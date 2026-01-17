import re

with open("/home/saurav/Documents/Final year Projects/saurav/GRIHA MATE/griha-mate-react/src/pages/property/PropertyDetail.tsx", "r") as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # Match <div, <Card, <main, <Dialog, <Badge etc.
    # Exclude self-closing tags and strings
    open_tags = re.findall(r'<([a-zA-Z0-9]+)(?:\s+[^>]*[^/])?>', line)
    close_tags = re.findall(r'</([a-zA-Z0-9]+)\s*>', line)
    
    # This is still not perfect because tags can span multiple lines
    # and it doesn't handle strings/comments well.
    # Let's try to just find all <TAG and </TAG
    
    items = re.findall(r'<([a-zA-Z0-9]+)|</([a-zA-Z0-9]+)', line)
    for item in items:
        if item[0]: # Open tag
            tag = item[0]
            if tag in ['div', 'main', 'Card', 'CardContent', 'Dialog', 'DialogContent', 'Badge']:
                # Heuristic: skip if it's likely a self-closing tag or component import
                if not re.search(r'<' + tag + r'[^>]*/>', line):
                    stack.append((tag, i + 1))
        else: # Close tag
            tag = item[1]
            if tag in ['div', 'main', 'Card', 'CardContent', 'Dialog', 'DialogContent', 'Badge']:
                if not stack:
                    print(f"Extra closing {tag} at line {i + 1}")
                else:
                    open_tag, line_no = stack.pop()
                    if open_tag != tag:
                        print(f"Mismatch: Opened {open_tag} at {line_no}, but closed {tag} at {i + 1}")

if stack:
    print(f"Still open: {stack}")
