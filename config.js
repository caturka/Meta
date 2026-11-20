// ═══════════════════════════════════════════
//  KING BANGCATS - CONFIG FULL + PAYMENT + IG
// ═══════════════════════════════════════════

module.exports = {

  // ─── IDENTITAS BOT ───
  BOT_NAME: "KING BANGCATS",
  AI_NAME: "KING AI",
  CREATOR_NAME: "Catur KA",
  CREATOR_INFO: "Software developer and content creator",
  OWNER_NUMBER: "62895631966911",
  PAIR_NUMBER: "628816863236",

  // ─── API KEY & GAMBAR ───
  GROQ_API_KEY: "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",
  BOT_IMAGE: "https://i.postimg.cc/wTRsxVtn/IMG-20261111-WA0003.jpg",

  // ─── GROQ (JANGAN DIUBAH) ───
  GROQ_URL: "https://fei-ai.vercel.app/api/groq",
  GROQ_MODEL: "openai/gpt-oss-20b",
  REASONING_EFFORT: "low",

  // ─── SETTING BOT ───
  PREFIX: ".",
  MODE: "PUBLIC",
  VERSION: "1.0.0",
  TIMEZONE: "Africa/Lagos",
  AUTO_REPLY: true,
  MAX_HISTORY: 6,
  COOLDOWN_SECONDS: 5,
  SESSION_FOLDER: "session",

  // ─── IG ───
  IG1: "bangcats.id",
  IG2: "__kerass",
  IG_LINK1: "https://instagram.com/bangcats.id",
  IG_LINK2: "https://instagram.com/__kerass",

  // ─── PAYMENT - DANA ───
  DANA_NUMBER: "0895631966911",
  DANA_NAME: "CATUR KURNIA ADI",
  QRIS_IMAGE: "qris.jpg",

  // ─── PAYMENT - GOPAY ───
  GOPAY_NUMBER: "0895631966911",
  GOPAY_NAME: "CATUR KURNIA ADI",
  GOPAY_QRIS_IMAGE: "gopay.jpg",
  QRIS_NMID: "ID1026644153318",

  // ─── HEADER ───
  header() {
    return (
      `╭─━─━─━─━─━─━─━─━─━─━╮\n` +
      `│  ⚡ ${this.BOT_NAME.toLowerCase()} ⚡\n` +
      `╰─━─━─━─━─━─━─━─━─━─━╯`
    );
  },

  // ─── SECTION ───
  section(title, lines) {
    let out = `┌───〔 ${title} 〕───┐\n`;
    for (const line of lines) {
      out += "│ ✦ " + line + "\n";
    }
    out += "└───────────────────┘";
    return out;
  },
  get SYSTEM_PROMPT() {
    return "You are " + this.AI_NAME + ", the AI assistant of " + this.CREATOR_NAME + ". " + this.CREATOR_NAME + " is " + this.CREATOR_INFO + ". Your main job: Helping beginners learn programming: explain simply, give small examples, help fix errors step by step. Rules: Be friendly, short and simple. Plain text for WhatsApp, under 1200 characters. If someone asks what you are, your name, who made you, who owns you, answer you are " + this.AI_NAME + ", the AI assistant of " + this.CREATOR_NAME + ", and you may add: " + this.CREATOR_INFO + ". Never claim to be human. Never name the AI company or model behind you. If someone sincerely asks about the technology, say you are an AI assistant powered by an AI language model. Stay on your job. Small talk is fine. If question is off-topic, politely steer back to helping beginners learn programming. Give small code examples when needed. Help fix errors step by step. Never show the AI model or AI provider name.";
  },
};