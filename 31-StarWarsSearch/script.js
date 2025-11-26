const input = document.getElementById("searchInput");
const btn = document.getElementById("searchBtn");
const resultBox = document.getElementById("result");

async function searchCharacter() {
    const query = input.value.trim();

    if (query === "") {
        resultBox.innerHTML = "Please enter a name.";
        return;
    }

    resultBox.innerHTML = "Searching...";

    try {
        const res = await fetch(`https://swapi.dev/api/people/?search=${query}`);
        const data = await res.json();

        if (data.count === 0) {
            resultBox.innerHTML = "No character found.";
            return;
        }

        const char = data.results[0];

        resultBox.innerHTML = `
            <h2>${char.name}</h2>
            <p><strong>Height:</strong> ${char.height} cm</p>
            <p><strong>Mass:</strong> ${char.mass} kg</p>
            <p><strong>Gender:</strong> ${char.gender}</p>
            <p><strong>Birth Year:</strong> ${char.birth_year}</p>
            <p><strong>Films:</strong> ${char.films.length} films</p>
        `;
    } catch (error) {
        resultBox.innerHTML = "Error fetching data.";
    }
}

btn.addEventListener("click", searchCharacter);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") searchCharacter();
});
