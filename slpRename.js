const { SlippiGame } = require('@slippi/slippi-js');
const fs = require('fs');
const path = require('path');
const hash = require('object-hash');

fs.readFile(`${path.dirname(process.execPath) + path.sep}options.txt`, 'utf8', (err, data) => { // Opens options.txt
  if (err) {
    console.error(err);
    return;
  }
  const splitData = data.split(/\r?\n/); // Splits the .txt file into each line for reading

  const userSettings = {};
  splitData.forEach((line) => {
    if (line.includes(':') && !(line.startsWith('#'))) {
      const front = line.split(':')[0];
      const back = line.split(':')[1];
      userSettings[front] = back.trim();
    }
  });

  let replayPath = userSettings['Replay Path (blank for current folder)']; // Sets the replay path from the input in options.txt
  if (replayPath === '') { // If path is empty, set path to the current directory of the program
    replayPath = path.dirname(process.execPath) + path.sep;
  } else {
    replayPath = path.dirname(replayPath) + path.sep + path.basename(replayPath) + path.sep;
  }

  // Setting config options/formats

  const format1v1 = userSettings['Non-Teams Replay Format'].replace('.slp', '');
  const formatTeams = userSettings['Teams Replay Format'].replace('.slp', '');
  const condenseCharBool = (userSettings['Replace Doubles (true/false)'].toLocaleLowerCase().substring(0, 4) === 'true');
  const verbose = (userSettings['Verbose output (true/false)'].toLocaleLowerCase().substring(0, 4) === 'true');
  const condenseChar = userSettings['Character to replace ("space" for space character)'].replace('space', ' ').substring(0, 1);
  const sortBool = (userSettings['Sort into tag folders (true/false)'].toLocaleLowerCase().substring(0, 4) === 'true');

  let idData = {};

  // Load the json ID data
  fs.readFile(path.join(__dirname, path.sep, 'slpids.json'), 'utf8', (jsonErr, jsonData) => {
    if (jsonErr) {
      console.error(`Error reading file from disk: ${jsonErr}`);
    } else {
      idData = JSON.parse(jsonData);

      console.log('\x1b[35m', `FFA Format: \r${format1v1}`);
      console.log(`Teams format: \r${formatTeams}`);
      console.log(`Character condense: ${condenseCharBool}, char: '${condenseChar}'`);
      console.log(`Verbose: ${verbose}`, '\x1b[0m');

      let filesCounter = 0;
      fs.readdir(replayPath, (err1, files) => {
        console.log(`Reading ${replayPath}`);
        if (err1) {
          console.error('Directory could not be found', err1);
          process.exit(1);
        }
        console.log('Renaming...');
        files.forEach((file) => {
          const slpPath = `${replayPath}${file}`;
          if (path.extname(slpPath) === '.slp' && !path.basename(slpPath).startsWith('.')) {
            const game = new SlippiGame(slpPath);
            const settings = game.getSettings();
            const metadata = game.getMetadata();
            const matchData = {};

            if (settings === null) {
              console.log('\x1b[31m', `File: ${file} could not be parsed.`, '\x1b[0m');
              return;
            }

            let generalFormat = path.basename(slpPath);

            // General
            if (!(metadata === null)) {
              const nameMinutes = Math.floor((metadata.lastFrame + 120) / 60 / 60);
              const nameSeconds = Math.floor(((metadata.lastFrame + 120) / 60) - nameMinutes * 60);
              matchData['{{GameMinutes}}'] = nameMinutes;
              matchData['{{GameSeconds}}'] = nameSeconds;
              matchData['{{ConsoleNick}}'] = metadata.consoleNick;
              const date1 = new Date(metadata.startAt);
              matchData['{{Date}}'] = metadata.startAt.split('T')[0];
              matchData['{{Year}}'] = date1.getFullYear();
              matchData['{{Month}}'] = date1[Symbol.toPrimitive]('string').split(' ')[1];
              matchData['{{MonthNum}}'] = parseInt(date1.getMonth(), 10) + 1;
              matchData['{{Day}}'] = date1.getDate();
              matchData['{{DayName}}'] = date1[Symbol.toPrimitive]('string').split(' ')[0];
              matchData['{{Time}}'] = newReplaceAll(metadata.startAt.split('T')[1], ':', '꞉').substring(0, 5);
              matchData['{{TimeHours}}'] = date1.getHours();
              matchData['{{TimeMinutes}}'] = date1.getMinutes();
              matchData['{{TimeSeconds}}'] = date1.getSeconds();
              matchData['{{Platform}}'] = metadata.playedOn;
            }
            matchData['{{Stage}}'] = stageSelect(idData, settings.stageId, false);
            matchData['{{StageShort}}'] = stageSelect(idData, settings.stageId, true);

            // Non-Teams
            if ((!settings.isTeams) || (settings.isTeams && settings.players.length === 2)) {
              matchData['{{P1Char}}'] = charSelect(idData, settings.players[0].characterId, false); // Player 1
              matchData['{{P1CharShort}}'] = charSelect(idData, settings.players[0].characterId, true);
              matchData['{{P1OfflineTag}}'] = newReplaceAll(settings.players[0].nametag, '?', '？');
              matchData['{{P1ConnectCode}}'] = newReplaceAll(settings.players[0].connectCode, '?', '？');
              matchData['{{P1DisplayName}}'] = newReplaceAll(settings.players[0].displayName, '?', '？');
              matchData['{{P1Color}}'] = costumeSelect(idData, settings.players[0].characterId, settings.players[0].characterColor);

              matchData['{{P2Char}}'] = charSelect(idData, settings.players[1].characterId, false); // Player 2
              matchData['{{P2CharShort}}'] = charSelect(idData, settings.players[1].characterId, true);
              matchData['{{P2OfflineTag}}'] = newReplaceAll(settings.players[1].nametag, '?', '？');
              matchData['{{P2ConnectCode}}'] = newReplaceAll(settings.players[1].connectCode, '?', '？');
              matchData['{{P2DisplayName}}'] = newReplaceAll(settings.players[1].displayName, '?', '？');
              matchData['{{P2Color}}'] = costumeSelect(idData, settings.players[1].characterId, settings.players[1].characterColor);

              if (settings.players.length > 2) {
                matchData['{{P3Char}}'] = charSelect(idData, settings.players[2].characterId, false); // Player 3
                matchData['{{P3CharShort}}'] = charSelect(idData, settings.players[2].characterId, true);
                matchData['{{P3OfflineTag}}'] = newReplaceAll(settings.players[2].nametag, '?', '？');
                matchData['{{P3ConnectCode}}'] = newReplaceAll(settings.players[2].connectCode, '?', '？');
                matchData['{{P3DisplayName}}'] = newReplaceAll(settings.players[2].displayName, '?', '？');
                matchData['{{P3Color}}'] = costumeSelect(idData, settings.players[2].characterId, settings.players[2].characterColor);
              }
              if (settings.players.length > 3) {
                matchData['{{P3Char}}'] = charSelect(idData, settings.players[3].characterId, false); // Player 4
                matchData['{{P3CharShort}}'] = charSelect(idData, settings.players[3].characterId, true);
                matchData['{{P3OfflineTag}}'] = newReplaceAll(settings.players[3].nametag, '?', '？');
                matchData['{{P3ConnectCode}}'] = newReplaceAll(settings.players[3].connectCode, '?', '？');
                matchData['{{P3DisplayName}}'] = newReplaceAll(settings.players[3].displayName, '?', '？');
                matchData['{{P3Color}}'] = costumeSelect(idData, settings.players[3].characterId, settings.players[3].characterColor);
              }
              generalFormat = format1v1;
            } else if (settings.isTeams && settings.players.length === 4) {
              let { players } = settings;
              players = players.sort((a, b) => ((a.teamId > b.teamId) ? 1 : -1));
              if (players[0].teamId === players[2].teamId) return;
              matchData['{{T1Color}}'] = ['Red', 'Blue', 'Green'][players[0].teamId];
              matchData['{{T2Color}}'] = ['Red', 'Blue', 'Green'][players[2].teamId];

              matchData['{{T1P1Char}}'] = charSelect(idData, players[0].characterId, false); // Player 1
              matchData['{{T1P1CharShort}}'] = charSelect(idData, players[0].characterId, true);
              matchData['{{T1P1OfflineTag}}'] = newReplaceAll(players[0].nametag, '?', '？');
              matchData['{{T1P1ConnectCode}}'] = newReplaceAll(players[0].connectCode, '?', '？');
              matchData['{{T1P1DisplayName}}'] = newReplaceAll(players[0].displayName, '?', '？');
              matchData['{{T1P1Color}}'] = costumeSelect(idData, players[0].characterId, players[0].characterColor);

              matchData['{{T2P1Char}}'] = charSelect(idData, players[2].characterId, false); // Player 3
              matchData['{{TP1CharShort}}'] = charSelect(idData, players[2].characterId, true);
              matchData['{{T2P1OfflineTag}}'] = newReplaceAll(players[2].nametag, '?', '？');
              matchData['{{T2P1ConnectCode}}'] = newReplaceAll(players[2].connectCode, '?', '？');
              matchData['{{T2P1DisplayName}}'] = newReplaceAll(players[2].displayName, '?', '？');
              matchData['{{T2P1Color}}'] = costumeSelect(idData, players[2].characterId, players[2].characterColor);

              matchData['{{T1P2Char}}'] = charSelect(idData, players[1].characterId, false); // Player 2
              matchData['{{T1P2CharShort}}'] = charSelect(idData, players[1].characterId, true);
              matchData['{{T1P2OfflineTag}}'] = newReplaceAll(players[1].nametag, '?', '？');
              matchData['{{T1P2ConnectCode}}'] = newReplaceAll(players[1].connectCode, '?', '？');
              matchData['{{T1P2DisplayName}}'] = newReplaceAll(players[1].displayName, '?', '？');
              matchData['{{T1P2Color}}'] = costumeSelect(idData, players[1].characterId, players[1].characterColor);

              matchData['{{T2P2Char}}'] = charSelect(idData, players[3].characterId, false); // Player 4
              matchData['{{T2P2CharShort}}'] = charSelect(idData, players[3].characterId, true);
              matchData['{{T2P2OfflineTag}}'] = newReplaceAll(players[3].nametag, '?', '？');
              matchData['{{T2P2ConnectCode}}'] = newReplaceAll(players[3].connectCode, '?', '？');
              matchData['{{T2P2DisplayName}}'] = newReplaceAll(players[3].displayName, '?', '？');
              matchData['{{T2P2Color}}'] = costumeSelect(idData, players[3].characterId, players[3].characterColor);

              generalFormat = formatTeams;
            }

            let renamedMatch = '';
            if (condenseCharBool) {
              renamedMatch = `${path.dirname(slpPath) + path.sep + removeRepeatChar(replaceFormatTags(generalFormat, matchData), condenseChar).trim()}.slp`;
            } else {
              renamedMatch = `${path.dirname(slpPath) + path.sep + replaceFormatTags(generalFormat, matchData).trim()}.slp`;
            }
            if (!(slpPath === renamedMatch)) {
              // If a file with the same name already exists, add a unique identifier
              // (get a bunch of numbers from the game object and turn it into an identifier)
              while (fs.existsSync(renamedMatch)) {
                const key = hash(game);
                renamedMatch = `${path.dirname(renamedMatch) + path.sep + path.basename(renamedMatch).replace('.slp', '')} ${key.substring(0, 15)}.slp`;
                if (verbose) console.log(`Duplicate name, adding a unique identifier: ${key.substring(0, 15)}`);
              }
              fs.rename(slpPath, renamedMatch, (rnErr) => {
                if (rnErr) console.log(rnErr);
              });
              if (verbose) {
                console.log(`Renamed: ${slpPath} to ${renamedMatch}`);
              }
            }
          }
          if (filesCounter % (Math.floor(files.length / 100) + 1) === 0) {
            console.log(`\x1b[33m1/3 ${Math.round(100 * (filesCounter / files.length) * 100) / 100}% ${` (${filesCounter})/(${files.length})`}\x1b[0m`);
          }
          // Sorting Replays (trigger on last rename)
          if (files.length <= filesCounter + 1) {
            if (sortBool) {
              console.log('Sorting replays...');
              sortReplays(replayPath, replayPath, verbose);
            }
          }

          filesCounter += 1;
        });
      });
    }
  });
});

