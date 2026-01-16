#tests/envs/test_dipg_environment.py
import os
import sys
import subprocess
import time
import requests
import pytest
import concurrent.futures

from med_safety_gym.client import DIPGSafetyEnv
from med_safety_gym.models import DIPGAction


@pytest.fixture(scope="module")
def server():
    """Starts the environment server as a background process."""
    # --- Define Absolute Paths & Port ---
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    DATASET_SOURCE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "mock_dataset.jsonl"))
    PORT = 8009

    # --- Launch the Server using Gunicorn ---
    localhost = f"http://localhost:{PORT}"
    print(f"--- Starting DIPGSafetyEnv server with Gunicorn on port {PORT} ---")

    # Clean up global state files
    import shutil
    state_dir = "/tmp/med_safety_state"
    if os.path.exists(state_dir):
        shutil.rmtree(state_dir)

    server_env = {
        **os.environ,
        "PYTHONPATH": ROOT_DIR,
        "DIPG_DATASET_PATH": DATASET_SOURCE_PATH,
    }

    gunicorn_command = [
        "uvicorn",
        "med_safety_gym.app:app",
        "--host", "0.0.0.0",
        "--port", str(PORT),
        "--log-level", "debug",
    ]
    openenv_process = subprocess.Popen(
        gunicorn_command,
        env=server_env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    # --- Wait and Verify ---
    print("\n--- Waiting for server to become healthy... ---")
    is_healthy = False
    for i in range(12):
        try:
            response = requests.get(f"{localhost}/health", timeout=5)
            if response.status_code == 200 and "healthy" in response.text:
                is_healthy = True
                print("✅ Server is running and healthy!")
                break
        except requests.exceptions.RequestException:
            print(f"Attempt {i+1}/12: Server not ready, waiting 10 seconds...")
            time.sleep(10)

    if not is_healthy:
        print("❌ Server did not become healthy in time. Aborting.")
        print("\n--- Server Logs ---")
        print(openenv_process.stderr.read())
        try:
            openenv_process.kill()
        except ProcessLookupError:
            pass
        raise RuntimeError("Server failed to start.")

    yield localhost

    # --- Clean up ---
    print("\n--- Cleaning up ---")
    try:
        openenv_process.terminate()
        stdout, _ = openenv_process.communicate(timeout=5)
        print("--- Server Logs ---")
        print(stdout)
        print("✅ Server process terminated.")
    except Exception as e:
        print(f"Error during cleanup: {e}")
        try:
            openenv_process.kill()
        except:
            pass

def test_reset(server):
    """Test that reset() returns a valid observation."""
    with DIPGSafetyEnv(base_url=server, timeout=300) as env:
        # Test multiple resets to ensure variety and no immediate repetition
        questions = []
        for _ in range(3):
            obs = env.reset()
            questions.append(obs.observation.question)
        
        # With 5 items in mock dataset, 3 consecutive resets should all be different
        assert len(set(questions)) == 3

def test_concurrency(server):
    """Test that concurrent requests are handled correctly."""
    num_threads = 4
    
    def run_reset():
        with DIPGSafetyEnv(base_url=server, timeout=300) as env:
            obs = env.reset()
            return obs.observation.question

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(run_reset) for _ in range(num_threads)]
        results = [f.result() for f in futures]
    
    # With 5 items and 4 concurrent threads, they should ideally all get different questions
    # because the server increments the global index.
    assert len(set(results)) == num_threads

def test_step(server):
    """Test that step() returns a valid result."""
    with DIPGSafetyEnv(base_url=server, timeout=300) as env:
        env.reset()
        action = DIPGAction(llm_response="<|channel|>analysis<|message|>This is an analysis.<|end|>\n<|channel|>final<|message|>This is the final answer.<|end|>")
        result = env.step(action)
        assert isinstance(result.reward, float)
        assert result.done is True

def test_malformed_step(server):
    """Test that a malformed step() does not crash the server."""
    with DIPGSafetyEnv(base_url=server, timeout=300) as env:
        env.reset()
        action = DIPGAction(llm_response="This is a malformed response")
        result = env.step(action)
    assert isinstance(result.reward, float)
    assert result.done is True