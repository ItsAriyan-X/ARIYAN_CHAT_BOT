
const pendingFilters = global.filterfbPending || (global.filterfbPending = {});

module.exports.config = {
    name: "filterfb",
    version: "2.0.0",
    hasPermssion: 2,
    credits: "ARIYAN SABBIR",
    description: "Preview and safely filter group members with missing gender data",
    commandCategory: "box chat",
    usages: "[preview/confirm/cancel]",
    cooldowns: 5
};

function getThreadInfo(api, threadID) {
    return new Promise((resolve, reject) => {
        let settled = false;

        const done = (err, data) => {
            if (settled) return;
            settled = true;
            if (err) return reject(err);
            resolve(data);
        };

        try {
            const result = api.getThreadInfo(threadID, done);

            if (result && typeof result.then === "function") {
                result.then(data => done(null, data)).catch(err => done(err));
            }
        } catch (err) {
            done(err);
        }
    });
}

function removeUser(api, userID, threadID) {
    return new Promise((resolve, reject) => {
        let settled = false;

        const done = (err, data) => {
            if (settled) return;
            settled = true;
            if (err) return reject(err);
            resolve(data);
        };

        try {
            const result = api.removeUserFromGroup(userID, threadID, done);

            if (result && typeof result.then === "function") {
                result.then(data => done(null, data)).catch(err => done(err));
            }
        } catch (err) {
            done(err);
        }
    });
}

