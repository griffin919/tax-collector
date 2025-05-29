export const useUtils = () => {
  // Helper function to format currency
const formatCurrency = (amount) => {
  if(!amount) return '0.00';
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };// Browser print function
  const printReceipt = async (donationData, logoUrl = null) => {
    try {
      const lineWidth = 24; // 58mm printer typically supports 24 characters per line
      const separator = '-'.repeat(lineWidth);
      const currentYear = new Date().getFullYear();
      
      const receiptText = `NJSMA 
PAYMENT RECEIPT
${separator}
Receipt #: ${donationData.payment_id.slice(0, 8)}
${formatDate(donationData.date)}, ${new Date().toLocaleTimeString()}
Name: ${donationData.name}
Contact: ${donationData.contact}
Amount: GHS ${formatCurrency(donationData.amount)}
Tax Type: ${donationData.taxType}

${currentYear} Rigel Inc, Accra`;
        const printWindow = window.open('', 'Print Receipt', 'height=600,width=400');
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Receipt</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                .receipt { 
                  max-width: 58mm;
                  max-height: 58mm;
                  font-size: 12px;
                  margin: 0;
                  padding: 5px;
                }
              }
              body {
                font-family: 'Courier New', monospace;
                margin: 20px;
                text-align: center;
                background: white;
                color: black;
              }
              .receipt {
                white-space: pre-line;
                line-height: 1.2;
                max-width: 250px;
                margin: 0 auto;
                padding: 6px;
                border: 1px solid #ccc;
                font-size: 7px;
              }
              img {
                max-width: 20px;
                height: auto;
                margin-bottom: 10px;
              }
              .print-btn {
                margin: 20px;
                padding: 10px 20px;
                background: #007cba;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
              }
              .print-btn:hover {
                background: #005a8a;
              }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button class="print-btn" onclick="window.print()">Print Receipt</button>
            </div>
            <div class="receipt">
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo">` : ''}
              ${receiptText}
            </div>
            <div class="no-print">
              <button class="print-btn" onclick="window.close()">Close</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Printing failed:', error);
      return false;
    }
  };

  return {
    formatCurrency,
    formatDate,
    printReceipt
  };
};
