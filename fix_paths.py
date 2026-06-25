#!/usr/bin/env python3
"""Fix Next.js static export paths for file:// protocol compatibility."""

import os
import re

def fix_html_files(out_dir="out"):
    if not os.path.isdir(out_dir):
        print(f"Directory {out_dir} not found")
        return

    for root, _, files in os.walk(out_dir):
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            # Fix absolute paths to relative
            orig = content
            content = re.sub(r'="/_next/', '="./_next/', content)
            content = re.sub(r'href="/"', 'href="./index.html"', content)
            content = re.sub(r'href="/detect"', 'href="./detect.html"', content)
            content = re.sub(r'href="/report"', 'href="./report.html"', content)
            content = re.sub(r'href="/settings"', 'href="./settings.html"', content)

            if content != orig:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed: {path}")

    print("Done fixing paths.")

if __name__ == "__main__":
    fix_html_files("out")
