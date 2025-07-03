# twitter-clipboard

A simple Chrome extension that parses Twitter/X threads and copies them to your clipboard with a single click.

Upon clicking the extension icon, the extension copies the currently viewed tweet and all previous tweets in the thread to your clipboard in order, along with links and quote tweets. NB: to copy a thread, **you have to be in the final tweet of the thread** - if you're just on the first tweet, the extension will only copy that tweet. It may take a few seconds for the extension to load all tweets and expand them.

## Installation
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select your `twitter-clipboard` folder

## Usage

1. Navigate to any Twitter/X thread, and click to the final tweet you want to copy
2. Click the extension icon in your toolbar
3. All thread tweets up to that point will be automatically parsed and copied to your clipboard
4. Look for:
   - ✓ badge = Success
   - ! badge = Error
   - On-page notification confirming the copy

If there's any issue with the clipboard, you'll get an alert to manually copy from the console or retry the extension.

## How does it work?

A bit hacky given there's no API used - we scrape the tweets off the page, which requires simulating scrolls to load all tweets in the thread. This requires some delays which are reflected in the operation of the extension.

