const API_KEY = "at_OKlMJqIFULFI65skWgk1JRphNDBlj"; 

const ipInput = document.getElementById("ipInput");
const searchBtn = document.getElementById("searchBtn");
const loadingEl = document.getElementById("loading");
const ipInfo = document.getElementById("ipInfo");
const flagImg = document.getElementById("flag");
const countryFull = document.getElementById("countryFull");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");


const map = L.map("map").setView([0,0],2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
let markers = [];

const STORAGE_KEY = "ip_tracker_history_v2";


// History functions
function getHistory(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
function saveHistory(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
function addHistory(item){
    let hist = getHistory();
    if(!hist.find(x=>x.query===item.query)) hist.unshift(item);
    if(hist.length>30) hist.pop();
    saveHistory(hist);
    renderHistory();
}
function renderHistory(){
    const hist = getHistory();
    historyList.innerHTML="";
    if(hist.length===0){ historyList.innerHTML="<li>No history yet</li>"; return; }
    hist.forEach(it=>{
        const li=document.createElement("li");
        li.textContent = it.query + " • " + it.ip;
        li.addEventListener("click", ()=> fetchIP(it.query));
        historyList.appendChild(li);
    });
}
clearHistoryBtn.addEventListener("click", ()=>{
    if(confirm("Clear history?")){ localStorage.removeItem(STORAGE_KEY); renderHistory(); }
});


function showLoading(show){ loadingEl.classList.toggle("hidden", !show); }


async function fetchIP(query){
    showLoading(true);
    let url = `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}`;
    if(query) url += `&ipAddress=${query}`;
    try{
        const res = await fetch(url);
        const data = await res.json();

        // Display info
        ipInfo.innerHTML = `
            <p><strong>IP:</strong> ${data.ip}</p>
            <p><strong>Country:</strong> ${data.location.country}</p>
            <p><strong>Region:</strong> ${data.location.region}</p>
            <p><strong>City:</strong> ${data.location.city}</p>
            <p><strong>Timezone:</strong> ${data.location.timezone}</p>
            <p><strong>ISP:</strong> ${data.isp}</p>
        `;

        if(data.location.country){
            flagImg.src=`https://flagcdn.com/w40/${data.location.country.toLowerCase()}.png`;
            flagImg.classList.remove("hidden");
            countryFull.textContent = data.location.country;
        } else { flagImg.classList.add("hidden"); countryFull.textContent=""; }

        
        const lat = data.location.lat || 0;
        const lng = data.location.lng || 0;
        map.setView([lat,lng],13);

        // Remove old markers if you want only latest, or keep all
        markers.forEach(m=>m.remove());
        markers = [];

        const customIcon = L.divIcon({className:"custom-marker", iconSize:[30,30], iconAnchor:[15,30]});
        const m = L.marker([lat,lng],{icon:customIcon})
                    .addTo(map)
                    .bindPopup(`<strong>${data.ip}</strong><br>${data.location.city}, ${data.location.region}<br>ISP: ${data.isp}`)
                    .openPopup();
        markers.push(m);

        addHistory({query: query || data.ip, ip:data.ip});

    } catch(err){
        alert("Error fetching IP data. Check API key or network.");
    } finally { showLoading(false); }
}


searchBtn.addEventListener("click", ()=> fetchIP(ipInput.value.trim()));
ipInput.addEventListener("keydown", e=>{ if(e.key==="Enter") fetchIP(ipInput.value.trim()); });


window.addEventListener("load", ()=>{
    renderHistory();
    fetchIP();
});
