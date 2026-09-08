module.exports = {
  config: {
    name: "ariyan",
    version: "2.0.0",
    author: "Ariyan X Sabbir",
    countDown: 5,
    role: 0,
    shortDescription: "Ariyan + Sabbir Mention Detector",
    longDescription: "Ariyan + Sabbir + Mentions Detector",
    category: "fun",
    guide: "Mention Ariyan or Sabbir, or type their names to trigger detector"
  },

  onStart: async function ({ message }) {
    try {
      const info = await message.reply(
        "✅ **Ariyan + Sabbir Detector Active!**\n\n" +
        "• Ariyan / Ariyan vai / Ariyan bhai / Ariyan bro\n" +
        "• Sabbir / Sabbir vai / Sabbir bhai / Sabbir bro\n" +
        "• 61591654275272\n" +
        "• 100028959431665\n\n" +
        "Bot ready 🔥"
      );

      if (
        info &&
        info.messageID &&
        global.GoatBot &&
        global.GoatBot.onReply
      ) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: message.senderID,
          type: "ariyan"
        });
      }
    } catch (err) {
      console.error("[ariyan] onStart error:", err);
    }
  },

  onChat: async function ({ event, message }) {
    try {
      if (!event.body || typeof event.body !== "string") return;

      const threadID = event.threadID;
      const messageID = event.messageID;
      const now = Date.now();

      // ---- Duplicate reply prevention ----
      if (!global.ariyanProcessed) {
        global.ariyanProcessed = new Set();
      }

      if (messageID && global.ariyanProcessed.has(messageID)) return;

      // ---- Thread-based anti-spam (8s) ----
      if (!global.ariyanThreadCooldown) {
        global.ariyanThreadCooldown = new Map();
      }

      const lastTime =
        global.ariyanThreadCooldown.get(threadID) || 0;

      if (now - lastTime < 8000) return;

      const text = event.body.toLowerCase().trim();
      const mentions = event.mentions || {};

      // ---- UID Detector ----
      const isTargetHit = (uid) => {
        if (mentions[uid]) return true;
        if (event.body.includes(uid)) return true;
        return false;
      };

      const markHandled = () => {
        global.ariyanThreadCooldown.set(threadID, now);

        if (messageID) {
          global.ariyanProcessed.add(messageID);

          if (global.ariyanProcessed.size > 500) {
            const first =
              global.ariyanProcessed.values().next().value;

            global.ariyanProcessed.delete(first);
          }
        }
      };

      // ---- Ariyan UID Detector ----
      const ariyanUID = "61591654275272";

      if (isTargetHit(ariyanUID)) {
        markHandled();

        const replies = [
          "Ariyan vai akon besto ache 😌",
          "Ariyan ke dakchen keno vai? 😂",
          "Ariyan vai ektu rest nitechen 😴",
          "Ariyan akon busy ache 🔥",
          "Ariyan er kache janai disi 😎"
        ];

        const randomReply =
          replies[Math.floor(Math.random() * replies.length)];

        await message.reply(randomReply);
        return;
      }

      // ---- Sabbir UID Detector ----
      const sabbirUID = "100028959431665";

      if (isTargetHit(sabbirUID)) {
        markHandled();

        const replies = [
          "Sabbir vai akon besto ache 😌",
          "Sabbir ke dakchen keno vai? 😂",
          "Sabbir vai ektu rest nitechen 😴",
          "Sabbir akon busy ache 🔥",
          "Sabbir er kache janai disi 😎"
        ];

        const randomReply =
          replies[Math.floor(Math.random() * replies.length)];

        await message.reply(randomReply);
        return;
      }

      // ---- Ariyan Name Detector ----
      const ariyanTriggers = [
        "ariyan",
        "আরিয়ান",
        "আরিয়ান",
        "ariyan vai",
        "ariyan bhai",
        "ariyan bro"
      ];

      if (
        ariyanTriggers.some(trigger =>
          text.includes(trigger)
        )
      ) {
        markHandled();

        const replies = [
          "Ariyan vai akon besto ache 😌",
          "Ariyan ke dakchen keno vai? 😂",
          "Ariyan vai ektu rest nitechen 😴",
          "Ariyan akon busy ache 🔥",
          "Ariyan er kache janai disi 😎"
        ];

        const randomReply =
          replies[Math.floor(Math.random() * replies.length)];

        await message.reply(randomReply);
        return;
      }

      // ---- Sabbir Name Detector ----
      const sabbirTriggers = [
        "sabbir",
        "সাব্বির",
        "sabbir vai",
        "sabbir bhai",
        "sabbir bro"
      ];

      if (
        sabbirTriggers.some(trigger =>
          text.includes(trigger)
        )
      ) {
        markHandled();

        const replies = [
          "Sabbir vai akon besto ache 😌",
          "Sabbir ke dakchen keno vai? 😂",
          "Sabbir vai ektu rest nitechen 😴",
          "Sabbir akon busy ache 🔥",
          "Sabbir er kache janai disi 😎"
        ];

        const randomReply =
          replies[Math.floor(Math.random() * replies.length)];

        await message.reply(randomReply);
        return;
      }

    } catch (err) {
      console.error("[ariyan] onChat error:", err);
    }
  },

  onReply: async function ({ event, Reply, message }) {
    try {
      if (!Reply || !event.body) return;
      if (event.senderID !== Reply.author) return;

      await message.reply(`You replied: ${event.body}`);
    } catch (err) {
      console.error("[ariyan] onReply error:", err);
    }
  },

  onReaction: async function ({ event, Reaction, message }) {
    try {
      if (!Reaction) return;
      if (event.userID !== Reaction.author) return;

      await message.reply(
        `You reacted with: ${event.reaction} 👍`
      );
    } catch (err) {
      console.error("[ariyan] onReaction error:", err);
    }
  },

  onEvent: async function ({ event, message }) {
    try {
      if (event.logMessageType === "log:subscribe") {
        await message.reply(
          "Welcome to the group! 🎉"
        );
      }
    } catch (err) {
      console.error("[ariyan] onEvent error:", err);
    }
  }
};
