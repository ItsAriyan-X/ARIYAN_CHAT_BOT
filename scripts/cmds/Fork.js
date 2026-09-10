module.exports = {
  config: {
    name: "fork",
    version: "1.0.0",
    author: "ARIYAN SABBIR",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get the GitHub fork link of the bot.",
      tl: "Kunin ang GitHub fork link ng bot."
    },
    longDescription: {
      en: "This command provides the official GitHub fork link to deploy your own bot."
    },
    category: "info",
    guide: {
      en: "{p}fork"
    }
  },

  onStart: async function ({ api, event, message }) {
    const forkLink = "https://github.com/ItsAriyan-X/ARIYAN_CHAT_BOT/fork";
    
    const replyText = `🤖 𝗔𝗥𝗜𝗬𝗔𝗡 𝗖𝗛𝗔𝗧 𝗕𝗢𝗧 🤖\n\n` +
                      `✨ আমার এই বটটি আপনার নিজের ফেসবুক আইডিতে সেটআপ করতে চান?\n\n` +
                      `🔗 নিচের লিংকে ক্লিক করে এখনই কোডটি ফর্ক (Fork) করে নিন:\n${forkLink}\n\n` +
                      `📝 ফর্ক করার পর account.txt ফাইলে আপনার ফেসবুক কুকিজ বসিয়ে রান করুন।`;
    
    return message.reply(replyText);
  }
};
