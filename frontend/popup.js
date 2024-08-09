const generateButton = document.getElementById("generateButton");
const wordInput = document.getElementById("wordInput");
const definitionResult = document.getElementById("definitionResult");
const wordOfTheDayDefinitionContainer = document.getElementById(
  "wordOfTheDayDefinition"
);
const pronounceButton = document.getElementById("pronounceButton");
const favouriteTab = document.getElementById("favouriteTab");
const tabButtons = document.querySelectorAll(".tabButton");
const favouriteStar = document.getElementById("favouriteStar");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const caseSensitiveCheckbox = document.getElementById("caseSensitiveCheckbox");
const translationCheckbox = document.getElementById("translationCheckbox");

let favoriteWords = [];
let isCaseSensitive = false;
let isTranslationEnabled = false;
let selectedText = "";

const fetchDefinition = async (
  word,
  container,
  translatedWord = false,
  detectedSourceLanguage
) => {
  try {
    const caseSensitive = document.getElementById(
      "caseSensitiveCheckbox"
    ).checked;

    if (!caseSensitive) {
      word = word.toLowerCase();
    }

    const response = await fetch(`http://localhost:3000/search?word=${word}`);
    if (!response.ok) throw new Error("Word not found");

    const entries = await response.json();
    if (!entries.length) throw new Error("Word not found");

    let resultHTML = "";

    if (translatedWord) {
      resultHTML += `<div style="font-size: 12px; margin-top: -16px;">Word not found but translation available.</div>`;
      resultHTML += `<div><strong>Language:</strong> ${detectedSourceLanguage}</div>`;
    }

    resultHTML += "<hr>";

    entries.forEach((entry) => {
      resultHTML += `<div class="entry"><div><strong>Word:</strong> ${entry.word}</div>`;
      const phonetic = entry.sounds?.[0]?.ipa || "N/A";
      resultHTML += `<div><strong>Phonetic:</strong> ${phonetic}</div>`;
      if (entry.senses?.length) {
        resultHTML += `<div class="meaning"><div><strong>${entry.pos}</strong></div>`;
        entry.senses.forEach((sense, senseIndex) => {
          const hiddenClass = senseIndex >= 4 ? "hidden-definition" : "";
          if (sense.glosses?.length) {
            resultHTML += `<div class="definition ${hiddenClass}" style="margin-left: 20px;"><div><strong>${
              senseIndex + 1
            }.</strong> ${sense.glosses[0]}</div></div>`;
          }
          if (sense.synonyms?.length) {
            resultHTML += `<div class="definition ${hiddenClass}" style="margin-left: 20px;"><strong>Synonyms:</strong> ${sense.synonyms
              .map((synonym) => synonym.word)
              .join(", ")}</div>`;
          }
          if (sense.antonyms?.length) {
            resultHTML += `<div class="definition ${hiddenClass}" style="margin-left: 20px;"><strong>Antonyms:</strong> ${sense.antonyms
              .map((antonym) => antonym.word)
              .join(", ")}</div>`;
          }
          if (sense.examples?.length) {
            sense.examples.forEach((example) => {
              resultHTML += `<div class="definition ${hiddenClass}" style="margin-left: 20px;"><strong>Example:</strong> ${example.text}</div>`;
            });
          }
        });
        if (entry.senses.length > 4) {
          resultHTML += `<div class="definition" style="margin-left: 20px;"><a href="#" class="see-more">See more...</a></div>`;
        }
        resultHTML += `</div>`;
      }
      if (entry.related?.length) {
        resultHTML += `<div style="margin-left: 20px;"><strong>Related Words:</strong> ${entry.related
          .map((relatedWord) => relatedWord.word)
          .join(", ")}</div>`;
      }
      if (entry.categories?.length) {
        resultHTML += `<div><strong>Categories:</strong> ${entry.categories
          .map((category) => category.name)
          .join(", ")}</div>`;
      }
      resultHTML += `</div><hr>`;
    });

    container.innerHTML = resultHTML;

    const seeMoreLinks = container.querySelectorAll(".see-more");
    seeMoreLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const parentElement = link.parentElement.parentElement;
        const scrollPosition = window.scrollY;
        const definitions =
          parentElement.querySelectorAll(".hidden-definition");
        definitions.forEach((definition) =>
          definition.classList.remove("hidden-definition")
        );
        link.style.display = "none";
        const seeLessLink = document.createElement("a");
        seeLessLink.href = "#";
        seeLessLink.textContent = "See less...";
        seeLessLink.classList.add("see-less");
        seeLessLink.style.marginLeft = "20px";
        parentElement.appendChild(seeLessLink);

        seeLessLink.addEventListener("click", (event) => {
          event.preventDefault();
          definitions.forEach((definition) =>
            definition.classList.add("hidden-definition")
          );
          seeLessLink.remove();
          link.style.display = "inline";
          window.scrollTo({ top: scrollPosition, behavior: "smooth" });
        });
      });
    });
  } catch (error) {
    try {
      if (isTranslationEnabled && !translatedWord) {
        const translatedData = await translateWordUsingGoogle(word);
        const translatedWord = translatedData.translatedWord.toLowerCase();
        const detectedSourceLanguage = translatedData.detectedSourceLanguage;
        if (translatedWord !== word) {
          fetchDefinition(
            translatedWord,
            container,
            true,
            detectedSourceLanguage
          );
        } else {
          throw new Error("Word not found");
        }
      } else {
        container.innerHTML = `Definition not found. <a href="https://www.google.com/search?q=${word}+meaning" target="_blank">Look up on Google</a>`;
      }
    } catch (translationError) {
      container.innerHTML = `Definition not found. <a href="https://www.google.com/search?q=${word}+meaning" target="_blank">Look up on Google</a>`;
    }
  }
};

