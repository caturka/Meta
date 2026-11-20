// ═══════════════════════════════════════════════════
//  KING BANGCATS - FULL + PAYMENT + IG + AI + DL + STIKER + VN
// ═══════════════════════════════════════════════════

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const config = require("./config");

// ═════════════ STATE ═════════════
const startTime = Date.now();
let autoReply = config.AUTO_REPLY;
const history = {};
const lastUsed = {};

// ═════════════ HELPERS ═════════════

function getUptime() {
  const s = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function isOwnerOrBot(sock, msg) {
  const botNum = sock.user?.id?.split(":")[0]?.replace(/[^0-9]/g, "");
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "").split("@")[0];
  const ownerNum = config.OWNER_NUMBER.replace(/[^0-9]/g, "");
  return msg.key.fromMe || senderNum === ownerNum || senderNum === botNum;
}

// ═════════════ TEMPLATE PESAN RAPI ═════════════

function getGreeting() {
  const p = config.PREFIX;
  let m = config.header() + "\n\n";
  m += `Halo lik! 👋\nSelamat datang neng *${config.BOT_NAME}*\nAku *${config.AI_NAME}*, AI assistant e *${config.CREATOR_NAME}*.\n\n`;
  m += config.section("👑 ʙᴏᴛ ɪɴғᴏ", [
    `ᴏᴡɴᴇʀ : ${config.CREATOR_NAME}`,
    `ᴘʀᴇғɪx : ${p}`,
    `ᴍᴏᴅᴇ : ${config.MODE}`,
    `sᴛᴀᴛᴜs : Online 🟢`,
    `ᴜᴘᴛɪᴍᴇ : ${getUptime()}`,
  ]);
  m += "\n\n";
  m += config.section("💡 ᴄᴏʙᴀ ᴋᴇᴛɪᴋ", [
    `${p}menu : Lihat semua fitur`,
    `${p}payment : Lihat payment`,
    `${p}ig : Lihat Instagram`,
    `${p}ai <tanya> : Tanya soal coding`,
    `${p}tiktok <link> : Download TikTok`,
    `${p}sticker : Bikin stiker`,
    `${p}vn <teks> : Bot kirim VN`,
  ]);
  return m;
}

function getMenu() {
  const p = config.PREFIX;
  let m = config.header() + "\n\n";
  m += config.section("👑 ʙᴏᴛ ɪɴғᴏ", [
    `ᴏᴡɴᴇʀ : ${config.CREATOR_NAME}`,
    `ᴘʀᴇғɪx : ${p}`,
    `ᴍᴏᴅᴇ : ${config.MODE}`,
    `ᴀɪ ʀᴇᴘʟʏ : ${autoReply ? "ON" : "OFF"}`,
    `sᴛᴀᴛᴜs : Online 🟢`,
    `ᴜᴘᴛɪᴍᴇ : ${getUptime()}`,
  ]);
  m += "\n\n";
  m += config.section("💳 ᴘᴀʏᴍᴇɴᴛ", [
    `${p}payment : Semua payment + QR`,
    `${p}dana : QR DANA`,
    `${p}gopay : QR GOPAY`,
  ]);
  m += "\n\n";
  m += config.section("📸 ɪɴsᴛᴀɢʀᴀᴍ", [
    `${p}ig : Lihat IG Owner`,
    `${p}owner : Info Owner`,
  ]);
  m += "\n\n";
  m += config.section("🤖 ᴀɪ ᴄᴏᴍᴍᴀɴᴅs", [
    `${p}ai <question> : Ask ${config.AI_NAME}`,
    `${p}menu : Show this menu`,
    `${p}ping : Check bot speed`,
    `${p}owner : Owner info`,
  ]);
  m += "\n\n";
  m += config.section("📥 ᴅᴏᴡɴʟᴏᴀᴅs", [
    `${p}tiktok <link> : Download TikTok no WM`,
    `${p}ytmp3 <link> : Download MP3 YouTube`,
    `${p}ytmp4 <link> : Download MP4 YouTube`,
    `${p}dl <link> : Auto detect link`,
  ]);
  m += "\n\n";
  m += config.section("😆 sᴛɪᴋᴇʀ", [
    `${p}sticker / ${p}s : Bikin stiker`,
    `Cara: Kirim foto + caption ${p}sticker`,
  ]);
  m += "\n\n";
  m += config.section("🎙️ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ", [
    `${p}vn <teks> : Bot kirim VN suara`,
    `${p}vn2 <teks> : VN suara cewek`,
    `Kirim VN ke bot, bot auto bales`,
  ]);
  m += "\n\n";
  m += config.section("⚙️ sᴇᴛᴛɪɴɢs", [
    `${p}autoreply on/off : Toggle auto reply (owner only)`,
  ]);
  m += "\n\n";
  m += config.section("💡 ᴛɪᴘs", [
    `Private chat: just type, no prefix needed`,
    `Group: use ${p}ai <question>`,
    `Ketik menu aja tanpa titik juga bisa`,
  ]);
  return m;
}

