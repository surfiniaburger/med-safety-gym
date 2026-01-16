from datasets import load_dataset
import os

path = os.path.abspath("tests/mock_dataset.jsonl")
ds = load_dataset('json', data_files=path, split='train')
print(f"Dataset size: {len(ds)}")
for i in range(len(ds)):
    print(f"Item {i}: {ds[i]['messages'][0]['content'][:50]}...")