/**
 * Replaces { { Tags } } with the data they represent in the format provided.
 * @param {string} format - format including tags.
 * @param {Object} data - object with every tag and it's corresponding data for the current replay.
 * @returns {string} a completed string with all tags replaced with their data.
 */
function replaceFormatTags(format, data) {
  let returnFormat = format.slice();
  Object.keys(data).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (typeof (data[key]) === 'undefined') {
        returnFormat = newReplaceAll(returnFormat, key, '');
      } else {
        returnFormat = newReplaceAll(returnFormat, key, data[key]);
      }
    } else {
      returnFormat = newReplaceAll(returnFormat, key, '');
    }
  });
  return removeExtraTags(returnFormat);
}

/**
 * Removes extra { { Tags } } from a string after replacing ones with data.
 * @param {string} input - a string with unwanted tags still in it.
 * @returns {string} a string with all tags removed.
 */
function removeExtraTags(input) {
  if (input.includes('{{') && input.includes('}}')) {
    return removeExtraTags(input.substring(0, input.indexOf('{{')) + input.substring(input.indexOf('}}') + 2));
  }
  return input;
}

/**
 * Replaces all instances of a string with another string in a string.
 * @param {string} input - the full string being acted on.
 * @param {string} replace - a string to be replaced.
 * @param {string} replaceWith - replacement string.
 * @returns {string} a string with all instances of replace replaced
 */
