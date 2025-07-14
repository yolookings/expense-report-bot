// GANTI DENGAN TOKEN BOT ANDA YANG AMAN
var token = "7723026339:AAH0HpeI2tKPaH_xWU5eThDqvCPZdY54z-A";
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName("Pengeluaran Harian"); // Halaman utama
var sheetUtang = ss.getSheetByName("Daftar Utang"); // Halaman untuk utang

// Fungsi untuk mendapatkan nama hari dalam Bahasa Indonesia
function getNamaHari(tanggal) {
  var namaHari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  return namaHari[tanggal.getDay()];
}

// Fungsi utama yang menerima panggilan dari Telegram
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

  try {
    // Membedakan antara input biasa (pengeluaran) dan perintah (dimulai dengan /)
    if (text.startsWith("/")) {
      handleCommand(text, chat_id);
    } else {
      handleExpense(text, chat_id);
    }
  } catch (err) {
    sendText(
      chat_id,
      "❌ Terjadi kesalahan tak terduga di level utama: " + err.message
    );
  }
}

// Fungsi khusus untuk menangani input PENGELUARAN
function handleExpense(text, chat_id) {
  try {
    var parts = text.split(",").map((part) => part.trim());
    if (parts.length !== 4)
      throw new Error(
        "Format input salah. Harusnya ada 4 bagian dipisah koma."
      );

    var kategori = parts[0];
    var catatan = parts[1];
    var jumlah = parts[2];
    var jenis = parts[3];

    if (isNaN(jumlah))
      throw new Error("Jumlah (bagian ke-3) harus berupa angka.");

    var jenisKebutuhanValid = ["primer", "sekunder", "tersier"];
    if (jenisKebutuhanValid.indexOf(jenis.toLowerCase()) === -1)
      throw new Error(
        "Jenis kebutuhan (bagian ke-4) harus: Primer, Sekunder, atau Tersier."
      );

    var jenisFormatted =
      jenis.charAt(0).toUpperCase() + jenis.slice(1).toLowerCase();
    var jumlahAngka = parseFloat(jumlah);

    var tanggalObjek = new Date();
    var hari = getNamaHari(tanggalObjek);
    var tanggal = Utilities.formatDate(tanggalObjek, "GMT+7", "dd-MM-yyyy");
    var waktu = Utilities.formatDate(tanggalObjek, "GMT+7", "HH:mm:ss");

    // Menambahkan pengeluaran ke sheet utama
    // Kolom G: Jumlah (Pengeluaran), Kolom H: Pemasukan (kosong)
    sheet.appendRow([
      hari,
      tanggal,
      waktu,
      kategori,
      catatan,
      jenisFormatted,
      jumlahAngka,
      "",
    ]);

    var lastRow = sheet.getLastRow();

    // Formatting
    sheet
      .getRange(lastRow, 1, 1, 3)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setFontLine("none");
    sheet.getRange(lastRow, 6).setHorizontalAlignment("center");
    sheet
      .getRange(lastRow, 7)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setNumberFormat("Rp #,##0");

    sendText(chat_id, "✅ Pengeluaran berhasil dicatat!");
  } catch (err) {
    sendText(
      chat_id,
      "❌ Gagal mencatat pengeluaran!\n" +
        "Error: " +
        err.message +
        "\n\n" +
        "Gunakan format:\n*Kategori, Catatan, Jumlah, Jenis*"
    );
  }
}

