import ast
import os
import json

base_dir = "backend/app"
directories = ["services", "routers", "scrapers"]
results = {}

for subdir in directories:
    dir_path = os.path.join(base_dir, subdir)
    if not os.path.exists(dir_path):
        continue
    for filename in os.listdir(dir_path):
        if filename.endswith(".py") and filename != "__init__.py":
            filepath = os.path.join(dir_path, filename)
            with open(filepath, "r") as f:
                try:
                    tree = ast.parse(f.read(), filename=filepath)
                except Exception:
                    continue
                
                imports = []
                for node in tree.body:
                    if isinstance(node, ast.ImportFrom):
                        if node.module:
                            imports.append(node.module)
                    elif isinstance(node, ast.Import):
                        for alias in node.names:
                            imports.append(alias.name)
                
                # Filter imports to just our app
                imports = [imp for imp in imports if "app." in imp or imp.startswith(".")]
                
                results[f"{subdir}/{filename}"] = {
                    "imports": list(set(imports))
                }

# Add main files
for filename in ["main.py", "models.py", "schemas.py", "database.py"]:
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            tree = ast.parse(f.read(), filename=filepath)
            imports = []
            for node in tree.body:
                if isinstance(node, ast.ImportFrom):
                    if node.module: imports.append(node.module)
                elif isinstance(node, ast.Import):
                    for alias in node.names: imports.append(alias.name)
            imports = [imp for imp in imports if "app." in imp or imp.startswith(".")]
            results[filename] = {"imports": list(set(imports))}

print(json.dumps(results, indent=2))
