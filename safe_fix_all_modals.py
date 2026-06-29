import os, glob, re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to find the <div className="fixed ... flex justify-center... ">
    # followed by <div className="bg-white rounded-2xl shadow-xl w-full max-w-... animate-fade-in my-auto">
    
    # Pattern to match the entire modal opening
    # We match:
    # 1. <div className="fixed inset-0...
    # 2. (optional whitespace)
    # 3. <div className="bg-white rounded-2xl... my-auto"
    
    # Note: some files might have `shrink-0` instead of `my-auto` because of my previous script
    # Let's match both
    
    pattern = r'<div className="fixed inset-0[^>]+flex justify-center[^>]*">\s*<div className="bg-white rounded-2xl shadow-xl w-full (max-w-[a-zA-Z0-9-]+) overflow-hidden animate-fade-in( my-auto| shrink-0)?"'
    
    def replacement(match):
        max_w = match.group(1)
        return f'<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">\n          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>\n          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full {max_w} animate-fade-in"'

    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)

for filepath in glob.glob('src/pages/*.tsx'):
    process_file(filepath)

