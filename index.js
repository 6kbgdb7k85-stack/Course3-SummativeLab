const history = []; //store previously searched words for quick access

//utility functions
function capitalizeFirstLetter(word) {
  const chars = word.split("");
  chars[0] = chars[0].toUpperCase();
  return chars.join("");
}

function renderHistory(word) {
  if (history.includes(word)) {
    return;
  }
  history.push(word);
  const historyContainer = document.querySelector("#history");
  const historyHTML = history
    .map(
      (word) =>
        `<strong class="history-link" id="history-${word}">${word}</strong>`,
    )
    .join("<span>|</span>");
  historyContainer.innerHTML = historyHTML;
}

function getSynAntHTML(meaning) {
  const { synonyms, antonyms } = meaning;
  if (synonyms.length === 0 && antonyms.length === 0) {
    return "";
  }
  const synonymsHTML =
    synonyms.length === 0
      ? ""
      : `<h4>Synonyms (varies by definition):</h4>
        <ul>
            ${synonyms.map((synonym) => `<li>${synonym}</li>`).join("")}
        </ul>`;
  const antonymsHTML =
    antonyms.length === 0
      ? ""
      : `<h4>Antonyms (varies by definition):</h4>
        <ul>
            ${antonyms.map((antonym) => `<li>${antonym}</li>`).join("")}
        </ul>`;
  return `<div class="synonym-antonym-block">
      ${synonymsHTML}${antonymsHTML}
    </div>`;
}

function getPhoneticText(wordData) {
  if (wordData.phonetic) {
    return wordData.phonetic;
  }
}

function getPhoneticData(phonetics) {
  if (!phonetics) {
    return [];
  }
  const phoneticArray = [];
  phonetics.forEach((phonetic) => {
    if (phonetic.audio && phonetic.text) {
      phoneticArray.push(phonetic);
    }
  });
  return phoneticArray;
}

function renderPlaceholders(dictionaryContainer) {
  dictionaryContainer.innerHTML = `<div class="word-panel">
      <div class="word-header">
        <h3 class="placeholder-glow">
            <span class="placeholder col-6"></span>
        </h3>
      </div>
      <div class="word-card">
        <div class="definition-block">
            <h4 class="placeholder-glow"><span class="placeholder col-4"></span></h4>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
        </div>
        <div class="synonym-antonym-block">
            <h4 class="placeholder-glow"><span class="placeholder col-4"></span></h4>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
            <p class="placeholder-glow"><span class="placeholder col-2"></span></p>
        </div>
      </div>
    </div>`;
}

//primary functions
function handleWordSubmit(event, historyWord) {
  event.preventDefault();
  const submittedWord =
    historyWord || event.target[0].value.trim().toLowerCase();
  const submitButton = document.querySelector("#submitButton");
  const dictionaryContainer = document.querySelector("#dictionary-container");
  if (!submittedWord) {
    dictionaryContainer.textContent = "You have to enter a word to search for!";
    return;
  }
  renderPlaceholders(dictionaryContainer);
  submitButton.textContent = "...";
  submitButton.disabled = true;
  fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(submittedWord)}`,
  )
    .then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Word "${submittedWord}" not found. Check your spelling and try again.`,
          );
        } else {
          throw new Error(
            `General API Error: HTTP Status - ${response.status}`,
          );
        }
      } else {
        renderHistory(submittedWord);
        return response.json();
      }
    })
    .then((wordsData) => {
      submitButton.disabled = false;
      submitButton.textContent = "Search";
      displayDictionaryResult(wordsData, dictionaryContainer);
    })
    .catch((error) => {
      const dictionaryContainer = document.querySelector(
        "#dictionary-container",
      );
      dictionaryContainer.style = "text-align: center;";
      dictionaryContainer.textContent = error.message;
      submitButton.disabled = false;
      submitButton.innerHTML = "Search";
    });
}

function displayDictionaryResult(wordsData, dictionaryContainer) {
  dictionaryContainer.style = "";
  const dictionaryHTML = wordsData
    .map((wordData) => {
      const phoneticData = getPhoneticData(wordData.phonetics);
      const phoneticHTML = phoneticData
        .map((phonetic) => {
          return `<div>
                <span>${phonetic.text}</span>
                <audio controls class="short-audio">
                    <source src="${phonetic.audio}" />
                </audio>
              </div>`;
        })
        .join("");
      const meaningsHTML = wordData.meanings
        .map((meaning) => {
          const defHTML = meaning.definitions
            .map((def) => {
              const exampleHTML = def.example
                ? `<p class="italics">e.g. ${def.example}</p>`
                : "";
              return `<li><p>${def.definition}</p>${exampleHTML}</li>`;
            })
            .join("");
          return `<div class="word-card">
            <div class="definition-block">
              <h4>${meaning.partOfSpeech.toUpperCase()}</h4>
              <ol>
                  ${defHTML}
              </ol>
            </div>
            ${getSynAntHTML(meaning)}
        </div>`;
        })
        .join("");
      return `<div class="word-panel">
        <div class="word-header">
          <h3>${capitalizeFirstLetter(wordData.word)}</h3>${phoneticHTML}
        </div>
        ${meaningsHTML}
      </div>`;
    })
    .join("");
  dictionaryContainer.innerHTML = dictionaryHTML;
}

//search for a word from history list upon clicking the link
function rerunWordSearch(event) {
  const element = event.target;
  if (element.id.includes("history-")) {
    handleWordSubmit(event, element.innerHTML);
  }
}

//initialization
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#word-search")
    .addEventListener("submit", (event) => handleWordSubmit(event));
  document.addEventListener("click", (event) => rerunWordSearch(event));
});

// Export functions for testing (CommonJS)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    capitalizeFirstLetter,
    getSynAntHTML,
    getPhoneticText,
    getPhoneticData,
    renderPlaceholders,
    handleWordSubmit,
    displayDictionaryResult,
  };
}
