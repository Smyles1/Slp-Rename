const { SlippiGame } = require('@slippi/slippi-js');
var fs = require('fs');
const { dirname } = require('path');
var path = require('path');

fs.readFile(path.dirname(process.execPath) + path.sep + 'options.txt', 'utf8', (err, data) => { // Opens options.txt
	if (err) {
		console.error(err);
		return;
	}
	let splitData = data.split(/\r?\n/) // Splits the .txt file into each line for reading

	let replayPath = splitData[19].substring(splitData[19].indexOf(":") + 1).trim() // Sets the replay path from the input in options.txt
	if (replayPath.trim() === "") { // If path is empty, set path to the current directory of the program
		replayPath = path.dirname(process.execPath) + path.sep
	} else if (!(replayPath.trim().charAt(replayPath.length - 1) === path.sep)) {
		replayPath = replayPath + path.sep
	}

	const format1v1 = splitData[21].substring(splitData[21].indexOf(":") + 1).trim() // Setting config options/formats
	const formatTeams = splitData[24].substring(splitData[24].indexOf(":") + 1).trim()

	const condenseCharBool = (splitData[28].substring(splitData[28].indexOf(":") + 1).trim().toLocaleLowerCase().substring(0, 4) === 'true')
	const verbose = (splitData[31].substring(splitData[31].indexOf(":") + 1).trim().toLocaleLowerCase().substring(0, 4) === 'true')
	const condenseChar = splitData[29].substring(splitData[29].indexOf(":") + 1).trim().replace("space", " ").substring(0, 1)
	console.log("\x1b[35m", "FFA Format: \r" + format1v1)
	console.log("Teams format: \r" + formatTeams)
	console.log("Character condense: " + condenseCharBool + ", char: '" + condenseChar + "'")
	console.log("Verbose: " + verbose, "\x1b[0m")

	let filesCounter = 0
	fs.readdir(replayPath, function (err, files) {
		console.log("Reading " + replayPath)
		if (err) {
			console.error("Directory could not be found", err);
			process.exit(1);
		}
		files.forEach(function (file, index) {
			slpPath = "" + replayPath + file
			if (path.extname(slpPath) == ".slp" && !path.basename(slpPath).startsWith(".")) {
				const game = new SlippiGame(slpPath);
				const settings = game.getSettings();
				const metadata = game.getMetadata();

				let matchData = {}

				if (settings === null) {
					console.log("\x1b[31m", "File: " + file + " could not be parsed.", "\x1b[0m");
					return;
				}

				let generalFormat = ""

				//General
				if (!(metadata === null)) {
					let nameMinutes = Math.floor((metadata.lastFrame + 120) / 60 / 60)
					let nameSeconds = Math.floor(((metadata.lastFrame + 120) / 60) - (nameMinutes * 60))
					matchData["{{GameMinutes}}"] = nameMinutes
					matchData["{{GameSeconds}}"] = nameSeconds
					matchData["{{Date}}"] = metadata.startAt.split("T")[0]
					matchData["{{Year}}"] = metadata.startAt.split("T")[0].split('-')[0]
					matchData["{{Month}}"] = metadata.startAt.split("T")[0].split('-')[1]
					matchData["{{Day}}"] = metadata.startAt.split("T")[0].split('-')[2]
					matchData["{{Time}}"] = metadata.startAt.split("T")[1]
					matchData["{{TimeHours}}"] = metadata.startAt.split("T")[1].split(":")[0]
					matchData["{{TimeMinutes}}"] = metadata.startAt.split("T")[1].split(":")[1]
					matchData["{{TimeSeconds}}"] = metadata.startAt.split("T")[1].split(":")[2]
					matchData["{{Platform}}"] = metadata.playedOn
				}

				matchData["{{Stage}}"] = stageSelect(settings.stageId, false)
				matchData["{{StageShort}}"] = stageSelect(settings.stageId, true)

				//Non-Teams
				if (settings.isTeams == false) { // 1v1 Check
					matchData["{{P1Char}}"] = charSelect(settings.players[0].characterId, false) //Player 1
					matchData["{{P1CharShort}}"] = charSelect(settings.players[0].characterId, true)
					matchData["{{P1OfflineTag}}"] = settings.players[0].nametag.replace("?", "？")
					matchData["{{P1ConnectCode}}"] = settings.players[0].connectCode.replace("?", "？")
					matchData["{{P1DisplayName}}"] = settings.players[0].displayName.replace("?", "？")
					matchData["{{P1Color}}"] = costumeSelect(settings.players[0].characterId, settings.players[0].characterColor)

					matchData["{{P2Char}}"] = charSelect(settings.players[1].characterId, false) //Player 2
					matchData["{{P2CharShort}}"] = charSelect(settings.players[1].characterId, true)
					matchData["{{P2OfflineTag}}"] = settings.players[1].nametag.replace("?", "？")
					matchData["{{P2ConnectCode}}"] = settings.players[1].connectCode.replace("?", "？")
					matchData["{{P2DisplayName}}"] = settings.players[1].displayName.replace("?", "？")
					matchData["{{P2Color}}"] = costumeSelect(settings.players[1].characterId, settings.players[1].characterColor)

					if (settings.players.length > 2) {
						matchData["{{P2Char}}"] = charSelect(settings.players[2].characterId, false) //Player 3
						matchData["{{P2CharShort}}"] = charSelect(settings.players[2].characterId, true)
						matchData["{{P2OfflineTag}}"] = settings.players[2].nametag.replace("?", "？")
						matchData["{{P2ConnectCode}}"] = settings.players[2].connectCode.replace("?", "？")
						matchData["{{P2DisplayName}}"] = settings.players[2].displayName.replace("?", "？")
						matchData["{{P2Color}}"] = costumeSelect(settings.players[2].characterId, settings.players[2].characterColor)
					}
					if (settings.players.length > 3) {
						matchData["{{P2Char}}"] = charSelect(settings.players[3].characterId, false) //Player 4
						matchData["{{P2CharShort}}"] = charSelect(settings.players[3].characterId, true)
						matchData["{{P2OfflineTag}}"] = settings.players[3].nametag.replace("?", "？")
						matchData["{{P2ConnectCode}}"] = settings.players[3].connectCode.replace("?", "？")
						matchData["{{P2DisplayName}}"] = settings.players[3].displayName.replace("?", "？")
						matchData["{{P2Color}}"] = costumeSelect(settings.players[3].characterId, settings.players[3].characterColor)
					}
					generalFormat = format1v1;
				} else if (settings.isTeams && settings.players.length == 4) {
					let players = settings.players
					players = players.sort((a, b) => (a.teamId > b.teamId) ? 1 : -1)
					if (players[0].teamId == players[2].teamId) return
					matchData["{{T1Color}}"] = ["Red", "Blue", "Green"][players[0].teamId]
					matchData["{{T2Color}}"] = ["Red", "Blue", "Green"][players[2].teamId]


					matchData["{{T1P1Char}}"] = charSelect(players[0].characterId, false) //Player 1
					matchData["{{T1P1CharShort}}"] = charSelect(players[0].characterId, true)
					matchData["{{T1P1OfflineTag}}"] = players[0].nametag.replace("?", "？")
					matchData["{{T1P1ConnectCode}}"] = players[0].connectCode.replace("?", "？")
					matchData["{{T1P1DisplayName}}"] = players[0].displayName.replace("?", "？")
					matchData["{{T1P1Color}}"] = costumeSelect(players[0].characterId, players[0].characterColor)

					matchData["{{T1P2Char}}"] = charSelect(players[1].characterId, false) //Player 2
					matchData["{{T1P2CharShort}}"] = charSelect(players[1].characterId, true)
					matchData["{{T1P2OfflineTag}}"] = players[1].nametag.replace("?", "？")
					matchData["{{T1P2ConnectCode}}"] = players[1].connectCode.replace("?", "？")
					matchData["{{T1P2DisplayName}}"] = players[1].displayName.replace("?", "？")
					matchData["{{T1P2Color}}"] = costumeSelect(players[1].characterId, players[1].characterColor)


					matchData["{{T2P1Char}}"] = charSelect(players[2].characterId, false) //Player 3
					matchData["{{TP1CharShort}}"] = charSelect(players[2].characterId, true)
					matchData["{{T2P1OfflineTag}}"] = players[2].nametag.replace("?", "？")
					matchData["{{T2P1ConnectCode}}"] = players[2].connectCode.replace("?", "？")
					matchData["{{T2P1DisplayName}}"] = players[2].displayName.replace("?", "？")
					matchData["{{T2P1Color}}"] = costumeSelect(players[2].characterId, players[2].characterColor)

					matchData["{{T2P2Char}}"] = charSelect(players[3].characterId, false) //Player 4
					matchData["{{T2P2CharShort}}"] = charSelect(players[3].characterId, true)
					matchData["{{T2P2OfflineTag}}"] = players[3].nametag.replace("?", "？")
					matchData["{{T2P2ConnectCode}}"] = players[3].connectCode.replace("?", "？")
					matchData["{{T2P2DisplayName}}"] = players[3].displayName.replace("?", "？")
					matchData["{{T2P2Color}}"] = costumeSelect(players[3].characterId, players[3].characterColor)

					generalFormat = formatTeams;
				}


				let renamedMatch = ""
				if (condenseCharBool) {
					renamedMatch = removeRepeatChar(path.dirname(slpPath) + path.sep + replaceFormatTags(generalFormat, matchData), condenseChar) + ".slp"
				} else {
					renamedMatch = (path.dirname(slpPath) + path.sep + replaceFormatTags(generalFormat, matchData) + ".slp")
				}
				if (!(slpPath === renamedMatch)) {
					while (fs.existsSync(renamedMatch)) {
						renamedMatch += "(1)"
						console.log("Duplicate name, adding \"(1)\"             ")
					}
					fs.rename(slpPath, renamedMatch, function (err) { if (err) console.log(err) })
					if (verbose) {
						console.log("Renamed: " + slpPath + " to " + renamedMatch + "           ")
					}
				}

			}
			if (verbose && filesCounter % (Math.floor(files.length / 100) + 1) == 0) {
				console.log(Math.round(100 * (filesCounter / files.length) * 100) / 100 + "%")
			}
			//console.log(files.length, filesCounter)
			if (files.length <= filesCounter + 1) {
				console.log("Sorting replays...")
				sortReplays(replayPath, replayPath)
			}

			filesCounter += 1;
		})
	})
});



