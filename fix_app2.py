with open("src/App.tsx", "r") as f:
    content = f.read()

if "import { InsurancesPage }" not in content:
    # Insert import at the top
    content = content.replace(
        'import { EndOfServicePage }',
        'import { InsurancesPage } from "./pages/InsurancesPage";\nimport { EndOfServicePage }'
    )
    if "import { InsurancesPage }" not in content:
        # Maybe EndOfServicePage is not imported like that
        content = content.replace(
            'import { AppLayout } from "./components/AppLayout";',
            'import { AppLayout } from "./components/AppLayout";\nimport { InsurancesPage } from "./pages/InsurancesPage";'
        )
    
    # Insert Route
    content = content.replace(
        '<Route path="employees" element={<EmployeesPage />} />',
        '<Route path="employees" element={<EmployeesPage />} />\n            <Route path="employees/insurances" element={<InsurancesPage />} />'
    )

    with open("src/App.tsx", "w") as f:
        f.write(content)

