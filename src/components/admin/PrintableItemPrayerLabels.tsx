import type { PrayerSubmission, PrayerReason } from '@/types/database';
import PrintButton from './PrintButton';

type Props = {
  submissions: PrayerSubmission[];
  reasons: PrayerReason[];
};

type Label = {
  key: string;
  itemHe: string;
  itemEn: string;
  names: { name: string; reasonHe: string }[];
};

/**
 * One small label per donated catalog item unit (a donation of 3 x Towels
 * yields 3 labels), listing the people the donor asked us to pray for.
 * Labels are fixed at 60mm wide so they fit on small item boxes.
 */
export default function PrintableItemPrayerLabels({
  submissions,
  reasons,
}: Props) {
  const reasonHe = Object.fromEntries(reasons.map((r) => [r.id, r.label_he]));

  const labels: Label[] = [];
  for (const s of submissions) {
    const names = (s.names_list ?? [])
      .filter((n) => n.name)
      .map((n) => ({
        name: n.name,
        reasonHe: n.reason_id ? (reasonHe[n.reason_id] ?? '') : '',
      }));
    if (names.length === 0) continue;
    for (const item of s.items_list ?? []) {
      for (let i = 0; i < item.quantity; i++) {
        labels.push({
          key: `${s.id}-${item.id}-${i}`,
          itemHe: item.title_he,
          itemEn: item.title_en,
          names,
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`@page { size: A4; margin: 8mm; }`}</style>

      <div className="print:hidden bg-brand-navy text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Item Prayer Labels</p>
          <p className="text-sm text-white/70">
            {labels.length} small label{labels.length !== 1 ? 's' : ''}, one
            per donated item, from catalog donations with prayer names
          </p>
        </div>
        <PrintButton />
      </div>

      {labels.length === 0 ? (
        <p className="print:hidden text-center text-gray-400 py-16">
          No catalog donations with prayer names yet.
        </p>
      ) : (
        <div
          className="p-4 print:p-0 grid gap-[3mm] justify-start"
          style={{ gridTemplateColumns: 'repeat(auto-fill, 60mm)' }}
        >
          {labels.map((label) => (
            <div
              key={label.key}
              className="w-[60mm] border border-dashed border-gray-400 px-[2.5mm] py-[2mm] text-black"
              style={{ breakInside: 'avoid', fontFamily: "'Heebo', serif" }}
            >
              <p
                className="text-center font-bold leading-tight border-b border-gray-300 pb-[1mm] mb-[1mm]"
                dir="rtl"
                style={{ fontSize: '8pt' }}
              >
                {label.itemHe}
              </p>
              <ol className="space-y-[0.5mm]" style={{ fontSize: '9pt' }}>
                {label.names.map((n, i) => (
                  <li key={i} className="leading-tight">
                    <span className="font-semibold">{n.name}</span>
                    {n.reasonHe && (
                      <span
                        dir="rtl"
                        className="text-gray-700"
                        style={{ fontSize: '7pt' }}
                      >
                        {' '}
                        — {n.reasonHe}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p
                className="text-center text-gray-500 mt-[1mm]"
                style={{ fontSize: '6pt' }}
              >
                Likrat Kalla · לקראת כלה
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
