import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock initial data
  let dashboardData = {
    totalCash: 1250450.00,
    receivables: 450800.50,
    payables: 215000.00,
    netProfit: 158000.00,
  };

  let accounts = [
    { id: 1, code: '1', name: 'الأصول', type: 'asset', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
    { id: 2, code: '11', name: 'الأصول المتداولة', type: 'asset', level: 'sub', parent_code: '1', company_id: 'ALL', is_active: true },
    { id: 3, code: '111', name: 'النقدية وما في حكمها', type: 'asset', level: 'sub', parent_code: '11', company_id: 'ALL', is_active: true },
    { id: 4, code: '1111', name: 'البنك الأهلي - EGP', type: 'asset', level: 'detail', parent_code: '111', company_id: 'BGK', is_active: true },
    { id: 5, code: '1112', name: 'CIB - USD', type: 'asset', level: 'detail', parent_code: '111', company_id: 'O2N', is_active: true },
    { id: 6, code: '2', name: 'الخصوم', type: 'liability', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
    { id: 7, code: '21', name: 'أرصدة دائنة أخرى', type: 'liability', level: 'sub', parent_code: '2', company_id: 'ALL', is_active: true },
    { id: 8, code: '211', name: 'جاري شركات شقيقة (Due To)', type: 'liability', level: 'detail', parent_code: '21', company_id: 'ALL', is_active: true },
    { id: 9, code: '3', name: 'حقوق الملكية', type: 'equity', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
    { id: 10, code: '4', name: 'الإيرادات', type: 'revenue', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
    { id: 11, code: '5', name: 'المصروفات', type: 'expense', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
  ];

  let invoices = [
    { id: 1, type: 'invoice', invoice_number: 'BGK-INV-2026-00001', customer_name: 'Bohemian Geeks', total_amount: 15400, paid_amount: 15400, tax_amount: 1400, discount_amount: 0, status: 'paid', invoice_date: '2026-05-10', due_date: '2026-05-24', currency: 'EGP', project_id: 'PRJ-001', recurring_status: 'none' },
    { id: 2, type: 'invoice', invoice_number: 'O2N-INV-2026-00001', customer_name: 'TechFlow Inc', total_amount: 45000, paid_amount: 20000, tax_amount: 5000, discount_amount: 2000, status: 'partial', invoice_date: '2026-05-15', due_date: '2026-05-30', currency: 'EGP', recurring_status: 'active', recurring_frequency: 'monthly' },
    { id: 3, type: 'quotation', invoice_number: 'BGK-QT-2026-00002', customer_name: 'Sealy KSA', total_amount: 120500, paid_amount: 0, tax_amount: 15000, discount_amount: 5000, status: 'draft', invoice_date: '2026-06-01', due_date: '2026-06-15', currency: 'SAR', recurring_status: 'none' },
    { id: 4, type: 'proforma', invoice_number: 'BGK-PRO-2026-00001', customer_name: 'Tech Solutions', total_amount: 85000, paid_amount: 0, tax_amount: 10000, discount_amount: 0, status: 'pending_approval', invoice_date: '2026-06-10', due_date: '2026-06-20', currency: 'EGP', recurring_status: 'none' },
  ];

  let journalEntries = [
    { id: 1, entry_number: 'JE-2026-00001', entry_date: '2026-06-01', description: 'Opening Balances', total_debit: 500000, total_credit: 500000, status: 'posted', company_id: 'BGK' },
    { id: 2, entry_number: 'JE-2026-00002', entry_date: '2026-06-02', description: 'Rent Payment June', total_debit: 15000, total_credit: 15000, status: 'reversed', company_id: 'O2N' },
    { id: 3, entry_number: 'JE-2026-00003', entry_date: '2026-06-10', description: 'Intercompany Transfer', total_debit: 120500, total_credit: 120500, status: 'draft', company_id: 'BGK' },
  ];

  let contacts = [
    { id: 1, type: 'customer', code: 'CUST-2026-001', name: 'بوهيميان جيكس (Bohemian Geeks)', email: 'hello@bohemiangeeks.com', phone: '01001234567', balance: 15400, credit_limit: 50000, opening_balance: 5000, outstanding_balance: 10400, aging: { '0_30': 10000, '31_60': 400, '61_90': 0, '91_plus': 0 }, sub_contacts: [{ name: 'Ahmed', email: 'ahmed@bohemiangeeks.com', phone: '0100000000' }] },
    { id: 2, type: 'customer', code: 'CUST-2026-002', name: 'Sealy KSA', email: 'info@sealy.sa', phone: '+9665000000', balance: 120500, credit_limit: 500000, opening_balance: 0, outstanding_balance: 120500, aging: { '0_30': 50000, '31_60': 70500, '61_90': 0, '91_plus': 0 }, sub_contacts: [] },
    { id: 3, type: 'supplier', code: 'SUP-2026-001', name: 'Office Supplies Co.', email: 'sales@osc.com', phone: '0223456789', balance: -4500, credit_limit: 0, opening_balance: 0, outstanding_balance: 0, aging: { '0_30': 0, '31_60': 0, '61_90': 0, '91_plus': 0 }, sub_contacts: [] },
    { id: 4, type: 'customer', code: 'CUST-2026-003', name: 'Tech Solutions', email: 'info@techsol.com', phone: '01112223334', balance: 85000, credit_limit: 100000, opening_balance: 10000, outstanding_balance: 75000, aging: { '0_30': 0, '31_60': 0, '61_90': 75000, '91_plus': 0 }, sub_contacts: [{ name: 'Ali', email: 'ali@techsol.com', phone: '0110000001' }] },
  ];

  let bills = [
    { id: 1, bill_number: 'BILL-2026-00001', reference_number: 'AWS-INV-001', supplier_name: 'Amazon Web Services', total_amount: 1200, paid_amount: 1200, tax_amount: 0, status: 'paid', bill_date: '2026-05-01', due_date: '2026-05-31', currency: 'USD', project_id: 'PRJ-001' },
    { id: 2, bill_number: 'BILL-2026-00002', reference_number: 'AD-2026', supplier_name: 'Google Ads', total_amount: 15000, paid_amount: 5000, tax_amount: 2100, status: 'partial', bill_date: '2026-06-01', due_date: '2026-06-15', currency: 'EGP', cost_center: 'HQ' },
    { id: 3, bill_number: 'BILL-2026-00003', reference_number: 'RN-1234', supplier_name: 'Digital Ocean', total_amount: 450, paid_amount: 0, tax_amount: 0, status: 'pending_approval', bill_date: '2026-06-10', due_date: '2026-06-25', currency: 'USD' },
  ];

  let banks = [
    { id: 1, code: '1111', name: 'BGK-EGP', type: 'bank', currency: 'EGP', balance: 250000, company_id: 'BGK' },
    { id: 2, code: '1112', name: 'BGK-USD', type: 'bank', currency: 'USD', balance: 15000, company_id: 'BGK' },
    { id: 3, code: '1113', name: 'GXD-EGP', type: 'bank', currency: 'EGP', balance: 100000, company_id: 'GXD' },
    { id: 4, code: '1114', name: 'GXD-USD', type: 'bank', currency: 'USD', balance: 8000, company_id: 'GXD' },
    { id: 5, code: '1120', name: 'Cash Box', type: 'cash', currency: 'EGP', balance: 45000, company_id: 'ALL' },
  ];

  let employees = [
    { id: 1, employee_code: 'EMP-001', name: 'Ahmed Mohamed', department: 'Engineering', position: 'Senior Developer', basic_salary: 25000, join_date: '2024-01-15', status: 'active', allowances: 5000 },
    { id: 2, employee_code: 'EMP-002', name: 'Sara Ali', department: 'Marketing', position: 'Marketing Manager', basic_salary: 30000, join_date: '2023-11-01', status: 'active', allowances: 6000 },
    { id: 3, employee_code: 'EMP-003', name: 'Mahmoud Hassan', department: 'Sales', position: 'Sales Representative', basic_salary: 15000, join_date: '2025-03-10', status: 'active', allowances: 3000 },
  ];

  let payrolls = [
    { id: 1, period: '2026-05', date: '2026-05-31', total_basic: 70000, total_allowances: 14000, total_bonuses: 5000, total_deductions: 2000, total_taxes: 8000, total_social_insurance: 7700, net_salary: 71300, status: 'paid' },
  ];

  let assets = [
    { id: 1, asset_code: 'COMP-001', name: 'MacBook Pro 16"', category: 'computers', purchase_date: '2025-01-10', purchase_price: 120000, salvage_value: 20000, useful_life_years: 3, depreciation_method: 'straight_line', accumulated_depreciation: 47222, net_book_value: 72778, status: 'active', location: 'HQ - IT Dept', last_depreciation_date: '2026-05-31' },
    { id: 2, asset_code: 'CAR-001', name: 'Toyota Corolla 2024', category: 'cars', purchase_date: '2024-06-01', purchase_price: 1500000, salvage_value: 300000, useful_life_years: 5, depreciation_method: 'declining_balance', accumulated_depreciation: 400000, net_book_value: 1100000, status: 'active', location: 'Sales Team', last_depreciation_date: '2026-05-31' },
    { id: 3, asset_code: 'FURN-001', name: 'Office Desks & Chairs', category: 'furniture', purchase_date: '2023-01-15', purchase_price: 50000, salvage_value: 5000, useful_life_years: 10, depreciation_method: 'straight_line', accumulated_depreciation: 15000, net_book_value: 35000, status: 'active', location: 'HQ - Main Office', last_depreciation_date: '2026-05-31' },
  ];
  let taxRecords = [
    { id: 1, type: 'vat', period: '2026-Q1', liability_amount: 45000, paid_amount: 45000, status: 'paid', due_date: '2026-04-30' },
    { id: 2, type: 'vat', period: '2026-Q2', liability_amount: 15000, paid_amount: 0, status: 'pending', due_date: '2026-07-31' },
    { id: 3, type: 'income', period: '2025', liability_amount: 120000, paid_amount: 50000, status: 'partial', due_date: '2026-03-31' },
    { id: 4, type: 'withholding', period: '2026-05', liability_amount: 2500, paid_amount: 2500, status: 'posted', due_date: '2026-06-15' },
    { id: 5, type: 'payroll', period: '2026-05', liability_amount: 8000, paid_amount: 0, status: 'pending', due_date: '2026-06-15' }
  ];

  let loans = [
    {
      id: 1, type: 'bank', lender_name: 'CIB Bank', original_amount: 500000, interest_rate: 15, start_date: '2025-01-01', end_date: '2030-01-01', remaining_principal: 400000, status: 'active',
      installments: [
        { id: 101, due_date: '2026-05-01', principal_amount: 8333, interest_amount: 5000, total_amount: 13333, status: 'paid' },
        { id: 102, due_date: '2026-06-01', principal_amount: 8333, interest_amount: 4900, total_amount: 13233, status: 'pending' },
      ]
    },
    {
      id: 2, type: 'personal', lender_name: 'Ahmed Mohamed', original_amount: 100000, interest_rate: 0, start_date: '2025-06-01', end_date: '2027-06-01', remaining_principal: 50000, status: 'active',
      installments: [
        { id: 201, due_date: '2026-05-01', principal_amount: 4166, interest_amount: 0, total_amount: 4166, status: 'paid' },
        { id: 202, due_date: '2026-06-01', principal_amount: 4166, interest_amount: 0, total_amount: 4166, status: 'pending' },
      ]
    }
  ];

  let partners = [
    {
      id: 1, partner_name: 'Ahmed Mohamed', equity_share: 60, capital_balance: 600000, current_balance: 15000,
      transactions: [
        { id: 1001, date: '2026-01-10', type: 'capital_injection', amount: 600000, description: 'Initial Capital' },
        { id: 1002, date: '2026-05-15', type: 'deposit', amount: 20000, description: 'Cash Support' },
        { id: 1003, date: '2026-05-30', type: 'withdrawal', amount: 5000, description: 'Personal Expenses' }
      ]
    },
    {
      id: 2, partner_name: 'Sara Ali', equity_share: 40, capital_balance: 400000, current_balance: -5000,
      transactions: [
        { id: 2001, date: '2026-01-10', type: 'capital_injection', amount: 400000, description: 'Initial Capital' },
        { id: 2002, date: '2026-04-20', type: 'withdrawal', amount: 5000, description: 'Personal Expenses' }
      ]
    }
  ];
  let costCenters = [
    { id: 'HQ', name: 'Headquarters', parent_id: null, manager_name: 'Ahmed Mohamed', budget: 1000000, actual_cost: 450000, revenue: 0 },
    { id: 'SALES', name: 'Sales Department', parent_id: 'HQ', manager_name: 'Sara Ali', budget: 300000, actual_cost: 280000, revenue: 2000000 },
    { id: 'IT', name: 'IT Department', parent_id: 'HQ', manager_name: 'Mahmoud Hassan', budget: 200000, actual_cost: 150000, revenue: 0 },
    { id: 'IT-DEV', name: 'Development Team', parent_id: 'IT', manager_name: 'Ali Omar', budget: 150000, actual_cost: 120000, revenue: 0 }
  ];

  let projects = [
    {
      id: 'PRJ-001', project_code: 'ERP-BGK', name: 'ERP Implementation', customer_id: 1, customer_name: 'Bohemian Geeks',
      budget_revenue: 500000, budget_cost: 300000, actual_revenue: 450000, actual_cost: 320000,
      status: 'in_progress', start_date: '2026-01-01', end_date: '2026-12-31'
    },
    {
      id: 'PRJ-002', project_code: 'WEB-SEALY', name: 'E-commerce Website', customer_id: 2, customer_name: 'Sealy KSA',
      budget_revenue: 120500, budget_cost: 50000, actual_revenue: 120500, actual_cost: 45000,
      status: 'completed', start_date: '2026-03-01', end_date: '2026-06-01'
    }
  ];


  // API Routes
  app.get("/api/dashboard", (req, res) => {
    res.json({ success: true, data: dashboardData });
  });

  app.get("/api/accounts", (req, res) => {
    res.json({ success: true, data: accounts });
  });

  app.post("/api/accounts", (req, res) => {
    const newAccount = req.body;
    newAccount.id = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
    accounts.push(newAccount);
    res.json({ success: true, data: newAccount });
  });

  app.get("/api/invoices", (req, res) => {
    res.json({ success: true, data: invoices });
  });

  app.post("/api/invoices", (req, res) => {
    const newInvoice = req.body;
    newInvoice.id = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    newInvoice.invoice_number = `BGK-INV-2026-${String(newInvoice.id).padStart(5, '0')}`;
    invoices.push(newInvoice);
    res.json({ success: true, data: newInvoice });
  });

  app.post("/api/invoices/:id/send", (req, res) => {
    const id = parseInt(req.params.id);
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    if (invoice.status === 'draft' || invoice.status === 'pending_approval') {
      invoice.status = 'issued';
    }
    res.json({ success: true, message: 'تم الإرسال بنجاح', data: invoice });
  });

  app.post("/api/invoices/:id/payment", (req, res) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    invoice.paid_amount += Number(amount);
    if (invoice.paid_amount >= invoice.total_amount) {
       invoice.status = 'paid';
    } else if (invoice.paid_amount > 0) {
       invoice.status = 'partial';
    }
    res.json({ success: true, message: 'تم تسجيل الدفعة بنجاح', data: invoice });
  });

  app.get("/api/invoices/:id/download", (req, res) => {
    const id = parseInt(req.params.id);
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    res.json({ success: true, message: 'تم إنشاء الفاتورة بنجاح', downloadUrl: `/invoices/pdf/${id}` });
  });

  app.get("/api/bills", (req, res) => {
    res.json({ success: true, data: bills });
  });

  app.post("/api/bills/:id/approve", (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const bill = bills.find(b => b.id === id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    
    if (status === 'approved' || status === 'cancelled') {
      bill.status = status;
    }
    res.json({ success: true, message: status === 'approved' ? 'تم اعتماد الفاتورة بنجاح' : 'تم رفض الفاتورة', data: bill });
  });

  app.post("/api/bills/:id/payment", (req, res) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    const bill = bills.find(b => b.id === id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    
    bill.paid_amount += Number(amount);
    if (bill.paid_amount >= bill.total_amount) {
       bill.status = 'paid';
    } else if (bill.paid_amount > 0) {
       bill.status = 'partial';
    }
    res.json({ success: true, message: 'تم تسجيل الصرف بنجاح', data: bill });
  });

  app.get("/api/bills/:id/download", (req, res) => {
    const id = parseInt(req.params.id);
    const bill = bills.find(b => b.id === id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    
    res.json({ success: true, message: 'تم إنشاء الفاتورة بنجاح', downloadUrl: `/bills/pdf/${id}` });
  });

  app.get("/api/journal-entries", (req, res) => {
    res.json({ success: true, data: journalEntries });
  });

  app.post("/api/journal-entries", (req, res) => {
    const newEntry = req.body;
    newEntry.id = journalEntries.length > 0 ? Math.max(...journalEntries.map(e => e.id)) + 1 : 1;
    journalEntries.push(newEntry);
    res.json({ success: true, data: newEntry });
  });

  app.get("/api/contacts", (req, res) => {
    res.json({ success: true, data: contacts });
  });

  app.get("/api/banks", (req, res) => {
    res.json({ success: true, data: banks });
  });

  app.post("/api/banks", (req, res) => {
    const newBank = req.body;
    newBank.id = banks.length > 0 ? Math.max(...banks.map(b => b.id)) + 1 : 1;
    banks.push(newBank);
    res.json({ success: true, data: newBank });
  });

  app.post("/api/banks/transaction", (req, res) => {
    const { type, amount, fromBankId, toBankId, bankId, memo, exchangeRate = 1 } = req.body;
    
    let description = memo || '';
    
    if (type === 'transfer') {
       const fromBank = banks.find(b => String(b.id) === String(fromBankId));
       const toBank = banks.find(b => String(b.id) === String(toBankId));
       if (fromBank) fromBank.balance -= Number(amount);
       
       let receivedAmount = Number(amount);
       if (fromBank && toBank && fromBank.currency !== toBank.currency) {
         receivedAmount = Number(amount) / Number(exchangeRate);
       }
       if (toBank) toBank.balance += receivedAmount;
       
       if (!description) {
         description = `تحويل من ${fromBank?.name || ''} إلى ${toBank?.name || ''}`;
       }
    } else if (type === 'deposit') {
       const bank = banks.find(b => String(b.id) === String(bankId));
       if (bank) bank.balance += Number(amount);
       description = `إيداع في حساب ${bank?.name || ''}`;
    } else if (type === 'withdraw') {
       const bank = banks.find(b => String(b.id) === String(bankId));
       if (bank) bank.balance -= Number(amount);
       description = `سحب من حساب ${bank?.name || ''}`;
    }
    
    const newEntry = {
      id: journalEntries.length > 0 ? Math.max(...journalEntries.map(e => e.id)) + 1 : 1,
      entry_number: `JE-2026-${String(journalEntries.length + 1).padStart(5, '0')}`,
      entry_date: new Date().toISOString().split('T')[0],
      description,
      total_debit: Number(amount),
      total_credit: Number(amount),
      status: 'posted',
      company_id: 'ALL'
    };
    journalEntries.push(newEntry);
    
    res.json({ success: true });
  });

  app.get("/api/employees", (req, res) => {
    res.json({ success: true, data: employees });
  });

  app.post("/api/employees", (req, res) => {
    const newEmp = req.body;
    newEmp.id = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    newEmp.employee_code = `EMP-${String(newEmp.id).padStart(3, '0')}`;
    newEmp.status = 'active';
    employees.push(newEmp);
    res.json({ success: true, data: newEmp });
  });

  app.get("/api/payrolls", (req, res) => {
    res.json({ success: true, data: payrolls });
  });

  app.post("/api/payrolls", (req, res) => {
    const { period } = req.body;
    const newRun = {
      id: payrolls.length > 0 ? Math.max(...payrolls.map(p => p.id)) + 1 : 1,
      period,
      date: new Date().toISOString().split('T')[0],
      total_basic: 70000,
      total_allowances: 14000,
      total_bonuses: 5000,
      total_deductions: 2000,
      total_taxes: 8000,
      total_social_insurance: 7700,
      net_salary: 71300,
      status: 'review'
    };
    payrolls.push(newRun);
    res.json({ success: true, data: newRun });
  });

  app.get("/api/assets", (req, res) => {
    res.json({ success: true, data: assets });
  });

  app.post("/api/assets", (req, res) => {
    const asset = req.body;
    const newAsset = {
      ...asset,
      id: assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1,
      status: 'active'
    };
    assets.push(newAsset);
    res.json({ success: true, data: newAsset });
  });

  app.post("/api/assets/depreciation", (req, res) => {
    assets.forEach(asset => {
      if (asset.status !== 'active') return;
      if (asset.net_book_value <= asset.salvage_value) return;

      let monthlyDepreciation = 0;
      if (asset.depreciation_method === 'straight_line') {
        const annualDepreciation = (asset.purchase_price - asset.salvage_value) / asset.useful_life_years;
        monthlyDepreciation = annualDepreciation / 12;
      } else if (asset.depreciation_method === 'declining_balance') {
        const rate = 2 / asset.useful_life_years;
        const annualDepreciation = asset.net_book_value * rate;
        monthlyDepreciation = annualDepreciation / 12;
      }

      if (asset.net_book_value - monthlyDepreciation < asset.salvage_value) {
        monthlyDepreciation = asset.net_book_value - asset.salvage_value;
      }

      asset.accumulated_depreciation += monthlyDepreciation;
      asset.net_book_value -= monthlyDepreciation;
      asset.last_depreciation_date = new Date().toISOString().split('T')[0];
    });

    res.json({ success: true, message: 'Depreciation executed successfully', data: assets });
  });

  app.get("/api/taxes", (req, res) => {
    const summary = {
      vat_liability: 0, vat_paid: 0,
      income_liability: 0, income_paid: 0,
      withholding_liability: 0, withholding_paid: 0,
      payroll_liability: 0, payroll_paid: 0
    };

    taxRecords.forEach(record => {
      const type = record.type as keyof typeof summary;
      const liabilityKey = `${type}_liability` as keyof typeof summary;
      const paidKey = `${type}_paid` as keyof typeof summary;
      
      if (liabilityKey in summary && paidKey in summary) {
         summary[liabilityKey] += record.liability_amount;
         summary[paidKey] += record.paid_amount;
      }
    });

    res.json({ success: true, summary, records: taxRecords });
  });

  app.post("/api/taxes/payment", (req, res) => {
    const { id, amount } = req.body;
    const record = taxRecords.find(r => r.id === id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    record.paid_amount += amount;
    if (record.paid_amount >= record.liability_amount) {
      record.status = 'paid';
    } else {
      record.status = 'partial';
    }

    res.json({ success: true, message: 'Payment registered', record });
  });

  app.post("/api/taxes/post", (req, res) => {
    const { id } = req.body;
    const record = taxRecords.find(r => r.id === id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    record.status = 'posted';
    res.json({ success: true, message: 'Taxes posted successfully', record });
  });

  app.get("/api/loans", (req, res) => {
    res.json({ success: true, data: loans });
  });

  app.post("/api/loans/payment", (req, res) => {
    const { loan_id, installment_id } = req.body;
    const loan = loans.find(l => l.id === loan_id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const installment = loan.installments.find(i => i.id === installment_id);
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });

    installment.status = 'paid';
    loan.remaining_principal -= installment.principal_amount;
    
    if (loan.remaining_principal <= 0) {
      loan.status = 'closed';
    }

    res.json({ success: true, message: 'Installment paid successfully', data: loans });
  });

  app.get("/api/partners", (req, res) => {
    res.json({ success: true, data: partners });
  });

  app.post("/api/partners/transaction", (req, res) => {
    const { partner_id, type, amount, description } = req.body;
    const partner = partners.find(p => p.id === partner_id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });

    const newTx = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type,
      amount,
      description
    };

    partner.transactions.push(newTx);

    if (type === 'deposit') {
      partner.current_balance += amount;
    } else if (type === 'withdrawal') {
      partner.current_balance -= amount;
    } else if (type === 'capital_injection') {
      partner.capital_balance += amount;
    }

    res.json({ success: true, message: 'Transaction recorded successfully', data: partners });
  });

  app.get("/api/cost-centers", (req, res) => {
    // Basic nested hierarchy builder
    const buildTree = (centers: any[], parentId: string | null = null): any[] => {
      return centers
        .filter(c => c.parent_id === parentId)
        .map(c => ({
          ...c,
          children: buildTree(centers, c.id)
        }));
    };
    const tree = buildTree(costCenters);
    res.json({ success: true, data: tree, raw: costCenters });
  });

  app.get("/api/projects", (req, res) => {
    res.json({ success: true, data: projects });
  });

  app.get("/api/projects/analysis", (req, res) => {
    const analysis = projects.map(p => {
      const gross_profit = p.actual_revenue - p.actual_cost;
      const profit_margin = p.actual_revenue > 0 ? (gross_profit / p.actual_revenue) * 100 : 0;
      const revenue_variance = p.actual_revenue - p.budget_revenue;
      const cost_variance = p.budget_cost - p.actual_cost; // positive is good
      
      return {
        id: p.id,
        gross_profit,
        net_profit: gross_profit, // simplifying net profit as gross here
        profit_margin,
        revenue_variance,
        cost_variance
      };
    });
    res.json({ success: true, data: analysis });
  });

  app.get("/api/cash-flow/forecast", (req, res) => {
    const scenario = req.query.scenario || 'realistic';
    let multiplier = 1;
    if (scenario === 'optimistic') multiplier = 1.2;
    if (scenario === 'pessimistic') multiplier = 0.8;

    let currentBalance = 500000;
    const forecast = [];
    
    for (let i = 1; i <= 12; i++) {
      const baseInflow = 150000 + (Math.random() * 50000);
      const baseOutflow = 120000 + (Math.random() * 40000);
      
      const inflows = baseInflow * multiplier;
      const outflows = baseOutflow * (scenario === 'optimistic' ? 0.9 : scenario === 'pessimistic' ? 1.1 : 1);
      
      const endingBalance = currentBalance + inflows - outflows;
      
      forecast.push({
        period: `Week ${i}`,
        starting_balance: currentBalance,
        inflows,
        outflows,
        ending_balance: endingBalance
      });
      
      currentBalance = endingBalance;
    }

    res.json({ success: true, data: forecast });
  });

  app.get("/api/cash-flow/insights", (req, res) => {
    // Generate some mock alerts and recommendations
    const alerts = [
      { status: 'warning', message: 'Cash balance projected to drop below minimum reserve in Week 8.', triggered_period: 'Week 8' }
    ];
    
    const recommendations = [
      { id: 'REC-1', type: 'collection', action: 'Expedite collection of Invoice O2N-INV-2026-00001 (TechFlow Inc)', impact_amount: 25000 },
      { id: 'REC-2', type: 'payment_delay', action: 'Delay payment for BILL-2026-00002 to preserve short-term liquidity', impact_amount: 10000 }
    ];

    res.json({ success: true, alerts, recommendations });
  });

  app.get("/api/profitability/rankings", (req, res) => {
    // Mock clients based on invoices data
    const clientProfitability = [
      { client_id: 1, client_name: 'Bohemian Geeks', total_revenue: 15400, total_cost: 8000, net_profit: 7400, profit_margin: 48.05 },
      { client_id: 2, client_name: 'TechFlow Inc', total_revenue: 45000, total_cost: 50000, net_profit: -5000, profit_margin: -11.11 },
      { client_id: 3, client_name: 'Sealy KSA', total_revenue: 120500, total_cost: 60000, net_profit: 60500, profit_margin: 50.20 }
    ];

    const topClients = [...clientProfitability].filter(c => c.net_profit > 0).sort((a, b) => b.net_profit - a.net_profit);
    const unprofitableClients = [...clientProfitability].filter(c => c.net_profit <= 0);

    const projectProfitability = projects.map(p => {
      const allocated_overhead = p.actual_cost * 0.15; // 15% overhead
      const total_cost = p.actual_cost + allocated_overhead;
      const net_profit = p.actual_revenue - total_cost;
      const profit_margin = p.actual_revenue > 0 ? (net_profit / p.actual_revenue) * 100 : 0;
      
      return {
        id: p.id,
        project_name: p.name,
        customer_name: p.customer_name,
        gross_profit: p.actual_revenue - p.actual_cost,
        net_profit,
        profit_margin,
        revenue_variance: p.actual_revenue - p.budget_revenue,
        cost_variance: p.budget_cost - p.actual_cost,
        allocated_overhead
      };
    }).sort((a, b) => b.net_profit - a.net_profit);

    res.json({ 
      success: true, 
      data: {
        topClients,
        unprofitableClients,
        topProjects: projectProfitability
      }
    });
  });

  app.get("/api/reports/standard", (req, res) => {
    const standardReports = [
      { id: 'tb', title: 'ميزان المراجعة (Trial Balance)', description: 'أرصدة جميع الحسابات للتحقق من التوازن المالي.', category: 'financial', iconType: 'scale' },
      { id: 'pnl', title: 'قائمة الدخل (Income Statement)', description: 'بيان الأرباح والخسائر عن فترة زمنية محددة.', category: 'financial', iconType: 'trending-up' },
      { id: 'bs', title: 'الميزانية العمومية (Balance Sheet)', description: 'المركز المالي (أصول، خصوم، حقوق ملكية).', category: 'financial', iconType: 'building' },
      { id: 'cf', title: 'التدفقات النقدية (Cash Flow)', description: 'حركة النقد الداخل والخارج.', category: 'financial', iconType: 'banknote' },
      { id: 'gl', title: 'دفتر الأستاذ العام (General Ledger)', description: 'التفاصيل الدقيقة لجميع الحركات المحاسبية.', category: 'financial', iconType: 'book-open' },
      
      { id: 'exec', title: 'لوحة القيادة التنفيذية (Executive Dashboard)', description: 'مؤشرات الأداء الرئيسية للإدارة العليا.', category: 'management', iconType: 'layout-dashboard' },
      { id: 'daily', title: 'ملخص الحركة اليومية (Daily Summary)', description: 'تقرير مجمع لحركة اليوم المالي.', category: 'management', iconType: 'calendar' },
      
      { id: 'aging', title: 'أعمار الديون (Aging Report)', description: 'تحليل أعمار ذمم العملاء والموردين.', category: 'operational', iconType: 'clock' },
      { id: 'cost_centers', title: 'مراكز التكلفة (Cost Centers)', description: 'المصاريف الموزعة على الأقسام والتحليل.', category: 'operational', iconType: 'target' },
      { id: 'projects', title: 'المشاريع (Projects)', description: 'موقف المشاريع من حيث التكلفة والربحية.', category: 'operational', iconType: 'folder-kanban' },
      
      { id: 'consolidated', title: 'الميزانية المجمعة (BGK + O2N)', description: 'تجميع أعمال الشركات مع استبعاد العمليات المتبادلة.', category: 'consolidated', iconType: 'network' },
    ];
    res.json({ success: true, data: standardReports });
  });

  app.get("/api/reports/data/:id", (req, res) => {
    // Mocking specific report data return. A real system would compute this.
    res.json({ 
      success: true, 
      report_id: req.params.id,
      data: [
        { account: 'Cash', debit: 500000, credit: 0 },
        { account: 'Accounts Receivable', debit: 150000, credit: 0 },
        { account: 'Accounts Payable', debit: 0, credit: 80000 },
        { account: 'Sales Revenue', debit: 0, credit: 620000 },
        { account: 'Operating Expenses', debit: 50000, credit: 0 }
      ]
    });
  });

  app.post("/api/reports/custom/run", (req, res) => {
    const config = req.body;
    
    let tableRows = [];
    let basePrefix = config.dataSource === 'invoices' ? 'Invoice' : config.dataSource === 'purchases' ? 'Purchase' : 'Entry';
    
    // Generate base mock data
    for (let i = 1; i <= 8; i++) {
        tableRows.push({
            id: 100 + i,
            col1: `${basePrefix} #${i}`,
            col2: Math.floor(Math.random() * 4000) + 100, // Random amount between 100 and 4100
            status: ['مكتمل', 'معلق', 'ملغى', 'مكتمل'][i % 4],
            date: `2026-06-${(i < 10 ? '0' : '') + i}`
        });
    }

    // Apply Filters
    if (config.filters && config.filters.length > 0) {
        if (config.filters.includes('المبلغ أكبر من 1000')) {
            tableRows = tableRows.filter(r => r.col2 > 1000);
        }
        if (config.filters.includes('العمليات المكتملة فقط')) {
            tableRows = tableRows.filter(r => r.status === 'مكتمل');
        }
        if (config.filters.includes('العمليات المعلقة')) {
            tableRows = tableRows.filter(r => r.status === 'معلق');
        }
        if (config.filters.includes('تاريخ اليوم')) {
            tableRows = tableRows.slice(0, 2); // Mock showing just today's entries
        }
    }

    // Also adjust chart data based on filtered rows
    const totalAmount = tableRows.reduce((sum, r) => sum + r.col2, 0);
    const chartData = [
       { label: 'Jan', value: totalAmount > 0 ? totalAmount * 0.3 : Math.floor(Math.random() * 5000) },
       { label: 'Feb', value: totalAmount > 0 ? totalAmount * 0.5 : Math.floor(Math.random() * 5000) },
       { label: 'Mar', value: totalAmount > 0 ? totalAmount * 0.8 : Math.floor(Math.random() * 5000) },
       { label: 'Apr', value: totalAmount > 0 ? totalAmount : Math.floor(Math.random() * 5000) }
    ];

    res.json({
      success: true,
      data: {
        chartData,
        tableRows
      }
    });
  });

  let periods = [
    { id: '2026-01', month: 1, year: 2026, status: 'hard_lock', checklists: [{ id: 'c1', name: 'Reconcile Banks', isCompleted: true, requiredForHardLock: true }, { id: 'c2', name: 'Depreciation Run (تنفيذ الإهلاك)', isCompleted: true, requiredForHardLock: false }] },
    { id: '2026-02', month: 2, year: 2026, status: 'hard_lock', checklists: [{ id: 'c1', name: 'Reconcile Banks', isCompleted: true, requiredForHardLock: true }, { id: 'c2', name: 'Depreciation Run (تنفيذ الإهلاك)', isCompleted: true, requiredForHardLock: false }] },
    { id: '2026-03', month: 3, year: 2026, status: 'soft_lock', checklists: [{ id: 'c1', name: 'Reconcile Banks', isCompleted: true, requiredForHardLock: true }, { id: 'c2', name: 'Depreciation Run (تنفيذ الإهلاك)', isCompleted: false, requiredForHardLock: false }] },
    { id: '2026-04', month: 4, year: 2026, status: 'open', checklists: [{ id: 'c1', name: 'Reconcile Banks', isCompleted: false, requiredForHardLock: true }, { id: 'c2', name: 'Depreciation Run (تنفيذ الإهلاك)', isCompleted: false, requiredForHardLock: false }] },
    { id: '2026-05', month: 5, year: 2026, status: 'open', checklists: [{ id: 'c1', name: 'Reconcile Banks', isCompleted: false, requiredForHardLock: true }, { id: 'c2', name: 'Depreciation Run (تنفيذ الإهلاك)', isCompleted: false, requiredForHardLock: false }] },
  ];

  app.get("/api/periods", (req, res) => {
    res.json({ success: true, data: periods });
  });

  app.post("/api/periods/close", (req, res) => {
    const { id, status } = req.body;
    const period = periods.find(p => p.id === id);
    if (!period) return res.status(404).json({ success: false, message: 'Period not found' });
    
    // Simulate validation
    if (status === 'hard_lock' && period.checklists.some(c => c.requiredForHardLock && !c.isCompleted)) {
      return res.status(400).json({ success: false, message: 'Cannot Hard Lock: Checklists incomplete.' });
    }

    period.status = status;
    res.json({ success: true, message: `تم تحديث حالة الفترة إلى ${status.replace('_', ' ')} بنجاح.`, data: periods });
  });

  app.post("/api/periods/checklist", (req, res) => {
    const { periodId, taskId, isCompleted } = req.body;
    const period = periods.find(p => p.id === periodId);
    if (!period) return res.status(404).json({ success: false, message: 'Period not found' });
    
    const task = period.checklists.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.isCompleted = isCompleted;
    res.json({ success: true, message: 'Checklist updated', data: periods });
  });

  const roles = [
    { id: 'r1', name: 'Super Admin', description: 'Full system access', isSystem: true, permissions: [] },
    { id: 'r2', name: 'Accountant', description: 'Standard accounting tasks', isSystem: true, permissions: [] },
    { id: 'r3', name: 'Auditor', description: 'Read-only access across all modules', isSystem: false, permissions: [] }
  ];

  const users = [
    { id: 'u1', name: 'Heidi Medhat', email: 'heidi@bohemiangeeks.com', roleId: 'r1', status: 'active', lastLogin: '2026-06-15T10:00:00Z' },
    { id: 'u2', name: 'Ahmed Hassan', email: 'ahmed@bohemiangeeks.com', roleId: 'r2', status: 'active', lastLogin: '2026-06-14T15:30:00Z' },
    { id: 'u3', name: 'Sara Ali', email: 'sara@bohemiangeeks.com', roleId: 'r3', status: 'locked', lastLogin: '2026-05-20T09:00:00Z' }
  ];

  app.get("/api/users", (req, res) => {
    res.json({ success: true, data: { users, roles } });
  });

  app.post("/api/users", (req, res) => {
    const { name, email, roleId } = req.body;
    if (!name || !email || !roleId) {
       return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const newUser = {
       id: `u${users.length + 1}`,
       name,
       email,
       roleId,
       status: 'active',
       lastLogin: new Date().toISOString()
    };
    users.push(newUser);
    res.json({ success: true, message: 'تم إضافة المستخدم بنجاح', data: { users, roles } });
  });

  app.put("/api/users/:id", (req, res) => {
    const { name, email, roleId, status } = req.body;
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (roleId) user.roleId = roleId;
    if (status) user.status = status;
    res.json({ success: true, message: 'تم تحديث بيانات المستخدم', data: { users, roles } });
  });

  app.post("/api/roles", (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Missing role name' });
    const newRole = {
       id: `r${roles.length + 1}`,
       name,
       description: description || '',
       isSystem: false,
       permissions: []
    };
    roles.push(newRole);
    res.json({ success: true, message: 'تم إنشاء الدور بنجاح', data: { users, roles } });
  });

  app.put("/api/roles/:id/permissions", (req, res) => {
    const { permissions } = req.body;
    const role = roles.find(r => r.id === req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSystem) return res.status(400).json({ success: false, message: 'لا يمكن تعديل صلاحيات أدوار النظام الأساسية (System Roles)' });
    role.permissions = permissions;
    res.json({ success: true, message: 'تم تحديث الصلاحيات بنجاح', data: { users, roles } });
  });

  app.post("/api/auth/login", (req, res) => {
    res.json({ success: true, token: 'mock_jwt_token_12345', refresh_token: 'mock_refresh_67890' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
