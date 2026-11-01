'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-brand-gold text-brand-navy font-bold px-5 py-2 rounded-lg hover:bg-brand-gold-hover transition-colors"
    >
      🖨 Print
    </button>
  );
}
