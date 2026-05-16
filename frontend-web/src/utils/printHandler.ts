export const printReceiptHTML = (printContent: string, title: string = "Cetak Nota") => {
  if (!printContent) return;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 65mm; 
            margin: 0 auto; 
            padding: 10px 0;
            color: #000;
            line-height: 1.5;
          }
          
          p, h2, h4 { margin: 0; }

          .text-center { text-align: center; }

          /* Item row: qty + name side by side with proper gap */
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
          }
          .item-left {
            display: flex;
            flex: 1;
            gap: 6px;
          }
          .item-qty {
            display: inline-block;
            min-width: 14px;
            flex-shrink: 0;
          }
          .item-name {
            font-weight: bold;
            text-transform: uppercase;
            word-break: break-word;
          }
          .item-price {
            white-space: nowrap;
            margin-left: 8px;
          }

          /* Indent for notes/half portion */
          .item-detail {
            padding-left: 20px;
            font-style: italic;
            font-size: 10px;
            opacity: 0.9;
          }

          .font-bold { font-weight: bold; }
          .font-black { font-weight: 900; }
          .uppercase { text-transform: uppercase; }
          .italic { font-style: italic; }
          .text-\\[10px\\] { font-size: 10px; }
          .text-\\[11px\\] { font-size: 11px; }
          .text-xs { font-size: 12px; }
          .text-sm { font-size: 14px; }

          .border-b { border-bottom: 1px dashed #000; }
          .border-t { border-top: 1px dashed #000; }

          .mt-4 { margin-top: 16px; }
          .mt-12 { margin-top: 48px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          
          .pt-4 { padding-top: 16px; }
          .pt-6 { padding-top: 24px; }
          .pb-6 { padding-bottom: 24px; }
          .py-4 { padding-top: 16px; padding-bottom: 16px; }

          .space-y-2 > * + * { margin-top: 8px; }
          .space-y-3 > * + * { margin-top: 12px; }

          /* Totals section: indented to the right (mirroring web preview) */
          .totals-section {
            width: 100%;
            margin-top: 4px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            width: 60%;
          }
          .total-row.grand {
            font-weight: 900;
            font-size: 12px;
            border-top: 1px solid #000 !important;
            padding-top: 4px;
            padding-bottom: 4px;
          }
          .total-row.grand.has-payment {
            border-bottom: 1px solid #000 !important;
          }

          /* Payment section (CASH / KEMBALI) */
          .payment-section {
            margin-top: 2px;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            width: 60%;
            font-weight: bold;
          }
          .payment-row.bold {
            font-weight: bold;
          }

          .hide-on-print { display: none !important; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

  iframeDoc.close();
  iframe.contentWindow?.focus();

  setTimeout(() => {
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
  }, 500);
};

export const printCustomerOrder = (printContent: string, title: string = "Cetak Nota") => {
  if (!printContent) return;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.write(`
    <html>
        <head>
        <title>${title}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 70mm; margin: 0 auto; 
              padding: 15px; /* PADDING AGAR TIDAK NEMPEL PINGGIR */
              font-size: 13px;
              color: #000;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 22px; }
            .text-sm { font-size: 16px; }
            .text-\\[10px\\] { font-size: 10px; }
            .uppercase { text-transform: uppercase; }
            .tracking-widest { letter-spacing: 0.1em; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
            .flex { display: flex; }
            .items-start { align-items: flex-start; }
            .w-6 { width: 28px; display: inline-block; }
            .pl-8 { padding-left: 28px; }
            .mt-1 { margin-top: 4px; }
            .space-y-4 > * + * { margin-top: 16px; } /* JARAK ANTAR ITEM AGAR LEGA */
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);

  iframeDoc.close();
  iframe.contentWindow?.focus();

  setTimeout(() => {
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
  }, 500);
};

export const printSettlementHTML = (printContent: string, title: string = "Closing Report") => {
  if (!printContent) return;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 72mm; /* Lebar optimal kertas thermal 80mm */
            margin: 0 auto; 
            padding: 4mm;
            color: #000;
            line-height: 1.4;
          }
          
          /* Reset margins */
          p, h2, h3, h4, h5 { margin: 0; }

          /* Layout Utilities (Mengadopsi Tailwind) */
          .flex { display: flex; }
          .flex-col { display: flex; flex-direction: column; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
          .items-start { align-items: flex-start; }
          .flex-1 { flex: 1; }
          .shrink-0 { flex-shrink: 0; }
          
          /* Text Align & Styles */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .font-black { font-weight: 900; }
          .uppercase { text-transform: uppercase; }
          .italic { font-style: italic; }
          .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

          /* Text Sizes */
          .text-\\[9px\\] { font-size: 9px; }
          .text-\\[10px\\] { font-size: 10px; }
          .text-\\[11px\\] { font-size: 11px; }
          .text-xs { font-size: 12px; }
          .text-sm { font-size: 14px; }
          
          /* Colors (Kertas thermal hanya hitam-putih, jadi kita set semua jadi hitam/abu-abu gelap) */
          .text-gray-400, .text-gray-500, .text-gray-600 { color: #444; }
          .text-red-600, .text-purple-600 { color: #000; } /* Merah/Ungu jadi hitam di struk */

          /* Margins & Paddings */
          .my-4 { margin-top: 16px; margin-bottom: 16px; }
          .mt-8 { margin-top: 32px; }
          .mt-4 { margin-top: 16px; }
          .mt-1 { margin-top: 4px; }
          .mt-0\\.5 { margin-top: 2px; }
          .mb-1 { margin-bottom: 4px; }
          .pt-4 { padding-top: 16px; }
          .pt-1 { padding-top: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .pr-2 { padding-right: 8px; }

          /* Spacing Helpers (space-y-*) */
          .space-y-1 > * + * { margin-top: 4px; }
          .space-y-1\\.5 > * + * { margin-top: 6px; }
          .space-y-2 > * + * { margin-top: 8px; }

          /* Borders */
          .border-t { border-top: 1px solid #000; }
          .border-b { border-bottom: 1px solid #000; }
          .border-dashed { border-style: dashed !important; border-width: 1px !important; border-color: #000 !important; }
          .border-gray-200, .border-gray-300, .border-gray-400 { border-color: #000 !important; }

          /* Backgrounds (Hilangkan background agar hasil cetak bersih) */
          .bg-gray-50 { background-color: transparent !important; }
          
          /* Sembunyikan elemen yg tidak perlu dicetak (jika ada) */
          .hide-on-print { display: none !important; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

  iframeDoc.close();
  iframe.contentWindow?.focus();

  setTimeout(() => {
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
  }, 500);
};