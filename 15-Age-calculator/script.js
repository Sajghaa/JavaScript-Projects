function calculateAge() {
      const input = document.getElementById("birthdate").value;
      if (!input) {
        document.getElementById("result").innerText = "Please select your birth date!";
        return;
      }

      const birthDate = new Date(input);
      const today = new Date();

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      document.getElementById("result").innerText = 
        `🎉 You are ${years} years, ${months} months, and ${days} days old.`;
    }