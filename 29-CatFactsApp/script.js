const factBox = document.getElementById("factBox");
const btn = document.getElementById("btn");

async function getCatFact() {
    factBox.textContent = "Loading... ";

    try {
        const res = await fetch("https://catfact.ninja/fact");
        const data = await res.json();

        factBox.textContent = data.fact;

    } catch (error) {
        factBox.textContent = "Failed to fetch a cat fact. Try again ";
    }
}

btn.addEventListener("click", getCatFact);

// Load first fact on start
getCatFact();
