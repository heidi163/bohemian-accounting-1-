import os, glob, re

for filepath in glob.glob('src/pages/*.tsx'):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if 'flex justify-center' in content:
        content = content.replace('flex justify-center', 'flex flex-col items-center justify-start')
        content = content.replace('animate-fade-in my-auto"', 'animate-fade-in shrink-0"')
        content = content.replace('<div className="bg-white rounded-2xl shadow-xl', '<div className="flex-1 min-h-[2rem]"></div>\n          <div className="bg-white rounded-2xl shadow-xl')
        content = content.replace('          </div>\n        </div>\n      )}\n    </div>', '          </div>\n          <div className="flex-1 min-h-[2rem]"></div>\n        </div>\n      )}\n    </div>')
        
        with open(filepath, 'w') as f:
            f.write(content)
