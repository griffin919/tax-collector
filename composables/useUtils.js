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
  };

  // Function to combine Uint8Arrays
  const concatenateUint8Arrays = (...arrays) => {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    arrays.forEach(arr => {
      result.set(arr, offset);
      offset += arr.length;
    });
    return result;
  };
  // Convert text to printer-encoded bytes (ASCII for thermal printers)
  const textToBytes = (text) => {
    // Use ASCII encoding instead of UTF-8 for better thermal printer compatibility
    const asciiText = text.replace(/[^\x00-\x7F]/g, '?'); // Replace non-ASCII chars
    const bytes = new Uint8Array(asciiText.length + 1);
    for (let i = 0; i < asciiText.length; i++) {
      bytes[i] = asciiText.charCodeAt(i);
    }
    bytes[asciiText.length] = 0x0A; // Line feed
    return bytes;
  };

  // New function to process image for thermal printer
  const processImage = async (imageUrl, maxWidth = 384) => { // 384 pixels is typical for thermal printers
    try {
      // Create a temporary canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load the image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      // Calculate dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Set canvas size and draw image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to black and white
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      
      // Convert to 1-bit black and white
      const bytesPerLine = Math.ceil(width / 8);
      const imageBytes = new Uint8Array(bytesPerLine * height);
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          const byteIndex = y * bytesPerLine + Math.floor(x / 8);
          const bitIndex = 7 - (x % 8);
          
          if (brightness < 128) { // Dark pixel
            imageBytes[byteIndex] |= (1 << bitIndex);
          }
        }
      }
      
      // Create printer command for image
      const imageCommand = new Uint8Array([
        ...COMMANDS.IMAGE_START,
        bytesPerLine & 0xFF, // xL
        (bytesPerLine >> 8) & 0xFF, // xH
        height & 0xFF, // yL
        (height >> 8) & 0xFF, // yH
        ...imageBytes
      ]);
      
      return imageCommand;
    } catch (error) {
      console.error('Image processing failed:', error);
      return new Uint8Array(0);
    }
  };

  

  // Function to create formatted receipt content
  const createReceiptContent = async (donationData, logoUrl) => {
    const lineWidth = 32; // PT-210 supports 32 characters per line at normal size
    const separator = '-'.repeat(lineWidth);
    const currentYear = new Date().getFullYear();
    
    // Process logo if provided
    const logoImage = logoUrl ? await processImage(logoUrl, 150) : new Uint8Array(0);

    
    // Create receipt arrays combining commands and text
    const receipt = [
      COMMANDS.INIT,
      COMMANDS.ALIGN_CENTER,
      
      // Add logo if processed successfully
      ...(logoImage.length > 0 ? [logoImage, COMMANDS.LINE_FEED] : []),
      textToBytes(''),
      COMMANDS.BOLD_ON,
      textToBytes('NJSMA'),
      textToBytes('PAYMENT RECEIPT'),
      COMMANDS.BOLD_OFF,
      textToBytes(separator),
      textToBytes(`Receipt #: ${donationData.payment_id.slice(0, 8)}`),
      textToBytes(`${formatDate(donationData.date)}, ${new Date().toLocaleTimeString()}`),
      textToBytes(`Name: ${donationData.name}`),
      textToBytes(`Contact: ${donationData.contact}`),
      textToBytes(`Amount: GHS ${formatCurrency(donationData.amount)}`),
      textToBytes(`Tax Type: ${donationData.taxType}`),
      COMMANDS.ALIGN_CENTER,
      textToBytes(`${currentYear} Rigel Inc, Accra`),
      COMMANDS.LINE_FEED,
      COMMANDS.LINE_FEED,
      COMMANDS.PAPER_CUT
    ];

    return concatenateUint8Arrays(...receipt);
  };  // Browser print function
  const printReceipt = async (donationData, logoUrl = null) => {
    try {
      const lineWidth = 32;
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
                line-height: 1.4;
                max-width: 300px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
              }
              img {
                max-width: 120px;
                height: auto;
                margin-bottom: 15px;
              }
              .print-btn {
                margin: 20px;
                padding: 10px 20px;
                background: #007cba;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
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
