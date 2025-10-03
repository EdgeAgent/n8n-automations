
import os
import json

automations_dir = "n8n-automations"

for filename in os.listdir(automations_dir):
    if filename.endswith(".json"):
        json_path = os.path.join(automations_dir, filename)
        md_path = os.path.join(automations_dir, filename.replace(".json", ".md"))

        if os.path.exists(md_path):
            print(f"Skipping {md_path}, already exists.")
            continue

        with open(json_path, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"Error reading {json_path}")
                continue

        automation_name = filename.replace(".json", "").replace("_", " ").title()

        with open(md_path, "w") as f:
            f.write(f"# {automation_name}\n\n")
            f.write("This n8n workflow automates the process of...\n\n")
            f.write("## Nodes\n\n")
            f.write("The workflow consists of the following nodes:\n\n")
            for node in data.get("nodes", []):
                f.write(f"- **{node.get('name', 'Unnamed Node')}**: {node.get('type', 'N/A')}\n")
            f.write("\n## Setup\n\n")
            f.write("To use this workflow, you need to configure the credentials for the following nodes:\n\n")
            f.write("## How to Use\n\n")
            f.write("1. Import the workflow into your n8n instance.\n")
            f.write("2. Configure the credentials for the nodes.\n")
            f.write("3. Activate the workflow.\n")

        print(f"Created {md_path}")

