export const useUtils = () => {
  // Printer-specific commands for PT-210
  const COMMANDS = {
    INIT: new Uint8Array([0x1B, 0x40]), // Initialize printer
    LINE_FEED: new Uint8Array([0x0A]), // Line feed
    ALIGN_CENTER: new Uint8Array([0x1B, 0x61, 0x01]), // Center alignment
    ALIGN_LEFT: new Uint8Array([0x1B, 0x61, 0x00]), // Left alignment
    BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]), // Bold on
    BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]), // Bold off
    PAPER_CUT: new Uint8Array([0x1D, 0x56, 0x41]), // Full cut
    CHAR_SIZE_NORMAL: new Uint8Array([0x1D, 0x21, 0x00]), // Normal size text
    CHAR_SIZE_DOUBLE: new Uint8Array([0x1D, 0x21, 0x11]), // Double size text
    // Add image-related commands
    IMAGE_START: new Uint8Array([0x1D, 0x76, 0x30, 0x00]), // Start image data
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0.00';
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

  // Convert text to printer-encoded bytes
  const textToBytes = (text) => {
    return new TextEncoder().encode(text + '\n');
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


  // Function to create formatted receipt content for thermal printers
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
      textToBytes('PROPERTY RECEIPT'),
      COMMANDS.BOLD_OFF,
      textToBytes(separator),
      textToBytes(`Receipt #: ${donationData.payment_id.slice(0, 8)}`),
      textToBytes(`${formatDate(donationData.date)}, ${new Date().toLocaleTimeString()}`),
      textToBytes(`Name: ${donationData.name}`),
      textToBytes(`Contact: ${donationData.contact}`),
      textToBytes(`Amount: GHS ${formatCurrency(donationData.amount)}`),
      textToBytes(`Charge Type: ${donationData.taxType}`),
      COMMANDS.ALIGN_CENTER,
      textToBytes(`${currentYear} Rigel Inc, Accra`),
      COMMANDS.LINE_FEED,
      COMMANDS.LINE_FEED,
      COMMANDS.PAPER_CUT
    ];

    return concatenateUint8Arrays(...receipt);
  };

  // Function to create text-only receipt content for browser printing
  const createTextReceipt = (donationData) => {
    const lineWidth = 40; // Wider for browser display
    const separator = '-'.repeat(lineWidth);
    const currentYear = new Date().getFullYear();

    return `
                NJSMA
                   TAX RECEIPT
${separator}
Receipt #: ${donationData.payment_id.slice(0, 8)}
Date: ${formatDate(donationData.date)}, ${new Date().toLocaleTimeString()}
Name: ${donationData.name}
Contact: ${donationData.contact}
Amount: GHS ${formatCurrency(donationData.amount)}
Charge Type: ${donationData.taxType}
${separator}
              ${currentYear} Rigel Inc, Accra
`;
  };

  // Print via Web Serial API (USB)
  const printViaUSB = async (receiptData) => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 }); // PT-210 default baud rate

      const writer = port.writable.getWriter();
      await writer.write(receiptData);
      await writer.close();
      return true;
    } catch (error) {
      console.error('USB printing failed:', error);
      throw error;
    }
  };

  // Print via Web Bluetooth API
  const printViaBluetooth = async (receiptData) => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'PT-210' },
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] } // Generic printer service UUID
        ]
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      // Send data in chunks (PT-210 typically supports 20 bytes per packet)
      const chunkSize = 20;
      for (let i = 0; i < receiptData.length; i += chunkSize) {
        const chunk = receiptData.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
      }      return true;
    } catch (error) {
      console.error('Bluetooth printing failed:', error);
      throw error;
    }
  };

  // Main print function
    const printReceipt = async (donationData, logoUrl = null, method = 'auto') => {
      try {
        // Priority order: USB first, then browser fallback, then Bluetooth last
        if (method === 'usb' || (method === 'auto' && 'serial' in navigator)) {
          const receiptData = await createReceiptContent(donationData, logoUrl);
          return await printViaUSB(receiptData);
        } else if (method === 'bluetooth') {
          const receiptData = await createReceiptContent(donationData, logoUrl);
          return await printViaBluetooth(receiptData);
        } else {
          // Browser print fallback - use text-only version
          const textReceipt = createTextReceipt(donationData);
          const printWindow = window.open('', 'Print Receipt', 'height=600,width=400');
          printWindow.document.write(`
          <html>
            <head>
              <title>Tax Receipt</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  margin: 20px;
                  background: white;
                }
                .receipt {
                  white-space: pre-line;
                  text-align: left;
                  line-height: 1.4;
                  font-size: 12px;
                }
                .logo {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .logo img {
                  max-width: 150px;
                  height: auto;
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                ${logoUrl ? `<div class="logo"><img src="${logoUrl}" alt="Logo"></div>` : ''}
                <div class="content">${textReceipt}</div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `);
          printWindow.document.close();
          return true;
        }
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
  