const container = document.getElementById("crypto-container");

async function fetchCryptoData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana,dogecoin"
    );
    const data = await res.json();

    container.innerHTML = data
      .map((coin) => {
        const priceChange = coin.price_change_percentage_24h.toFixed(2);
        const changeClass = priceChange >= 0 ? "positive" : "negative";

        return `
          <div class="card">
            <img src="${coin.image}" alt="${coin.name}" />
            <h2>${coin.name} (${coin.symbol.toUpperCase()})</h2>
            <p class="price">$${coin.current_price.toLocaleString()}</p>
            <span class="change ${changeClass}">
              ${priceChange > 0 ? "▲" : "▼"} ${priceChange}%
            </span>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    container.innerHTML = `<p> Failed to fetch crypto data.</p>`;
    console.error(error);
  }
}

// Fetch every 30 seconds
fetchCryptoData();
setInterval(fetchCryptoData, 30000);
