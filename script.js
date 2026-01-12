/*****************
 * DATA
 *****************/
const TOTAL_COUNTRIES = 195;

const DATA = {
  Turkey: {
    coords: [39, 35],
    cities: ["Istanbul", "Ankara", "Izmir", "Antalya"]
  },
  Germany: {
    coords: [51, 10],
    cities: ["Berlin", "Munich", "Hamburg"]
  },
  France: {
    coords: [46, 2],
    cities: ["Paris", "Lyon", "Marseille"]
  },
  Italy: {
    coords: [42, 12],
    cities: ["Rome", "Milan", "Florence"]
  }
};

/*****************
 * ELEMENTS
 *****************/
const countryList = document.getElementById("countryList");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const stats = document.getElementById("stats");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

const detailPanel = document.getElementById("detailPanel");
const detailCountry = document.getElementById("detailCountry");
const detailStats = document.getElementById("detailStats");
const detailProgress = document.getElementById("detailProgress");
const cityList = document.getElementById("cityList");
const closePanelBtn = document.getElementById("closePanel");

/*****************
 * STATE
 *****************/
let travelData =
  JSON.parse(localStorage.getItem("travelData")) || {};

/*****************
 * MAP
 *****************/
const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let markers = [];

/*****************
 * RENDER COUNTRIES
 *****************/
Object.keys(DATA).forEach(country => {
  const div = document.createElement("div");
  div.className = "country";

  div.innerHTML = `
    <h3>${country}</h3>
    <div class="cities">
      ${DATA[country].cities
        .map(
          city => `
        <label>
          <input type="checkbox" value="${city}">
          ${city}
        </label>
      `
        )
        .join("")}
    </div>
  `;

  const citiesDiv = div.querySelector(".cities");

  div.querySelector("h3").onclick = () => {
    citiesDiv.style.display =
      citiesDiv.style.display === "block" ? "none" : "block";
  };

  countryList.appendChild(div);
});

/*****************
 * LOAD SAVED
 *****************/
Object.keys(travelData).forEach(country => {
  const countryDiv = [...document.querySelectorAll(".country")]
    .find(c => c.querySelector("h3").innerText === country);

  if (!countryDiv) return;

  countryDiv.querySelector(".cities").style.display = "block";

  countryDiv.querySelectorAll("input").forEach(i => {
    if (travelData[country].includes(i.value)) i.checked = true;
  });

  addMarker(country);
});

updateStats();

/*****************
 * SAVE
 *****************/
saveBtn.onclick = () => {
  travelData = {};
  clearMarkers();
  closeDetailPanel();

  document.querySelectorAll(".country").forEach(c => {
    const country = c.querySelector("h3").innerText;
    const selected = [...c.querySelectorAll("input:checked")].map(
      i => i.value
    );

    if (selected.length > 0) {
      travelData[country] = selected;
      addMarker(country);
    }
  });

  localStorage.setItem("travelData", JSON.stringify(travelData));
  updateStats();
};

/*****************
 * CLEAR
 *****************/
clearBtn.onclick = () => {
  if (!confirm("Tüm veriler silinsin mi?")) return;

  travelData = {};
  localStorage.removeItem("travelData");
  document
    .querySelectorAll("input[type=checkbox]")
    .forEach(i => (i.checked = false));

  clearMarkers();
  updateStats();
  closeDetailPanel();
};

/*****************
 * SEARCH
 *****************/
searchInput.oninput = e => {
  const value = e.target.value.toLowerCase();

  document.querySelectorAll(".country").forEach(c => {
    const name = c.querySelector("h3").innerText.toLowerCase();
    c.style.display = name.includes(value) ? "block" : "none";
  });
};

/*****************
 * MARKERS
 *****************/
function addMarker(country) {
  const { coords, cities } = DATA[country];
  const visited = travelData[country];
  const percent = Math.round((visited.length / cities.length) * 100);

  const marker = L.marker(coords).addTo(map);

  marker.onclick = () => {
    map.setView(coords, 5);
    openDetailPanel(country, visited, cities, percent);
  };

  markers.push(marker);
}

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

/*****************
 * DETAIL PANEL
 *****************/
function openDetailPanel(country, visited, all, percent) {
  detailPanel.classList.remove("hidden");
  detailPanel.classList.add("show");

  detailCountry.innerText = country;
  detailStats.innerText = `${visited.length} / ${all.length} şehir • %${percent}`;
  detailProgress.style.width = percent + "%";

  cityList.innerHTML = "";
  all.forEach(city => {
    const li = document.createElement("li");
    li.innerText = visited.includes(city)
      ? `✅ ${city}`
      : `⬜ ${city}`;
    if (visited.includes(city)) li.classList.add("visited");
    cityList.appendChild(li);
  });
}

function closeDetailPanel() {
  detailPanel.classList.remove("show");
  setTimeout(() => detailPanel.classList.add("hidden"), 300);
}

closePanelBtn.onclick = closeDetailPanel;

/*****************
 * STATS
 *****************/
function updateStats() {
  const count = Object.keys(travelData).length;
  const percent = ((count / TOTAL_COUNTRIES) * 100).toFixed(1);
  stats.innerText = `${count} / ${TOTAL_COUNTRIES} ülke • %${percent}`;
}

/*****************
 * THEME
 *****************/
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
  themeToggle.innerText = "☀️";
}

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeToggle.innerText = isLight ? "☀️" : "🌙";
  localStorage.setItem("theme", isLight ? "light" : "dark");
};
