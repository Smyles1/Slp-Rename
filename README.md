# Slp-Rename

**Description:**

A tool for sorting and renaming Slippi replay files, intended for tournament organizers to make their replays public.

**Features:**

- Better Renaming. Supports teams replays, free for all replays, and the classic 1v1 with both online and offline tags
- Tag Sorting (currently only offline tags). Sorts replays into folders based on the tags of each player, making it easier to find your games.
- Character Condensing. No more Blue--Falcon-vs--Default--Marth.slp, condense characters when a tag is not being used.
- More tags. {{Platform}}, {{GameMinutes}}, and more.

## Disclaimer:

This was created by a student and has not been extensively tested (yet) although all the features work. This package will flood your C drive with replays though if you somehow mess it up. It is an executable so beware!

## Usage:

### 1: Downloading

Unzip the package in Releases for your operating system.

### 2: Configure (IMPORTANT)

**Open options.txt**

- Set `Replay Path (blank for current folder):` to the directory of the slippi replay files
- Set `Non-Teams Replay Format:` to the format, exluding the 'slp', that you want 1v1 and free for all replays to have (examples below)
- Set `Teams Replay Format:` to the format, exluding the 'slp', that you want teams replays to have (examples below)
- Set `Replace Doubles (true/false):` to `true` if you want to condense spaces or extra characters and set `Character to replace ("space" for space character):` to that character.
- Set `Sort into tag folders (true/false):` to `true` if you want to sort replays into folders with nametags

### 3: Run the program

If you get an error, please dm Smyles#4703 on discord.

## Tags

### General

**{{Stage}}**

- Full name of the stage the game was played on
- ex: "Fountain of Dreams"

**{{StageShort}}**

- Shortened name of the stage the game was played on
- ex: "FoD"

**{{GameMinutes}}**

- Number of minutes the game took (integer)
- Usually combined with {{GameSeconds}}
- ex: "2"

**{{GameSeconds}}**

- Numbebr of seconds the game took (less than 60, combined with {{GameMinutes}})
- ex: "42"

**{{{Date}}**

- Date the replay was recorded in YYYY-MM-DD format
- ex: "2022-8-2"

**{{Year}}**

- Year the replay was recorded
- ex: "2022"

**{{Month}}**

- Month the replay was recorded
- ex: "Dec"

**{{Day}}**

- Day the replay was recorded
- ex: "11"

**{{DayName}}**

- Day of the week the replay was recorded
- ex: "Mon"

**{{Time}}**

- Time the replay was recorded in 24 hour time
- ex: "20꞉45"

**{{Platform}}**

- The platform the replay was recorded on
- ex: "dolphin"

**{{ConsoleNick}}**

- The nickname of the wii the replay was recorded on (if applicable)
- ex: "ubc1"

**More tags coming in the future :)**
