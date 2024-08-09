const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const htmlFilePath = path.resolve(__dirname, "../frontend/popup.html");
const htmlContent = fs.readFileSync(htmlFilePath, "utf8");
const { window } = new JSDOM(htmlContent);
global.document = window.document;

const { fetchDefinition } = require("../frontend/popup.js");
let caseSensitiveCheckbox = document.getElementById("caseSensitiveCheckbox");
let translationCheckbox = document.getElementById("translationCheckbox");

describe("Interface", () => {
  test("test existence of buttons, search box, star, checkboxes.", async () => {
    expect(document.getElementById("generateButton")).toBeTruthy();
    expect(document.getElementById("wordInput")).toBeTruthy();
    expect(document.getElementById("definitionResult")).toBeTruthy();
    expect(document.getElementById("wordOfTheDayDefinition")).toBeTruthy();
    expect(document.getElementById("pronounceButton")).toBeTruthy();
    expect(document.getElementById("favouriteTab")).toBeTruthy();
    expect(document.querySelector(".tabButton")).toBeTruthy();
    expect(document.getElementById("favouriteStar")).toBeTruthy();
    expect(document.getElementById("clearHistoryButton")).toBeTruthy();
    expect(document.getElementById("caseSensitiveCheckbox")).toBeTruthy();
    expect(document.getElementById("translationCheckbox")).toBeTruthy();
  });
});

describe("fetchDefinition different cases", () => {
  test('test results for searching for the word "amazing"', async () => {
    const mockResponse = JSON.parse(
      fs.readFileSync("tests/payload/amazing.json", "utf-8")
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    await fetchDefinition(
      "amazing",
      document.getElementById("definitionResult")
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/search?word=amazing"
    );

    const definition = document.getElementById("definitionResult");
    const expectedHTML = `<div id="definitionResult" class="mt-3"><hr><div class="entry"><div><strong>Word:</strong> amazing</div><div><strong>Phonetic:</strong> /əˈmeɪzɪŋ/</div><div class="meaning"><div><strong>verb</strong></div><div class="definition " style="margin-left: 20px;"><div><strong>1.</strong> present participle and gerund of amaze</div></div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> How many things have men found out to the amazing of one another, to the wonderment of one another, to the begetting of endless commendations of one another in the world</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Amazing is judged relative what already exists, and Quake has the best underwater effects so far.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Reality, especially God's Reality is amazing. For instance that there is something rather than nothing is amazing. [...] Amazing is amazing.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> The amazing is happening.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> All that is impossibly amazing is considered nothing, and the impossibly amazing is considered normal.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> The amazing is that, in EXACTLY the same situation, the demo2 doesn't show this problem.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Everything that amazes has its method, until we notice that the amazing is not amazing, has no method.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Sheffield is an amazing athlete, how much of the amazing is provided from the Chemlab.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> 2006 May 16, Simon Baird, "monkeyGTD is amazing- a few questions and suggestions", GTD TiddlyWiki, Google goups
Cool! Of course 99% of the amazing is due to the "powered by TiddlyWiki" part of MonkeyGTD.. :)</div></div></div><hr><div class="entry"><div><strong>Word:</strong> amazing</div><div><strong>Phonetic:</strong> /əˈmeɪzɪŋ/</div><div class="meaning"><div><strong>adj</strong></div><div class="definition " style="margin-left: 20px;"><div><strong>1.</strong> Causing wonder and amazement; very surprising.</div></div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> “It’s been amazing, the amount of emails and congratulations,” the Snow White and the Huntsman star, 36, told Ryan Seacrest Friday on his radio show.</div><div class="definition " style="margin-left: 20px;"><div><strong>2.</strong> Possessing uniquely wonderful qualities; very good.</div></div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> “I didn’t think I would be a fan of the swaddling, but the swaddling’s pretty amazing,” she says.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> 2014, November 6, WAAY-TV (Huntsville, AL), VIDEO: "Sitting next to him was amazing" says student of General Via
"I think it was pretty amazing that he picked our school out of a lot of schools to come speak to us about what he has done, and what our country has done, to help us gain our freedom," Mucci said, “sitting next to him was amazing.”</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> 2014, November 8, Nick McCarvel, "Wozniacki's marathon debut was amazing, Djokovic says", USA TODAY Sports
"Running a marathon is definitely an amazing experience."</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> 2015 June 10, Lindsey Bever, Morning Mix: Another reason seeing-eye dogs are amazing:</div></div><div style="margin-left: 20px;"><strong>Related Words:</strong> amazement</div></div><hr></div>`;
    expect(definition.outerHTML).toEqual(expectedHTML);
  });

  test('test results for searching a non-existing word "doesnotexist"', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ error: "Word not found" }),
      })
    );

    await fetchDefinition(
      "doesnotexist",
      document.getElementById("definitionResult")
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/search?word=doesnotexist"
    );

    const definition = document.getElementById("definitionResult");
    const expectedHTML = `<div id=\"definitionResult\" class=\"mt-3\">Definition not found. <a href=\"https://www.google.com/search?q=doesnotexist+meaning\" target=\"_blank\">Look up on Google</a></div>`;
    expect(definition.outerHTML).toEqual(expectedHTML);
  });
});