const translateWordUsingGoogle = async (word) => {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
      word
    )}`
  );
  if (!response.ok) throw new Error("Translation failed");

  const data = await response.json();
  const translatedWord = data[0][0][0];
  const detectedSourceLanguageCode = data[2];
  const languageNamesResponse = await fetch(
    "../backend/dictionary/language-code.json"
  );
  if (!languageNamesResponse.ok)
    throw new Error("Failed to load language names");

  const languageNames = await languageNamesResponse.json();
  const detectedSourceLanguageName =
    languageNames[detectedSourceLanguageCode] || "Unknown";
  return { translatedWord, detectedSourceLanguage: detectedSourceLanguageName };
};

const handleWordSearch = async (word) => {
  if (!isCaseSensitive) {
    word = word.toLowerCase();
  }
  fetchDefinition(word, definitionResult);
  updateFavoriteStarColor(word);
  chrome.storage.sync.set({ lastSearchedWord: word });
};

const fetchWordOfTheDay = async (date) => {
  try {
    const response = await fetch("../backend/dictionary/word-of-the-day.json");
    if (!response.ok) throw new Error("Failed to fetch Word of the Day data");

    const wordOfTheDayData = await response.json();
    const wordOfTheDay = wordOfTheDayData[date];
    const wordOfTheDayContainer = document.getElementById("wordOfTheDay");
    if (wordOfTheDay) {
      wordOfTheDayContainer.innerHTML = `<p>Word of the Day: <strong>${wordOfTheDay}</strong></p>`;
      fetchDefinition(wordOfTheDay, wordOfTheDayDefinitionContainer);
    } else {
      wordOfTheDayContainer.textContent = "No word of the day found.";
    }
  } catch (error) {
    console.error("Error fetching Word of the Day:", error);
    document.getElementById("wordOfTheDay").textContent =
      "Failed to fetch Word of the Day data.";
  }
};

const updateFavoriteStarColor = (word) => {
  if (word === "" || !favoriteWords.includes(word.toLowerCase())) {
    favouriteStar.classList.remove("active");
  } else {
    favouriteStar.classList.add("active");
  }
};

const toggleSearchIconColor = () => {
  generateButton.style.color = isCaseSensitive ? "#0b55dd" : "";
};

const clearHistory = () => {
  chrome.storage.sync.remove(["lastSearchedWord"], () => {
    wordInput.value = "";
    definitionResult.textContent = "";
    updateFavoriteStarColor("");
  });
};

const pronounceWord = (word) => {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  synth.speak(utterance);
};

const activateTab = (tabName) => {
  tabButtons.forEach((button) => {
    const buttonTabName = button.id.replace("TabButton", "Tab");
    const tab = document.getElementById(buttonTabName);
    button.classList.toggle("active", buttonTabName === tabName);
    tab.classList.toggle("active", buttonTabName === tabName);
    if (tabName === "favouriteTab") displayFavoriteWords();
  });
};

const displayFavoriteWords = () => {
  favouriteTab.innerHTML = "";
  if (favoriteWords.length) {
    const ul = document.createElement("ul");
    favoriteWords.forEach((word) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="favorite-word clickable">${word}</span><span class="remove-star"><i class="fas fa-times"></i></span>`;
      li.querySelector(".remove-star").addEventListener("click", () => {
        favoriteWords = favoriteWords.filter((favWord) => favWord !== word);
        chrome.storage.sync.set({ favoriteWords });
        displayFavoriteWords();
        updateFavoriteStarColor(wordInput.value.trim());
      });

      li.querySelector(".favorite-word").addEventListener("click", () => {
        wordInput.value = word;
        activateTab("definitionTab");
        fetchDefinition(word, definitionResult);
        updateFavoriteStarColor(word);
      });

      ul.appendChild(li);
    });
    favouriteTab.appendChild(ul);
  } else {
    favouriteTab.textContent = "No favorite words yet.";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  generateButton.addEventListener("click", () => {
    let word = wordInput.value.trim();
    if (!isCaseSensitive) word = word.toLowerCase();
    if (!word && selectedText) {
      word = selectedText;
      if (!isCaseSensitive) word = word.toLowerCase();
    }
    word
      ? handleWordSearch(word)
      : (definitionResult.textContent = "Please enter a word or select one.");
  });

  pronounceButton.addEventListener("click", () => {
    let word = wordInput.value.trim();
    if (!isCaseSensitive) word = word.toLowerCase();
    if (word) pronounceWord(word);
  });

  tabButtons.forEach((button) =>
    button.addEventListener("click", () =>
      activateTab(button.id.replace("TabButton", "Tab"))
    )
  );

  wordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      generateButton.click();
    }
  });

  clearHistoryButton.addEventListener("click", clearHistory);

  favouriteStar.addEventListener("click", () => {
    const word = wordInput.value.trim();
    if (word) {
      const lowerCaseWord = word.toLowerCase();
      if (!favoriteWords.includes(lowerCaseWord)) {
        favoriteWords.push(lowerCaseWord);
      } else {
        favoriteWords = favoriteWords.filter(
          (favWord) => favWord !== lowerCaseWord
        );
      }
      chrome.storage.sync.set({ favoriteWords });
      updateFavoriteStarColor(lowerCaseWord);
      displayFavoriteWords();
    }
  });

  caseSensitiveCheckbox.addEventListener("change", () => {
    isCaseSensitive = caseSensitiveCheckbox.checked;
    chrome.storage.sync.set({ isCaseSensitive });
    toggleSearchIconColor();
  });

  translationCheckbox.addEventListener("change", () => {
    isTranslationEnabled = translationCheckbox.checked;
    chrome.storage.sync.set({ isTranslationEnabled });
  });

  chrome.runtime.sendMessage({ action: "fetchSelectedText" }, (response) => {
    if (response && response.selectedText) {
      selectedText = response.selectedText.toLowerCase();
      wordInput.value = selectedText;
      fetchDefinition(selectedText, definitionResult);
    }
  });

  chrome.storage.sync.get(
    [
      "favoriteWords",
      "isCaseSensitive",
      "lastSearchedWord",
      "isTranslationEnabled",
    ],
    (result) => {
      if (result.favoriteWords)
        favoriteWords = result.favoriteWords.map((word) => word.toLowerCase());
      if (result.isCaseSensitive !== undefined) {
        isCaseSensitive = result.isCaseSensitive;
        caseSensitiveCheckbox.checked = isCaseSensitive;
        toggleSearchIconColor();
      }
      if (result.lastSearchedWord) {
        let lastSearchedWord = result.lastSearchedWord.toLowerCase();
        wordInput.value = lastSearchedWord;
        fetchDefinition(lastSearchedWord, definitionResult);
        updateFavoriteStarColor(lastSearchedWord);
      }
      if (result.isTranslationEnabled !== undefined) {
        isTranslationEnabled = result.isTranslationEnabled;
        translationCheckbox.checked = isTranslationEnabled;
      }
    }
  );

  const today = new Date();
  const formattedDate = `${today.getDate() < 10 ? "0" : ""}${today.getDate()}/${
    today.getMonth() + 1 < 10 ? "0" : ""
  }${today.getMonth() + 1}/${today.getFullYear()}`;
  fetchWordOfTheDay(formattedDate);
});

module.exports = { fetchDefinition, handleWordSearch };
