const wordInput = document.getElementById("wordInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");

async function getWordData() {
  const word = wordInput.value.trim();
  if (!word) {
    result.innerHTML = `<p>Please enter a word </p>`;
    return;
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) throw new Error("Word not found");
    const data = await res.json();

    const meaning = data[0].meanings[0];
    const definition = meaning.definitions[0].definition;
    const example = meaning.definitions[0].example || "No example available.";
    const phonetic = data[0].phonetic || "No phonetic available";
    const audio = data[0].phonetics.find(p => p.audio)?.audio;

    result.innerHTML = `
      <h2>${word.charAt(0).toUpperCase() + word.slice(1)}</h2>
      <p><strong>Phonetic:</strong> ${phonetic}</p>
      <p><strong>Part of Speech:</strong> ${meaning.partOfSpeech}</p>
      <p><strong>Definition:</strong> ${definition}</p>
      <p><strong>Example:</strong> "${example}"</p>
      ${audio ? `<audio controls src="${audio}"></audio>` : "<p>No pronunciation audio available 🎧</p>"}
    `;
  } catch (error) {
    result.innerHTML = `<p class="error">❌ ${error.message}</p>`;
  }
}

searchBtn.addEventListener("click", getWordData);