function replaceFormatTags(format, data) {
	let returnFormat = format.slice()
	Object.keys(data).forEach(key => {
		if (data.hasOwnProperty(key)) returnFormat = newReplaceAll(returnFormat, key, data[key])
		else returnFormat = newReplaceAll(returnFormat, key, "")
	});
	return returnFormat;
}

function newReplaceAll(input, replace, replaceWith) {
	if (!(input.includes(replace))) {
		return input
	} else {
		return newReplaceAll(input.replace(replace, replaceWith), replace, replaceWith)
	}
}

function sortReplays(replayPath, basePath) {
	let slpPath = "";

	fs.readdir(replayPath, function (err, files) {
		if (err) {
			console.error("Could not list the directory.", err);
			process.exit(1);
		}

		let tagsList = {}
		console.log("Getting Tags...")
		fs.mkdirSync(basePath + "No_Tags");
		files.forEach(function (file, index) {
			let file1 = file;
			slpPath = "" + replayPath + file1
			if (path.extname(slpPath) == ".slp") {
				const game = new SlippiGame(slpPath);
				const settings = game.getSettings();
				let players = settings.players
				let noTags = true
				players.forEach(player => {
					if (player.nametag.length > 0) {
						noTags = false
					}
				})
				if (noTags) {
					fs.copyFile(slpPath, basePath + "No_Tags" + path.sep + path.basename(slpPath), function (err) { if (err) console.log(err) })
				}
				let tags = []
				settings.players.forEach(player => {
					if (player.nametag.length > 0) {
						tags.push(player.nametag.replace("?", '？'))
					}
				})
				tags.forEach(tag => {
					if (tagsList.hasOwnProperty(tag)) {
						tagsList[tag].push(slpPath)
					} else {
						tagsList[tag] = [slpPath]
					}
				})
			}
		})
		console.log("Sorting Files...")
		Object.keys(tagsList).forEach(key => {
			try {
				if (!fs.existsSync(basePath + key)) {
					fs.mkdirSync(basePath + key);
					console.log("Created directory: \"" + key + "\" with " + tagsList[key].length + " files. " + path.basename(tagsList[key][0]))
				}
			} catch (err) {
				console.error(err);
			}
		})
		console.log("Adding files to directories...")
		Object.keys(tagsList).forEach(key => {
			try {
				tagsList[key].forEach(slpPath => {
					fs.copyFile(slpPath, basePath + key + "/" + path.basename(slpPath), (err) => {
						if (err) console.error(err);
					})
				})
			} catch (err) {
				console.error(err);
			}
		})
	})
}

