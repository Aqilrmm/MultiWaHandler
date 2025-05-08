const express = require('express');
const router = express.Router();
const sessionManager = require('../bots/botManager');

router.get('/:userId', (req, res) => {
    const { userId } = req.params;

    res.send(`
        <html>
        <head>
            <title>QR WA - ${userId}</title>
            <meta charset="UTF-8" />
            <style>
                body { font-family: sans-serif; text-align: center; margin-top: 5%; }
                img { margin-top: 20px; }
                .error { color: red; margin: 20px; }
            </style>
        </head>
        <body>
            <h2>QR Code untuk ${userId}</h2>
            <div id="qr-container">Memuat QR...</div>
            <script>
                let errorCount = 0;
                
                async function fetchQR() {
                    try {
                        const res = await fetch('/get-qr/${userId}');
                        const data = await res.json();
                        
                        if (data.qr) {
                            errorCount = 0;
                            const qrData = encodeURIComponent(data.qr);
                            document.getElementById('qr-container').innerHTML = 
                                '<img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + qrData + '" />';
                        } else {
                            errorCount++;
                            document.getElementById('qr-container').innerHTML = 
                                '<div class="error">' + (data.error || 'QR tidak tersedia.') + '</div>' +
                                '<div>Mencoba ulang... (' + errorCount + '/6)</div>';
                            
                            if (errorCount >= 6) {
                                location.reload();
                            }
                        }
                    } catch (err) {
                        errorCount++;
                        document.getElementById('qr-container').innerHTML = 
                            '<div class="error">Gagal memuat QR.</div>' +
                            '<div>Mencoba ulang... (' + errorCount + '/6)</div>';
                            
                        if (errorCount >= 6) {
                            location.reload();
                        }
                    }
                }

                fetchQR();
                setInterval(fetchQR, 3000); // refresh setiap 3 detik
            </script>
        </body>
        </html>
    `);
});
module.exports = router;