// Fungsi khusus untuk menangani SEMUA PERINTAH yang dimulai dengan "/"
function handleCommand(text, chat_id) {
  var parts = text.split(" ");
  var command = parts[0].toLowerCase();
  var tanggalObjek = new Date();
  var tanggalLengkap = Utilities.formatDate(
    tanggalObjek,
    "GMT+7",
    "dd-MM-yyyy HH:mm:ss"
  );

  try {
    // ---- Perintah untuk mencatat PEMASUKAN ----
    if (command === "/uang") {
      if (parts.length < 2 || isNaN(parts[1]))
        throw new Error("Format salah. Contoh: /uang 5000000 Gaji Bulanan");

      var jumlahPemasukan = parseFloat(parts[1]);
      var catatanPemasukan = parts.slice(2).join(" ");
      var hari = getNamaHari(tanggalObjek);
      var tanggal = Utilities.formatDate(tanggalObjek, "GMT+7", "dd-MM-yyyy");
      var waktu = Utilities.formatDate(tanggalObjek, "GMT+7", "HH:mm:ss");

      // Kolom G: Pengeluaran (kosong), Kolom H: Pemasukan
      sheet.appendRow([
        hari,
        tanggal,
        waktu,
        "Pemasukan",
        catatanPemasukan,
        "",
        "",
        jumlahPemasukan,
      ]);

      var lastRow = sheet.getLastRow();
      sheet
        .getRange(lastRow, 1, 1, 3)
        .setFontWeight("bold")
        .setHorizontalAlignment("center")
        .setFontLine("none");
      sheet
        .getRange(lastRow, 8)
        .setFontWeight("bold")
        .setNumberFormat("Rp #,##0")
        .setBackground("#d9ead3");

      sendText(
        chat_id,
        "✅ Pemasukan berhasil dicatat: *Rp " +
          jumlahPemasukan.toLocaleString("id-ID") +
          "*"
      );

      // ---- Perintah untuk melihat SALDO ----
    } else if (command === "/saldo") {
      SpreadsheetApp.flush(); // Memaksa sheet untuk menghitung ulang formula
      var pemasukan = ss.getRangeByName("TotalPemasukan").getDisplayValue();
      var pengeluaran = ss.getRangeByName("TotalPengeluaran").getDisplayValue();
      var sisa = ss.getRangeByName("SisaUang").getDisplayValue();

      var pesan =
        "💰 *Ringkasan Saldo Anda*\n\n" +
        " Pemasukan: " +
        pemasukan +
        "\n" +
        " Pengeluaran: " +
        pengeluaran +
        "\n" +
        "---------------------------------\n" +
        " *Sisa Uang: " +
        sisa +
        "*";
      sendText(chat_id, pesan);

      // ---- Perintah untuk melihat RINGKASAN PENGELUARAN ----
    } else if (command === "/ringkasan") {
      SpreadsheetApp.flush();
      var primer = ss.getRangeByName("TotalPrimer").getDisplayValue();
      var sekunder = ss.getRangeByName("TotalSekunder").getDisplayValue();
      var tersier = ss.getRangeByName("TotalTersier").getDisplayValue();

      var pesan =
        "📊 *Ringkasan Pengeluaran per Jenis*\n\n" +
        " Primer: " +
        primer +
        "\n" +
        " Sekunder: " +
        sekunder +
        "\n" +
        " Tersier: " +
        tersier;
      sendText(chat_id, pesan);

      // ---- Perintah untuk mencatat UTANG BARU ----
    } else if (command === "/utang") {
      if (parts.length < 5)
        throw new Error(
          "Format salah. Contoh:\n/utang saya Budi 50000 Pinjam makan"
        );

      var tipe = parts[1].toLowerCase();
      var nama = parts[2];
      var jumlah = parts[3];
      var catatan = parts.slice(4).join(" ");

      if (isNaN(jumlah))
        throw new Error("Jumlah utang (bagian ke-3) harus angka.");
      if (tipe !== "saya" && tipe !== "dia")
        throw new Error("Tipe utang (bagian ke-2) harus 'saya' atau 'dia'.");

      var jenisUtangText =
        tipe === "saya" ? "Saya Berutang" : "Orang Lain Berutang";
      var idUtang = sheetUtang.getLastRow(); // ID sederhana berdasarkan nomor baris

      sheetUtang.appendRow([
        idUtang,
        nama,
        parseFloat(jumlah),
        catatan,
        jenisUtangText,
        "Belum Lunas",
        tanggalLengkap,
        "",
      ]);
      sendText(
        chat_id,
        "✅ Utang berhasil dicatat!\n\nID Utang: *" +
          idUtang +
          "*\nJenis: " +
          jenisUtangText +
          "\nNama: " +
          nama +
          "\nJumlah: Rp " +
          parseFloat(jumlah).toLocaleString("id-ID")
      );

      // ---- Perintah untuk MELUNASI UTANG ----
    } else if (command === "/lunas") {
      if (parts.length < 2 || isNaN(parts[1]))
        throw new Error("Format salah. Contoh: /lunas 1");

      var idLunas = parseInt(parts[1]);
      var dataUtang = sheetUtang.getDataRange().getValues();
      var utangDitemukan = false;

      for (var i = 1; i < dataUtang.length; i++) {
        if (dataUtang[i][0] == idLunas) {
          if (dataUtang[i][5] === "Lunas")
            throw new Error(
              "Utang dengan ID " + idLunas + " sudah pernah lunas."
            );

          var nama = dataUtang[i][1];
          var jumlah = dataUtang[i][2];
          var jenisUtang = dataUtang[i][4];

          sheetUtang.getRange(i + 1, 6).setValue("Lunas");
          sheetUtang.getRange(i + 1, 8).setValue(tanggalLengkap);

          if (jenisUtang === "Saya Berutang") {
            handleExpense(
              "Pembayaran Utang, Bayar utang ke " +
                nama +
                ", " +
                jumlah +
                ", Sekunder",
              chat_id
            );
          } else {
            handleCommand(
              "/uang " + jumlah + " Terima pembayaran utang dari " + nama,
              chat_id
            );
          }

          sendText(
            chat_id,
            "✅ Utang dengan ID *" +
              idLunas +
              "* berhasil dilunasi & dicatat di arus kas!"
          );
          utangDitemukan = true;
          break;
        }
      }
      if (!utangDitemukan)
        throw new Error("Utang dengan ID " + idLunas + " tidak ditemukan.");

      // ---- Perintah untuk melihat DAFTAR UTANG ----
    } else if (command === "/daftarutang") {
      var dataUtang = sheetUtang.getDataRange().getValues();
      var pesan = "📖 *Daftar Utang (Belum Lunas)*\n\n";
      var adaUtang = false;

      for (var i = 1; i < dataUtang.length; i++) {
        if (dataUtang[i][5] === "Belum Lunas") {
          var id = dataUtang[i][0];
          var nama = dataUtang[i][1];
          var jumlah = parseFloat(dataUtang[i][2]).toLocaleString("id-ID");
          var jenis = dataUtang[i][4];
          var catatan = dataUtang[i][3];
          pesan +=
            "ID: *" +
            id +
            "* | " +
            jenis +
            "\n" +
            "Nama: " +
            nama +
            "\n" +
            "Jumlah: Rp " +
            jumlah +
            "\n" +
            "Catatan: " +
            catatan +
            "\n\n";
          adaUtang = true;
        }
      }
      if (!adaUtang) pesan = "🎉 Selamat! Tidak ada utang yang belum lunas.";
      sendText(chat_id, pesan);
    } else {
      sendText(
        chat_id,
        "Perintah tidak dikenali. Perintah yang tersedia:\n- `/uang [jumlah] [catatan]`\n- `/saldo`\n- `/ringkasan`\n- `/utang [saya/dia] [nama] [jumlah] [catatan]`\n- `/lunas [ID]`\n- `/daftarutang`"
      );
    }
  } catch (err) {
    sendText(
      chat_id,
      "❌ Gagal menjalankan perintah!\n" + "Error: " + err.message
    );
  }
}

// Fungsi untuk mengirim pesan balasan ke Telegram
function sendText(chat_id, text) {
  var url =
    "https://api.telegram.org/bot" +
    token +
    "/sendMessage?chat_id=" +
    chat_id +
    "&text=" +
    encodeURIComponent(text) +
    "&parse_mode=Markdown";
  UrlFetchApp.fetch(url);
}

// Fungsi untuk setup awal webhook (hanya dijalankan sekali)
function setWebhook() {
  // GANTI DENGAN URL WEB APP ANDA YANG BENAR
  var webAppUrl =
    "https://script.google.com/macros/s/AKfycbxaaCQu_YdjRhY0ka-Lc96pkVCTlucJgiHIPVNOU8Yi8Eeq9G1UUBhEJN5CGADAW6k/exec";
  var response = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + token + "/setWebhook?url=" + webAppUrl
  );
  Logger.log(response.getContentText());
}