function newReplaceAll(input, replace, replaceWith) {
  if (!(input.includes(replace))) {
    return input;
  }
  return newReplaceAll(input.replace(replace, replaceWith), replace, replaceWith);
}

// Sorting replays into directories with tags (reused my summit 13 sorting code)
function sortReplays(replayPath, basePath, verbose) {
  let slpPath = '';

  fs.readdir(replayPath, (err, files) => {
    if (err) {
      console.error('Could not list the directory.', err);
      process.exit(1);
    }

    const tagsList = {};
    console.log('Getting Tags...');

    try {
      fs.mkdirSync(`${basePath}No_Tags`);
    } catch {
      console.error('Please delete /No_Tags/ and try again.');
    }

    files.forEach((file) => {
      const file1 = file;
      slpPath = `${replayPath}${file1}`;
      if (path.extname(slpPath) === '.slp') {
        const game = new SlippiGame(slpPath);
        const settings = game.getSettings();
        const { players } = settings;
        let noTags = true;
        players.forEach((player) => {
          if (player.nametag.length > 0) {
            noTags = false;
          }
        });
        if (noTags) {
          fs.copyFile(slpPath, `${basePath}No_Tags${path.sep}${path.basename(slpPath)}`, (cfErr) => {
            if (cfErr) console.error(cfErr);
          });
        }
        const tags = [];
        settings.players.forEach((player) => {
          if (player.nametag.length > 0) {
            tags.push(player.nametag.replace('?', '？'));
          }
        });
        tags.forEach((tag) => {
          if (Object.prototype.hasOwnProperty.call(tagsList, tag)) {
            tagsList[tag].push(slpPath);
          } else {
            tagsList[tag] = [slpPath];
          }
        });
      }
    });
    console.log('Sorting Files...');
    let sortIndex = 0;
    Object.keys(tagsList).forEach((key, index, array) => {
      if (sortIndex % (Math.floor(index / 100) + 1) === 0) {
        console.log(`\x1b[33m2/3 ${Math.round(100 * (sortIndex / array.length) * 100) / 100}% ${` (${index})/(${array.length})`}\x1b[0m`);
      }
      try {
        if (!fs.existsSync(basePath + key)) {
          fs.mkdirSync(basePath + key);
          if (verbose) console.log(`Created directory: "${key}" with ${tagsList[key].length} files. ${path.basename(tagsList[key][0])}`);
        }
      } catch (mkErr) {
        console.error(mkErr);
      }
      sortIndex += 1;
    });
    console.log('Adding files to directories...');
    let addIndex = 0;
    Object.keys(tagsList).forEach((key, index, array) => {
      if (addIndex % (Math.floor(index / 100) + 1) === 0) {
        console.log(`\x1b[33m3/3 ${Math.round(100 * (addIndex / array.length) * 100) / 100}% ${` (${index})/(${array.length})`}\x1b[0m`);
      }
      tagsList[key].forEach((tagsPath) => {
        fs.copyFile(tagsPath, `${basePath + key}/${path.basename(tagsPath)}`, (cfErr) => {
          if (cfErr) console.error(cfErr);
        });
      });
      addIndex += 1;
    });
  });
}

