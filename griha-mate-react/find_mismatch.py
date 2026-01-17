import re

with open("/home/saurav/Documents/Final year Projects/saurav/GRIHA MATE/griha-mate-react/src/pages/property/PropertyDetail.tsx", "r") as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # This is a very simple parser, might be confused by strings or comments
    tags = re.findall(r'<(div|/div)', line)
    for tag in tags:
        if tag == 'div':
            stack.append(i + 1)
        else:
            if not stack:
                print(f"Extra closing div at line {i + 1}")
            else:
                stack.pop()

if stack:
    print(f"Unclosed divs starting at lines: {stack}")
