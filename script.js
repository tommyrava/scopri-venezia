// Dichiarazioni globali per fermate, linee e orari
let fermate = [];
let linee = [];
let orari = [];
let percorsi = [];
let tuttiIMarkers = [];

function initMap() {
  const venezia = [45.4375, 12.3358];
  const map = L.map("map").setView(venezia, 13);
  window.myMap = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  L.marker(venezia).addTo(map).bindPopup("Venezia!").openPopup();
}

function caricaGTFS(file) {
  const zip = new JSZip();

  zip.loadAsync(file).then(function (contenutoZip) {
    contenutoZip.forEach(function (nomeFile, file) {
      if (nomeFile.endsWith('.txt')) {
        file.async('string').then(function (contenutoCSV) {
          const datiCSV = Papa.parse(contenutoCSV, {
            header: true,
            skipEmptyLines: true,
          });

          elaboraDatiGTFS(nomeFile, datiCSV.data);
        });
      }
    });
  });
}

function elaboraDatiGTFS(nomeFile, dati) {
  switch (nomeFile) {
    case 'stops.txt':
      fermate = dati;
      console.log("Fermate:", fermate);
      break;
    case 'routes.txt':
      linee = dati;
      console.log("Linee:", linee);
      break;
    case 'stop_times.txt':
      orari = dati;
      console.log("Orari:", orari);
      break;
    case 'trips.txt':
      percorsi = dati;
      console.log("Percorsi:", percorsi);
      break;
    default:
      console.log("File non gestito:", nomeFile);
  }
}

function aggiungiMarkerLuoghi() {
  const map = window.myMap;
  if (!map) return;

  if (window.markersLayer) {
    map.removeLayer(window.markersLayer);
  }

  const luoghi = [...cibo, ...musei, ...negozi];
  const layerGroup = L.layerGroup();
  window.tuttiIMarkers = [];  // Resetta i marker

  luoghi.forEach(l => {
    if (l.lat && l.lng) {
      const marker = L.marker([l.lat, l.lng]).bindPopup(`<b>${l.nome}</b><br>${l.descrizione}`);
      
      // Assegna i dati al marker per filtri e ricerca
      marker.nome = l.nome.toLowerCase();         // Per la ricerca
      marker.categoria = l.categoria || section;  // Se manca, usa la sezione (cibo, musei, ecc.)
      
      layerGroup.addLayer(marker);
      window.tuttiIMarkers.push(marker);
    }
  });
  

  layerGroup.addTo(map);
  window.markersLayer = layerGroup;  // Memorizza il layer group
}

function filtraPerCategoria(categoria) {
  const map = window.myMap;
  if (!map || !window.tuttiIMarkers) return;

  window.tuttiIMarkers.forEach(marker => {
    if (categoria === "tutti" || marker.categoria === categoria) {
      marker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });
}

function showSection(section) {
  const content = document.getElementById("content");

  if (!content) {
    console.error("Elemento #content non trovato");
    return;
  }

  // Effetto fade-in
  content.classList.remove("fade-in");
  void content.offsetWidth; // Forza il reflow per riavviare l'animazione
  content.classList.add("fade-in");

  if (section === "home") {
    content.innerHTML = "";
    aggiungiMarkerLuoghi();
    localizzaUtente();
    setSelectedTab("home");
    return;
  }

  if (section === "trasporti") {
    let html = `<h2>Orari ACTV / Alilaguna</h2><p>Scegli un imbarcadero:</p>`;
    html += trasporti.map((t, i) =>
      `<button onclick="mostraDestinazioni(${i})">${t.imbarcadero}</button>`
    ).join("");
    content.innerHTML = html;
    setSelectedTab("trasporti");
    return;
  }

  // Sezioni: cibo, musei, negozi
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
  setSelectedTab(section);
}

function mostraDestinazioni(index) {
  const imbarcadero = trasporti[index];
  const content = document.getElementById("content");

  // Iniziamo la visualizzazione delle destinazioni dell'imbarcadero
  let html = `<h2>${imbarcadero.imbarcadero}</h2>`;
  html += `<p>Seleziona una linea:</p>`;

  // Mostra tutte le destinazioni per l'imbarcadero selezionato
  html += imbarcadero.destinazioni.map(d => `
    <p>Linea ${d.linea} – <a href="${d.orari}" target="_blank">Visualizza Orari</a></p>
  `).join("");

  // Aggiungi un pulsante per tornare alla lista degli imbarcaderi
  html += `<button onclick="showSection('trasporti')">← Torna agli imbarcaderi</button>`;

  content.innerHTML = html;
}



window.onload = function () {
  initMap();
  setTimeout(() => {
    showSection("home");
  }, 100);
};

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  if (input) {
    input.addEventListener("input", function (e) {
      const val = e.target.value.toLowerCase();
      tuttiIMarkers.forEach(marker => {
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
