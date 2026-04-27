module.exports = (req, res) => {
  const serial = req.query.serial || '';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
      <title>Scan Giftcard QR</title>
      <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
        }
        
        .container {
          max-width: 500px;
          width: 100%;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .scanner {
          padding: 24px;
          background: #f5f5f5;
        }
        
        #reader {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .info {
          background: #e3f2fd;
          padding: 16px;
          margin: 16px;
          border-radius: 12px;
          text-align: center;
        }
        
        .info p {
          color: #1976d2;
          font-size: 14px;
        }
        
        .button-group {
          padding: 16px;
          display: flex;
          gap: 12px;
        }
        
        button {
          flex: 1;
          background: #667eea;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        
        button:active {
          transform: scale(0.98);
        }
        
        button.secondary {
          background: #95a5a6;
        }
        
        .manual input {
          width: 100%;
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        
        .manual {
          padding: 16px;
          display: none;
        }
        
        .manual.show {
          display: block;
        }
        
        .toggle-manual {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          margin-top: 8px;
        }
        
        .result {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 20px;
          border-radius: 20px 20px 0 0;
          transform: translateY(100%);
          transition: transform 0.3s;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        }
        
        .result.show {
          transform: translateY(0);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .scanning {
          animation: pulse 1.5s ease-in-out infinite;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📷 Scan Giftcard QR</h1>
          <p>Position the QR code within the frame</p>
        </div>
        
        <div class="scanner">
          <div id="reader"></div>
        </div>
        
        <div class="info">
          <p>💡 Tip: Hold steady and ensure good lighting</p>
        </div>
        
        <div class="button-group">
          <button id="restartBtn">🔄 Restart</button>
          <button id="manualBtn" class="secondary">⌨️ Enter Manually</button>
        </div>
        
        <div id="manualInput" class="manual">
          <input type="text" id="serialInput" placeholder="Enter serial number" maxlength="14" autocomplete="off">
          <button id="submitSerial">✅ Verify</button>
          <button id="hideManual" class="toggle-manual">🔙 Back to Scanner</button>
        </div>
      </div>
      
      <div id="result" class="result">
        <p id="resultMessage"></p>
        <button onclick="closeResult()">Close</button>
      </div>
      
      <script>
        let html5QrCode = null;
        let isScanning = false;
        
        function startScanner() {
          if (html5QrCode && isScanning) {
            html5QrCode.stop().then(() => {
              initScanner();
            }).catch(err => console.log(err));
          } else {
            initScanner();
          }
        }
        
        function initScanner() {
          html5QrCode = new Html5Qrcode("reader");
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };
          
          html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // Success - send back to bot
              if (html5QrCode) {
                html5QrCode.stop();
                isScanning = false;
              }
              
              if (window.TelegramWebApp) {
                window.TelegramWebApp.sendData(decodedText);
                window.TelegramWebApp.close();
              } else {
                showResult('Scanned: ' + decodedText);
                setTimeout(() => {
                  window.location.href = decodedText;
                }, 1500);
              }
            },
            (error) => {
              // Silent error handling
              console.log(error);
            }
          ).then(() => {
            isScanning = true;
            document.querySelector('#reader').classList.add('scanning');
          }).catch(err => {
            console.error(err);
            showResult('Camera error. Please check permissions.');
          });
        }
        
        function stopScanner() {
          if (html5QrCode && isScanning) {
            html5QrCode.stop();
            isScanning = false;
            document.querySelector('#reader').classList.remove('scanning');
          }
        }
        
        function showResult(message) {
          const resultDiv = document.getElementById('result');
          document.getElementById('resultMessage').innerText = message;
          resultDiv.classList.add('show');
          setTimeout(() => {
            if (resultDiv.classList.contains('show')) {
              closeResult();
            }
          }, 3000);
        }
        
        function closeResult() {
          document.getElementById('result').classList.remove('show');
        }
        
        // Manual entry
        function showManual() {
          stopScanner();
          document.getElementById('manualInput').classList.add('show');
        }
        
        function hideManual() {
          document.getElementById('manualInput').classList.remove('show');
          startScanner();
        }
        
        function submitManual() {
          const serial = document.getElementById('serialInput').value.trim().toUpperCase();
          if (serial) {
            if (window.TelegramWebApp) {
              window.TelegramWebApp.sendData(serial);
              window.TelegramWebApp.close();
            } else {
              showResult('Serial: ' + serial);
              window.location.href = '/verify?serial=' + serial;
            }
          } else {
            showResult('Please enter a serial number');
          }
        }
        
        // Event listeners
        document.getElementById('restartBtn').addEventListener('click', () => {
          hideManual();
          startScanner();
        });
        
        document.getElementById('manualBtn').addEventListener('click', showManual);
        document.getElementById('hideManual').addEventListener('click', hideManual);
        document.getElementById('submitSerial').addEventListener('click', submitManual);
        document.getElementById('serialInput').addEventListener('keypress', (e) => {
          if (e.key === 'Enter') submitManual();
        });
        
        // Auto-start scanner
        startScanner();
        
        // Telegram WebApp integration
        if (window.TelegramWebApp) {
          window.TelegramWebApp.ready();
          window.TelegramWebApp.expand();
          window.TelegramWebApp.enableClosingConfirmation();
        }
      </script>
    </body>
    </html>
  `);
};