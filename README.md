# Expense Telegram Bot – Sistem Pencatatan Keuangan Otomatis

Sistem ini adalah solusi pencatatan keuangan harian yang terintegrasi antara Google Spreadsheet, Google Apps Script, dan Telegram Bot. Dengan sistem ini, Anda dapat mencatat pemasukan dan pengeluaran secara otomatis melalui chat Telegram, dan data akan langsung tersimpan serta terkelola di Google Spreadsheet.

## Fitur Utama

- **Pencatatan Pengeluaran**: Cukup kirim pesan ke bot Telegram dengan format tertentu, pengeluaran akan otomatis tercatat di spreadsheet.
- **Pencatatan Pemasukan**: Gunakan perintah khusus untuk mencatat pemasukan.
- **Cek Saldo & Ringkasan**: Dapatkan ringkasan saldo dan pengeluaran berdasarkan kategori kebutuhan (Primer, Sekunder, Tersier) langsung dari Telegram.
- **Visualisasi Otomatis**: Spreadsheet menyediakan visualisasi data (grafik donat, ringkasan otomatis) untuk memudahkan analisis keuangan.

## Cara Kerja

1. **Google Spreadsheet**  
   Spreadsheet digunakan sebagai basis data utama untuk menyimpan seluruh transaksi keuangan. Terdapat sheet khusus bernama `Pengeluaran Harian` yang berisi data harian, serta summary otomatis dan grafik.

2. **Google Apps Script**  
   Script pada file `file.md` (bisa di-copy ke editor Apps Script di Google Spreadsheet) berfungsi sebagai backend yang menerima data dari Telegram, memproses, dan menyimpan ke spreadsheet.

3. **Telegram Bot**  
   Anda perlu membuat bot Telegram melalui [@BotFather](https://t.me/BotFather), lalu mendapatkan token bot. Token ini digunakan pada script Apps Script.

4. **Webhook**  
   Webhook digunakan agar setiap pesan yang masuk ke bot Telegram langsung diteruskan ke Apps Script untuk diproses secara real-time.

## Format Input Telegram

- **Pengeluaran**:  
  `Kategori, Catatan, Jumlah, Jenis`  
  Contoh:
  ```
  Makan Siang, Nasi Padang, 25000, Primer
  ```
- **Pemasukan**:  
  `/uang [jumlah] [catatan]`  
  Contoh:
  ```
  /uang 5000000 Gaji Bulanan
  ```
- **Cek Saldo**:
  ```
  /saldo
  ```
- **Ringkasan Pengeluaran**:
  ```
  /ringkasan
  ```

## Langkah Instalasi & Setup

1. **Clone/Salin Spreadsheet**  
   Buat Google Spreadsheet baru dan sesuaikan sheet serta kolom seperti contoh pada gambar.

2. **Copy Script ke Apps Script**

   - Buka menu Extensions > Apps Script di spreadsheet.
   - Copy seluruh isi `file.md` ke editor Apps Script.
   - Ganti `GANTI_DENGAN_TOKEN_BOT_ANDA` dengan token bot Telegram Anda.
   - Ganti `GANTI_DENGAN_URL_WEB_APP_ANDA` dengan URL Web App setelah deploy (lihat langkah 4).

3. **Deploy Apps Script sebagai Web App**

   - Klik `Deploy` > `New deployment`.
   - Pilih `Web app`.
   - Set akses ke "Anyone" (siapa saja).
   - Salin URL Web App yang dihasilkan.

4. **Set Webhook Telegram**

   - Jalankan fungsi `setWebhook()` di Apps Script.
   - Webhook akan menghubungkan bot Telegram ke Apps Script.

5. **Cek & Uji Bot**
   - Kirim pesan ke bot Telegram sesuai format.
   - Data akan otomatis masuk ke spreadsheet.

## Catatan Penting

- Pastikan nama sheet di spreadsheet sama dengan yang ada di script (`Pengeluaran Harian`).
- Pastikan sudah membuat Named Range di spreadsheet untuk: `TotalPemasukan`, `TotalPengeluaran`, `SisaUang`, `TotalPrimer`, `TotalSekunder`, `TotalTersier` agar fitur ringkasan berjalan.
- Jangan membagikan token bot Telegram Anda ke publik.

## Contoh Visualisasi

![tampilan-dashboard](/img/dashboard.png)

Lihat file `/img/dashboard.png` untuk contoh tampilan dashboard spreadsheet.

---

Jika Anda membutuhkan bantuan lebih lanjut atau ingin mengembangkan fitur, silakan hubungi pengembang atau buka issue di repository ini.
