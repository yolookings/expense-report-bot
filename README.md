# Expense Telegram Bot – Sistem Pencatatan Keuangan Otomatis

Sistem ini adalah solusi pencatatan keuangan pribadi yang lengkap dan terintegrasi antara Google Spreadsheet, Google Apps Script, dan Telegram Bot. Dengan sistem ini, Anda dapat mencatat pemasukan, pengeluaran, hingga utang-piutang secara otomatis melalui chat Telegram, dan data akan langsung tersimpan serta terkelola di Google Spreadsheet.

## Fitur Utama

- **Pencatatan Pengeluaran**: Catat pengeluaran harian dengan mudah melalui format pesan sederhana.
- **Pencatatan Pemasukan**: Gunakan perintah khusus untuk mencatat setiap pemasukan.
- **Manajemen Utang**: Modul terpisah untuk mencatat, melihat, dan melunasi utang-piutang. Pelunasan utang akan otomatis terintegrasi sebagai pemasukan/pengeluaran di arus kas utama.
- **Laporan Instan di Telegram**: Dapatkan ringkasan saldo, rincian pengeluaran per kategori (Primer, Sekunder, Tersier), dan daftar utang yang belum lunas langsung dari Telegram.
- **Dashboard Visual**: Spreadsheet menyediakan ringkasan otomatis, sisa uang, dan grafik dinamis untuk analisis keuangan yang mendalam.

## Cara Kerja

1.  **Google Spreadsheet**  
    Spreadsheet digunakan sebagai basis data utama. Terdapat dua sheet utama:

    - `Pengeluaran Harian`: Berisi data arus kas harian, ringkasan otomatis, dan grafik.
    - `Daftar Utang`: Berisi catatan utang-piutang yang terpisah.

2.  **Google Apps Script**  
    Script pada file `Code.gs` (bisa di-copy ke editor Apps Script) berfungsi sebagai backend yang menerima data dari Telegram, memproses, dan menyimpannya ke sheet yang sesuai.

3.  **Telegram Bot**  
    Anda perlu membuat bot Telegram melalui [@BotFather](https://t.me/BotFather) dan mendapatkan token unik. Token ini digunakan untuk otentikasi.

4.  **Webhook**  
    Webhook digunakan agar setiap pesan yang masuk ke bot Telegram langsung diteruskan ke URL Web App dari Apps Script untuk diproses secara real-time.

## Format Perintah Telegram

#### Arus Kas Harian

- **Pengeluaran**:  
  `Kategori, Catatan, Jumlah, Jenis Kebutuhan`  
  Contoh:

  ```bash
   Makan Siang, Nasi Padang, 25000, Primer
  ```

- **Pemasukan**:  
  `/uang [jumlah] [catatan]`  
  Contoh:
  ```bash
  /uang 5000000 Gaji Bulanan
  ```

#### Laporan Cepat

- **Cek Saldo**:

  ```
  /saldo
  ```

- **Ringkasan Pengeluaran**:
  ```
  /ringkasan
  ```

#### Manajemen Utang

- **Catat Utang Baru**:  
  `/utang [saya/dia] [Nama] [Jumlah] [Catatan]`
- `saya`: Jika Anda yang berutang.
- `dia`: Jika orang lain yang berutang pada Anda.  
  Contoh:
  ```
  /utang saya Budi 50000 Pinjam buat makan
  /utang dia Siti 100000 Siti pinjam buat bensin
  ```
- **Lihat Daftar Utang**:
  ```
  /daftarutang
  ```
- **Melunasi Utang**:  
  `/lunas [ID Utang]`  
  Contoh:
  ```
  /lunas 1
  ```

## Langkah Instalasi & Setup

1.  **Salin Spreadsheet & Atur Sheet**

- Buat salinan dari template Google Spreadsheet atau buat dari awal.
- Pastikan ada dua sheet dengan nama persis: `Pengeluaran Harian` dan `Daftar Utang`.
- Atur kolom di kedua sheet sesuai dengan kebutuhan sistem (lihat contoh/dokumentasi).

2.  **Copy Script ke Apps Script**

- Buka menu `Extensions > Apps Script` di spreadsheet.
- Hapus kode contoh dan copy seluruh isi dari file `Code.gs` ke editor.
- Ganti `GANTI_DENGAN_TOKEN_BOT_ANDA` dengan token bot Telegram Anda.

3.  **Deploy Apps Script sebagai Web App**

- Klik `Deploy > New deployment`.
- Pilih `Web app` sebagai tipe deployment.
- Atur akses ke **"Anyone"** (siapa saja).
- Klik `Deploy` dan salin **URL Web App** yang dihasilkan.

4.  **Set Webhook Telegram**

- Kembali ke editor Apps Script.
- Ganti `GANTI_DENGAN_URL_WEB_APP_ANDA` di dalam fungsi `setWebhook()` dengan URL yang baru saja Anda salin.
- Pilih fungsi `setWebhook` dari menu dropdown, lalu klik **Run (►)**.

5.  **Cek & Uji Bot**

- Kirim berbagai format perintah ke bot Telegram Anda.
- Periksa apakah data masuk dengan benar ke sheet yang sesuai.

## Catatan Penting

- **Nama Sheet & Named Ranges**: Pastikan nama sheet (`Pengeluaran Harian`, `Daftar Utang`) dan Named Ranges (`TotalPemasukan`, `SisaUang`, dll.) di spreadsheet sama persis dengan yang ada di script.
- **Keamanan Token**: Jangan pernah membagikan token bot Telegram Anda ke publik. Simpan sebagai rahasia.

## Contoh Visualisasi

![tampilan-dashboard](/img/dashboard.png)

Lihat file `/img/dashboard.png` untuk contoh tampilan dashboard spreadsheet.

---

Jika Anda membutuhkan bantuan lebih lanjut atau ingin mengembangkan fitur, silakan buka _issue_ di repository ini.
