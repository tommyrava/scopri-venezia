function initMap() {
  const venezia = [45.4375, 12.3358];
  const map = L.map("map").setView(venezia, 13);
  window.myMap = map;
  window.tuttiIMarkers = [];


  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  L.marker(venezia).addTo(map).bindPopup("Venezia!").openPopup();
}

function aggiungiMarkerLuoghi() {
  const map = window.myMap;
  if (!map) {
    console.error("Mappa non inizializzata");
    return;
  }

function filtraPerCategoria(categoria) {
  const map = window.myMap;
  if (!map || !window.tuttiIMarkers) return;
  
  window.tuttiIMarkers.forEach(marker => {
    if (marker.categoria === categoria) {
      marker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });
}  

  if (window.markersLayer) {
    map.removeLayer(window.markersLayer);
  }

  const luoghi = [...cibo, ...musei, ...negozi];
  const layerGroup = L.layerGroup();

  window.tuttiIMarkers = []; // reset
  luoghi.forEach(l => {
    if (l.lat && l.lng) {
      const marker = L.marker([l.lat, l.lng]).bindPopup(`<b>${l.nome}</b><br>${l.descrizione}`);
      marker.categoria = l.categoria || "generico";
      marker.nome = l.nome;
      layerGroup.addLayer(marker);
      window.tuttiIMarkers.push(marker);
    }
  });


  layerGroup.addTo(map);
  window.markersLayer = layerGroup;
}

function localizzaUtente() {
  if (!navigator.geolocation) {
    alert("Geolocalizzazione non supportata");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const userMarker = L.marker([lat, lng]).addTo(window.myMap);
    userMarker.bindPopup("Sei qui").openPopup();
    window.myMap.setView([lat, lng], 14);
  }, () => {
    alert("Impossibile ottenere la posizione");
  });
}

function showSection(section) {
  const content = document.getElementById("content");
  if (!content) return;

  if (section === "home") {
    content.innerHTML = ""; // niente testo!
    aggiungiMarkerLuoghi();
    localizzaUtente();
    return;
  }
  

  if (section === "trasporti") {
    let html = `<h2>Orari ACTV / Alilaguna</h2>`;
    html += `<p>Scegli un imbarcadero:</p>`;
    html += trasporti.map((t, i) => `
      <button onclick="mostraDestinazioni(${i})">${t.imbarcadero}</button>
    `).join("");
    content.innerHTML = html;
    return;
  }

  let lista = [];
  if (section === "cibo") lista = cibo;
  if (section === "musei") lista = musei;
  if (section === "negozi") lista = negozi;

  const html = lista.map((luogo, index) => `
    <div class="luogo" onclick="mostraDettagli('${section}', ${index})">
      <h3>${luogo.nome}</h3>
      <p>${luogo.descrizione}</p>
    </div>
  `).join("");

  content.innerHTML = html;
}

function mostraDettagli(sezione, index) {
  let luogo;
  if (sezione === "cibo") luogo = cibo[index];
  if (sezione === "musei") luogo = musei[index];
  if (sezione === "negozi") luogo = negozi[index];

  const content = document.getElementById("content");
  const immagini = luogo.immagini.map(img => `<img src="${img}" width="100%">`).join("");

  content.innerHTML = `
    <h2>${luogo.nome}</h2>
    <div>${immagini}</div>
    <p>${luogo.descrizione}</p>
    <p><strong>Orari:</strong> ${luogo.orari}</p>
    <p><strong>Telefono:</strong> ${luogo.telefono}</p>
    <p><a href="${luogo.sito}" target="_blank">Visita il sito</a></p>
    <button onclick="showSection('${sezione}')">← Torna indietro</button>
  `;
}

function mostraDestinazioni(index) {
  const imbarcadero = trasporti[index];
  const content = document.getElementById("content");

  let html = `<h2>${imbarcadero.imbarcadero}</h2>`;
  html += `<p>Seleziona una linea:</p>`;
  html += imbarcadero.destinazioni.map(d => `
    <p>Linea ${d.linea} – <a href="${d.orari}" target="_blank">Visualizza Orari</a></p>
  `).join("");
  html += `<button onclick="showSection('trasporti')">← Torna agli imbarcaderi</button>`;

  content.innerHTML = html;
}

window.onload = function () {
  initMap();
  setTimeout(() => {
    showSection("home");
  }, 100);
};

function setSelectedTab(section) {
  // Rimuovi la classe "selected" da tutti i tab
  const tabs = document.querySelectorAll('#tabs button');
  tabs.forEach(tab => tab.classList.remove('selected'));

  // Aggiungi la classe "selected" al tab corrispondente
  const selectedTab = document.querySelector(`#tabs button[onclick="showSection('${section}')"]`);
  if (selectedTab) {
    selectedTab.classList.add('selected');
  }
}

function showSection(section) {
  const content = document.getElementById("content");

  if (!content) {
    console.error("Elemento #content non trovato");
    return;
  }

  if (section === "home") {
    content.innerHTML = ""; // Nessun testo, solo mappa
    aggiungiMarkerLuoghi();
    localizzaUtente();
    setSelectedTab("home");
    return;
  }

  // Aggiungi altre sezioni (cibo, musei, etc.) qui

  let lista = [];
  if (section === "cibo") lista = cibo;
  if (section === "musei") lista = musei;
  if (section === "negozi") lista = negozi;

  if (section === "trasporti") {
    content.innerHTML = "<h2>Orari ACTV / Alilaguna</h2>";
    // ... (gestisci trasporti)
  }

  // Genera HTML per i luoghi
  const html = lista.map((luogo, index) => `
    <div class="luogo" onclick="mostraDettagli('${section}', ${index})">
      <h3>${luogo.nome}</h3>
      <p>${luogo.descrizione}</p>
    </div>
  `).join("");

  content.innerHTML = html;
  setSelectedTab(section); // Imposta il tab selezionato
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  if (input) {
    input.addEventListener("input", function (e) {
      const val = e.target.value.toLowerCase();
      window.tuttiIMarkers.forEach(marker => {
        const match = marker.nome.toLowerCase().includes(val) || marker.categoria.toLowerCase().includes(val);
        if (match) {
          marker.addTo(window.myMap);
        } else {
          window.myMap.removeLayer(marker);
        }
      });
    });
  }
});


