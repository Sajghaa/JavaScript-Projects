
    const result = document.getElementById("result");
    const loading = document.getElementById("loading");

    document.getElementById("convert-btn").addEventListener("click", async () => {
      const amount = parseFloat(document.getElementById("amount").value);
      const from = document.getElementById("from-currency").value;
      const to = document.getElementById("to-currency").value;

      if (isNaN(amount) || amount <= 0) {
        result.textContent = "Enter a valid amount!";
        return;
      }

      loading.textContent = "Converting... ⏳";
      result.textContent = "";

      try {
        const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
        const data = await res.json();

        if (data.result) {
          loading.textContent = "";
          result.textContent = `${amount} ${from} = ${data.result.toFixed(2)} ${to}`;
        } else {
          loading.textContent = "Conversion failed 😞";
        }
      } catch (err) {
        loading.textContent = "Network error 😕. Try again later.";
      }
    });
 