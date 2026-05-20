import json
import sys

try:
    tsx_path = "/Users/kevin/.gemini/tmp/auction-master/tool-outputs/session-6bba788d-b152-4ad3-9557-5eda65135bad/replace_replace_1778924057569_0_sdvqv.txt"
    with open(tsx_path, 'r') as f:
        data = json.load(f)
        
    output_str = data['output']
    code = output_str.split("Here is the updated code:\n", 1)[1]

    with open('frontend/src/views/WorkQueueView.tsx', 'w') as f:
        f.write(code)
    print("Recovered TSX.")
except Exception as e:
    print(f"TSX Error: {e}")

try:
    css_path = "/Users/kevin/.gemini/tmp/auction-master/tool-outputs/session-6bba788d-b152-4ad3-9557-5eda65135bad/read_file_read_file_1778923194943_1_54x9un.txt"
    with open(css_path, 'r') as f:
        data = json.load(f)

    with open('frontend/src/views/WorkQueueView.css', 'w') as f:
        f.write(data['output'])
    print("Recovered CSS.")
except Exception as e:
    print(f"CSS Error: {e}")
