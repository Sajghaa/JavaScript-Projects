const jokeEl = document.getElementById('joke');
const btn = document.getElementById('getJokeBtn');

async function fetchJoke() {
  try {
    const res = await fetch('https://api.chucknorris.io/jokes/random');
    const data = await res.json();
    jokeEl.textContent = data.value;
  } catch (error) {
    jokeEl.textContent = "Oops! Couldn't fetch a joke this time ";
    console.error(error);
  }
}


fetchJoke();


btn.addEventListener('click', fetchJoke);
