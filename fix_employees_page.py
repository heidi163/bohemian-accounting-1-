with open("src/pages/EmployeesPage.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'onClick={() => alert(\'سيتم تفعيل إدارة التأمينات قريباً\')}',
    'onClick={() => navigate(\'/employees/insurances\')}'
)

with open("src/pages/EmployeesPage.tsx", "w") as f:
    f.write(content)