function removeRepeatChar(input, char) {
  let outString = '';
  let prevChar = '';
  for (let i = 0; i < input.length; i += 1) {
    if (input[i] !== char || prevChar !== char) {
      outString += input[i];
    }
    prevChar = input[i];
  }
  return outString;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Turns stage IDs into stage strings based on Fizzi's SLP spec.
 * @param {Object} data - JSON data of IDs and their corresponding stage in Fizzi's spec.
 * @param {number} stage - stage ID.
 * @param {boolean} short - whether to return a short version of the stage name.
 * @returns {string} a stage name based on the given ID.
 */
function stageSelect(data, stage, short) {
  if (Object.prototype.hasOwnProperty.call(data.stage, stage)) {
    if (short) {
      if (isObject(data.stage[stage])) {
        return data.stage[stage].short;
      }
      return data.stage[stage];
    }
    if (isObject(data.stage[stage])) {
      return data.stage[stage].long;
    }
    return data.stage[stage];
  }
  return '';
}

/**
 * Turns character IDs into character strings based on Fizzi's SLP spec.
 * @param {Object} data - JSON data of IDs and their corresponding character in Fizzi's spec.
 * @param {number} char - character id.
 * @param {boolean} short whether to return a short version of the character name.
 * @returns {string} a character name based on the given ID.
 */
function charSelect(data, char, short) {
  if (short) {
    if (isObject(data.character[char])) {
      return data.character[char].short;
    }
    return data.character[char];
  }
  if (isObject(data.character[char])) {
    return data.character[char].long;
  }
  return data.character[char];
}

/**
 * Turns character IDs into costume strings based on Fizzi's SLP spec.
 * @param {Object} data - JSON data of IDs and their corresponding costume in Fizzi's spec.
 * @param {number} char - character ID.
 * @param {boolean} costumeNum - costume ID.
 * @returns {string} - a character name based on the given ID.
 */
function costumeSelect(data, char, costumeNum) {
  if (Object.prototype.hasOwnProperty.call(data.costume, char)) {
    return data.costume[char][costumeNum];
  }
  return '';
}