function getOwnerInfo() {
  return (
    config.header() + "\n\n" +
    config.section("👑 ᴏᴡɴᴇʀ ɪɴғᴏ", [
      `ɴᴀᴍᴇ : ${config.CREATOR_NAME}`,
      `ɪɴғᴏ : ${config.CREATOR_INFO}`,
      `ɴᴜᴍʙᴇʀ : ${config.OWNER_NUMBER}`,
    ]) + "\n\n" +
    config.section("📸 ɪɴsᴛᴀɢʀᴀᴍ", [
      `ɪɢ 1 : @${config.IG1}`,
      `ɪɢ 2 : @${config.IG2}`,
    ]) + "\n\n" +
    config.section("💬 ʜᴜʙᴜɴɢɪ", [
      `Ketik ${config.PREFIX}ai <tanya> kanggo tanya coding`,
      `Ketik ${config.PREFIX}ig kanggo lihat IG`,
    ])
  );
}

function getIgInfo() {
  return (
    config.header() + "\n\n" +
    config.section("📸 ɪɴsᴛᴀɢʀᴀᴍ - ᴄᴀᴛᴜʀ ᴋᴀ", [
      `ɪɢ 1 : @${config.IG1}`,
      `ʟɪɴᴋ 1 : ${config.IG_LINK1}`,
      `ɪɢ 2 : @${config.IG2}`,
      `ʟɪɴᴋ 2 : ${config.IG_LINK2}`,
    ]) + "\n\n" +
    `Follow yo lik! 🔥\nBantu follow ben semangat gawe konten! 🙏`
  );
}

function getPaymentText() {
  return (
    config.header() + "\n\n" +
    config.section("💳 ᴘᴀʏᴍᴇɴᴛ - ᴋɪɴɢ ʙᴀɴɢᴄᴀᴛs", [
      `ᴏᴡɴᴇʀ : ${config.CREATOR_NAME}`,
    ]) + "\n\n" +
    config.section("💙 ᴅᴀɴᴀ", [
      `ɴᴏᴍᴏʀ : ${config.DANA_NUMBER}`,
      `ɴᴀᴍᴀ : ${config.DANA_NAME}`,
    ]) + "\n\n" +
    config.section("💚 ɢᴏᴘᴀʏ / ǫʀɪs", [
      `ɴᴏᴍᴏʀ : ${config.GOPAY_NUMBER}`,
      `ɴᴀᴍᴀ : ${config.GOPAY_NAME}`,
      `ɴᴍɪᴅ : ${config.QRIS_NMID}`,
    ]) + "\n\n" +
    `Habis TF, kirim bukti ya lik! 🙏\nMakasih support e! ❤️`
  );
}

function getDanaText() {
  return (
    config.header() + "\n\n" +
    config.section("💙 ᴅᴀɴᴀ - ᴋɪɴɢ ʙᴀɴɢᴄᴀᴛs", [
      `ɴᴏᴍᴏʀ : ${config.DANA_NUMBER}`,
      `ɴᴀᴍᴀ : ${config.DANA_NAME}`,
      `ᴏᴡɴᴇʀ : ${config.CREATOR_NAME}`,
    ]) + "\n\n" +
    `Scan QR neng nduwur ya lik! 📸\nHabis TF kirim bukti! 🙏`
  );
}

