
import grain.python as grain
import numpy as np
import jax

# ==============================================================================
# BLOCK 4: Data Pipeline (Grain) & Token Masking
# ==============================================================================

def tokenize_and_mask(ex, tokenizer, max_length):
    """
    Tokenizes the example and creates the 'decoder_loss_weights' mask.
    Masks the User's query (loss=0) and trains on the Model's response (loss=1).
    """
    # 1. Parse correct fields from the formatted text or raw dictionary
    # Note: 'format_dipg_example' in the notebook returns a dict with "text"
    # which is the full concatenated string. 
    # To do masking correctly, we really need the SEPARATE parts.
    # So we will re-parse or adjust the previous step. 
    # BETTER APPROACH: This function takes the RAW dataset example.
    
    messages = ex["messages"]
    user_content = next((m["content"] for m in messages if m["role"] == "user"), "")
    assistant_content = next((m["content"] for m in messages if m["role"] == "assistant"), "")

    # 2. Format parts
    # User Part: <start_of_turn>user\n{sys}\n\n{user}<end_of_turn>\n<start_of_turn>model\n
    # Model Part: {content}<end_of_turn>
    system_prompt = (
        "You are a strict safety assistant. You MUST prove your answer using the provided context.\n"
        "Your final response MUST be structured using XML-like tags.\n\n"
        "1. <think>...</think>: First, plan your response and analyze the question.\n"
        "2. <proof>...</proof>: You MUST copy direct quotes from the context that support your answer. "
        "If you cannot find a quote, you cannot answer. Empty proof = Penalty.\n"
        "3. <answer>...</answer>: Finally, provide your answer based ONLY on the proof.\n\n"
        "Structure your response exactly like this:\n"
        "<think>\n[Reasoning]\n</think>\n"
        "<proof>\n\"[Exact quote from text]\"\n</proof>\n"
        "<answer>\n[Final Answer]\n</answer>\n"
    )
    
    user_text = f"<start_of_turn>user\n{system_prompt}\n\n{user_content}<end_of_turn>\n<start_of_turn>model\n"
    model_text = f"{assistant_content}<end_of_turn>"
    
    # 3. Tokenize
    user_tokens = tokenizer.encode(user_text, add_eos=False)
    model_tokens = tokenizer.encode(model_text, add_eos=True) # EOS at very end
    
    # 4. Concatenate & Create Mask
    # Input: [User Tokens] + [Model Tokens]
    # Mask:  [0.0 .......] + [1.0 ........]
    input_tokens = user_tokens + model_tokens
    loss_weights = [0.0] * len(user_tokens) + [1.0] * len(model_tokens)
    
    # 5. Truncate or Pad
    current_len = len(input_tokens)
    
    if current_len > max_length:
        # Truncate from the end (keep the start of conversation usually, or simple crop)
        # For SFT, usually better to truncate end if too long
        input_tokens = input_tokens[:max_length]
        loss_weights = loss_weights[:max_length]
    else:
        # Pad
        pad_len = max_length - current_len
        input_tokens = input_tokens + [0] * pad_len
        loss_weights = loss_weights + [0.0] * pad_len # Don't train on padding

    input_tokens = np.array(input_tokens, dtype=np.int32)
    
    # CRITICAL TRICK: 
    # Tunix 'TrainingInput' checks strictly for 'input_tokens' and 'input_mask'.
    # It drops 'decoder_loss_weights'.
    # So we hijack 'input_mask' to carry our loss weights!
    # The trainer lambda below will then unpack it to 'decoder_loss_weights'.
    # Attention mask is re-generated from non-zero tokens anyway.
    return {
        "input_tokens": input_tokens,
        "input_mask": np.array(loss_weights, dtype=np.float32) # Hijacked!
    }

# --- Setup Grain Loaders ---
# NOTE: Using 'dataset' from previous cell (HuggingFace dataset)

class HFDataSource(grain.RandomAccessDataSource):
    """Wrapper to make HF Dataset compatible with Grain."""
    def __init__(self, hf_dataset):
        self._hf_dataset = hf_dataset
    
    def __len__(self):
        return len(self._hf_dataset)
    
    def __getitem__(self, idx):
        return self._hf_dataset[idx]

# Create Loaders
# Transformations
class TokenizeTransform(grain.MapTransform):
    def __init__(self, tokenizer, max_len):
        self._tokenizer = tokenizer
        self._max_len = max_len
    
    def map(self, ex):
        return tokenize_and_mask(ex, self._tokenizer, self._max_len)

def create_grain_loader(hf_rel, tokenizer, max_len, batch_size, seed=42, shuffle=True):
    source = HFDataSource(hf_rel)
    
    # Transformations
    transformations = [
        TokenizeTransform(tokenizer, max_len),
        grain.Batch(batch_size=batch_size, drop_remainder=True)
    ]
    
    if shuffle:
        sampler = grain.IndexSampler(
            num_records=len(source),
            shuffle=True,
            seed=seed,
            shard_options=grain.NoSharding(), # Single host, Tunix will shard later if needed
            num_epochs=1
        )
    else:
         sampler = grain.IndexSampler(
            num_records=len(source),
            shuffle=False,
            seed=seed,
            shard_options=grain.NoSharding(),
            num_epochs=1
        )
        
    loader = grain.DataLoader(
        data_source=source,
        sampler=sampler,
        operations=transformations,
        worker_count=0 # In-process for simplicity in notebooks
    )
    return loader

print("Creating Grain Data Loaders...")
train_loader = create_grain_loader(dataset['train'], tokenizer, MAX_SEQ_LENGTH, GLOBAL_BATCH, shuffle=True)
# For test, maybe smaller batch or same?
test_loader = create_grain_loader(dataset['test'], tokenizer, MAX_SEQ_LENGTH, GLOBAL_BATCH, shuffle=False)

print("✓ Grain Loaders Ready")

# ==============================================================================
# BLOCK 5: Trainer Update (Pass Loss Weights)
# ==============================================================================

# ... (Previous Optimizer/Trainer init code) ...

# UPDATE the input function to pass 'decoder_loss_weights'
# NOTE: 'x' coming from Grain is a TrainingInput object.
# We retrieve our hijacked 'decoder_loss_weights' from 'x.input_mask'.
trainer = trainer.with_gen_model_input_fn(lambda x: {
    'input_tokens': x['input_tokens'], 
    # CRITICAL: We pass our loss weights (hijacked in x.input_mask) 
    # as the 'input_mask' argument to the model/loss function.
    # Tunix likely uses this to mask the loss.
    'input_mask': x['input_mask'], 
    'positions': sft_utils.build_positions_from_mask(x['input_tokens'] != 0),
    'attention_mask': sft_utils.make_causal_attn_mask(x['input_tokens'] != 0),
})

print("✓ Trainer Updated with Loss Masking")
