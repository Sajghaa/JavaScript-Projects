// Select elements
const form = document.getElementById("signupForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");

function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = "form-control error";
  const small = formControl.querySelector("small");
  small.textContent = message;
}

function showSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control success";
  const small = formControl.querySelector("small");
  small.textContent = "";
}

function isValidEmail(emailValue) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(emailValue);
}

function isValidPassword(passwordValue) {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return re.test(passwordValue);
}


form.addEventListener("submit", (e) => {
  e.preventDefault(); 

  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();

  if (usernameValue === "") {
    showError(username, "Username is required");
  } else if (usernameValue.length < 3) {
    showError(username, "Username must be at least 3 characters");
  } else {
    showSuccess(username);
  }

  if (emailValue === "") {
    showError(email, "Email is required");
  } else if (!isValidEmail(emailValue)) {
    showError(email, "Email is not valid");
  } else {
    showSuccess(email);
  }

  if (passwordValue === "") {
    showError(password, "Password is required");
  } else if (!isValidPassword(passwordValue)) {
    showError(password, "Password must be 6+ chars with letters and numbers");
  } else {
    showSuccess(password);
  }
});

email.addEventListener("input", () => {
  if (isValidEmail(email.value.trim())) {
    showSuccess(email);
  } else {
    showError(email, "Invalid email format");
  }
});
