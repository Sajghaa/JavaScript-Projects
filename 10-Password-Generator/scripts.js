const passwordBox = document.getElementById("password");
const copyBtn = document.getElementById("copy");
const generateBtn = document.getElementById("generate");

const lengthInput = document.getElementById("length");
const upperCheck = document.getElementById("uppercase");
const lowerCheck = document.getElementById("lowercase");
const numberCheck = document.getElementById("numbers");
const symbolCheck = document.getElementById("symbols");

const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowerCase = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

generateBtn.addEventListener("click", () => {
  const length = parseInt(lengthInput.value);
  let chars = "";
  let password = "";

  if (upperCheck.checked) chars += upperCase;
  if (lowerCheck.checked) chars += lowerCase;
  if (numberCheck.checked) chars += numbers;
  if (symbolCheck.checked) chars += symbols;

  if (chars === "") {
    passwordBox.value = "Select at least one option!";
    return;
  }

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  passwordBox.value = password;
});

copyBtn.addEventListener("click", () => {
  if (passwordBox.value) {
    navigator.clipboard.writeText(passwordBox.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1000);
  }
});
