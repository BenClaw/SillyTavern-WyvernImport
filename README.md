# WyvernChat Import Plugin for SillyTavern

Adds a button to import characters directly from WyvernChat URLs.

## Installation

1. Open your SillyTavern `plugins` folder.
2. Clone this repository into a folder named `wyvern-import`.
   ```bash
   git clone https://github.com/BenClaw/SillyTavern-WyvernImport.git plugins/wyvern-import
   ```
3. Open a terminal in `plugins/wyvern-import` and run:
   ```bash
   npm install
   ```
4. Restart SillyTavern.

## Usage

1. Open the Character Management panel (top right).
2. Click the new Dragon icon button (next to the standard import button).
3. Paste a WyvernChat character URL (e.g., `https://app.wyvern.chat/characters/_DcFzAKrRDj1WeUKf3KXdH`).
4. The character will be downloaded and imported automatically as a V2 Character Card (PNG with embedded JSON).
