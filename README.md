# word-definition-extension

<table>
  <tr>
    <td><img src="https://raw.githubusercontent.com/danialjivraj/word-definition-extension/main/githubPreviews/dictionary.png" alt="dictionary image" /></td>
    <td style="text-align: left;">This Google Chrome extension provides quick access to word definitions from Wiktionary. <br> The local server must be running for the definitions to display in the extension, as, instead of relying on a public API, the word definitions are retrieved from a large JSON file within the project.
</td>
  </tr>
</table>

## Functionality

The extension includes four tabs:

- **Definition**

  - Search for a word
  - Select a word in your browser, and opening the extension will display its definition
  - Listen to its pronunciation by pressing the speech synthesis volume icon
  - Mark words as favorites

- **Favourite**

  - View and manage your favorite words
  - Remove words from the favorites list
  - Click on a word to see its definition, which will redirect you to the Definition tab

- **Word of the Day**

  - Discover a new word every day as this tab retrieves the daily word from `word-of-the-day.json`

- **Settings**
  - Case sensitivity checkbox
  - Translation checkbox

## Preview

_searching for normal words with their respective meanings:_
![searchingWords](https://raw.githubusercontent.com/danialjivraj/word-definition-extension/main/githubPreviews/searchingWords.png)
_same word but with case sensitivity on, showcasing different meanings:_
![searchingWords](https://raw.githubusercontent.com/danialjivraj/word-definition-extension/main/githubPreviews/caseSensitivity.png)
_non-existent word in the english dictionary, without and with translation on:_
![searchingWords](https://raw.githubusercontent.com/danialjivraj/word-definition-extension/main/githubPreviews/translation.png)
_other different tabs:_
![searchingWords](https://raw.githubusercontent.com/danialjivraj/word-definition-extension/main/githubPreviews/differentTabs.png)

## Dependencies

To install all dependencies, run:

```
npm install
```

## Running the Server

Download the [JSONL data for all word senses in the English dictionary](https://kaikki.org/dictionary/English/index.html) (≈2GB) and rename it to `english-dictionary.json` <br>
Once downloaded, place it in the following directory: `backend/dictionary/`.

To run the server, execute the following command:

```
node .\server.js
```

**Note:** Make sure you're in the `backend` directory to run the command. <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
You will need [Node.js](https://nodejs.org/en/download) installed to be able to run the server.

## Add Extension to Google Chrome

In the browser, go to `chrome://extensions/`, click on `Load unpacked` (Developer mode must be on) and select the `word-definition-extension` folder. <br>
The extension should be loaded successfully. You might need to click the puzzle icon to see it!

## Tests

To run all tests, execute:

```
npm test
```

To run a specific test, use:

```
npm test -- --testNamePattern="name of the test here"
```

## Docker

You can run the tests within Docker by executing the following script:

```
.\run-tests.bat
```

**Note:** Make sure you're in the `backend\scripts` directory to run the script. <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
The script is only compatible with Windows because it is a .bat file..
