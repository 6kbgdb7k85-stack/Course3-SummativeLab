/**
 * @jest-environment jsdom
 */

const {
  capitalizeFirstLetter,
  getSynAntHTML,
  getPhoneticText,
  getPhoneticData,
  renderPlaceholders,
  displayDictionaryResult,
} = require("../index.js");

describe("index.js utility functions", () => {
  test("capitalizeFirstLetter turns the first character uppercase", () => {
    expect(capitalizeFirstLetter("example")).toBe("Example");
    expect(capitalizeFirstLetter("Already")).toBe("Already");
  });

  test("getSynAntHTML returns an empty string when no synonyms or antonyms are present", () => {
    expect(getSynAntHTML({ synonyms: [], antonyms: [] })).toBe("");
  });

  test("getSynAntHTML formats synonyms and antonyms HTML correctly", () => {
    const html = getSynAntHTML({
      synonyms: ["fast", "quick"],
      antonyms: ["slow"],
    });

    expect(html).toContain("Synonyms (varies by definition):");
    expect(html).toContain("<li>fast</li>");
    expect(html).toContain("<li>quick</li>");
    expect(html).toContain("Antonyms (varies by definition):");
    expect(html).toContain("<li>slow</li>");
  });

  test("getPhoneticText returns the phonetic string when available", () => {
    expect(getPhoneticText({ phonetic: "/ɪgˈzæmpəl/" })).toBe("/ɪgˈzæmpəl/");
    expect(getPhoneticText({})).toBeUndefined();
  });

  test("getPhoneticData filters out phonetics with missing audio or text", () => {
    const phonetics = [
      { text: "/tɛst/", audio: "https://audio.test.mp3" },
      { text: "/noaudio/", audio: "" },
      { text: "", audio: "https://audio.example.mp3" },
      { text: "/good/", audio: "https://good.mp3" },
    ];

    const filtered = getPhoneticData(phonetics);

    expect(filtered).toEqual([
      { text: "/tɛst/", audio: "https://audio.test.mp3" },
      { text: "/good/", audio: "https://good.mp3" },
    ]);
  });
});

describe("DOM rendering helpers", () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="dictionary-container"></div>';
    container = document.querySelector("#dictionary-container");
  });

  test("renderPlaceholders inserts placeholder content into the container", () => {
    renderPlaceholders(container);

    expect(container.innerHTML).toContain("word-panel");
    expect(container.innerHTML).toContain("placeholder-glow");
    expect(container.innerHTML).toContain("placeholder col-6");
  });

  test("displayDictionaryResult renders a word panel with phonetics, definitions, and examples", () => {
    const wordsData = [
      {
        word: "example",
        phonetics: [
          { text: "/ɪɡˈzæmpəl/", audio: "https://audio.example.mp3" },
          { text: "/ɪɡˈzæmpəl/" },
        ],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition: "A thing characteristic of its kind or illustrating a general rule.",
                example: "This painting is an example of his early style.",
              },
            ],
            synonyms: ["instance"],
            antonyms: ["counterexample"],
          },
        ],
      },
    ];

    displayDictionaryResult(wordsData, container);

    expect(container.innerHTML).toContain("Example");
    expect(container.innerHTML).toContain("/ɪɡˈzæmpəl/");
    expect(container.innerHTML).toContain("https://audio.example.mp3");
    expect(container.innerHTML).toContain("A thing characteristic of its kind or illustrating a general rule.");
    expect(container.innerHTML).toContain("e.g. This painting is an example of his early style.");
    expect(container.innerHTML).toContain("instance");
    expect(container.innerHTML).toContain("counterexample");
  });
});
