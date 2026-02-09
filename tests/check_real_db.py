import os
import json
from sqlalchemy import create_engine, text

# Connection string provided by the user
CONNECTION_STRING = "postgresql://postgres.vsybkimrymvewakcsdkc:%40WockyRocky007@aws-1-us-west-1.pooler.supabase.com:6543/postgres"

def check_db():
    print(f"Connecting to: {CONNECTION_STRING.split('@')[1]}")
    engine = create_engine(CONNECTION_STRING)
    
    with engine.connect() as conn:
        # 1. Check table existence and count
        print("\n--- Table Stats ---")
        try:
            count = conn.execute(text("SELECT count(*) FROM neural_snapshots")).scalar()
            print(f"Total Snapshots: {count}")
        except Exception as e:
            print(f"Error accessing neural_snapshots: {e}")
            return

        # 2. Check unique sessions and run types
        print("\n--- Sessions ---")
        # Use ->> to get text values for DISTINCT
        query = text("SELECT DISTINCT session_id, metadata->>'run_type' as run_type, metadata->>'task_id' as task_id FROM neural_snapshots")
        sessions = conn.execute(query).fetchall()
        for s in sessions:
            print(f"Session: {s[0]} | Run Type: {s[1]} | Task ID: {s[2]}")

        # 3. Sample a snapshot
        print("\n--- Sample Snapshot ---")
        sample = conn.execute(text("SELECT step, scores, metadata FROM neural_snapshots LIMIT 1")).fetchone()
        if sample:
            print(f"Step: {sample[0]}")
            print(f"Scores: {json.dumps(sample[1], indent=2)}")
            print(f"Metadata: {json.dumps(sample[2], indent=2)}")

if __name__ == "__main__":
    check_db()
