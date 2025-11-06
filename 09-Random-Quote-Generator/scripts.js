const quotes = [
  "“Success is not final, failure is not fatal: it is the courage to continue that counts.” – Winston Churchill",
  "“Don’t watch the clock; do what it does. Keep going.” – Sam Levenson",
  "“Dream big. Start small. Act now.” – Robin Sharma",
  "“The future depends on what you do today.” – Mahatma Gandhi",
  "“Hustle in silence, let your success make the noise.” – Unknown",
  "“Believe you can and you’re halfway there.” – Theodore Roosevelt",
  "“Do something today that your future self will thank you for.” – Unknown",
  "“Everything you can imagine is real.” - Pablo Picasso",
  "“It always seems impossible until it’s done” - Nelson Mandela",
  "“Act as if what you do makes a difference. It does.” - William James",
  "“Keep your face always toward the sunshine—and shadows will fall behind you.” - Walt Whitman",
  "“The best way to predict the future is to create it.” - Peter Drucker"
];

const colors = [
  "#1abc9c",
  "#e74c3c",
  "#9b59b6",
  "#f39c12",
  "#3498db",
  "#2ecc71",
  "#e67e22"
];

const quoteText = document.getElementById("quote");
const btn = document.getElementById("new-quote");

btn.addEventListener("click", () => {
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteText.textContent = randomQuote;


  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  document.body.style.background = randomColor;
});