describe("testing the word bem with case sensitivity and translation scenarios", () => {
  test("test results for searching lowercase bem", async () => {
    caseSensitiveCheckbox.checked = false;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ error: "Word not found" }),
      })
    );

    await fetchDefinition("bem", document.getElementById("definitionResult"));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/search?word=bem"
    );

    const definition = document.getElementById("definitionResult");
    const expectedHTML = `<div id=\"definitionResult\" class=\"mt-3\">Definition not found. <a href=\"https://www.google.com/search?q=bem+meaning\" target=\"_blank\">Look up on Google</a></div>`;
    expect(definition.outerHTML).toEqual(expectedHTML);
  });

  test("test results for searching uppercase Bem with sensitivity off", async () => {
    caseSensitiveCheckbox.checked = false;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ error: "Word not found" }),
      })
    );

    await fetchDefinition("Bem", document.getElementById("definitionResult"));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/search?word=bem"
    );

    const definition = document.getElementById("definitionResult");
    const expectedHTML = `<div id=\"definitionResult\" class=\"mt-3\">Definition not found. <a href=\"https://www.google.com/search?q=bem+meaning\" target=\"_blank\">Look up on Google</a></div>`;
    expect(definition.outerHTML).toEqual(expectedHTML);
  });

  test("test results for searching uppercase bem with sensitivity on", async () => {
    caseSensitiveCheckbox.checked = true;

    const mockResponse = JSON.parse(
      fs.readFileSync("tests/payload/Bem2.json", "utf-8")
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    await fetchDefinition("Bem", document.getElementById("definitionResult"));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/search?word=Bem"
    );

    const definition = document.getElementById("definitionResult");
    const expectedHTML = `<div id=\"definitionResult\" class=\"mt-3\"><hr><div class=\"entry\"><div><strong>Word:</strong> Bem</div><div><strong>Phonetic:</strong> N/A</div><div class=\"meaning\"><div><strong>name</strong></div><div class=\"definition \" style=\"margin-left: 20px;\"><div><strong>1.</strong> An unincorporated community in Gasconade County, Missouri, United States.</div></div><div class=\"definition \" style=\"margin-left: 20px;\"><strong>Example:</strong> gasconade county / Bem vicinity / PEENIE ARCHEOLOGICAL PETROGLYPH SITE / 3 miles east of Bem / Pre-Columbian</div></div></div><hr></div>`;
    expect(definition.outerHTML).toEqual(expectedHTML);
  });

  test("test results for searching full uppercase BEM with sensitivity on", async () => {
    caseSensitiveCheckbox.checked = true;

    const mockResponse = JSON.parse(
      fs.readFileSync("tests/payload/BEM3.json", "utf-8")
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    await fetchDefinition("BEM", document.getElementById("definitionResult"));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/search?word=BEM"
    );

    const definition = document.getElementById("definitionResult");
    const expectedHTML = `<div id=\"definitionResult\" class=\"mt-3\"><hr><div class=\"entry\"><div><strong>Word:</strong> BEM</div><div><strong>Phonetic:</strong> N/A</div><div class=\"meaning\"><div><strong>noun</strong></div><div class=\"definition \" style=\"margin-left: 20px;\"><div><strong>1.</strong> Initialism of British Empire Medal.</div></div><div class=\"definition \" style=\"margin-left: 20px;\"><div><strong>2.</strong> Initialism of block, element, modifier, a convention for authoring CSS.</div></div><div class=\"definition \" style=\"margin-left: 20px;\"><strong>Example:</strong> Where OOCSS and SMACSS can be seen as a more of frameworks for thinking about structured CSS combined with some handy rules of thumb, BEM is a much more rigid system for how to author and name your styles. BEM is originally an application development methodology from the search engine company Yandex.</div></div></div><hr><div class=\"entry\"><div><strong>Word:</strong> BEM</div><div><strong>Phonetic:</strong> N/A</div><div class=\"meaning\"><div><strong>noun</strong></div><div class=\"definition \" style=\"margin-left: 20px;\"><div><strong>1.</strong> A stock character in science fiction; a grotesque creature, often an extraterrestrial, that menaces the protagonists.</div></div><div class=\"definition \" style=\"margin-left: 20px;\"><strong>Synonyms:</strong> bem</div><div class=\"definition \" style=\"margin-left: 20px;\"><strong>Example:</strong> Incidentally, Mr. Bergey, the BEM's on your latest smear have extremely jovial expressions on their pans to be as tough a bunch of eggs as Friend made them out.</div><div class=\"definition \" style=\"margin-left: 20px;\"><strong>Example:</strong> This is my first time in active BEM service. They've never let me near the Bugs before.</div></div></div><hr></div>`;
    expect(definition.outerHTML).toEqual(expectedHTML);
  });

  test("test results for searching full uppercase BEM with sensitivity off and translation on", async () => {
    caseSensitiveCheckbox.checked = false;
    translationCheckbox.checked = true;

    const mockResponse = JSON.parse(
      fs.readFileSync("tests/payload/good.json", "utf-8")
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    await fetchDefinition(
      "BEM",
      document.getElementById("definitionResult"),
      true,
      "Portuguese"
    );

    const definition = document.getElementById("definitionResult");
    const expectedHTML = `<div id="definitionResult" class="mt-3"><div style="font-size: 12px; margin-top: -16px;">Word not found but translation available.</div><div><strong>Language:</strong> Portuguese</div><hr><div class="entry"><div><strong>Word:</strong> good</div><div><strong>Phonetic:</strong> N/A</div></div><hr><div class="entry"><div><strong>Word:</strong> good</div><div><strong>Phonetic:</strong> /ɡʊd/</div><div class="meaning"><div><strong>adv</strong></div><div class="definition " style="margin-left: 20px;"><div><strong>1.</strong> Well; satisfactorily or thoroughly.</div></div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> The boy done good. (did well)</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> If Silvertip refuses to give you the horse, grab him before he can draw a weapon, and beat him good. You're big enough to do it.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> I kept my eyes peeled for signs of pursuit. There was none, unless I was being fooled very good.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> She said, "I don't want to bother you / Consider it's understood / I know I'm not no beauty queen / But I sure can listen good."</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Marsellus fucked him up good. Word 'round the campfire is it was on account of Marsellus Wallace's wife.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> The one thing that we can't do...is throw out the baby with the bathwater.... We know our process works pretty darn good and, uh, it’s really sparked this amazing phenomenon of this...high-quality website.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> "They're travellin' good now. We'll leave them be."</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Admiral Anderson: You did good, child. You did good. I'm proud of you.</div></div></div><hr></div>`;
    expect(definition.outerHTML).toEqual(expectedHTML);
  });
});

