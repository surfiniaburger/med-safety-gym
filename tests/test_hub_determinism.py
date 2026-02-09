import os
import json
import sqlite3
from sqlalchemy import text
from med_safety_eval.data_agent import DataAgent

def test_metadata_determinism():
    print("🛸 Testing Metadata Determinism (Regression Test)...")
    db_path = "determinism_test.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    
    agent = DataAgent(db_url=f"sqlite:///{db_path}")
    
    # Insert two steps for the same session with DIFFERENT metadata
    # The second step (step 2) should be the one returned by get_all_sessions
    with agent.engine.begin() as conn:
        conn.execute(text("INSERT INTO neural_snapshots (session_id, step, scores, metadata) VALUES (:sid, :step, :scores, :meta)"), {
            "sid": "session-1",
            "step": 1,
            "scores": "{}",
            "meta": json.dumps({"version": "v1", "latest": False})
        })
        conn.execute(text("INSERT INTO neural_snapshots (session_id, step, scores, metadata) VALUES (:sid, :step, :scores, :meta)"), {
            "sid": "session-1",
            "step": 2,
            "scores": "{}",
            "meta": json.dumps({"version": "v2", "latest": True})
        })

    # BUGGY VERSION will likely return v1 because DISTINCT session_id is non-deterministic in SQLite
    # for columns not in the DISTINCT clause.
    sessions = agent.get_all_sessions()
    
    found = False
    for s in sessions:
        if s["session_id"] == "session-1":
            found = True
            version = s["metadata"].get("version")
            print(f"Result for session-1: version={version}")
            if version == "v2":
                print("✅ PASS: Correct metadata (latest step) returned.")
            else:
                print("❌ FAIL: Old metadata returned. This is the non-determinism bug.")
                # We expect this to fail BEFORE our fix
    
    if not found:
        print("❌ FAIL: Session not found in results.")

    if os.path.exists(db_path):
        os.remove(db_path)

if __name__ == "__main__":
    test_metadata_determinism()
