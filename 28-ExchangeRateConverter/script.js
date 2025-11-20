const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const fromAmount = document.getElementById("fromAmount");
const toAmount = document.getElementById("toAmount");
const rateText = document.getElementById("rateText");

const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const swapBtn = document.getElementById("swapBtn");

// flag helper
function getFlag(currencyCode) {
    const country = currencyCode.slice(0, 2).toUpperCase();
    return `https://flagsapi.com/${country}/flat/64.png`;
}

// Load currencies from a more stable API
async function loadCurrencies() {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();

    const currencies = Object.keys(data.rates);

    currencies.forEach(cur => {
        fromCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
        toCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
    });

    fromCurrency.value = "USD";
    toCurrency.value = "RWF";

    updateFlags();
    calculate();
}

function updateFlags() {
    fromFlag.src = getFlag(fromCurrency.value);
    toFlag.src = getFlag(toCurrency.value);
}

async function calculate() {
    const from = fromCurrency.value;
    const to = toCurrency.value;

    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();

    const rate = data.rates[to];
    toAmount.value = (fromAmount.value * rate).toFixed(2);

    rateText.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    rateText.classList.remove("fade");
    void rateText.offsetWidth;
    rateText.classList.add("fade");

    updateFlags();
}

swapBtn.addEventListener("click", () => {
    let temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    calculate();
});

fromAmount.addEventListener("input", calculate);
fromCurrency.addEventListener("change", calculate);
toCurrency.addEventListener("change", calculate);

loadCurrencies();
