"""
Simple Evaluation Script - Works on ANY Platform

This script provides a clean, minimal evaluation flow that works on:
- Google Colab
- Kaggle
- Local Jupyter
- Any Python environment with HTTP access

No complex imports needed - just requests and your model!
"""

import requests

# Configuration
SERVER_URL = "https://dipg-server-5hurbdoigq-uc.a.run.app"  # Cloud Run
# SERVER_URL = "http://localhost:8000"  # Local Docker

def evaluate_model(model, tokenizer, num_samples=100, server_url=SERVER_URL):
    """
    Evaluate a model using the simple 3-step flow.
    
    Args:
        model: Your model (any framework)
        tokenizer: Your tokenizer
        num_samples: Number of samples to evaluate
        server_url: DIPG server URL (Cloud Run or local Docker)
    
    Returns:
        dict: Evaluation metrics
    """
    
    # Step 1: Get tasks from server
    print(f"📥 Fetching {num_samples} evaluation tasks...")
    response = requests.get(f"{server_url}/tasks", params={"count": num_samples})
    response.raise_for_status()
    tasks = response.json()["tasks"]
    print(f"✅ Received {len(tasks)} tasks")
    
    # Step 2: Generate responses locally
    print(f"🤖 Generating responses...")
    responses = []
    
    for i, task in enumerate(tasks):
        if i % 10 == 0:
            print(f"  Progress: {i}/{len(tasks)}")
        
        # Create prompt (customize this for your model)
        prompt = f"{task['context']}\n\n{task['question']}"
        
        # Generate response (customize this for your model)
        # Example for transformers:
        inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
        outputs = model.generate(**inputs, max_new_tokens=512)
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        responses.append({
            "task_id": task["task_id"],
            "response": response_text
        })
    
    print(f"✅ Generated {len(responses)} responses")
    
    # Step 3: Submit for evaluation
    print(f"📊 Evaluating responses...")
    eval_response = requests.post(
        f"{server_url}/evaluate/tasks",
        json={
            "responses": responses,
            "format": "json"  # or "custom_tags" depending on your training
        }
    )
    eval_response.raise_for_status()
    metrics = eval_response.json()["metrics"]
    
    # Display results
    print("\n" + "="*60)
    print("📊 EVALUATION RESULTS")
    print("="*60)
    print(f"Mean Reward: {metrics.get('mean_reward', 'N/A'):.2f}")
    print(f"Safe Response Rate: {metrics.get('safe_response_rate', 'N/A'):.2%}")
    print(f"Hallucination Rate: {metrics.get('hallucination_rate', 'N/A'):.2%}")
    print("="*60 + "\n")
    
    return metrics


# Example usage in Colab/Kaggle:
if __name__ == "__main__":
    # Assuming you have 'model' and 'tokenizer' loaded
    # metrics = evaluate_model(model, tokenizer, num_samples=100)
    print("Import this script and call evaluate_model(model, tokenizer)")
