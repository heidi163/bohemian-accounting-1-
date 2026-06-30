import re

# 1. Update EmployeeCreatePage
with open("src/pages/EmployeeCreatePage.tsx", "r") as f:
    emp_content = f.read()

if "import { SearchableSelect }" not in emp_content:
    emp_content = emp_content.replace('import { ArrowRight, Save, UserPlus } from "lucide-react";', 'import { ArrowRight, Save, UserPlus } from "lucide-react";\nimport { SearchableSelect } from "../components/ui/SearchableSelect";')

emp_pattern = r'<input[^>]+list="departments-list"[^>]+>\s*<datalist id="departments-list">.*?</datalist>'
emp_replacement = '''<SearchableSelect
              value={formData.department} 
              onChange={val => setFormData({...formData, department: val})} 
              placeholder="اختر أو اكتب القسم..."
              allowCreate={true}
              options={[
                { value: "الهندسة (Engineering)", label: "الهندسة (Engineering)" },
                { value: "المبيعات (Sales)", label: "المبيعات (Sales)" },
                { value: "التسويق (Marketing)", label: "التسويق (Marketing)" },
                { value: "الموارد البشرية (HR)", label: "الموارد البشرية (HR)" },
                { value: "المالية (Finance)", label: "المالية (Finance)" }
              ]}
            />'''

emp_content = re.sub(emp_pattern, emp_replacement, emp_content, flags=re.DOTALL)

with open("src/pages/EmployeeCreatePage.tsx", "w") as f:
    f.write(emp_content)

# 2. Update AssetCreatePage
with open("src/pages/AssetCreatePage.tsx", "r") as f:
    ast_content = f.read()

if "import { SearchableSelect }" not in ast_content:
    ast_content = ast_content.replace('import { ArrowRight, Save } from "lucide-react";', 'import { ArrowRight, Save } from "lucide-react";\nimport { SearchableSelect } from "../components/ui/SearchableSelect";')

ast_pattern = r'<input[^>]+list="asset-categories"[^>]+>\s*<datalist id="asset-categories">.*?</datalist>'
ast_replacement = '''<SearchableSelect
                 value={form.category} 
                 onChange={val => setForm({...form, category: val})} 
                 placeholder="اختر أو اكتب التصنيف..."
                 allowCreate={true}
                 options={[
                   { value: "أجهزة حاسب وملحقاتها", label: "أجهزة حاسب وملحقاتها" },
                   { value: "سيارات ومركبات", label: "سيارات ومركبات" },
                   { value: "معدات وآلات", label: "معدات وآلات" },
                   { value: "أثاث ومفروشات", label: "أثاث ومفروشات" }
                 ]}
               />'''

ast_content = re.sub(ast_pattern, ast_replacement, ast_content, flags=re.DOTALL)

with open("src/pages/AssetCreatePage.tsx", "w") as f:
    f.write(ast_content)

