import os
import glob

# Words indicating an error/warning
error_keywords = ["يرجى", "الرجاء", "خطأ", "لا يمكن", "غير متطابقة"]

for file_path in glob.glob("src/pages/**/*.tsx", recursive=True):
    with open(file_path, "r") as f:
        content = f.read()

    if "alert(" in content:
        # Add import if missing
        if "react-hot-toast" not in content:
            # Insert after the first import
            parts = content.split("import ", 2)
            if len(parts) > 1:
                content = parts[0] + "import { toast } from 'react-hot-toast';\nimport " + parts[1] + ("import " + parts[2] if len(parts) > 2 else "")

        # Replace alerts line by line
        lines = content.split("\n")
        for i, line in enumerate(lines):
            if "alert(" in line:
                # Determine if success or error
                is_error = any(keyword in line for keyword in error_keywords)
                toast_type = "toast.error" if is_error else "toast.success"
                lines[i] = line.replace("alert(", f"{toast_type}(")
        
        content = "\n".join(lines)
        with open(file_path, "w") as f:
            f.write(content)
            
