document.getElementById("bmi-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const weight = parseFloat(document.getElementById("weight").value);
  const height = parseFloat(document.getElementById("height").value) / 100; // convert cm to meters
  const result = document.getElementById("bmi-result");
  const status = document.getElementById("bmi-status");

  if (weight > 0 && height > 0) {
    const bmi = (weight / (height * height)).toFixed(1);
    result.textContent = `Your BMI: ${bmi}`;

    if (bmi < 18.5) {
      status.textContent = "You are underweight ";
      status.style.color = "#f5e642";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      status.textContent = "You have a normal weight ";
      status.style.color = "#00ff99";
    } else if (bmi >= 25 && bmi < 29.9) {
      status.textContent = "You are overweight ";
      status.style.color = "#ffae00";
    } else {
      status.textContent = "You are obese ";
      status.style.color = "#ff0059";
    }
  } else {
    result.textContent = "Please enter valid numbers!";
    status.textContent = "";
  }
});
