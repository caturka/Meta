const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const config = require("./config");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_FOLDER || "session");
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true,
    browser: ["KING BANGCATS", "Chrome", "1.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === "close") {
      const r = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (r) startBot();
      else console.log("❌ LOGGED OUT - Hapus folder session, scan ulang!");
    } else if (connection === "open") {
      console.log("✅ KING BANGCATS ONLINE - QR BERHASIL!");
    }
  });

  // === PAYMENT ===
  async function kirimPayment(from, msg, jenis) {
    if (jenis === 'dana') {
      let c = `Iki DANA ku lik 💙\n\n${config.section("DANA", [`Nomor : ${config.DANA_NUMBER}`, `Nama : ${config.DANA_NAME}`, `Owner : ${config.CREATOR_NAME} ✅`])}\n\nScan QR neng foto iki yo lik 📸\nNek wes TF, kirim bukti ne neng kene yo 🙏`;
      const p = path.join(__dirname, config.QRIS_IMAGE);
      if (fs.existsSync(p)) return await sock.sendMessage(from, { image: { url: p }, caption: c }, { quoted: msg });
      return await sock.sendMessage(from, { text: c }, { quoted: msg });
    }
    if (jenis === 'gopay') {
      let c = `Iki GOPAY / QRIS ku lik 💚\n\n${config.section("GOPAY / QRIS", [`Nomor : ${config.GOPAY_NUMBER}`, `Nama : ${config.GOPAY_NAME}`, `NMID : ${config.QRIS_NMID}`, `Owner : ${config.CREATOR_NAME} ✅`])}\n\nIso di-scan teko GoPay, DANA, BCA, Mandiri, BNI, BRI ✅\nScan QR neng foto iki yo lik 📸\nNek wes TF, kirim bukti ne 🙏`;
      const p = path.join(__dirname, config.GOPAY_QRIS_IMAGE);
      if (fs.existsSync(p)) return await sock.sendMessage(from, { image: { url: p }, caption: c }, { quoted: msg });
      return await sock.sendMessage(from, { text: c }, { quoted: msg });
    }
    if (jenis === 'payment') {
      let c = `*PAYMENT - ${config.BOT_NAME}* 💳\n\n${config.section("DANA 💙", [`Nomor : ${config.DANA_NUMBER}`, `Nama : ${config.DANA_NAME}`])}\n\n${config.section("GOPAY / QRIS 💚", [`Nomor : ${config.GOPAY_NUMBER}`, `Nama : ${config.GOPAY_NAME}`, `NMID : ${config.QRIS_NMID}`])}\n\nOwner : ${config.CREATOR_NAME} ✅\nKetik *dana* kanggo QR DANA\nKetik *gopay* kanggo QR GOPAY\nNek wes TF, kirim bukti ne yo lik 🙏`;
      await sock.sendMessage(from, { text: c }, { quoted: msg });
      const p1 = path.join(__dirname, config.QRIS_IMAGE);
      const p2 = path.join(__dirname, config.GOPAY_QRIS_IMAGE);
      if (fs.existsSync(p1)) await sock.sendMessage(from, { image: { url: p1 }, caption: "QR DANA - " + config.DANA_NAME + " 💙" }, { quoted: msg });
      if (fs.existsSync(p2)) await sock.sendMessage(from, { image: { url: p2 }, caption: "QRIS GOPAY - " + config.GOPAY_NAME + " 💚" }, { quoted: msg });
      return;
    }
  }

  // === AI - NYAMBUNG KARO CONFIG MU ===
  async function tanyaAI(q) {
    try {
      const res = await axios.post(config.GROQ_URL, {
        model: config.GROQ_MODEL,
        messages: [
          { role: "system", content: config.SYSTEM_PROMPT },
          { role: "user", content: q }
        ]
      }, { headers: { Authorization: `Bearer ${config.GROQ_API_KEY}` } });
      return res.data.choices[0].message.content;
    } catch (e) {
      console.log("AI Error:", e.response?.data || e.message);
      return "AI ne lagi turu lik, coba meneh 😅";
    }
  }

  // === HITUNG ===
  function hitungSoal(soalRaw) {
    let soal = soalRaw.replace(/x/gi, "*").replace(/:/g, "/").replace(/,/g, ".");
    if (!/^[0-9+\-*/().\s]+$/.test(soal)) return null;
    try { return Function("return " + soal)(); } catch (e) { return null; }
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "";
    const text = body.toLowerCase().trim();
    const isGroup = from.endsWith("@g.us");

    if (["halo", "hai", "hi", "assalamualaikum", "p", "hei", "woy", "hello", "selamat pagi", "selamat siang", "selamat malam"].includes(text)) {
      return await sock.sendMessage(from, { text: `Halo lik! 👋\nAku ${config.BOT_NAME}, bot e ${config.CREATOR_NAME} 👑\n\nKetik *menu* kanggo delok kabeh fitur ku\nKetik *payment* nek arep TF / donasi 🙏\nIG ku: @${config.IG1} & @${config.IG2}` }, { quoted: msg });
    }
    if (text.includes("makasih") || text.includes("thank") || text.includes("suwun") || text.includes("matur")) {
      return await sock.sendMessage(from, { text: `Sami-sami lik! 🙏 Makasih wes mampir neng ${config.BOT_NAME}\nJangan lali follow IG @${config.IG1} yo! 🔥` }, { quoted: msg });
    }
    if (text.includes("harga") || text.includes("berapa") || text.includes("piro") || text.includes("regane")) {
      return await sock.sendMessage(from, { text: `Nek soal harga, langsung chat owner ku wae lik 👑\nOwner : ${config.CREATOR_NAME}\nIG : @${config.IG1}\n\nAtau ketik *payment* nek wes deal TF yo! 💳` }, { quoted: msg });
    }

    if (text === "menu" || text === ".menu" || text === "help" || text === "fitur") {
      let m = `*MENU - ${config.BOT_NAME}* 👑🔥\n\nHalo lik! Aku bot e ${config.CREATOR_NAME}\n\n`;
      m += `${config.section("PAYMENT 💳", ["payment - Semua payment + 2 QR", "dana - QR DANA", "gopay - QR GOPAY / QRIS"])}\n\n`;
      m += `${config.section("AI + MATEMATIKA 🤖🧮", ["ai [teks] - Tanya AI Jowo", "hitung 25*40 - Kalkulator cepet", "100+200*3 - Langsung diitung", "caption [tema] - Caption IG", "ide [tema] - Ide konten"])}\n\n`;
      m += `${config.section("STIKER 😆", ["Kirim foto + caption stiker", "Reply foto ketik stiker"])}\n\n`;
      m += `${config.section("DOWNLOAD 📥", ["dl [link tiktok/ig/yt]"])}\n\n`;
      m += `${config.section("LAIN 👑", ["owner - Info owner", "ig - Instagram owner", "halo - Sapa bot"])}\n\n`;
      m += `Owner : ${config.CREATOR_NAME} ✅\nIG : @${config.IG1} & @${config.IG2}`;
      return await sock.sendMessage(from, { text: m }, { quoted: msg });
    }

    if (text === "dana") return kirimPayment(from, msg, 'dana');
    if (text === "gopay") return kirimPayment(from, msg, 'gopay');
    if (["payment", "pay", "donasi", "tf", "transfer"].includes(text)) return kirimPayment(from, msg, 'payment');

    if (text === "owner") return await sock.sendMessage(from, { text: `Owner ku ${config.CREATOR_NAME} lik 👑\n${config.CREATOR_INFO}\nIG : @${config.IG1} & @${config.IG2}\nKetik *payment* nek arep donasi 🙏` }, { quoted: msg });
    if (text === "ig") return await sock.sendMessage(from, { text: `IG Owner:\n1. @${config.IG1} - ${config.IG_LINK1}\n2. @${config.IG2} - ${config.IG_LINK2}\nFollow yo lik! 🔥` }, { quoted: msg });

    if (text === "stiker" || text === "s" || text === "sticker") {
      let quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      let imgMsg = msg.message.imageMessage || quoted?.imageMessage;
      if (imgMsg) {
        try {
          const stream = await downloadContentFromMessage(imgMsg, "image");
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          return await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
        } catch (e) { return await sock.sendMessage(from, { text: "Gagal gawe stiker lik, coba foto liyane 😅" }, { quoted: msg }); }
      } else return await sock.sendMessage(from, { text: "Kirim foto + caption *stiker* lik, atau reply foto terus ketik *stiker* 📸" }, { quoted: msg });
    }

    if (text.startsWith("dl ")) {
      const link = body.slice(3).trim();
      return await sock.sendMessage(from, { text: `Siap lik, tak downloadke sek... 📥\nLink : ${link}\n\nBuka neng browser mu:\nTikTok : https://ssstik.io/en\nIG : https://saveinsta.app\n\nAtau kirim link e neng owner ku @${config.IG1} yo! 🙏` }, { quoted: msg });
    }

    if (text.startsWith("hitung ") || text.startsWith("kalkulator ") || text.startsWith("itung ")) {
      let soalRaw = body.replace(/hitung|kalkulator|itung/gi, "").trim();
      let hasil = hitungSoal(soalRaw);
      if (hasil !== null) return await sock.sendMessage(from, { text: `*KALKULATOR - ${config.BOT_NAME}* 🧮\n\nSoal : ${soalRaw}\nHasil : *${hasil}*\n\nKetik *hitung 100*50* kanggo ngitung liyane` }, { quoted: msg });
      return await sock.sendMessage(from, { text: `Soal e salah lik 😅\nConto bener: *hitung 25*40+100*` }, { quoted: msg });
    }
    if (/^[0-9+\-*/().\sx:]+$/.test(text) && text.length > 3 && /[+\-*/x:]/.test(text)) {
      let hasil = hitungSoal(text);
      if (hasil !== null) return await sock.sendMessage(from, { text: `🧮 ${text} = *${hasil}*` }, { quoted: msg });
    }

    if (text.startsWith("ai ")) { const ans = await tanyaAI(body.slice(3)); return await sock.sendMessage(from, { text: ans }, { quoted: msg }); }
    if (text.startsWith("caption ")) {
      const tema = body.slice(8);
      const ans = await tanyaAI(`Gawekke 3 caption Instagram sing viral, lucu, gaul, nganggo hashtag, tema: ${tema}. Gawe bahasa Jowo gaul campur Indonesia.`);
      return await sock.sendMessage(from, { text: `*CAPTION IG - ${tema.toUpperCase()}* 📸\n\n${ans}\n\nFollow @${config.IG1} 🔥` }, { quoted: msg });
    }
    if (text.startsWith("ide ")) {
      const tema = body.slice(4);
      const ans = await tanyaAI(`Gawekke 5 ide konten TikTok / IG Reels sing viral, gampang digawe, tema: ${tema}. Kasih hook + cara gawe ne.`);
      return await sock.sendMessage(from, { text: `*IDE KONTEN - ${tema.toUpperCase()}* 🔥\n\n${ans}` }, { quoted: msg });
    }

    if (!isGroup) {
      const perintah = ["menu", "dana", "gopay", "payment", "pay", "donasi", "tf", "transfer", "owner", "ig", "stiker", "s", "sticker", "halo", "hai", "hi", "assalamualaikum", "p", "hei", "woy", "makasih", "thank", "suwun", "harga", "berapa", "piro"];
      const isPerintah = perintah.some(p => text === p || text.startsWith("ai ") || text.startsWith("caption ") || text.startsWith("ide ") || text.startsWith("dl ") || text.startsWith("hitung ") || text.startsWith("kalkulator "));
      if (!isPerintah && body.length > 2) {
        const ans = await tanyaAI(body);
        return await sock.sendMessage(from, { text: ans + `\n\n---\nKetik *menu* kanggo delok fitur ku\nKetik *payment* nek arep TF 🙏` }, { quoted: msg });
      }
    }
  });
}
startBot();