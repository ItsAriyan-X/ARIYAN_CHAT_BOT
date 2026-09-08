/**
 * @author NTKhang
 * ! The source code is written by NTKhang, please don't change the author's name everywhere.
 */

// ==========================================
// GOAT BOT
// ==========================================

const { spawn } = require("child_process");

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			console.log("Restarting Project...");
			startProject();
		}
	});
}

startProject();

// ==========================================
// UPTIME SERVER
// ==========================================

const express = require("express");
const app = express();

app.get("/", (req, res) => {
	res.send("Bot is running!");
});

app.listen(3000, () => {
	console.log("Uptime server running on port 3000");
});
