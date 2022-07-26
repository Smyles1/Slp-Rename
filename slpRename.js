const { SlippiGame } = require('@slippi/slippi-js');
const fs = require('fs');
const path = require('path');

fs.readFile(`${path.dirname(process.execPath) + path.sep}options.txt`, 'utf8', (err, data) => { // Opens options.txt
  if (err) {
    console.error(err);
    return;
  }
  const splitData = data.split(/\r?\n/); // Splits the .txt file into each line for reading
  let replayPath = splitData[19].substring(splitData[19].indexOf(':') + 1).trim(); // Sets the replay path from the input in options.txt
  if (replayPath.trim() === '') { // If path is empty, set path to the current directory of the program
    replayPath = path.dirname(process.execPath) + path.sep;
  } else if (!(replayPath.trim().charAt(replayPath.length - 1) === path.sep)) {
    replayPath += path.sep;
  }

  // Setting config options/formats
  const format1v1 = splitData[21].substring(splitData[21].indexOf(':') + 1).trim();
  const formatTeams = splitData[24].substring(splitData[24].indexOf(':') + 1).trim();

  const condenseCharBool = (splitData[28].substring(splitData[28].indexOf(':') + 1).trim().toLocaleLowerCase().substring(0, 4) === 'true');
  const verbose = (splitData[31].substring(splitData[31].indexOf(':') + 1).trim().toLocaleLowerCase().substring(0, 4) === 'true');
  const condenseChar = splitData[29].substring(splitData[29].indexOf(':') + 1).trim().replace('space', ' ').substring(0, 1);

  const sortBool = (splitData[33].substring(splitData[33].indexOf(':') + 1).trim().toLocaleLowerCase().substring(0, 4) === 'true');

  let idData = {};

  // Load the json ID data
  fs.readFile(path.join(__dirname, path.sep, 'slpids.json'), 'utf8', (jsonErr, jsonData) => {
    if (jsonErr) {
      console.log(`Error reading file from disk: ${jsonErr}`);
    } else {
    // parse JSON string to JSON object
      idData = JSON.parse(jsonData);

      console.log('\x1b[35m', `FFA Format: \r${format1v1}`);
      console.log(`Teams format: \r${formatTeams}`);
      console.log(`Character condense: ${condenseCharBool}, char: '${condenseChar}'`);
      console.log(`Verbose: ${verbose}`, '\x1b[0m');

      let filesCounter = 0;
      fs.readdir(replayPath, (err1, files) => {
        console.log(`Reading ${replayPath}`);
        if (err) {
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
              matchData['{{Date}}'] = metadata.startAt.split('T')[0];
              matchData['{{Year}}'] = metadata.startAt.split('T')[0].split('-')[0];
              matchData['{{Month}}'] = metadata.startAt.split('T')[0].split('-')[1];
              matchData['{{Day}}'] = metadata.startAt.split('T')[0].split('-')[2];
              matchData['{{Time}}'] = metadata.startAt.split('T')[1];
              matchData['{{TimeHours}}'] = metadata.startAt.split('T')[1].split(':')[0];
              matchData['{{TimeMinutes}}'] = metadata.startAt.split('T')[1].split(':')[1];
              matchData['{{TimeSeconds}}'] = metadata.startAt.split('T')[1].split(':')[2];
              matchData['{{Platform}}'] = metadata.playedOn;
            }
            matchData['{{Stage}}'] = stageSelect(idData, settings.stageId, false);
            matchData['{{StageShort}}'] = stageSelect(idData, settings.stageId, true);
            // Non-Teams
            if ((!settings.isTeams) || (settings.isTeams && settings.players.length === 2)) {
              matchData['{{P1Char}}'] = charSelect(idData, settings.players[0].characterId, false); // Player 1
              matchData['{{P1CharShort}}'] = charSelect(idData, settings.players[0].characterId, true);
              matchData['{{P1OfflineTag}}'] = settings.players[0].nametag.replace('?', '？');
              matchData['{{P1ConnectCode}}'] = settings.players[0].connectCode.replace('?', '？');
              matchData['{{P1DisplayName}}'] = settings.players[0].displayName.replace('?', '？');
              matchData['{{P1Color}}'] = costumeSelect(idData, settings.players[0].characterId, settings.players[0].characterColor);

              matchData['{{P2Char}}'] = charSelect(idData, settings.players[1].characterId, false); // Player 2
              matchData['{{P2CharShort}}'] = charSelect(idData, settings.players[1].characterId, true);
              matchData['{{P2OfflineTag}}'] = settings.players[1].nametag.replace('?', '？');
              matchData['{{P2ConnectCode}}'] = settings.players[1].connectCode.replace('?', '？');
              matchData['{{P2DisplayName}}'] = settings.players[1].displayName.replace('?', '？');
              matchData['{{P2Color}}'] = costumeSelect(idData, settings.players[1].characterId, settings.players[1].characterColor);

              if (settings.players.length > 2) {
                matchData['{{P3Char}}'] = charSelect(idData, settings.players[2].characterId, false); // Player 3
                matchData['{{P3CharShort}}'] = charSelect(idData, settings.players[2].characterId, true);
                matchData['{{P3OfflineTag}}'] = settings.players[2].nametag.replace('?', '？');
                matchData['{{P3ConnectCode}}'] = settings.players[2].connectCode.replace('?', '？');
                matchData['{{P3DisplayName}}'] = settings.players[2].displayName.replace('?', '？');
                matchData['{{P3Color}}'] = costumeSelect(idData, settings.players[2].characterId, settings.players[2].characterColor);
              }
              if (settings.players.length > 3) {
                matchData['{{P3Char}}'] = charSelect(idData, settings.players[3].characterId, false); // Player 4
                matchData['{{P3CharShort}}'] = charSelect(idData, settings.players[3].characterId, true);
                matchData['{{P3OfflineTag}}'] = settings.players[3].nametag.replace('?', '？');
                matchData['{{P3ConnectCode}}'] = settings.players[3].connectCode.replace('?', '？');
                matchData['{{P3DisplayName}}'] = settings.players[3].displayName.replace('?', '？');
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
              matchData['{{T1P1OfflineTag}}'] = players[0].nametag.replace('?', '？');
              matchData['{{T1P1ConnectCode}}'] = players[0].connectCode.replace('?', '？');
              matchData['{{T1P1DisplayName}}'] = players[0].displayName.replace('?', '？');
              matchData['{{T1P1Color}}'] = costumeSelect(idData, players[0].characterId, players[0].characterColor);

              matchData['{{T2P1Char}}'] = charSelect(idData, players[2].characterId, false); // Player 3
              matchData['{{TP1CharShort}}'] = charSelect(idData, players[2].characterId, true);
              matchData['{{T2P1OfflineTag}}'] = players[2].nametag.replace('?', '？');
              matchData['{{T2P1ConnectCode}}'] = players[2].connectCode.replace('?', '？');
              matchData['{{T2P1DisplayName}}'] = players[2].displayName.replace('?', '？');
              matchData['{{T2P1Color}}'] = costumeSelect(idData, players[2].characterId, players[2].characterColor);

              matchData['{{T1P2Char}}'] = charSelect(idData, players[1].characterId, false); // Player 2
              matchData['{{T1P2CharShort}}'] = charSelect(idData, players[1].characterId, true);
              matchData['{{T1P2OfflineTag}}'] = players[1].nametag.replace('?', '？');
              matchData['{{T1P2ConnectCode}}'] = players[1].connectCode.replace('?', '？');
              matchData['{{T1P2DisplayName}}'] = players[1].displayName.replace('?', '？');
              matchData['{{T1P2Color}}'] = costumeSelect(idData, players[1].characterId, players[1].characterColor);

              matchData['{{T2P2Char}}'] = charSelect(idData, players[3].characterId, false); // Player 4
              matchData['{{T2P2CharShort}}'] = charSelect(idData, players[3].characterId, true);
              matchData['{{T2P2OfflineTag}}'] = players[3].nametag.replace('?', '？');
              matchData['{{T2P2ConnectCode}}'] = players[3].connectCode.replace('?', '？');
              matchData['{{T2P2DisplayName}}'] = players[3].displayName.replace('?', '？');
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
                let total = 0.0;
                JSON.stringify(game).match(/[-+]?\d*(\.(?=\d))?\d+/g).forEach((val) => {
                  total += parseFloat(val.replace('.', ''));
                });
                const key = parseInt(total.toString().replace('.', '').substring(1, 11), 10);
                renamedMatch = `${path.dirname(renamedMatch) + path.sep + path.basename(renamedMatch).substring(0, renamedMatch.indexOf('.') - 1)} ${key.toString(16)}.slp`;
                // console.log(`Duplicate name, adding a unique identifier: ${key.toString(16)}`);
              }
              if (path.basename(renamedMatch).length < 10) {
                console.log('FOUND ONE ---------------');
                console.log(slpPath, renamedMatch);
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
            console.log(`\x1b[33m 1/3 ${Math.round(100 * (filesCounter / files.length) * 100) / 100}%\x1b[0m`);
          }
          // Sorting Replays
          if (files.length <= filesCounter + 1) {
            if (sortBool) {
              console.log('Sorting replays...');
              sortReplays(replayPath, replayPath);
            }
          }

          filesCounter += 1;
        });
      });
    }
  });
});

