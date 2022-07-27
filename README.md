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
### 1:
Unzip the package in Releases for your operating system.

### 2: Configure (IMPORTANT)
**Open options.txt**
- Set ``Replay Path (blank for current folder):`` to the directory of the slippi replay files
- Set ``Non-Teams Replay Format:`` to the format, exluding the 'slp', that you want 1v1 and free for all replays to have (examples below)
- Set ``Teams Replay Format:`` to the format, exluding the 'slp', that you want teams replays to have (examples below)
- Set ``Replace Doubles (true/false):`` to ``true`` if you want to condense spaces or extra characters and set ``Character to replace ("space" for space character):`` to that character.
- Set ``Sort into tag folders (true/false):`` to ``true`` if you want to sort replays into folders with nametags

### 3: Run the program
If you get an error, please dm Smyles#4703 on discord.
