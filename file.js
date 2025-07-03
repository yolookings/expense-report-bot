// GANTI DENGAN TOKEN BOT ANDA YANG AMAN
var token = "GANTI_DENGAN_TOKEN_BOT_ANDA";
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName("Pengeluaran Harian"); // Pastikan nama sheet ini benar

// Fungsi untuk mendapatkan nama hari dalam Bahasa Indonesia
function getNamaHari(tanggal) {
var namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
return namaHari[tanggal.getDay()];
}

function doPost(e) {
var contents;
try {
contents = JSON.parse(e.postData.contents);
} catch (err) {
Logger.log(err);
return;
}

if (!contents.message || !contents.message.text) {
Logger.log("Tidak ada pesan teks yang diterima.");
return;
}

var text = contents.message.text;
var chat_id = contents.message.chat.id;
var message_timestamp = contents.message.date;
var tanggalObjek = new Date(message_timestamp \* 1000);
var hari = getNamaHari(tanggalObjek);
var tanggal = Utilities.formatDate(tanggalObjek, "GMT+7", "dd-MM-yyyy");
var waktu = Utilities.formatDate(tanggalObjek, "GMT+7", "HH:mm:ss");

try {
if (text.startsWith("/")) {
handleCommand(text, chat_id);
} else {
handleExpense(text, chat_id, hari, tanggal, waktu);
}
} catch (err) {
sendText(chat_id, "❌ Terjadi kesalahan tak terduga: " + err.message);
}
}

// Fungsi untuk menangani input PENGELUARAN
function handleExpense(text, chat_id, hari, tanggal, waktu) {
try {
var parts = text.split(",").map(part => part.trim());
if (parts.length !== 4) throw new Error("Format input salah. Harusnya ada 4 bagian dipisah koma.");

    var kategori = parts[0];
    var catatan = parts[1];
    var jumlah = parts[2];
    var jenis = parts[3];

    if (isNaN(jumlah)) throw new Error("Jumlah (bagian ke-3) harus berupa angka.");

    var jenisKebutuhanValid = ["primer", "sekunder", "tersier"];
    if (jenisKebutuhanValid.indexOf(jenis.toLowerCase()) === -1) throw new Error("Jenis kebutuhan (bagian ke-4) harus: Primer, Sekunder, atau Tersier.");

    var jenisFormatted = jenis.charAt(0).toUpperCase() + jenis.slice(1).toLowerCase();
    var jumlahAngka = parseFloat(jumlah);

    sheet.appendRow([hari, tanggal, waktu, kategori, catatan, jenisFormatted, jumlahAngka, ""]);

    var lastRow = sheet.getLastRow();

    sheet.getRange(lastRow, 1, 1, 3).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(lastRow, 6).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 7).setFontWeight("bold").setHorizontalAlignment("center").setNumberFormat("Rp #,##0");

    sendText(chat_id, "✅ Pengeluaran berhasil dicatat!");

} catch (err) {
sendText(chat_id, "❌ Gagal mencatat pengeluaran!\n" +
"Error: " + err.message + "\n\n" +
"Gunakan format:\n*Kategori, Catatan, Jumlah, Jenis*");
}
}

// Fungsi BARU untuk menangani SEMUA PERINTAH
function handleCommand(text, chat_id) {
var parts = text.split(" ");
var command = parts[0].toLowerCase(); // -> /uang, /saldo, /ringkasan

try {
// ---- Perintah untuk mencatat PEMASUKAN ----
if (command === "/uang") {
if (parts.length < 2 || isNaN(parts[1])) throw new Error("Format perintah /uang salah.\nContoh: /uang 5000000 Gaji Bulanan");

      var jumlahPemasukan = parseFloat(parts[1]);
      var catatanPemasukan = parts.slice(2).join(" ");
      var tanggalObjek = new Date();
      var hari = getNamaHari(tanggalObjek);
      var tanggal = Utilities.formatDate(tanggalObjek, "GMT+7", "dd-MM-yyyy");
      var waktu = Utilities.formatDate(tanggalObjek, "GMT+7", "HH:mm:ss");

      sheet.appendRow([hari, tanggal, waktu, "Pemasukan", catatanPemasukan, "", "", jumlahPemasukan]);
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1, 1, 3).setFontWeight("bold").setHorizontalAlignment("center");
      sheet.getRange(lastRow, 8).setFontWeight("bold").setNumberFormat("Rp #,##0").setBackground("#d9ead3");

      sendText(chat_id, "✅ Pemasukan berhasil dicatat: *Rp " + jumlahPemasukan.toLocaleString('id-ID') + "*");

    // ----- FITUR BARU: Cek Saldo -----
    } else if (command === "/saldo") {
      SpreadsheetApp.flush(); // Memastikan semua kalkulasi di sheet sudah ter-update
      var pemasukan = ss.getRangeByName("TotalPemasukan").getValue();
      var pengeluaran = ss.getRangeByName("TotalPengeluaran").getValue();
      var sisa = ss.getRangeByName("SisaUang").getValue();

      var pesan = "💰 *Ringkasan Saldo Anda*\n\n" +
                  " Pemasukan: Rp " + pemasukan.toLocaleString('id-ID') + "\n" +
                  " Pengeluaran: Rp " + pengeluaran.toLocaleString('id-ID') + "\n" +
                  "---------------------------------\n" +
                  " *Sisa Uang: Rp " + sisa.toLocaleString('id-ID') + "*";
      sendText(chat_id, pesan);

    // ----- FITUR BARU: Ringkasan Pengeluaran -----
    } else if (command === "/ringkasan") {
      SpreadsheetApp.flush(); // Memastikan semua kalkulasi di sheet sudah ter-update
      var primer = ss.getRangeByName("TotalPrimer").getValue();
      var sekunder = ss.getRangeByName("TotalSekunder").getValue();
      var tersier = ss.getRangeByName("TotalTersier").getValue();

      var pesan = "📊 *Ringkasan Pengeluaran per Jenis*\n\n" +
                  "  necesidades primarias: Rp " + primer.toLocaleString('id-ID') + "\n" +
                  " Necesidades secundarias: Rp " + sekunder.toLocaleString('id-ID') + "\n" +
                  " Necesidades terciarias: Rp " + tersier.toLocaleString('id-ID');
      sendText(chat_id, pesan);

    } else {
      sendText(chat_id, "Perintah tidak dikenali. Perintah yang tersedia:\n- `/uang [jumlah] [catatan]`\n- `/saldo`\n- `/ringkasan`");
    }

} catch(err) {
sendText(chat_id, "❌ Gagal menjalankan perintah!\n" + "Error: " + err.message);
}
}

function sendText(chat_id, text) {
var url = "https://api.telegram.org/bot" + token + "/sendMessage?chat_id=" + chat_id + "&text=" + encodeURIComponent(text) + "&parse_mode=Markdown";
UrlFetchApp.fetch(url);
}

// FUNGSI SETUP (Tidak perlu dijalankan lagi)
function setWebhook() {
var webAppUrl = "GANTI_DENGAN_URL_WEB_APP_ANDA";
var response = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/setWebhook?url=" + webAppUrl);
Logger.log(response.getContentText());
}
