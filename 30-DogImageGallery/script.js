const gallery = document.getElementById("gallery");
const loadBtn = document.getElementById("loadBtn");

async function loadDogImage() {
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await res.json();

    const img = document.createElement("img");
    img.src = data.message;
    gallery.appendChild(img);
}

async function loadMultipleImages(count = 6) {
    for (let i = 0; i < count; i++) {
        await loadDogImage();
    }
}

loadBtn.addEventListener("click", () => loadMultipleImages());

loadMultipleImages();
