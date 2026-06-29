with open("src/App.tsx", "r") as f:
    content = f.read()

if "InsurancesPage" not in content:
    content = content.replace(
        'import { EndOfServicePage } from "./pages/EndOfServicePage";',
        'import { EndOfServicePage } from "./pages/EndOfServicePage";\nimport { InsurancesPage } from "./pages/InsurancesPage";'
    )
    content = content.replace(
        '<Route path="employees/end-of-service" element={<EndOfServicePage />} />',
        '<Route path="employees/end-of-service" element={<EndOfServicePage />} />\n            <Route path="employees/insurances" element={<InsurancesPage />} />'
    )

    with open("src/App.tsx", "w") as f:
        f.write(content)