function stageSelect(stage, short) { // Turns stage IDs into stage strings based on Fizzi's SLP specs
	switch (stage) {
		case 2:
			if (short) return "FoD";
			else return "Fountain of Dreams";
		case 3:
			if (short) return "PS";
			else return "Pokemon Stadium";
		case 4:
			return "Peach's Castle";
		case 5:
			return 'Kongo Jungle';
		case 6:
			return 'Brinstar';
		case 7:
			return 'Corneria';
		case 8:
			if (short) return "YS";
			else return "Yoshis Story";
		case 9:
			return 'Onett';
		case 10:
			return 'Mute City';
		case 11:
			return 'Rainbow Cruise';
		case 12:
			return 'Jungle Japes';
		case 13:
			return 'Great Bay';
		case 14:
			return 'Hyrule Temple';
		case 15:
			return 'Brinstar Depths';
		case 16:
			return "Yoshi's Island";
		case 17:
			return 'Green Greens';
		case 18:
			return 'Fourside';
		case 19:
			return 'Mushroom Kingdom I';
		case 20:
			return 'Mushroom Kingdom II';
		case 21:
			return 'Akaneia';
		case 22:
			return 'Venom';
		case 23:
			return 'Poke Floats';
		case 24:
			return 'Big Blue';
		case 25:
			return 'Icicle Mountain';
		case 26:
			return 'Icetop';
		case 27:
			return 'Flat zone';
		case 28:
			if (short) return "DL"
			else return "Dreamland"
		case 29:
			return "Yoshi's Island";
		case 30:
			return 'Kongo Jungle';
		case 31:
			if (short) return "BF";
			else return "Battlefield";
		case 32:
			if (short) return "FD";
			else return "Final Destination";
	}
}

