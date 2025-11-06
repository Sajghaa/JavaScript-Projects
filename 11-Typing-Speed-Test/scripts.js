const quotes = [
  "The quick brown fox jumps over the lazy dog.",
  "Discipline is the bridge between goals and achievement.",
  "Stay focused and keep learning every day.",
  "Practice makes perfect, keep typing to improve.",
  "Success comes to those who never give up."
];

const quoteDisplay = document.getElementById("quote");
const input = document.getElementById("input");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const startBtn = document.getElementById("start");

let timer;
let time = 0;
let isRunning = false;
let startTime = 0;
let currentQuote = "";

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function renderQuote(quote) {
  quoteDisplay.innerHTML = "";
  quote.split("").forEach(char => {
    const span = document.createElement("span");
    span.textContent = char;
    quoteDisplay.appendChild(span);
  });
}

function startTest() {
  currentQuote = getRandomQuote();
  renderQuote(currentQuote);
  input.value = "";
  input.disabled = false;
  input.focus();
  time = 0;
  timeDisplay.textContent = "0";
  wpmDisplay.textContent = "0";
  startTime = new Date();
  isRunning = true;

  clearInterval(timer);
  timer = setInterval(() => {
    time++;
    timeDisplay.textContent = time;
  }, 1000);
}

function endTest() {
  clearInterval(timer);
  isRunning = false;

  const typedText = input.value.trim();
  const wordCount = typedText.split(" ").filter(word => word !== "").length;
  const timeTaken = (new Date() - startTime) / 1000 / 60; // in minutes
  const wpm = Math.round(wordCount / timeTaken);
  wpmDisplay.textContent = wpm;
}

input.addEventListener("input", () => {
  const arrayQuote = quoteDisplay.querySelectorAll("span");
  const arrayValue = input.value.split("");

  let correct = true;

  arrayQuote.forEach((charSpan, index) => {
    const char = arrayValue[index];
    if (char == null) {
      charSpan.classList.remove("correct", "incorrect");
      correct = false;
    } else if (char === charSpan.textContent) {
      charSpan.classList.add("correct");
      charSpan.classList.remove("incorrect");
    } else {
      charSpan.classList.add("incorrect");
      charSpan.classList.remove("correct");
      correct = false;
    }
  });

  if (correct && input.value.length === currentQuote.length) {
    endTest();
  }
});

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    startTest();
  }
});
