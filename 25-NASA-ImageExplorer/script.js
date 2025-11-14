const API_URL = "https://images-api.nasa.gov/search";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const gallery = document.getElementById("gallery");
const loadingEl = document.getElementById("loading");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoritesGallery = document.getElementById("favorites");
const closeBtn = document.querySelector(".close");

let currentImages = [];
let currentIndex = 0;
let favorites = JSON.parse(localStorage.getItem("nasa_favorites") || "[]");
let currentModalImage = null;

function showLoading(show){ loadingEl.classList.toggle("hidden", !show); }

function renderGallery(images){
    gallery.innerHTML="";
    images.forEach((img,index)=>{
        const imgEl=document.createElement("img");
        imgEl.src = img.href;
        imgEl.alt = img.title;
        imgEl.title = img.title;
        imgEl.addEventListener("click", ()=> openModal(index));
        gallery.appendChild(imgEl);
    });
}

function renderFavorites(){
    favoritesGallery.innerHTML="";
    favorites.forEach((img)=>{
        const imgEl=document.createElement("img");
        imgEl.src = img.href;
        imgEl.alt = img.title;
        imgEl.title = img.title;
        favoritesGallery.appendChild(imgEl);
    });
}

async function fetchImages(query){
    showLoading(true);
    gallery.innerHTML="";
    try{
        const res = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&media_type=image`);
        const data = await res.json();
        const items = data.collection.items;
        currentImages = items.map(item=>{
            return {
                title: item.data[0].title,
                href: item.links ? item.links[0].href : ""
            };
        });
        if(currentImages.length===0) gallery.innerHTML="<p>No images found.</p>";
        renderGallery(currentImages);
    }catch(err){
        gallery.innerHTML="<p>Error fetching images.</p>";
        console.error(err);
    }finally{ showLoading(false); }
}

function openModal(index){
    currentModalImage = currentImages[index];
    modalImg.src = currentModalImage.href;
    modalTitle.textContent = currentModalImage.title;
    modal.classList.remove("hidden");
}
function closeModal(){ modal.classList.add("hidden"); currentModalImage=null; }
closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", e=>{ if(e.target===modal) closeModal(); });

favoriteBtn.addEventListener("click", ()=>{
    if(currentModalImage && !favorites.find(f=>f.href===currentModalImage.href)){
        favorites.unshift(currentModalImage);
        localStorage.setItem("nasa_favorites", JSON.stringify(favorites));
        renderFavorites();
    }
});

searchBtn.addEventListener("click", ()=> {
    const query = searchInput.value.trim();
    if(query) fetchImages(query);
});
searchInput.addEventListener("keydown", e=>{
    if(e.key==="Enter"){ const query=searchInput.value.trim(); if(query) fetchImages(query);}
});

window.addEventListener("load", ()=>{
    renderFavorites();
    fetchImages("space");
});
