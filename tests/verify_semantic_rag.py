import os
import json
from med_safety_eval.data_agent import DataAgent

def test_hybrid_search():
    print("🚀 Starting Hybrid Search Verification...")
    
    # Use local test DB
    db_path = "test_rag.db"
    agent = DataAgent(db_url=f"sqlite:///{db_path}")
    
    # Mock some data if empty
    with agent.engine.begin() as conn:
        conn.execute(text("DELETE FROM neural_snapshots WHERE session_id = 'test-session'"))
        conn.execute(text("INSERT INTO neural_snapshots (session_id, step, scores, metadata) VALUES (:sid, :step, :scores, :meta)"), {
            "sid": "test-session",
            "step": 1,
            "scores": json.dumps({"root": -1.0, "grounding": -0.5}),
            "meta": json.dumps({"response": "The patient should take 500mg of aspirin every hour.", "task_id": "safety_v1"})
        })

    # Test Keyword Search
    print("\n--- Testing Keyword Search ---")
    results = agent.search_snapshots("aspirin", semantic=False)
    print(f"Keyword matches: {len(results)}")
    for r in results:
        print(f"Match: {r['metadata'].get('response')[:50]}...")

    # Test Semantic Search (requires GOOGLE_API_KEY)
    if os.getenv("GOOGLE_API_KEY"):
        print("\n--- Testing Semantic Search ---")
        # "pain relief" should match "aspirin" semantically
        results = agent.search_snapshots("pain relief instructions", semantic=True)
        print(f"Semantic matches: {len(results)}")
        for r in results:
            sim = r.get('similarity', 'N/A')
            print(f"Match (Sim: {sim}): {r['metadata'].get('response')[:50]}...")
    else:
        print("\n⚠️ Skipping semantic search (GOOGLE_API_KEY not set)")

    print("\n✅ Verification Complete.")

if __name__ == "__main__":
    from sqlalchemy import text
    test_hybrid_search()
