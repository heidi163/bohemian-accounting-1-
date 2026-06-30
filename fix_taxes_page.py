with open("src/pages/TaxesPage.tsx", "r") as f:
    content = f.read()

# Fix 1: The mock data bug
old_mock_logic = '''        const localSummary = JSON.parse(localStorage.getItem(getCompanyKey('mock_taxes_summary')) || 'null') || {
          vat_liability: 150000, vat_paid: 100000,
          income_liability: 500000, income_paid: 200000,
          withholding_liability: 20000, withholding_paid: 5000,
          payroll_liability: 45000, payroll_paid: 30000
        };
        const localRecords = JSON.parse(localStorage.getItem(getCompanyKey('mock_taxes_records')) || '[]') || [
          { id: 1, type: 'vat', period: '2026-Q1', liability_amount: 50000, paid_amount: 50000, due_date: '2026-04-30', status: 'paid' },
          { id: 2, type: 'vat', period: '2026-Q2', liability_amount: 60000, paid_amount: 20000, due_date: '2026-07-30', status: 'partial' },
          { id: 3, type: 'income', period: '2025', liability_amount: 500000, paid_amount: 200000, due_date: '2026-04-30', status: 'partial' }
        ];'''

new_mock_logic = '''        const storedSummary = localStorage.getItem(getCompanyKey('mock_taxes_summary'));
        const storedRecords = localStorage.getItem(getCompanyKey('mock_taxes_records'));
        
        const localSummary = storedSummary ? JSON.parse(storedSummary) : {
          vat_liability: 150000, vat_paid: 100000,
          income_liability: 500000, income_paid: 200000,
          withholding_liability: 20000, withholding_paid: 5000,
          payroll_liability: 45000, payroll_paid: 30000
        };
        
        const localRecords = storedRecords && storedRecords !== '[]' ? JSON.parse(storedRecords) : [
          { id: 1, type: 'vat', period: '2026-Q1', liability_amount: 50000, paid_amount: 50000, due_date: '2026-04-30', status: 'paid' },
          { id: 2, type: 'vat', period: '2026-Q2', liability_amount: 60000, paid_amount: 20000, due_date: '2026-07-30', status: 'partial' },
          { id: 3, type: 'income', period: '2025', liability_amount: 500000, paid_amount: 200000, due_date: '2026-04-30', status: 'partial' }
        ];'''

content = content.replace(old_mock_logic, new_mock_logic)

# Fix 2: Add empty state
old_tbody = '''            <tbody className="text-sm text-slate-600">
              {records.map((record) => (
                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">'''

new_tbody = '''            <tbody className="text-sm text-slate-600">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="font-bold text-slate-600">لا توجد سجلات ضريبية</p>
                      <p className="text-sm">لم يتم إضافة أي بيانات للفترات الضريبية حتى الآن.</p>
                    </div>
                  </td>
                </tr>
              ) : records.map((record) => (
                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">'''

content = content.replace(old_tbody, new_tbody)

with open("src/pages/TaxesPage.tsx", "w") as f:
    f.write(content)