function send(api, message, threadID, messageID) {
    return new Promise((resolve, reject) => {
        let settled = false;

        const done = (err, data) => {
            if (settled) return;
            settled = true;
            if (err) return reject(err);
            resolve(data);
        };

        try {
            const result = api.sendMessage(message, threadID, done, messageID);

            if (result && typeof result.then === "function") {
                result.then(data => done(null, data)).catch(err => done(err));
            }
        } catch (err) {
            done(err);
        }
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getAdminIDs(info) {
    return (Array.isArray(info.adminIDs) ? info.adminIDs : [])
        .map(item => String(
            item && typeof item === "object" ? item.id : item
        ))
        .filter(id => id && id !== "undefined" && id !== "null");
}

function getEligibleUsers(info, botID) {
    const admins = getAdminIDs(info);

    return (Array.isArray(info.userInfo) ? info.userInfo : [])
        .filter(user => {
            if (!user || user.id == null) return false;

            const id = String(user.id);

            if (!id || id === botID || admins.includes(id)) {
                return false;
            }

            // Missing gender data only; this does not identify account type.
            return user.gender == null ||
                String(user.gender).trim() === "";
        })
        .map(user => ({
            id: String(user.id),
            name: user.name || "Unknown User"
        }));
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const sender = String(senderID);
    const botID = String(api.getCurrentUserID());
    const mode = String(args?.[0] || "preview").toLowerCase();
    const key = `${threadID}:${sender}`;

    try {
        if (!["preview", "confirm", "cancel"].includes(mode)) {
            return send(
                api,
                "ব্যবহার:\nfilterfb preview\nfilterfb confirm\nfilterfb cancel",
                threadID,
                messageID
            );
        }

        let info = await getThreadInfo(api, threadID);

        if (!info) {
            return send(api, "❌ গ্রুপের তথ্য পাওয়া যায়নি।", threadID, messageID);
        }

        let adminIDs = getAdminIDs(info);

        if (!adminIDs.includes(botID)) {
            return send(
                api,
                "❌ আগে বটকে গ্রুপ অ্যাডমিন করতে হবে।",
                threadID,
                messageID
            );
        }

        if (!adminIDs.includes(sender)) {
            return send(
                api,
                "❌ শুধু গ্রুপ অ্যাডমিন এই কমান্ড ব্যবহার করতে পারবেন।",
                threadID,
                messageID
            );
        }

        if (mode === "cancel") {
            if (!pendingFilters[key]) {
                return send(
                    api,
                    "ℹ️ আপনার জন্য কোনো pending filter নেই।",
                    threadID,
                    messageID
                );
            }

            delete pendingFilters[key];

            return send(
                api,
                "✅ Filter বাতিল করা হয়েছে। কাউকে রিমুভ করা হয়নি।",
                threadID,
                messageID
            );
        }

        if (mode === "preview") {
            const users = getEligibleUsers(info, botID);

            if (!users.length) {
                delete pendingFilters[key];

                return send(
                    api,
                    "✅ অনুপস্থিত gender তথ্যের শর্তে কোনো eligible সদস্য পাওয়া যায়নি।",
                    threadID,
                    messageID
                );
            }

            pendingFilters[key] = {
                threadID: String(threadID),
                senderID: sender,
                userIDs: users.map(user => user.id),
                createdAt: Date.now()
            };

            const list = users.slice(0, 30)
                .map((user, index) => `${index + 1}. ${user.name}`)
                .join("\n");

            const more = users.length > 30
                ? `\n...এবং আরও ${users.length - 30} জন`
                : "";

            return send(
                api,
                "🔎 FILTER PREVIEW\n\n" +
                `👥 মোট সদস্য: ${users.length}\n\n` +
                `${list}${more}\n\n` +
                "⚠️ তালিকাটি gender তথ্য অনুপস্থিত থাকার ভিত্তিতে তৈরি। " +
                "এটি কোনো অ্যাকাউন্টের ধরন প্রমাণ করে না।\n\n" +
                "রিমুভ করতে চাইলে ২ মিনিটের মধ্যে:\n" +
                "filterfb confirm\n\n" +
                "বাতিল করতে: filterfb cancel",
                threadID,
                messageID
            );
        }

        // Confirmation must follow a preview from the same admin and group.
        const pending = pendingFilters[key];

        if (
            !pending ||
            pending.threadID !== String(threadID) ||
            pending.senderID !== sender
        ) {
            return send(
                api,
                "❌ আগে filterfb preview চালান। তারপর confirm দিন।",
                threadID,
                messageID
            );
        }

        if (Date.now() - pending.createdAt > 2 * 60 * 1000) {
            delete pendingFilters[key];

            return send(
                api,
                "⌛ Preview-এর সময় শেষ। আবার filterfb preview চালান।",
                threadID,
                messageID
            );
        }

        // Refresh group data before acting.
        info = await getThreadInfo(api, threadID);
        if (!info) {
            delete pendingFilters[key];
            return send(api, "❌ গ্রুপের তথ্য আবার পাওয়া যায়নি।", threadID, messageID);
        }

        adminIDs = getAdminIDs(info);

        if (!adminIDs.includes(botID) || !adminIDs.includes(sender)) {
            delete pendingFilters[key];

            return send(
                api,
                "❌ বট বা আপনার অ্যাডমিন অনুমতি নেই। Filter বাতিল করা হয়েছে।",
                threadID,
                messageID
            );
        }

        const currentUsers = getEligibleUsers(info, botID);
        const pendingIDs = new Set(pending.userIDs);
        const targets = currentUsers.filter(user => pendingIDs.has(user.id));

        delete pendingFilters[key];

        if (!targets.length) {
            return send(
                api,
                "✅ Preview-এর কোনো সদস্য এখন আর eligible নন। কাউকে রিমুভ করা হয়নি।",
                threadID,
                messageID
            );
        }

        await send(
            api,
            `⚠️ Filter শুরু হচ্ছে।\nমোট সদস্য: ${targets.length}\nবন্ধ করতে চাইলে পরবর্তী সদস্য রিমুভ হওয়ার আগেই বট থামান।`,
            threadID,
            messageID
        );

        let success = 0;
        let failed = 0;

        for (const user of targets) {
            try {
                // Refresh membership/admin status before each removal.
                const latestInfo = await getThreadInfo(api, threadID);
                if (!latestInfo) {
                    failed += targets.length - success - failed;
                    break;
                }

                const latestAdmins = getAdminIDs(latestInfo);
                const stillMember = (latestInfo.userInfo || []).some(
                    member => String(member.id) === user.id
                );

                if (
                    !latestAdmins.includes(botID) ||
                    latestAdmins.includes(user.id) ||
                    !stillMember
                ) {
                    failed++;
                    continue;
                }

                await delay(1200);
                await removeUser(api, user.id, threadID);
                success++;
            } catch (err) {
                failed++;
                console.error(
                    `[FILTERFB] Failed for ${user.id}:`,
                    err?.message || err
                );
            }
        }

        return send(
            api,
            "✅ FILTER COMPLETE\n\n" +
            `🔎 Preview-এ ছিল: ${pending.userIDs.length}\n` +
            `🎯 বর্তমান eligible: ${targets.length}\n` +
            `✅ রিমুভ সফল: ${success}\n` +
            `❌ ব্যর্থ/এড়ানো হয়েছে: ${failed}`,
            threadID,
            messageID
        );

    } catch (error) {
        console.error("[FILTERFB ERROR]", error);

        return send(
            api,
            "❌ Filter করতে সমস্যা হয়েছে। Console log পরীক্ষা করুন।",
            threadID,
            messageID
        );
    }
};
