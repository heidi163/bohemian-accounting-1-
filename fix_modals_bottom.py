import os, glob

for filepath in glob.glob('src/pages/*.tsx'):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We already have <div className="flex-1 min-h-[2rem]"></div> at the top.
    # We need to insert it at the bottom of the modal container.
    # The modal container ends with:
    #   </div>
    # </div>
    # )}
    
    # Let's find: `</div>\n      )}` or similar.
    # The modal wrapper is the one before `)}`.
    # Let's just replace `\n        </div>\n      )}` with `\n          <div className="flex-1 min-h-[2rem]"></div>\n        </div>\n      )}`
    
    if 'animate-fade-in shrink-0' in content and '<div className="flex-1 min-h-[2rem]"></div>\n        </div>\n      )}' not in content:
        content = content.replace('\n        </div>\n      )}', '\n          <div className="flex-1 min-h-[2rem]"></div>\n        </div>\n      )}')
        
        with open(filepath, 'w') as f:
            f.write(content)

