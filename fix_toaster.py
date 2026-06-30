with open("src/App.tsx", "r") as f:
    content = f.read()

if "import { Toaster } from 'react-hot-toast';" not in content:
    content = content.replace(
        'import { AppLayout } from "./components/AppLayout";',
        "import { Toaster } from 'react-hot-toast';\nimport { AppLayout } from \"./components/AppLayout\";"
    )
    
    content = content.replace(
        '<ThemeProvider>',
        '<ThemeProvider>\n      <Toaster position="top-center" toastOptions={{ style: { fontFamily: \'inherit\', fontSize: \'14px\', borderRadius: \'12px\' } }} />'
    )

with open("src/App.tsx", "w") as f:
    f.write(content)

