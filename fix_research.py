with open('frontend/src/views/ResearchView.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [authRequiredSite, setAuthRequiredSite] = useState<string | null>(null);", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const [authRequiredSite, setAuthRequiredSite] = useState<string | null>(null);")

with open('frontend/src/views/ResearchView.tsx', 'w') as f:
    f.write(content)
