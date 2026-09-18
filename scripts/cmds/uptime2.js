const os = require("os");
const { bold } = require("fontstyles");

// ═══════════════════════════════════════
// 🔐 PROTECTED AUTHOR
// ═══════════════════════════════════════

const PROTECTED_AUTHOR = "ARIYAN AHMED SABBIR";

// ═══════════════════════════════════════
// ✏️ EDITABLE BOT INFORMATION
// ═══════════════════════════════════════

const BOT_NAME = "𝗔𝗥𝗜𝗬𝗔𝗡 𝗖𝗛𝗔𝗧 𝗕𝗢𝗧";
const OWNER_NAME = "𝗔𝗥𝗜𝗬𝗔𝗡 𝗦𝗔𝗕𝗕𝗜𝗥";


// ═══════════════════════════════════════
// 📦 MODULE
// ═══════════════════════════════════════

module.exports = {

  config: {
    name: "uptime2",
    aliases: ["upt2", "up2"],
    version: "2.0",

    // 🔐 DO NOT CHANGE
    author: PROTECTED_AUTHOR,

    countDown: 10,
    role: 0,

    shortDescription:
      "Premium system dashboard",

    longDescription: {
      en:
        "Display bot uptime, CPU, RAM, users, groups and system information.",
      id:
        "Display bot uptime, CPU, RAM, users, groups and system information."
    },

    category: "system",

    guide: {
      en: "{pn}: Display premium system dashboard",
      id: "{pn}: Display premium system dashboard"
    }
  },


  // ═══════════════════════════════════════
  // 🚀 ON START
  // ═══════════════════════════════════════

  onStart: async function ({
    message,
    event,
    usersData,
    threadsData,
    api
  }) {

    // ═════════════════════════════════════
    // 🔐 AUTHOR PROTECTION
    // ═════════════════════════════════════

    if (this.config.author !== PROTECTED_AUTHOR) {

      console.log(
        "❌ [uptime2] SECURITY BLOCK: Author was changed."
      );

      return message.reply(
        "╭━━━━━━━━━━━━━━━━━━━━╮\n" +
        "       🔐 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯\n\n" +
        "❌ Unauthorized author change detected.\n" +
        "🚫 Command execution stopped.\n\n" +
        "🔒 This command is protected."
      );
    }


    const startTime = Date.now();


    try {

      // ═══════════════════════════════════
      // 📊 FETCH BOT DATA
      // ═══════════════════════════════════

      const [
        users,
        groups
      ] = await Promise.all([
        usersData.getAll(),
        threadsData.getAll()
      ]);


      // ═══════════════════════════════════
      // ⏱️ UPTIME
      // ═══════════════════════════════════

      const uptime =
        process.uptime();

      const days =
        Math.floor(uptime / 86400);

      const hours =
        Math.floor((uptime % 86400) / 3600);

      const minutes =
        Math.floor((uptime % 3600) / 60);

      const seconds =
        Math.floor(uptime % 60);

      const uptimeText =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;


      // ═══════════════════════════════════
      // 💾 RAM
      // ═══════════════════════════════════

      const totalMemory =
        os.totalmem();

      const freeMemory =
        os.freemem();

      const usedMemory =
        totalMemory - freeMemory;

      const memoryPercent =
        (usedMemory / totalMemory) * 100;

      const memoryPercentText =
        memoryPercent.toFixed(1);


      const usedGB =
        (usedMemory /
          1024 /
          1024 /
          1024
        ).toFixed(2);

      const totalGB =
        (totalMemory /
          1024 /
          1024 /
          1024
        ).toFixed(2);


      // ═══════════════════════════════════
      // 📊 RAM BAR
      // ═══════════════════════════════════

      const barLength = 12;

      const filled =
        Math.round(
          (memoryPercent / 100) *
          barLength
        );

      const ramBar =
        "█".repeat(
          Math.min(filled, barLength)
        ) +
        "░".repeat(
          Math.max(
            0,
            barLength - filled
          )
        );


      // ═══════════════════════════════════
      // 🧠 CPU
      // ═══════════════════════════════════

      const cpus =
        os.cpus() || [];

      const cpuCount =
        cpus.length || 1;

      const cpuModel =
        cpus[0]?.model ||
        "Unknown CPU";


      const load =
        os.loadavg();

      // Approximate CPU load percentage
      const cpuLoad =
        Math.min(
          100,
          (load[0] / cpuCount) * 100
        );


      // ═══════════════════════════════════
      // 🖥️ SYSTEM
      // ═══════════════════════════════════

      const platform =
        os.platform();

      const architecture =
        os.arch();

      const hostname =
        os.hostname();

      const nodeVersion =
        process.version;


      // ═══════════════════════════════════
      // ⚡ PING
      // ═══════════════════════════════════

      const ping =
        Date.now() - startTime;


      // ═══════════════════════════════════
      // 🖼️ MEDIA BAN
      // ═══════════════════════════════════

      let mediaBan = false;

      try {

        mediaBan =
          await threadsData.get(
            event.threadID,
            "mediaBan"
          ) || false;

      } catch {

        mediaBan = false;

      }


      const mediaStatus =
        mediaBan
          ? "🚫 Restricted"
          : "🟢 Active";


      // ═══════════════════════════════════
      // 🇧🇩 BANGLADESH TIME
      // ═══════════════════════════════════

      const bangladeshTime =
        new Date().toLocaleString(
          "en-US",
          {
            timeZone: "Asia/Dhaka",

            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",

            hour12: true
          }
        );


      // ═══════════════════════════════════
      // 📈 LOAD BAR
      // ═══════════════════════════════════

      const cpuBarLength = 12;

      const cpuFilled =
        Math.round(
          (cpuLoad / 100) *
          cpuBarLength
        );

      const cpuBar =
        "█".repeat(
          Math.min(
            cpuFilled,
            cpuBarLength
          )
        ) +
        "░".repeat(
          Math.max(
            0,
            cpuBarLength - cpuFilled
          )
        );


      // ═══════════════════════════════════
      // 🟢 STATUS
      // ═══════════════════════════════════

      const status =
        "🟢 ALL SYSTEMS OPERATIONAL";


      // ═══════════════════════════════════
      // 📋 DASHBOARD
      // ═══════════════════════════════════

      const dashboard =

`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
       ⚡ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢
╭──────────────────────────────
│ 🤖 Bot    : ${BOT_NAME}
│ 👑 Owner  : ${OWNER_NAME}
│ 🔐 Author : ${PROTECTED_AUTHOR}
╰──────────────────────────────

⏱️ 𝗣𝗥𝗢𝗖𝗘𝗦𝗦 𝗨𝗣𝗧𝗜𝗠𝗘
╭──────────────────────────────
│ 🕒 Uptime : ${uptimeText}
│ ⚡ Ping   : ${ping} ms
│ 📦 Node   : ${nodeVersion}
╰──────────────────────────────

🧠 𝗥𝗘𝗦𝗢𝗨𝗥𝗖𝗘 𝗨𝗦𝗔𝗚𝗘
╭──────────────────────────────
│ 🧠 CPU : [${cpuBar}]
│ 📊 Load: ${cpuLoad.toFixed(2)}%
│
│ 💾 RAM : [${ramBar}]
│ 📊 Used: ${memoryPercentText}%
│ 📥 ${usedGB} GB / ${totalGB} GB
╰──────────────────────────────

🖥️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢
╭──────────────────────────────
│ 💻 OS      : ${platform}
│ 🏗️ Arch    : ${architecture}
│ 🧠 Cores   : ${cpuCount}
│ ⚙️ CPU     : ${cpuModel}
│ 🖥️ Host    : ${hostname}
╰──────────────────────────────

📊 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗖𝗦
╭──────────────────────────────
│ 👥 Users   : ${users.length}
│ 🏘️ Groups  : ${groups.length}
│ 🖼️ Media   : ${mediaStatus}
╰──────────────────────────────

🇧🇩 𝗕𝗔𝗡𝗚𝗟𝗔𝗗𝗘𝗦𝗛 𝗧𝗜𝗠𝗘
╭──────────────────────────────
│ 📅 ${bangladeshTime}
╰──────────────────────────────

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│ ${status}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭──────────────────────────────╮
│ 🤖 ${BOT_NAME}
│ 🔐 Protected Author
│ ✨ Premium System Monitor
╰──────────────────────────────╯`;


      // ═══════════════════════════════════
      // 🔄 LOADING ANIMATION
      // ═══════════════════════════════════

      const loadingFrames = [
        "『 ░░░░░░░░░░░░ 』 0%",
        "『 ██░░░░░░░░░░ 』 20%",
        "『 ████░░░░░░░░ 』 40%",
        "『 ██████░░░░░░ 』 60%",
        "『 ████████░░░░ 』 80%",
        "『 ████████████ 』 100%"
      ];


      let sentMessage =
        await message.reply(
          `╭━━━━━━━━━━━━━━━━━━━━╮
        ⚙️ ${bold("SYSTEM BOOT")}
╰━━━━━━━━━━━━━━━━━━━━╯

${loadingFrames[0]}

🔄 Initializing system...
🔄 Reading resources...
🔄 Checking bot status...`
        );


      const sleep =
        ms =>
          new Promise(
            resolve =>
              setTimeout(
                resolve,
                ms
              )
          );


      // ═══════════════════════════════════
      // 🔄 ANIMATION
      // ═══════════════════════════════════

      for (
        let i = 1;
        i < loadingFrames.length;
        i++
      ) {

        await sleep(350);

        await api.editMessage(

`╭━━━━━━━━━━━━━━━━━━━━╮
        ⚙️ ${bold("SYSTEM BOOT")}
╰━━━━━━━━━━━━━━━━━━━━╯

${loadingFrames[i]}

${i < 3
  ? "🔄 Collecting system data..."
  : i < 5
    ? "⚡ Processing resources..."
    : "🟢 System check completed..."
}`,

          sentMessage.messageID
        );

      }


      // ═══════════════════════════════════
      // 📡 SHOW FINAL DASHBOARD
      // ═══════════════════════════════════

      await sleep(300);

      return api.editMessage(
        dashboard,
        sentMessage.messageID
      );


    } catch (err) {

      console.error(
        "[uptime2] Error:",
        err
      );

      return message.reply(
        "╭━━━━━━━━━━━━━━━━━━━━╮\n" +
        "       ❌ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗘𝗥𝗥𝗢𝗥\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯\n\n" +
        "⚠️ Unable to fetch system information.\n\n" +
        `📝 Error: ${err.message || "Unknown error"}`
      );

    }

  }

};