function getGopayText() {
  return (
    config.header() + "\n\n" +
    config.section("💚 ɢᴏᴘᴀʏ / ǫʀɪs", [
      `ɴᴏᴍᴏʀ : ${config.GOPAY_NUMBER}`,
      `ɴᴀᴍᴀ : ${config.GOPAY_NAME}`,
      `ɴᴍɪᴅ : ${config.QRIS_NMID}`,
    ]) + "\n\n" +
    `Scan QR neng nduwur ya lik! 📸\nHabis TF kirim bukti! 🙏`
  );
}

function getPing(speed) {
  return config.header() + "\n\n" + config.section("🏓 ᴘɪɴɢ", [
    `sᴘᴇᴇᴅ : ${speed}ms`,
    `ᴜᴘᴛɪᴍᴇ : ${getUptime()}`,
    `sᴛᴀᴛᴜs : Online 🟢`,
  ]);
}

function getAutoReplyBox() {
  return config.header() + "\n\n" + config.section("⚙️ ᴀᴜᴛᴏ ʀᴇᴘʟʏ", [
    `sᴛᴀᴛᴜs : ${autoReply ? "ON 🟢" : "OFF 🔴"}`,
  ]) + `\n\nAuto Reply ${autoReply ? "diaktifkan ✅" : "dimatikan ❌"}`;
}

function getCooldownBox() {
  return config.header() + "\n\n" + config.section("⏳ ᴛᴜɴɢɢᴜ sᴇʙᴇɴᴛᴀʀ", [
    `ᴄᴏᴏʟᴅᴏᴡɴ : ${config.COOLDOWN_SECONDS} detik`,
    `sᴛᴀᴛᴜs : Sabar ya lik 🙏`,
  ]);
}

function getAiReply(answer) {
  return config.header() + "\n\n" + answer + "\n\n───────────────────\nKetik *" + config.PREFIX + "menu* kanggo lihat fitur\nKetik *" + config.PREFIX + "ai <tanya>* kanggo tanya lagi";
}

function getThanks() {
  return config.header() + "\n\n" + `Sami-sami lik! 🙏\nSeneng iso bantu kamu belajar coding.\n\n` + config.section("💡 ʟᴀɴᴊᴜᴛ?", [
    `Ketik ${config.PREFIX}ai <tanya> kanggo tanya lagi`,
    `Ketik ${config.PREFIX}menu kanggo lihat fitur`,
  ]);
}

function getVnReceived() {
  return config.header() + "\n\n" + `Wes tak rungok ke VN mu lik! 🎙️\n\n` + config.section("🎙️ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ", [
    `sᴛᴀᴛᴜs : Diterima ✅`,
    `ᴛɪᴘs : Ketik teks aja biar AI iso bales`,
    `ᴄᴏʙᴀ : ${config.PREFIX}vn halo lik, piye kabare`,
  ]) + `\n\nCoba ketik pertanyaan mu nganggo teks ya, ben tak jawab AI! 🤖`;
}

function getStickerHelp() {
  const p = config.PREFIX;
  return config.header() + "\n\n" + config.section("😆 ᴄᴀʀᴀ ʙɪᴋɪɴ sᴛɪᴋᴇʀ", [
    `1. Kirim foto + caption ${p}sticker`,
    `2. Atau reply foto + ketik ${p}sticker`,
    `3. Atau kirim foto + caption ${p}s`,
  ]) + `\n\nCoba saiki, kirim foto mu! 📸`;
}

function getDlHelp() {
  const p = config.PREFIX;
  return config.header() + "\n\n" + config.section("📥 ᴄᴀʀᴀ ᴅᴏᴡɴʟᴏᴀᴅ", [
    `${p}tiktok <link tiktok>`,
    `${p}ytmp3 <link youtube>`,
    `${p}ytmp4 <link youtube>`,
    `${p}dl <link apa aja>`,
  ]) + `\n\nConto: ${p}tiktok https://vt.tiktok.com/xxxx`;
}

