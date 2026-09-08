"use strict";

function format(...args) {
	return args
		.map(arg => {
			if (typeof arg === "object" && arg !== null) {
				try {
					return JSON.stringify(arg);
				} catch {
					return String(arg);
				}
			}
			return String(arg);
		})
		.join(" ");
}

module.exports = {
	info(...args) {
		console.log("[INFO]", format(...args));
	},

	warn(...args) {
		console.warn("[WARN]", format(...args));
	},

	error(...args) {
		console.error("[ERROR]", format(...args));
	},

	success(...args) {
		console.log("[SUCCESS]", format(...args));
	},

	debug(...args) {
		console.log("[DEBUG]", format(...args));
	},

	log(...args) {
		console.log(format(...args));
	}
};
