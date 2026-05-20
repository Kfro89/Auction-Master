import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    if filepath.endswith('.css'):
        # Remove backdrop-filter lines
        content = re.sub(r'\s*backdrop-filter:\s*[^;]+;', '', content)
        content = re.sub(r'\s*-webkit-backdrop-filter:\s*[^;]+;', '', content)
        
        # Replace .glass-card with .saas-card if defined
        if 'index.css' in filepath:
            content = content.replace(
                '.glass-card {\n    @apply bg-white opacity-70 backdrop-blur-md border border-outline-variant shadow-soft rounded-lg;\n  }',
                '.saas-card {\n    @apply bg-surface-container-lowest border border-outline-variant shadow-soft rounded-lg;\n  }'
            )

            # Update typography
            typography_add = """
  --text-display-lg: 32px;
  --text-display-lg--line-height: 40px;
  --text-display-lg--letter-spacing: -0.02em;
  --text-display-lg--font-weight: 700;

  --text-stat-xl: 28px;
  --text-stat-xl--line-height: 34px;
  --text-stat-xl--letter-spacing: -0.01em;
  --text-stat-xl--font-weight: 600;

  --text-headline-md: 18px;
  --text-headline-md--line-height: 24px;
  --text-headline-md--font-weight: 600;

  --text-body-md: 14px;
  --text-body-md--line-height: 20px;
  --text-body-md--font-weight: 400;

  --text-body-sm: 13px;
  --text-body-sm--line-height: 18px;
  --text-body-sm--font-weight: 400;

  --text-label-caps: 11px;
  --text-label-caps--line-height: 16px;
  --text-label-caps--letter-spacing: 0.05em;
  --text-label-caps--font-weight: 700;

  --text-table-data: 13px;
  --text-table-data--line-height: 16px;
  --text-table-data--font-weight: 500;
"""
            if '--text-display-lg' not in content:
                content = content.replace('--font-stat-xl: \'Inter\';', '--font-stat-xl: \'Inter\';\n' + typography_add)
                
    elif filepath.endswith('.tsx'):
        # Remove backdrop-blur-* classes
        content = re.sub(r'\bbackdrop-blur-[a-zA-Z0-9_-]+\b', '', content)
        # Rename glass-card to saas-card
        content = content.replace('glass-card', 'saas-card')

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.css') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
