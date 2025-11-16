
const API_KEY = "02a9a0f0c1ab4ca297c73724731af3cd"; 
const newsContainer = document.getElementById("newsContainer");
const loader = document.getElementById("loader");
const categoryTabs = document.getElementById("categoryTabs");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const voiceBtn = document.getElementById("voiceBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const favPanel = document.getElementById("favPanel");
const favList = document.getElementById("favList");
const closeFav = document.getElementById("closeFav");

let page = 1;
const pageSize = 12;
let isLoading = false;
let lastQuery = "";
let lastCategory = "general";
let country = "us";
let favorites = JSON.parse(localStorage.getItem("nl_favs") || "[]");


const CATEGORIES = ["general","technology","business","sports","health","science","entertainment"];

function formatTime(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){return ""}
}
function saveFavs(){ localStorage.setItem("nl_favs", JSON.stringify(favorites)) }

function renderTabs(){
  categoryTabs.innerHTML = "";
  CATEGORIES.forEach(cat=>{
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.setAttribute("role","tab");
    btn.dataset.cat = cat;
    btn.setAttribute("aria-selected", cat===lastCategory ? "true" : "false");
    btn.addEventListener("click", async ()=>{
      lastCategory = cat;
      page = 1;
      setSelectedTab(cat);
      await loadNews(true);
    });
    categoryTabs.appendChild(btn);
  });
}
function setSelectedTab(cat){
  const tabs = categoryTabs.querySelectorAll(".tab");
  tabs.forEach(t=> t.setAttribute("aria-selected", t.dataset.cat===cat ? "true" : "false"));
}

function showSkeleton(count=6){
  newsContainer.innerHTML = "";
  for(let i=0;i<count;i++){
    const sk = document.createElement("div");
    sk.className = "skel-card";
    sk.innerHTML = `<div class="skel-media"></div><div class="skel-body"><div class="skel-line" style="width:70%"></div><div class="skel-line" style="width:95%"></div><div class="skel-line" style="width:50%"></div></div>`;
    newsContainer.appendChild(sk);
  }
}

function createCard(article){
  const tpl = document.getElementById("cardTemplate");
  const node = tpl.content.cloneNode(true);
  const articleEl = node.querySelector(".card");
  const img = node.querySelector(".thumb");
  const title = node.querySelector(".title");
  const desc = node.querySelector(".desc");
  const source = node.querySelector(".source");
  const time = node.querySelector(".time");
  const read = node.querySelector(".read-more");
  const saveBtn = node.querySelector(".save-btn");

  img.src = article.urlToImage || "";
  img.alt = article.title || "image";
  title.textContent = article.title || "Untitled";
  desc.textContent = article.description || "";
  source.textContent = article.source.name || "";
  time.textContent = formatTime(article.publishedAt);
  read.href = article.url || "#";

  const key = article.url;
  const isSaved = favorites.some(f=>f.url===key);
  saveBtn.textContent = isSaved ? "★" : "☆";
  saveBtn.addEventListener("click", ()=>{
    if (favorites.some(f=>f.url===key)){
      favorites = favorites.filter(f=>f.url!==key);
      saveBtn.textContent = "☆";
    } else {
      favorites.unshift(article);
      saveBtn.textContent = "★";
    }
    saveFavs();
  });

  return node;
}

function openFavorites(){
  favPanel.classList.remove("hidden");
  favPanel.setAttribute("aria-hidden","false");
  renderFavList();
}
function closeFavorites(){
  favPanel.classList.add("hidden");
  favPanel.setAttribute("aria-hidden","true");
}
function renderFavList(){
  favList.innerHTML = "";
  if (!favorites.length){
    favList.innerHTML = `<p style="padding:10px;color:var(--muted)">No favorites saved yet.</p>`;
    return;
  }
  favorites.forEach(a=>{
    const div = document.createElement("div");
    div.className = "fav-item";
    div.innerHTML = `<img src="${a.urlToImage||''}" alt=""><div style="flex:1"><strong>${a.title}</strong><div style="color:var(--muted);font-size:.9rem">${a.source.name||''}</div></div><div><button class="remove">Remove</button><a target="_blank" href="${a.url}">Open</a></div>`;
    div.querySelector(".remove").addEventListener("click", ()=>{
      favorites = favorites.filter(f=>f.url!==a.url);
      saveFavs();
      renderFavList();
    });
    favList.appendChild(div);
  });
}

async function fetchNews({q="",category=lastCategory,page=1,country="us"}){

  const pageSizeParam = pageSize;
  let url = "";
  if (q && q.length>0){
    const params = new URLSearchParams({q,language:"en",page,pageSize:pageSizeParam,apiKey:API_KEY});
    url = `https://newsapi.org/v2/everything?${params.toString()}`;
  } else {
    const params = new URLSearchParams({country,category,page,pageSize:pageSizeParam,apiKey:API_KEY});
    url = `https://newsapi.org/v2/top-headlines?${params.toString()}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("News API error");
  return await res.json();
}

async function loadNews(reset=false){
  if (isLoading) return;
  isLoading = true;
  loader.classList.remove("hidden");

  try{
    if (reset) { showSkeleton(6); newsContainer.scrollTop = 0; }
    const {articles} = await fetchNews({q:lastQuery,category:lastCategory,page,country});
    if (!articles || articles.length===0){
      if (reset) newsContainer.innerHTML = `<p style="padding:16px;color:var(--muted)">No articles found.</p>`;
      loader.classList.add("hidden");
      isLoading=false;
      return;
    }

    if (reset) newsContainer.innerHTML = "";
    const frag = document.createDocumentFragment();
    articles.forEach(a=>{
      const node = createCard(a);
      frag.appendChild(node);
    });
    newsContainer.appendChild(frag);

    page++;
  }catch(err){
    console.error(err);
    if (reset) newsContainer.innerHTML = `<p style="padding:16px;color:var(--muted)">Failed to load news.</p>`;
  }finally{
    loader.classList.add("hidden");
    isLoading=false;
  }
}

window.addEventListener("scroll", ()=>{
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
  if (nearBottom && !isLoading){
    loadNews(false);
  }
});

searchBtn.addEventListener("click", async ()=>{
  lastQuery = searchInput.value.trim();
  page = 1;
  await loadNews(true);
});

searchInput.addEventListener("keydown", async (e)=>{
  if (e.key === "Enter"){
    lastQuery = searchInput.value.trim();
    page = 1;
    await loadNews(true);
  }
});

themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "Light" : "Dark";
});

let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  voiceBtn.addEventListener('click', ()=>{
    recognition.start();
    voiceBtn.textContent = "🎙️...";
  });

  recognition.onresult = (e)=>{
    const transcript = e.results[0][0].transcript;
    searchInput.value = transcript;
    lastQuery = transcript;
    page = 1;
    loadNews(true);
    voiceBtn.textContent = "🎤";
  };
  recognition.onerror = (e)=>{ console.error(e); voiceBtn.textContent = "🎤"; };
} else {
  voiceBtn.title = "Voice search not supported on this browser";
  voiceBtn.disabled = true;
}

favoritesBtn.addEventListener('click', openFavorites);
document.getElementById('closeFav')?.addEventListener('click', closeFavorites);

renderTabs();
setSelectedTab(lastCategory);
loadNews(true);
renderFavList();
