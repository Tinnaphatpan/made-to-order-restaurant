'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TABLE_COUNT = 12; // จำนวนโต๊ะ

export default function AdminTablesPage() {
  const [baseUrl, setBaseUrl] = useState(
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );
  const [tableCount, setTableCount] = useState(TABLE_COUNT);
  const [size, setSize] = useState(160);

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const handlePrint = () => window.print();

  const handleDownload = (tableNum) => {
    const svg = document.getElementById(`qr-table-${tableNum}`)?.closest('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `qr-table-${tableNum}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="page-header mb-6">
        <div>
          <h1 className="page-title">QR Code โต๊ะ</h1>
          <p className="text-sm text-gray-400 mt-0.5">ลูกค้า Scan เพื่อเข้าสู่เมนูโดยตรง</p>
        </div>
        <button onClick={handlePrint} className="btn-primary text-sm print:hidden">
          🖨️ พิมพ์ทั้งหมด
        </button>
      </header>

      {/* Settings */}
      <section className="card p-5 mb-8 flex flex-wrap gap-6 items-end print:hidden">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">URL ร้าน</label>
          <input
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            className="input w-72 text-sm"
            placeholder="https://your-domain.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">จำนวนโต๊ะ</label>
          <input
            type="number" min="1" max="50" value={tableCount}
            onChange={e => setTableCount(Math.min(50, Math.max(1, Number(e.target.value))))}
            className="input w-24 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">ขนาด QR (px)</label>
          <select value={size} onChange={e => setSize(Number(e.target.value))} className="input w-28 text-sm">
            <option value={120}>120px</option>
            <option value={160}>160px</option>
            <option value={200}>200px</option>
            <option value={256}>256px</option>
          </select>
        </div>
      </section>

      {/* QR Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 print:grid-cols-4 print:gap-3">
        {tables.map(num => {
          const url = `${baseUrl}/menu?table=${num}`;
          return (
            <div key={num} className="card p-5 flex flex-col items-center gap-3 print:shadow-none print:border print:border-gray-200 print:p-3">
              <p className="font-bold text-gray-700 text-sm">โต๊ะ {num}</p>
              <QRCodeSVG
                id={`qr-table-${num}`}
                value={url}
                size={size}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                level="M"
                includeMargin
              />
              <p className="text-xs text-gray-400 text-center break-all">{url}</p>
              <button
                onClick={() => handleDownload(num)}
                className="btn-secondary text-xs px-3 py-1.5 print:hidden"
              >
                ดาวน์โหลด SVG
              </button>
            </div>
          );
        })}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:grid-cols-4, .print\\:grid-cols-4 * { visibility: visible; }
          .print\\:grid-cols-4 { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