// Replaces {{Tags}} with the data they represent in the format provided.
function replaceFormatTags(format, data) {
  let returnFormat = format.slice();
  Object.keys(data).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      returnFormat = newReplaceAll(returnFormat, key, data[key]);
    } else returnFormat = newReplaceAll(returnFormat, key, '');
  });
  return returnFormat;
}

// Made my own replace all because the normal one wasn't working right
// (finally got to use recursion though pog)
function newReplaceAll(input, replace, replaceWith) {
  if (!(input.includes(replace))) {
    return input;
  }
  return newReplaceAll(input.replace(replace, replaceWith), replace, replaceWith);
}

// Sorting replays into directories with tags (reused my summit 13 sorting code)
function sortReplays(replayPath, basePath) {
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
    Object.keys(tagsList).forEach((key) => {
      if (sortIndex % (Math.floor(tagsList.length / 100) + 1) === 0) {
        console.log(`\x1b[33m2/3 ${Math.round(100 * (sortIndex / tagsList.length) * 100) / 100}%\x1b[0m`);
      }
      try {
        if (!fs.existsSync(basePath + key)) {
          fs.mkdirSync(basePath + key);
          console.log(`Created directory: "${key}" with ${tagsList[key].length} files. ${path.basename(tagsList[key][0])}`);
        }
      } catch (mkErr) {
        console.error(mkErr);
      }
      sortIndex += 1;
    });
    console.log('Adding files to directories...');
    let addIndex = 0;
    Object.keys(tagsList).forEach((key) => {
      if (addIndex % (Math.floor(tagsList.length / 100) + 1) === 0) {
        console.log(`\x1b[33m3/3 ${Math.round(100 * (addIndex / tagsList.length) * 100) / 100}%\x1b[0m`);
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

// Turns stage IDs into stage strings based on Fizzi's SLP specs
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

// Turns character IDs into character strings based on Fizzi's SLP specs
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

// Turns character IDs into character strings based on Fizzi's SLP specs
function costumeSelect(data, char, costumeNum) {
  if (Object.prototype.hasOwnProperty.call(data.costume, char)) {
    return data.costume[char][costumeNum];
  }
  return '';
}
