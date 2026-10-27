import type { PrayerSubmission, PrayerReason } from '@/types/database';

type Props = {
  submissions: PrayerSubmission[];
  reasons: PrayerReason[];
};

export default function PrintablePrayerSheet({ submissions, reasons }: Props) {
  const reasonMap = Object.fromEntries(reasons.map((r) => [r.id, r.label_he]));
  const reasonMapEn = Object.fromEntries(reasons.map((r) => [r.id, r.label_en]));

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Flatten all prayer names across submissions
  const allNames: {
    name: string;
    reasonEn: string;
    reasonHe: string;
    donorName: string;
    note: string | null;
  }[] = [];

  for (const submission of submissions) {
    for (const entry of submission.names_list ?? []) {
      if (!entry.name) continue;
      allNames.push({
        name: entry.name,
        reasonEn: entry.reason_id ? (reasonMapEn[entry.reason_id] ?? '') : '',
        reasonHe: entry.reason_id ? (reasonMap[entry.reason_id] ?? '') : '',
        donorName: submission.donor_name,
        note: entry.note ?? null,
      });
    }
  }

  return (
    <div
      className="print:m-0 print:p-0 min-h-screen bg-white"
      style={{ fontFamily: 'serif' }}
    >
      {/* Print-only controls strip (hidden in print) */}
      <div className="print:hidden bg-brand-navy text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Prayer Distribution Sheet</p>
          <p className="text-sm text-white/70">Formatted for print — {submissions.length} submissions, {allNames.length} names</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-brand-gold text-brand-navy font-bold px-5 py-2 rounded-lg hover:bg-brand-gold-hover transition-colors"
        >
          🖨 Print
        </button>
      </div>

      {/* Printable content */}
      <div className="max-w-[720px] mx-auto px-8 py-10 print:px-6 print:py-4">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Heebo', 'David', serif", direction: 'rtl' }}
          >
            לקראת כלה — שמות לתפילה
          </h1>
          <h2 className="text-xl font-semibold mb-2">Likrat Kalla — Names for Prayer</h2>
          <p className="text-sm text-gray-600">Distribution Day Sheet · {today}</p>
          <p className="text-xs text-gray-400 mt-1">
            {allNames.length} name{allNames.length !== 1 ? 's' : ''} from {submissions.length} donor{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {allNames.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No prayer names submitted yet.</p>
          </div>
        ) : (
          <>
            {/* Instructions in Hebrew */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-right" dir="rtl">
              <p className="text-sm font-semibold mb-1" style={{ fontFamily: "'Heebo', serif" }}>
                הוראות לכלה:
              </p>
              <p className="text-sm text-gray-700" style={{ fontFamily: "'Heebo', serif" }}>
                אנא התפללי לכל השמות הרשומים מטה, לפי הסיבה המצוינת לצד כל שם. תפילתך יקרה מאוד לתורמים ולמשפחותיהם.
              </p>
            </div>

            {/* Names table */}
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 pr-4 font-bold w-8">#</th>
                  <th className="text-left py-2 pr-4 font-bold">Name / שם</th>
                  <th className="text-left py-2 pr-4 font-bold">Prayer Intention / תפילה</th>
                  <th className="text-left py-2 font-bold hidden print:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {allNames.map((entry, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-semibold text-base">{entry.name}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      {entry.reasonEn && (
                        <div>
                          <p className="text-xs text-gray-600">{entry.reasonEn}</p>
                          {entry.reasonHe && (
                            <p
                              className="text-xs text-gray-500"
                              dir="rtl"
                              style={{ fontFamily: "'Heebo', serif" }}
                            >
                              {entry.reasonHe}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-gray-500 hidden print:table-cell">
                      {entry.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer blessing */}
            <div
              className="mt-8 pt-6 border-t border-gray-300 text-center"
              dir="rtl"
              style={{ fontFamily: "'Heebo', serif" }}
            >
              <p className="text-base font-semibold">
                יהי רצון מלפני אבינו שבשמים שכל התפילות יתקבלו ברצון
              </p>
              <p className="text-xs text-gray-400 mt-1">
                — Likrat Kalla · לקראת כלה
              </p>
            </div>

            {/* Donor summary (screen only, not print) */}
            <div className="print:hidden mt-10 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-700 mb-3">Donor Summary</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Donor</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Names</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <p className="font-medium">{s.donor_name}</p>
                        <p className="text-xs text-gray-400">{s.donor_email}</p>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{s.sponsorship_type}</td>
                      <td className="px-3 py-2 text-xs">₪{s.amount_nis}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {(s.names_list ?? []).map((n) => n.name).filter(Boolean).join(', ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
