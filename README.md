# WhatsApp Bot Multi-Session (Express + WWebJS + MySQL)

Bot WhatsApp berbasis Node.js dengan dukungan multi-session, terhubung ke database MySQL, memiliki API untuk QR code, pengiriman pesan, dan status sesi, serta siap dijalankan dalam Docker.

## 🚀 Fitur Utama
- Multi-session (bisa jalankan 4 WA sekaligus atau lebih)
- QR code via API (tidak perlu buka terminal)
- Pengiriman pesan via REST API
- Status session (aktif/tidak)
- Struktur modular (handler, router, bot manager)
- Persistent session di folder /sessions
- Session tercatat di database MySQL

## 📁 Struktur Proyek
```
Wa-Con/
│
├── bots/              # Manajemen client WhatsApp
├── db/                # Koneksi & model database (Sequelize)
├── handlers/          # Handler pesan masuk
├── routes/            # Semua endpoint API
├── sessions/          # Penyimpanan session lokal
├── .env               # Konfigurasi environment
├── Dockerfile         # Image container
├── index.js           # Entry point aplikasi
└── README.md          # Dokumentasi ini
```

## ⚙️ Persiapan

### 1. Clone Repo
```bash
git clone https://github.com/yourusername/wa-con.git
cd wa-con
```

### 2. Siapkan .env
Buat file `.env` di root:
```
PORT=3000
MYSQL_DB=wa_bot_db
MYSQL_USER=root
MYSQL_PASS=your_password
MYSQL_HOST=localhost
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Jalankan Lokal
```bash
node index.js
```

## 🐳 Jalankan via Docker

### 1. Build Image
```bash
docker build -t wa-bot .
```

### 2. Run Container
```bash
docker run -p 3000:3000 --env-file .env -v $(pwd)/sessions:/app/sessions wa-bot
```

## 🔌 API Endpoint

### 1. Inisialisasi WA session
```http
POST /init-wa
Content-Type: application/json

{
    "userId": "wa1"
}
```

### 2. Ambil QR Code
```http
GET /get-qr/wa1
```

### 3. Kirim Pesan
```http
POST /send-message
Content-Type: application/json

{
    "userId": "wa1",
    "number": "628123456789",
    "message": "Halo dari bot!"
}
```

### 4. Cek Status Session
```http
GET /session-status/wa1
```

### 5. Lihat Semua Session Aktif
```http
GET /session-status
```

## 🧠 Cara Menambah Fitur
- Tambah endpoint baru: Buat file baru di `routes/`, dan import di `index.js`
- Custom logic pesan masuk: Edit di `handlers/messageHandler.js`
- Tambah data user/sesi: Tambah model di `db/models` dan migrasikan via Sequelize

## ❓ FAQ
**Q**: Bisa jalankan lebih dari 4 sesi WA?  
**A**: Bisa, tergantung resource server/container. Per sesi adalah 1 instance browser (Chromium).

**Q**: QR harus scan ulang tiap restart?  
**A**: Tidak, karena disimpan di folder sessions/.

**Q**: Aman digunakan di production?  
**A**: Ya, dengan kontrol rate limit dan validasi pesan.

## 👨‍💻 Kontribusi
Pull request dan feedback sangat diterima. Pastikan kodingan kamu modular dan bersih.

## 🧾 Lisensi
MIT © 2025 Mazeluna
