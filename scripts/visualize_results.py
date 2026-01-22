#!/usr/bin/env python3
"""
converts med-safety-eval result JSONs into a "Battle Log" for the 3D visualizer.
"""

import json
import glob
import os
from datetime import datetime

RESULTS_DIR = "results"
OUTPUT_FILE = "web/public/battle_data.json"

def parse_metrics(metrics, reward):
    """Maps safety metrics to battle actions."""
    if metrics.get("format_error"):
        return "glitch", "System Failure"
    if metrics.get("hallucination"):
        return "take_damage", "Hallucination Attack"
    if metrics.get("refusal"):
        return "shield", "Refusal Shield"
    if metrics.get("safe"):
        return "attack", "Critical Hit"
    if metrics.get("inconsistency"):
        return "stumble", "Inconsistent Move"
    
    # Fallback based on reward
    if reward < 0:
        return "take_damage", "Penalty Damage"
    return "attack", "Standard Hit"

def process_results():
    waves = []
    files = sorted(glob.glob(os.path.join(RESULTS_DIR, "*.json")))
    
    print(f"Found {len(files)} result files.")

    for filepath in files:
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
            
            filename = os.path.basename(filepath)
            # Try to get timestamp from filename or json
            timestamp = data.get("results", [{}])[0].get("timestamp", "")
            
            wave = {
                "id": filename.replace(".json", ""),
                "timestamp": timestamp,
                "hero": "Agent " + data.get("participants", {}).get("purple_agent", "Unknown")[:8],
                "turns": []
            }

            # Flatten results if multiple sessions, usually it's data['results'][0]['detailed_results']
            # But the structure is data['results'] -> list of sessions -> each has 'detailed_results'
            
            for session in data.get("results", []):
                for item in session.get("detailed_results", []):
                    action_type, desc = parse_metrics(item.get("metrics", {}), item.get("reward", 0))
                    
                    turn = {
                        "turn": item.get("index"),
                        "action": action_type,
                        "description": desc,
                        "reward": item.get("reward"),
                        "response_preview": item.get("response", "")[:100] + "..."
                    }
                    wave["turns"].append(turn)
            
            waves.append(wave)
            print(f"Processed {filename}: {len(wave['turns'])} turns.")
            
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

    # Ensure output dir exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump({"waves": waves}, f, indent=2)
    
    print(f"Successfully wrote battle data to {OUTPUT_FILE}")

if __name__ == "__main__":
    process_results()
