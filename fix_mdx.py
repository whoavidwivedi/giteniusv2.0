with open('web/next/src/mdx-components.tsx', 'r') as f:
    content = f.read()
if not content.startswith('"use client"'):
    with open('web/next/src/mdx-components.tsx', 'w') as f:
        f.write('"use client"\n\n' + content)
