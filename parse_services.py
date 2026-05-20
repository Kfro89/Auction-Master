import ast
import os
import json

services_dir = "backend/app/services"
results = {}

for filename in os.listdir(services_dir):
    if filename.endswith(".py"):
        filepath = os.path.join(services_dir, filename)
        with open(filepath, "r") as f:
            try:
                tree = ast.parse(f.read(), filename=filepath)
            except Exception as e:
                continue
            
            imports = []
            functions = []
            
            for node in tree.body:
                if isinstance(node, ast.ImportFrom):
                    if node.module and node.module.startswith("app.services"):
                        imports.append(node.module)
                elif isinstance(node, ast.Import):
                    for alias in node.names:
                        if alias.name.startswith("app.services"):
                            imports.append(alias.name)
                elif isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                    if not node.name.startswith("_"):
                        args = [arg.arg for arg in node.args.args]
                        functions.append(f"{node.name}({', '.join(args)})")
                elif isinstance(node, ast.ClassDef):
                    for sub_node in node.body:
                        if isinstance(sub_node, ast.FunctionDef) or isinstance(sub_node, ast.AsyncFunctionDef):
                            if not sub_node.name.startswith("_"):
                                args = [arg.arg for arg in sub_node.args.args]
                                functions.append(f"{node.name}.{sub_node.name}({', '.join(args)})")
                                
            results[filename] = {
                "imports": list(set(imports)),
                "functions": functions
            }

print(json.dumps(results, indent=2))
