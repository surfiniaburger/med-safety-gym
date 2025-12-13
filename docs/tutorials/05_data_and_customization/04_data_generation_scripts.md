# Guide: Data Generation Scripts

This guide explains the purpose of the Python scripts found in the `scripts/` directory. These tools are used to build, clean, and analyze the DIPG dataset.

## Core Generation Pipeline

### 1. `generate_med_data_gemini.py`
The primary generator script. It uses **Google Gemini 1.5 Pro** to synthesize realistic medical scenarios.
*   **Input**: `topics_list` (internal)
*   **Output**: Raw JSONL files in `datasets/raw/`
*   **Key Logic**: Implements the "reasoning-first" generation strategy.

### 2. `clean_data.py`
Sanitizes the raw output from the LLM.
*   **Function**:
    *   Removes Markdown code blocks (` ```json `).
    *   Validates JSON structure.
    *   Drops duplicates.
*   **Output**: Cleaned JSONL ready for review.

## Analysis & Utilities

### `visualizations.py`
Generates charts for the documentation.
*   **Usage**: `python scripts/visualizations.py`
*   **Output**: `.png` files in `docs/images/` showing Safe Rate vs Hallucination Rate correlations.

### `statistical_analysis.py`
Computes dataset statistics.
*   **Usage**: `python scripts/statistical_analysis.py`
*   **Output**: Distribution of "Refusal" vs "Answered" cases, token counts, etc.

## Deprecated / Experimental
*   `generate_med_data.py`: Legacy script using older prompts.
*   `debug_*.py`: Verification scripts used during development.