test("test the word 'bober', expecting to be translated from polish into the word 'beaver'", async () => {
  caseSensitiveCheckbox.checked = false;
  translationCheckbox.checked = true;

  const mockResponse = JSON.parse(
    fs.readFileSync("tests/payload/beaver.json", "utf-8")
  );

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
  );

  await fetchDefinition(
    "bober",
    document.getElementById("definitionResult"),
    true,
    "Polish"
  );

  const definition = document.getElementById("definitionResult");
  const expectedHTML = `<div id="definitionResult" class="mt-3"><div style="font-size: 12px; margin-top: -16px;">Word not found but translation available.</div><div><strong>Language:</strong> Polish</div><hr><div class="entry"><div><strong>Word:</strong> beaver</div><div><strong>Phonetic:</strong> /ˈbiːvə/</div></div><hr><div class="entry"><div><strong>Word:</strong> beaver</div><div><strong>Phonetic:</strong> /ˈbiːvə/</div><div class="meaning"><div><strong>noun</strong></div><div class="definition " style="margin-left: 20px;"><div><strong>1.</strong> Alternative spelling of bevor (“part of a helmet”).</div></div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> With trembling hands her beaver he untied, / Which done, he saw, and seeing knew her face.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Without alighting from his horse, the conqueror called for a bowl of wine, and opening the beaver, or lower part of his helmet, announced that he quaffed it, “To all true English hearts, and to the confusion of foreign tyrants.”</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> 1951 Adaptation of the 1885 Ormsby translation of Cervantes’ Don Quixote, correcting Ormsby as to the portion of the helmet referred to by Cervantes (see note 11 to chapter II) at the suggestion of Juan Hartzenbusch, a 19th-century director of the National Library of Spain.
They laid a table for him at the door of the inn for the sake of the air, and the host brought him a portion of ill-soaked and worse cooked stockfish, and a piece of bread as black and mouldy as his own armour; but a laughble sight it was to see him eating, for having his helmet on and the beaver up, he could not with his own hands put anything into his mouth unless some one else placed it there, and this service one of the ladies rendered him.</div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> As each one brings a little of himself to what he sees you brought the trappings of your historic preoccupations, so that Monsieur flattered you by presenting himself with beaver up like Hamlet's father's ghost!</div></div></div><hr><div class="entry"><div><strong>Word:</strong> beaver</div><div><strong>Phonetic:</strong> /ˈbiːvə/</div><div class="meaning"><div><strong>noun</strong></div><div class="definition " style="margin-left: 20px;"><div><strong>1.</strong> Butter.</div></div><div class="definition " style="margin-left: 20px;"><strong>Example:</strong> Butter – Beaver.]</div></div></div><hr></div>`;
  expect(definition.outerHTML).toEqual(expectedHTML);
});
