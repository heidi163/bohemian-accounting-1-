const express = require('express');
const app = express();
app.use(express.json());

let journalEntries = [ {id:1}, {id:2}, {id:3} ];

app.post("/api/banks/transaction", (req, res) => {
    const { type, amount, fromBankId, toBankId, bankId } = req.body;
    
    let description = '';
    
    if (type === 'transfer') {
       description = `تحويل من ${fromBankId} إلى ${toBankId}`;
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

app.listen(3001, () => console.log('started'));