// ═════════════ PAYMENT SENDER (kirim teks + QR) ═════════════

async function kirimPayment(sock, from, msg, jenis) {
  if (jenis === "dana") {
    await sock.sendMessage(from, { text: getDanaText() }, { quoted: msg });
    const p = path.join(__dirname, config.QRIS_IMAGE);
    if (fs.existsSync(p)) {
      await sock.sendMessage(from, { image: { url: p }, caption: "QR DANA 💙\nScan neng kene lik! 📸" }, { quoted: msg });
    }
    return;
  }
  if (jenis === "gopay") {
    await sock.sendMessage(from, { text: getGopayText() }, { quoted: msg });
    const p = path.join(__dirname, config.GOPAY_QRIS_IMAGE);
    if (fs.existsSync(p)) {
      await sock.sendMessage(from, { image: { url: p }, caption: "QRIS GOPAY 💚\nScan neng kene lik! 📸" }, { quoted: msg });
    }
    return;
  }
  if (jenis === "payment") {
    await sock.sendMessage(from, { text: getPaymentText() }, { quoted: msg });
    const p1 = path.join(__dirname, config.QRIS_IMAGE);
    const p2 = path.join(__dirname, config.GOPAY_QRIS_IMAGE);
    if (fs.existsSync(p1)) await sock.sendMessage(from, { image: { url: p1 }, caption: "QR DANA 💙" }, { quoted: msg });
    if (fs.existsSync(p2)) await sock.sendMessage(from, { image: { url: p2 }, caption: "QRIS GOPAY 💚" }, { quoted: msg });
    return;
  }
}

// ═════════════ DOWNLOADS ═════════════

async function downloadTikTok(link) {
  const res = await fetch(`https://api.tikwm.com/api/?url=${encodeURIComponent(link)}`);
  const data = await res.json();
  if (!data?.data?.play) throw new Error("Gagal download TikTok");
  return { video: data.data.play, music: data.data.music, author: data.data.author?.nickname || "TikTok", title: data.data.title || "Video TikTok" };
}

async function downloadYT(link, type) {
  const api = `https://api.ryzumi.vip/api/downloader/yt${type}?url=${encodeURIComponent(link)}`;
  const res = await fetch(api);
  const data = await res.json();
  const url = data?.result?.download || data?.url || data?.result?.url;
  const title = data?.result?.title || data?.title || "YouTube";
  if (!url) throw new Error("Gagal download YouTube");
  return { url, title };
}

// ═════════════ VN (TTS) ═════════════

async function makeVN(text) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(text.slice(0, 200))}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error("Gagal bikin VN");
  return Buffer.from(await res.arrayBuffer());
}

// ═════════════ AI CALL ═════════════

