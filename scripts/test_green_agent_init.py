import logging
from unittest.mock import patch
from med_safety_gym.green_agent import GreenAgent
from med_safety_gym.dipg_environment import DIPGEnvironment
from med_safety_gym.format_parser import ResponseFormat

logging.basicConfig(level=logging.INFO)

def test_green_agent_init():
    # Mock environment setup
    env = DIPGEnvironment(
        dataset_path="tests/mock_dataset.jsonl",
        conflict_reward=0, abstain_reward=0, hallucination_penalty=0, missing_answer_penalty=0,
        hallucinated_trace_penalty=0, proof_inconsistency_penalty=0, incorrect_answer_penalty=0,
        conflict_penalty=0, abstain_penalty=0, missing_trace_penalty=0, correct_abstention_reward=0,
        verifiable_trace_reward=0, correct_synthesis_reward=0, exact_format_reward=0,
        format_mismatch_penalty=0, no_hallucination_reward=0,
        analysis_channel_start="<A>", proof_channel_start="<P>", final_channel_start="<F>", channel_end="</>"
    )
    
    # Use patch to mock get_environment
    with patch('med_safety_gym.app.get_environment', return_value=env):
        agent = GreenAgent()
        print("✓ GreenAgent initialized successfully")
        
        assert agent.eval_manager is not None
        assert agent.messenger is not None

if __name__ == "__main__":
    test_green_agent_init()