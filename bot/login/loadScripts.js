const {
	readdirSync,
	readFileSync,
	existsSync
} = require("fs-extra");

const path = require("path");

const exec = (cmd, options) =>
	new Promise((resolve, reject) => {
		require("child_process").exec(
			cmd,
			options,
			(err, stdout) => {
				if (err) return reject(err);
				resolve(stdout);
			}
		);
	});

const { log } = global.utils;
const { GoatBot } = global;
const { configCommands } = GoatBot;

const regExpCheckPackage =
	/require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;

const packageAlready = [];

const hackerLog = () => {
	console.log("[+] Loading commands...");
	console.log("[+] Loading events...");
	console.log("[✓] All modules loaded successfully.");
	console.log("> System ready...");
};

module.exports = async function (
	api,
	threadModel,
	userModel,
	dashBoardModel,
	globalModel,
	threadsData,
	usersData,
	dashBoardData,
	globalData,
	createLine
) {

	hackerLog();

	/* =====================================================
	   LOAD ALIASES
	===================================================== */

	const aliasesData =
		await globalData.get(
			"setalias",
			"data",
			[]
		);

	if (aliasesData) {
		for (const data of aliasesData) {

			const {
				aliases,
				commandName
			} = data;

			if (!Array.isArray(aliases))
				continue;

			for (const alias of aliases) {

				if (
					GoatBot.aliases.has(alias)
				) {
					throw new Error(
						`Alias "${alias}" already exists in command "${commandName}"`
					);
				}

				GoatBot.aliases.set(
					alias,
					commandName
				);
			}
		}
	}

	/* =====================================================
	   COMMAND + EVENT FOLDERS
	===================================================== */

	const folders = [
		"cmds",
		"events"
	];

	let text;
	let setMap;
	let typeEnvCommand;

	for (const folderModules of folders) {

		if (folderModules === "cmds") {

			text = "command";
			typeEnvCommand = "envCommands";
			setMap = "commands";

		} else {

			text = "event command";
			typeEnvCommand = "envEvents";
			setMap = "eventCommands";
		}

		const fullPathModules =
			path.normalize(
				path.join(
					process.cwd(),
					"scripts",
					folderModules
				)
			);

		/* =================================================
		   CHECK FOLDER
		================================================= */

		if (!existsSync(fullPathModules)) {

			console.log(
				`[!] Folder not found: ${fullPathModules}`
			);

			continue;
		}

		const Files =
			readdirSync(fullPathModules)
				.filter(file =>
					file.endsWith(".js") &&
					!file.endsWith("eg.js") &&
					(
						process.env.NODE_ENV ===
						"development"
							? true
							: !file.match(
								/(dev)\.js$/g
							)
					) &&
					!(
						configCommands[
							folderModules === "cmds"
								? "commandUnload"
								: "commandEventUnload"
						]?.includes(file)
					)
				);

		const commandError = [];
		let commandLoadSuccess = 0;

		/* =================================================
		   LOAD EACH FILE
		================================================= */

		for (const file of Files) {

			const pathCommand =
				path.normalize(
					path.join(
						fullPathModules,
						file
					)
				);

			try {

				/* =========================================
				   READ FILE
				========================================= */

				const contentFile =
					readFileSync(
						pathCommand,
						"utf8"
					);

				/* =========================================
				   AUTO INSTALL PACKAGES
				========================================= */

				let allPackage =
					contentFile.match(
						regExpCheckPackage
					);

				if (allPackage) {

					allPackage =
						allPackage
							.map(p => {

								const match =
									p.match(
										/[`'"]([^`'"]+)[`'"]/
									);

								return match
									? match[1]
									: null;
							})
							.filter(Boolean)
							.filter(p =>
								p.indexOf("/") !== 0 &&
								p.indexOf("./") !== 0 &&
								p.indexOf("../") !== 0 &&
								p.indexOf(__dirname) !== 0
							);

					for (
						let packageName
						of allPackage
					) {

						if (
							packageName.startsWith("@")
						) {

							packageName =
								packageName
									.split("/")
									.slice(0, 2)
									.join("/");

						} else {

							packageName =
								packageName
									.split("/")[0];
						}

						if (
							!packageAlready.includes(
								packageName
							)
						) {

							packageAlready.push(
								packageName
							);

							const packagePath =
								path.join(
									process.cwd(),
									"node_modules",
									packageName
								);

							if (
								!existsSync(
									packagePath
								)
							) {

								console.log(
									`[+] Installing package: ${packageName}`
								);

								try {

									await exec(
										`npm install ${packageName}`
									);

									console.log(
										`[✓] Installed: ${packageName}`
									);

								} catch (err) {

									console.error(
										`[✖] Failed installing ${packageName}`
									);

									throw new Error(
										`Can't install package ${packageName}`
									);
								}
							}
						}
					}
				}

				/* =========================================
				   SAVE SCRIPT CONTENT
				========================================= */

				if (
					!global.temp
				) {
					global.temp = {};
				}

				if (
					!global.temp.contentScripts
				) {
					global.temp.contentScripts = {};
				}

				if (
					!global.temp.contentScripts[
						folderModules
					]
				) {
					global.temp.contentScripts[
						folderModules
					] = {};
				}

				global.temp.contentScripts[
					folderModules
				][file] =
					contentFile;

				/* =========================================
				   REQUIRE COMMAND
				========================================= */

				delete require.cache[
					require.resolve(
						pathCommand
					)
				];

				const command =
					require(pathCommand);

				if (
					!command ||
					typeof command !== "object"
				) {
					throw new Error(
						`${text} must export an object`
					);
				}

				command.location =
					pathCommand;

				/* =========================================
				   CHECK CONFIG
				========================================= */

				const configCommand =
					command.config;

				if (!configCommand) {
					throw new Error(
						`config of ${text} undefined`
					);
				}

				const commandName =
					configCommand.name;

				if (!configCommand.category) {
					throw new Error(
						`category of ${text} undefined`
					);
				}

				if (!commandName) {
					throw new Error(
						`name of ${text} undefined`
					);
				}

				if (
					typeof command.onStart !==
					"function"
				) {
					throw new Error(
						`onStart of ${text} undefined`
					);
				}

				/* =========================================
				   ALIASES
				========================================= */

				const {
					aliases
				} = configCommand;

				const validAliases = [];

				if (aliases) {

					if (
						!Array.isArray(aliases)
					) {
						throw new Error(
							'The value of "config.aliases" must be array!'
						);
					}

					for (
						const alias
						of aliases
					) {

						if (
							aliases.filter(
								item =>
									item === alias
							).length > 1
						) {
							throw new Error(
								`alias "${alias}" duplicate in ${text} "${commandName}"`
							);
						}

						if (
							GoatBot.aliases.has(
								alias
							)
						) {
							throw new Error(
								`alias "${alias}" already exists in another command`
							);
						}

						validAliases.push(
							alias
						);
					}

					for (
						const alias
						of validAliases
					) {
						GoatBot.aliases.set(
							alias,
							commandName
						);
					}
				}

				/* =========================================
				   HOOKS
				========================================= */

				const {
					onFirstChat,
					onChat,
					onLoad,
					onEvent,
					onAnyEvent
				} = command;

				if (
					typeof onLoad ===
					"function"
				) {

					await onLoad({
						api,
						threadModel,
						userModel,
						dashBoardModel,
						globalModel,
						threadsData,
						usersData,
						dashBoardData,
						globalData
					});
				}

				/* =========================================
				   REGISTER EVENTS
				========================================= */

				if (
					typeof onChat ===
					"function"
				) {
					GoatBot.onChat.push(
						commandName
					);
				}

				if (
					typeof onFirstChat ===
					"function"
				) {

					GoatBot.onFirstChat.push({
						commandName,
						threadIDsChattedFirstTime: []
					});
				}

				if (
					typeof onEvent ===
					"function"
				) {
					GoatBot.onEvent.push(
						commandName
					);
				}

				if (
					typeof onAnyEvent ===
					"function"
				) {
					GoatBot.onAnyEvent.push(
						commandName
					);
				}

				/* =========================================
				   SAVE COMMAND
				========================================= */

				GoatBot[
					setMap
				].set(
					commandName.toLowerCase(),
					command
				);

				commandLoadSuccess++;

			} catch (error) {

				commandError.push({
					name: file,
					error
				});
			}
		}

		/* =================================================
		   LOAD RESULT
		================================================= */

		console.log(
			`[✓] Loaded ${commandLoadSuccess}/${Files.length} ${text}s`
		);

		if (
			commandError.length > 0
		) {

			console.error(
				`[✖] Error loading some ${text}s:`
			);

			for (
				const item
				of commandError
			) {

				console.error(
					` ✖ ${item.name}: ${item.error.message}`
				);
			}
		}
	}

	console.log(
		"[✓] Command/Event loader finished."
	);
};
