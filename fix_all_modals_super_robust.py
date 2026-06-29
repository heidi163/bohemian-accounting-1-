import glob
import re

for filepath in glob.glob('src/pages/*.tsx'):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. First, we replace the `fixed inset-0` wrappers.
    # We want them to end up as:
    # <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
    
    # Let's find all occurrences of <div className="fixed inset-0 ...">
    # We match up to the closing `>`
    def replace_wrapper(match):
        return '<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">'
        
    content = re.sub(r'<div className="fixed inset-0[^>]+>', replace_wrapper, content)
    
    # 2. Next, we replace the inner modal box wrapper.
    # It usually starts with <div className="bg-white rounded-2xl shadow-xl w-full...
    # BUT wait! In ChecksPage.tsx, we have `<div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl...` from the bad commit.
    # Let's remove the flex-1 spacers first!
    content = content.replace('<div className="flex-1 min-h-[2rem]"></div>', '')

    # Now let's find the inner modal box.
    # We match <div className="bg-white rounded-2xl ... max-w-...">
    # Wait! Not ALL bg-white rounded-2xl are modals! Some are page containers!
    # How to distinguish? The modal box comes RIGHT AFTER the `<div className="fixed inset-0...`
    # Let's use a regex that matches the fixed inset-0, then any whitespace, then the inner div!
    
    def replace_both(match):
        # match.group(0) is the whole thing
        # We want to extract the max-w part
        inner_class = match.group(2)
        
        # Extract max-w class
        max_w_match = re.search(r'max-w-[a-zA-Z0-9-]+', inner_class)
        max_w = max_w_match.group(0) if max_w_match else 'max-w-2xl'
        
        # Does it have animate-fade-in?
        animate = ' animate-fade-in' if 'animate-fade-in' in inner_class else ''
        
        return f'<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">\n          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>\n          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full {max_w}{animate}">'

    # Let's reload content from original to do this safely
    content = original_content
    # Remove spacers first
    content = content.replace('<div className="flex-1 min-h-[2rem]"></div>', '')
    
    pattern = r'(<div className="fixed inset-0[^>]+>)\s*<div className="([^"]*bg-white[^"]*max-w-[^"]*)"[^>]*>'
    content = re.sub(pattern, replace_both, content)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)