async function askAI(chatId, userText) {
  if (!config.GROQ_API_KEY || config.GROQ_API_KEY === "gsk_xxxx") {
    console.log("⚠️ GROQ_API_KEY is empty! Isi neng config.js");
    return "AI is busy, try again in a moment 🙏";
  }
  if (!history[chatId]) history[chatId] = [];
  history[chatId].push({ role: "user", content: userText });
  history[chatId] = history[chatId].slice(-config.MAX_HISTORY);
  const messages = [{ role: "system", content: config.SYSTEM_PROMPT }, ...history[chatId]];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(config.GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.GROQ_API_KEY}` },
      body: JSON.stringify({ model: config.GROQ_MODEL, reasoning_effort: config.REASONING_EFFORT, messages, max_tokens: 600 }),
      signal: controller.signal,
    });
    const raw = await res.text();
    if (!res.ok) {
      console.log(`❌ Groq error - Status: ${res.status} Body: ${raw}`);
      return "AI is busy, try again in a moment 🙏";
    }
    let data;
    try { data = JSON.parse(raw); } catch {
      console.log("❌ Groq JSON parse error:", raw);
      return "AI is busy, try again in a moment 🙏";
    }
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.log("❌ Groq empty answer:", raw);
      return "AI is busy, try again in a moment 🙏";
    }
    history[chatId].push({ role: "assistant", content });
    history[chatId] = history[chatId].slice(-config.MAX_HISTORY);
    return content.slice(0, 1200);
  } catch (e) {
    console.log("❌ Groq fetch error:", e.name, e.message);
    return "AI is busy, try again in a moment 🙏";
  } finally { clearTimeout(timeout); }
}

// ═════════════ START BOT ═════════════

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_FOLDER);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    version,
    printQRInTerminal: false,
    browser: [config.BOT_NAME, "Chrome", "1.0"],
  });
  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    const nomor = config.PAIR_NUMBER.replace(/[^0-9]/g, "");
    console.log(`=== ${config.BOT_NAME} PAIRING ===`);
    console.log(`Nomor: ${nomor}`);
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const code = await sock.requestPairingCode(nomor);
      console.log(`\n🔥 KODE PAIRING MU: ${code}\n`);
      console.log("WA > Perangkat Tertaut > Tautkan dengan nomor telepon (30 detik!)");
    } catch (e) { console.log("Gagal pairing:", e.message); }
  }
  if (!config.GROQ_API_KEY || config.GROQ_API_KEY === "gsk_xxxx") {
    console.log("⚠️ GROQ_API_KEY masih kosong! Isi neng config.js biar AI jalan.");
  }

  sock.ev.on("connection.update", (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnect:", shouldReconnect);
      if (shouldReconnect) startBot();
      else console.log("❌ LOGGED OUT! Hapus folder session, Restart, Pairing lagi!");
    }
    if (connection === "open") console.log(`✅ ${config.BOT_NAME} ONLINE - ${config.PAIR_NUMBER}`);
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    if (msg.key.remoteJid === "status@broadcast") return;
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    // ─── VN MASUK ───
    if (msg.message.audioMessage) {
      return await sock.sendMessage(from, { text: getVnReceived() }, { quoted: msg });
    }

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "";
    if (!body) return;

    const sender = msg.key.participant || from;
    const senderNum = sender.replace(/[^0-9]/g, "").split("@")[0];
    const prefix = config.PREFIX;
    const isCmd = body.startsWith(prefix);
    const cmdBody = isCmd ? body.slice(prefix.length).trim() : body.trim();
    const [cmd, ...rest] = cmdBody.split(" ");
    const args = rest.join(" ").trim();
    const cmdLower = cmd.toLowerCase();
    const textLower = body.toLowerCase().trim();

    // ─── MENU TANPA PREFIX ───
    if (textLower === "menu" || textLower === "help" || textLower === "fitur" || textLower === "list" || textLower === "daftar menu") {
      return await sock.sendMessage(from, { text: getMenu() }, { quoted: msg });
    }

    // ─── PAYMENT / IG TANPA PREFIX JUGA BISA ───
    if (["payment", "pay", "donasi", "tf", "transfer", "dana", "gopay", "ig"].includes(textLower)) {
      if (textLower === "dana") return kirimPayment(sock, from, msg, "dana");
      if (textLower === "gopay") return kirimPayment(sock, from, msg, "gopay");
      if (["payment", "pay", "donasi", "tf", "transfer"].includes(textLower)) return kirimPayment(sock, from, msg, "payment");
      if (textLower === "ig") return await sock.sendMessage(from, { text: getIgInfo() }, { quoted: msg });
    }

    // ─── AUTO SAPA ───
    const sapaList = ["halo", "hai", "hi", "hello", "hei", "woy", "p", "assalamualaikum", "selamat pagi", "selamat siang", "selamat malam", "selamat sore"];
    if (!isCmd && sapaList.includes(textLower)) {
      return await sock.sendMessage(from, { text: getGreeting() }, { quoted: msg });
    }
    if (!isCmd && (textLower.includes("makasih") || textLower.includes("thank") || textLower.includes("suwun") || textLower.includes("matur nuwun"))) {
      return await sock.sendMessage(from, { text: getThanks() }, { quoted: msg });
    }

    // ─── OWNER ONLY ───
    if (isCmd && cmdLower === "autoreply") {
      if (!isOwnerOrBot(sock, msg)) return;
      const val = args.toLowerCase();
      if (val === "on") autoReply = true;
      else if (val === "off") autoReply = false;
      else return await sock.sendMessage(from, { text: getAutoReplyBox() + `\n\nKetik ${prefix}autoreply on / off` }, { quoted: msg });
      return await sock.sendMessage(from, { text: getAutoReplyBox() }, { quoted: msg });
    }

    // ─── COMMANDS ───
    if (isCmd) {
      if (cmdLower === "menu" || cmdLower === "help") return await sock.sendMessage(from, { text: getMenu() }, { quoted: msg });
      if (cmdLower === "ping") {
        const start = Date.now();
        await sock.sendMessage(from, { text: "Ping..." }, { quoted: msg });
        const speed = Date.now() - start;
        return await sock.sendMessage(from, { text: getPing(speed) }, { quoted: msg });
      }
      if (cmdLower === "owner") return await sock.sendMessage(from, { text: getOwnerInfo() }, { quoted: msg });
      if (cmdLower === "ig") return await sock.sendMessage(from, { text: getIgInfo() }, { quoted: msg });

      // ─── PAYMENT COMMANDS ───
      if (cmdLower === "dana") return kirimPayment(sock, from, msg, "dana");
      if (cmdLower === "gopay") return kirimPayment(sock, from, msg, "gopay");
      if (["payment", "pay", "donasi", "tf", "transfer"].includes(cmdLower)) return kirimPayment(sock, from, msg, "payment");

      if (cmdLower === "ai") {
        if (!args) return await sock.sendMessage(from, { text: config.header() + "\n\n" + config.section("🤖 ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [`ᴋᴇᴛɪᴋ : ${prefix}ai <pertanyaan>`, `ᴄᴏɴᴛᴏʜ : ${prefix}ai jelaskan function di javascript`]) }, { quoted: msg });
        const now = Date.now();
        if (lastUsed[senderNum] && now - lastUsed[senderNum] < config.COOLDOWN_SECONDS * 1000) return await sock.sendMessage(from, { text: getCooldownBox() }, { quoted: msg });
        lastUsed[senderNum] = now;
        await sock.sendPresenceUpdate("composing", from);
        const ans = await askAI(from, args);
        return await sock.sendMessage(from, { text: getAiReply(ans) }, { quoted: msg });
      }

      if (cmdLower === "sticker" || cmdLower === "stiker" || cmdLower === "s") {
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const imgMsg = msg.message.imageMessage || quoted?.imageMessage;
        const videoMsg = msg.message.videoMessage || quoted?.videoMessage;
        const targetMsg = imgMsg || videoMsg;
        if (!targetMsg) return await sock.sendMessage(from, { text: getStickerHelp() }, { quoted: msg });
        try {
          await sock.sendMessage(from, { text: "⏳ Lagi gawe stiker mu lik... 📸" }, { quoted: msg });
          const stream = await downloadContentFromMessage(targetMsg, imgMsg ? "image" : "video");
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          return await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
        } catch (e) {
          console.log("Sticker error:", e.message);
          return await sock.sendMessage(from, { text: config.header() + "\n\nGagal gawe stiker 😅\nCoba foto liyane ya lik!" }, { quoted: msg });
        }
      }

      if (cmdLower === "vn" || cmdLower === "vn2" || cmdLower === "tts" || cmdLower === "suara") {
        if (!args) return await sock.sendMessage(from, { text: config.header() + "\n\n" + config.section("🎙️ ᴄᴀʀᴀ ᴘᴀᴋᴀɪ ᴠɴ", [`ᴋᴇᴛɪᴋ : ${prefix}vn <teks>`, `ᴄᴏɴᴛᴏʜ : ${prefix}vn halo lik, piye kabare`, `ᴄᴇᴡᴇᴋ : ${prefix}vn2 halo cantik`]) }, { quoted: msg });
        try {
          await sock.sendMessage(from, { text: "⏳ Lagi gawe VN mu lik... 🎙️" }, { quoted: msg });
          const audioBuf = await makeVN(args);
          return await sock.sendMessage(from, { audio: audioBuf, mimetype: "audio/mp4", ptt: true }, { quoted: msg });
        } catch (e) {
          console.log("VN error:", e.message);
          return await sock.sendMessage(from, { text: config.header() + "\n\nGagal gawe VN 😅\nCoba teks e luwih pendek ya lik!" }, { quoted: msg });
        }
      }

      if (cmdLower === "tiktok" || cmdLower === "tt" || cmdLower === "dl" || cmdLower === "ytmp3" || cmdLower === "ytmp4") {
        if (!args || !args.includes("http")) return await sock.sendMessage(from, { text: getDlHelp() }, { quoted: msg });
        try {
          await sock.sendMessage(from, { text: config.header() + "\n\n⏳ Lagi download lik...\nMohon tunggu ya! 📥" }, { quoted: msg });
          if (cmdLower === "tiktok" || cmdLower === "tt" || (cmdLower === "dl" && args.includes("tiktok"))) {
            const dl = await downloadTikTok(args);
            let caption = config.header() + "\n\n" + config.section("📥 ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ", [`ᴀᴜᴛʜᴏʀ : ${dl.author}`, `ᴛɪᴛʟᴇ : ${dl.title.slice(0, 50)}`, `sᴛᴀᴛᴜs : Berhasil ✅`]);
            await sock.sendMessage(from, { video: { url: dl.video }, caption }, { quoted: msg });
            if (dl.music) await sock.sendMessage(from, { audio: { url: dl.music }, mimetype: "audio/mp4" }, { quoted: msg });
            return;
          }
          if (cmdLower === "ytmp3" || cmdLower === "ytmp4" || (cmdLower === "dl" && (args.includes("youtube") || args.includes("youtu.be")))) {
            const type = cmdLower === "ytmp4" ? "mp4" : "mp3";
            const dl = await downloadYT(args, type);
            let caption = config.header() + "\n\n" + config.section(`🎵 ʏᴏᴜᴛᴜʙᴇ ${type.toUpperCase()}`, [`ᴛɪᴛʟᴇ : ${dl.title.slice(0, 50)}`, `sᴛᴀᴛᴜs : Berhasil ✅`]);
            if (type === "mp3") await sock.sendMessage(from, { audio: { url: dl.url }, mimetype: "audio/mp4", caption }, { quoted: msg });
            else await sock.sendMessage(from, { video: { url: dl.url }, caption }, { quoted: msg });
            return;
          }
          return await sock.sendMessage(from, { text: getDlHelp() }, { quoted: msg });
        } catch (e) {
          console.log("Download error:", e.message);
          return await sock.sendMessage(from, { text: config.header() + "\n\n" + config.section("❌ ᴅᴏᴡɴʟᴏᴀᴅ ɢᴀɢᴀʟ", [`ᴀʟᴀsᴀɴ : Link salah / video private`, `sᴏʟᴜsɪ : Coba link liyane`]) + `\n\nCoba lagi ya lik! 🙏` }, { quoted: msg });
        }
      }

      return;
    }

    // ─── AUTO REPLY ───
    if (!autoReply) return;
    if (config.MODE === "PRIVATE" && !isOwnerOrBot(sock, msg)) return;
    let shouldReply = false;
    if (!isGroup) shouldReply = true;
    else {
      const quoted = msg.message.extendedTextMessage?.contextInfo;
      const isReplyToBot = quoted?.participant?.includes(sock.user?.id?.split(":")[0]);
      if (isReplyToBot) shouldReply = true;
    }
    if (!shouldReply) return;
    const now = Date.now();
    if (lastUsed[senderNum] && now - lastUsed[senderNum] < config.COOLDOWN_SECONDS * 1000) return;
    lastUsed[senderNum] = now;
    await sock.sendPresenceUpdate("composing", from);
    const ans = await askAI(from, body);
    await sock.sendMessage(from, { text: getAiReply(ans) }, { quoted: msg });
  });
}

startBot();