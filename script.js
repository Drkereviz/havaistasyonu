import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyChZKRhqzrclXg_5MK-3bnEQDPkp84H8bo",
  authDomain: "hava-c22fd.firebaseapp.com",
  databaseURL: "https://hava-c22fd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hava-c22fd",
  storageBucket: "hava-c22fd.appspot.com",
  messagingSenderId: "289579205570",
  appId: "1:289579205570:web:24e4f3d8df7a7d8dfb4c5b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, "/data");

const tempData = {
  labels: [],
  datasets: [{
    label: "Sıcaklık (°C)",
    data: [],
    fill: true,
    borderColor: "#ff5722",
    backgroundColor: "rgba(255,87,34,0.1)",
    tension: 0.3
  }]
};

const tempChart = new Chart(document.getElementById("tempChart"), {
  type: "line",
  data: tempData,
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: { display: true },
      y: { beginAtZero: true }
    }
  }
});

onValue(dataRef, (snapshot) => {
  const rawData = snapshot.val();
  if (!rawData) return;

  const parsed = Object.entries(rawData).map(([key, value]) => value);
  parsed.sort((a, b) => a.timestamp - b.timestamp);
  const recent = parsed.slice(-12);  // son 12 veri

  const last = recent[recent.length - 1];

  updateAnimatedValue("temp", last.temperature + " °C");
  updateAnimatedValue("hum", last.humidity + " %");
  updateAnimatedValue("pres", last.pressure + " hPa");
  updateAnimatedValue("yorum", last.yorum ?? "-");

  tempData.labels = recent.map(d => new Date(d.timestamp).toLocaleTimeString());
  tempData.datasets[0].data = recent.map(d => d.temperature);
  tempChart.update();
});

function updateAnimatedValue(id, value) {
  const el = document.getElementById(id);
  el.classList.remove("show");
  setTimeout(() => {
    el.innerText = value;
    el.classList.add("show");
  }, 100);
}