function charSelect(char, short) { // Turns character IDs into character strings based on Fizzi's SLP specs
	switch (char) {
		case 0:
			if (short) return "Falcon";
			else return "Captain Falcon";
		case 1:
			if (short) return "DK";
			else return 'Donkey Kong';
		case 2:
			return 'Fox';
		case 3:
			if (short) return "GnW";
			else return 'Mr. Game & Watch';
		case 4:
			return 'Kirby';
		case 5:
			return 'Bowser';
		case 6:
			return 'Link';
		case 7:
			return 'Luigi';
		case 8:
			return 'Mario';
		case 9:
			return 'Marth';
		case 10:
			return 'Mewtwo';
		case 11:
			return 'Ness';
		case 12:
			return 'Peach';
		case 13:
			return 'Pikachu';
		case 14:
			if (short) return "Icies";
			else return 'Ice Climbers';
		case 15:
			if (short) return "Puff";
			else return 'Jigglypuff';
		case 16:
			return 'Samus';
		case 17:
			return 'Yoshi';
		case 18:
			return 'Zelda';
		case 19:
			return 'Sheik';
		case 20:
			return 'Falco';
		case 21:
			if (short) return "YLink";
			else return 'Young Link';
		case 22:
			if (short) return "Doc";
			else return 'Dr. Mario';
		case 23:
			return 'Roy';
		case 24:
			return 'Pichu';
		case 25:
			if (short) return "Ganon";
			else return 'Ganondorf';
	}
}

function costumeSelect(char, costume) { // Turns character IDs into character strings based on Fizzi's SLP specs
	switch (char) {
		case 0:
			return ["Default", "Black", "Red", "White", "Green", "Blue"][costume]
		case 1:
			return ["Default", "Black", "Red", "Blue", "Green"][costume]
		case 2:
			return ["Default", "Red", "Blue", "Green"][costume]
		case 3:
			return ["Default", "Red", "Blue", "Green"][costume]
		case 4:
			return ["Default", "Yellow", "Blue", "Red", "Green", "White"][costume]
		case 5:
			return ["Default", "Red", "Blue", "Black"][costume]
		case 6:
			return ["Default", "Red", "Blue", "Black", "White"][costume]
		case 7:
			return ["Default", "White", "Blue", "Red"][costume]
		case 8:
			return ["Default", "Yellow", "Black", "Blue", "Green"][costume]
		case 9:
			return ["Default", "Red", "Green", "Black", "White"][costume]
		case 10:
			return ["Default", "Red", "Blue", "Green"][costume]
		case 11:
			return ["Default", "Yellow", "Blue", "Green"][costume]
		case 12:
			return ["Default", "Daisy", "White", "Blue", "Green"][costume]
		case 13:
			return ["Default", "Red", "Party Hat", "Cowboy Hat"][costume]
		case 14:
			return ["Default", "Green", "Orange", "Red"][costume]
		case 15:
			return ["Default", "Red", "Blue", "Headband", "Crown"][costume]
		case 16:
			return ["Default", "Pink", "Black", "Green", "Purple"][costume]
		case 17:
			return ["Default", "Red", "Blue", "Yellow", "Pink", "Cyan"][costume]
		case 18:
			return ["Default", "Red", "Blue", "Green", "White"][costume]
		case 19:
			return ["Default", "Red", "Blue", "Green", "White"][costume]
		case 20:
			return ["Default", "Red", "Blue", "Green"][costume]
		case 21:
			return ["Default", "Red", "Blue", "White", "Black"][costume]
		case 22:
			return ["Default", "Red", "Blue", "Green", "Black"][costume]
		case 23:
			return ["Default", "Red", "Blue", "Green", "Yellow"][costume]
		case 24:
			return ["Default", "Red", "Blue", "Green"][costume]
		case 25:
			return ["Default", "Red", "Blue", "Green", "Purple"][costume]
	}
}

function removeRepeatChar(input, char) {
	let outString = "";
	let prevChar = ""
	for (var i = 0; i < input.length; i++) {
		if (input[i] != char || prevChar != char) {
			outString = outString + input[i];
		}
		prevChar = input[i];
	}
	return outString
}