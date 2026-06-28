import { useEffect, useState } from "react";
import { type JournalEntry } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import { getCompanyKey } from '../utils/storage';

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  posted: 'bg-emerald-100 text-emerald-700',
  reversed: 'bg-red-100 text-red-700',
};

const statusTranslations: Record<string, string> = {
  draft: 'مسودة',
  pending_approval: 'في انتظار الموافقة',
  posted: 'مُرحل',
  reversed: 'معكوس',
};

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/journal-entries")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => setEntries(data.data))
      .catch(() => {
        const localJournals = JSON.parse(localStorage.getItem(getCompanyKey('mock_journals')) || '[]');
        if (localJournals.length > 0) {
          setEntries(localJournals);
        } else {
          const defaults = [
            { id: 1, entry_number: 'JE-2026-00001', entry_date: '2026-05-01', description: 'رصيد افتتاحي', total_debit: 500000, total_credit: 500000, status: 'posted', company_id: 'BGK' },
            { id: 2, entry_number: 'JE-2026-00002', entry_date: '2026-05-15', description: 'إثبات رواتب شهر مايو', total_debit: 45000, total_credit: 45000, status: 'posted', company_id: 'BGK' },
            { id: 3, entry_number: 'JE-2026-00003', entry_date: '2026-06-01', description: 'تسوية عهدة موظف', total_debit: 1200, total_credit: 1200, status: 'pending_approval', company_id: 'O2N' }
          ];
          localStorage.setItem(getCompanyKey('mock_journals'), JSON.stringify(defaults));
          setEntries(defaults);
        }
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-lg">قيود اليومية</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition" onClick={() => navigate('/journal/new')}>
          قيد جديد
        </button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-start">رقم القيد</th>
              <th className="px-6 py-4 text-start">التاريخ</th>
              <th className="px-6 py-4 text-start">الشركة</th>
              <th className="px-6 py-4 text-start">الوصف</th>
              <th className="px-6 py-4 text-end">إجمالي المدين</th>
              <th className="px-6 py-4 text-end">إجمالي الدائن</th>
              <th className="px-6 py-4 text-start">الحالة</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600">
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap text-start">
                  {entry.entry_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-start">
                  {format(new Date(entry.entry_date), 'yyyy/MM/dd')}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap text-start">{entry.company_id}</td>
                <td className="px-6 py-4 max-w-xs truncate text-start">{entry.description}</td>
                <td className="px-6 py-4 text-end font-mono font-medium whitespace-nowrap" dir="ltr">
                  {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(entry.total_debit)}
                </td>
                <td className="px-6 py-4 text-end font-mono font-medium whitespace-nowrap" dir="ltr">
                  {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(entry.total_credit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-start">
                  <span className={clsx('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none disabled:opacity-50 cursor-pointer hover:opacity-80', statusStyles[entry.status])}
                        onClick={() => {
                          if (entry.status === 'posted') {
                            if(confirm("هل تريد بالتأكيد عمل قيد عكسي (Reverse Entry) لهذا القيد؟")) {
                               const localJournals = JSON.parse(localStorage.getItem(getCompanyKey('mock_journals')) || '[]');
                               const updatedJournals = localJournals.map((j: any) => j.id === entry.id ? { ...j, status: 'reversed' } : j);
                               const reverseEntry = {
                                 ...entry,
                                 id: Date.now(),
                                 entry_number: `REV-${entry.entry_number}`,
                                 description: `قيد عكسي لـ ${entry.entry_number}: ${entry.description}`,
                                 status: 'posted'
                               };
                               updatedJournals.unshift(reverseEntry);
                               localStorage.setItem(getCompanyKey('mock_journals'), JSON.stringify(updatedJournals));
                               setEntries(updatedJournals);
                               alert("تم إنشاء القيد العكسي بنجاح");
                            }
                          }
                        }}
                  >
                    {statusTranslations[entry.status]} {entry.status === 'posted' ? ' ⟲' : ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
