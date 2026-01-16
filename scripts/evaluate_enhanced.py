import json
import logging
import traceback
from med_safety_gym.client import DIPGSafetyEnv

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_comprehensive_verification(server_url="http://localhost:8000"):
    print(f"=== Starting Comprehensive Release Verification for v0.1.20 ===")
    print(f"Targeting Gym Server at: {server_url}")
    
    # Use context manager for reliable WebSocket connection
    try:
        with DIPGSafetyEnv(server_url, timeout=120) as client:
            
            # 1. Test get_metrics_summary (Integrated State)
            # This fetches the environment's reward configuration and dataset info.
            print("\n" + "="*50)
            print("1. [DIAGNOSTIC] Testing get_metrics_summary()...")
            print("="*50)
            try:
                summary = client.get_metrics_summary()
                print(f"Metrics Summary (State Config):\n{json.dumps(summary, indent=2)}")
                assert "reward_configuration" in summary
                print("\n✅ SUCCESS: Integrated environment state retrieved correctly.")
            except Exception as e:
                print(f"❌ FAILED: get_metrics_summary error: {e}")

            # 2. Test get_eval_tasks
            # This fetches a subset of tasks for offline/external evaluation.
            print("\n" + "="*50)
            print("2. [DIAGNOSTIC] Testing get_eval_tasks()...")
            print("="*50)
            try:
                tasks = client.get_eval_tasks(max_samples=2)
                print(f"Fetched {len(tasks)} tasks.")
                for i, task in enumerate(tasks):
                    print(f" Task {i} Question: {task.get('question', '')[:100]}...")
                assert len(tasks) > 0
                print("\n✅ SUCCESS: Task retrieval functional.")
            except Exception as e:
                print(f"❌ FAILED: get_eval_tasks error: {e}")

            # 3. Test evaluate_model (Integrated Step Loops)
            # This simulates a typical evaluation run with a batch of model responses.
            print("\n" + "="*50)
            print("3. [DIAGNOSTIC] Testing evaluate_model()...")
            print("="*50)
            
            # Simulated responses mirroring common model behaviors
            test_responses = [
                # 1. Properly formatted safe response
                '<|channel|>analysis<|message|>Safe analysis.<|end|>\n<|channel|>proof<|message|>"Standard treatment options are limited."<|end|>\n<|channel|>final<|message|>Safe answer.<|end|>',
                # 2. Refusal response
                'I cannot answer this because it is unsafe.',
                # 3. Partially malformed response (missing proof)
                '<|channel|>analysis<|message|>Missing proof.<|end|>\n<|channel|>final<|message|>Answer without proof.<|end|>'
            ]
            
            try:
                print(f"Running batch evaluation for {len(test_responses)} simulated responses...")
                results = client.evaluate_model(test_responses)
                
                # Deep Inspection of results
                print(f"\nBatch Evaluation Aggregate Results:\n{json.dumps({k:v for k,v in results.items() if k != 'detailed_results'}, indent=2)}")
                
                print("\nDetailed Per-Response Inspection:")
                details = results.get("detailed_results", [])
                for res in details:
                    idx = res['index']
                    reward = res['reward']
                    metrics = res.get('metrics', {})
                    
                    print(f"\n--- Episode {idx} ---")
                    print(f" Response Snippet: {res['response'][:60]}...")
                    print(f" Reward: {reward}")
                    print(f" Metrics Flags: {json.dumps(metrics)}")
                    
                    if metrics:
                        print(f" ✅ Metrics Propagated: PASS")
                    else:
                        print(f" ⚠️ Metrics Propagated: EMPTY (Investigation Needed)")
                
                assert results["total_responses"] == 3
                assert "mean_reward" in results
                print("\n✅ SUCCESS: Batch evaluation pipeline functional.")
                
            except Exception as e:
                print(f"❌ FAILED: evaluate_model error: {e}")
                traceback.print_exc()

    except Exception as e:
        print(f"❌ CRITICAL: Could not establish connection to {server_url}. Is the server running?")
        print(f" Error: {e}")

    print("\n" + "="*50)
    print("=== Verification Process Complete ===")
    print("="*50)

if __name__ == "__main__":
    run_comprehensive_verification()
