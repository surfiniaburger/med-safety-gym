import json

notebook_path = "docs/tutorials/tutorial_1.ipynb"
with open(notebook_path, "r") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code" and "!dipg-server" in "".join(cell["source"]):
        cell["source"] = [
            "# ------------------------------------------------------------------------------\n",
            "# EVALUATION SERVER (Run in background)\n",
            "# ------------------------------------------------------------------------------\n",
            "from med_safety_gym import run_bg_server\n",
            "\n",
            "# Start server in background\n",
            "# This won't block the notebook, allowing you to run the evaluation cells below.\n",
            "server_proc = run_bg_server(\n",
            "    dataset_path=\"surfiniaburger/med-safety-gym-eval\",\n",
            "    port=8081\n",
            ")\n"
        ]
        break

with open(notebook_path, "w") as f:
    json.dump(nb, f, indent=1)

print("✅ Tutorial notebook updated.")
