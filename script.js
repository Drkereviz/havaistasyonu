import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
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

const chartConfig = (label, borderColor, bgColor) => ({
  label,
  data: [],
  fill: true,
  borderColor,
  backgroundColor: bgColor,
  tension: 0.3
});

const chartData = {
  labels: [],
  datasets: [
    chartConfig("Sıcaklık (°C)", "#ff5722", "rgba(255,87,34,0.1)"),
    chartConfig("Nem (%)", "#2196f3", "rgba(33,150,243,0.1)"),
    chartConfig("Basınç (hPa)", "#4caf50", "rgba(76,175,80,0.1)")
  ]
};

const chartOptions = {
  responsive: true,
  animation: {
    duration: 1000,
    easing: "easeOutBounce"
  },
  scales: {
    x: { display: true },
    y: { beginAtZero: false }
  }
};

const chart = new Chart(document.getElementById("tempChart"), {
  type: "line",
  data: chartData,
  options: chartOptions
});

onValue(dataRef, (snapshot) => {
  const rawData = snapshot.val();
  if (!rawData) return;

  const parsed = Object.entries(rawData).map(([key, value]) => value);
  parsed.sort((a, b) => a.timestamp - b.timestamp);
  const recent = parsed.slice(-50);  // son 50 veri

  const last = recent[recent.length - 1];

  updateAnimatedValue("temp", last.temperature + " °C");
  updateAnimatedValue("hum", last.humidity + " %");
  updateAnimatedValue("pres", last.pressure + " hPa");
  updateAnimatedValue("yorum", last.yorum ?? "-");

  chartData.labels = recent.map(d => new Date(d.timestamp).toLocaleTimeString());
  chartData.datasets[0].data = recent.map(d => d.temperature);
  chartData.datasets[1].data = recent.map(d => d.humidity);
  chartData.datasets[2].data = recent.map(d => d.pressure);
  chart.update();
});

function updateAnimatedValue(id, value) {
  const el = document.getElementById(id);
  el.classList.remove("show");
  setTimeout(() => {
    el.innerText = value;
    el.classList.add("show");
  }, 100);
}


function setTimeTheme() {
  const hour = new Date().getHours();
  const body = document.body;
  if (hour >= 5 && hour < 10) body.className = "morning";
  else if (hour >= 10 && hour < 17) body.className = "day";
  else if (hour >= 17 && hour < 20) body.className = "evening";
  else body.className = "night";
}
setTimeTheme();

function applyWeatherTheme(comment) {
  const body = document.body;
  const icon = document.getElementById("weather-icon");

  let emoji = "🌤️"; // default icon
  let theme = "day";

  if (!comment) return;

  if (comment.includes("Yağış")) {
    emoji = "🌧️";
    theme = "evening";
    playAlertSound();
  } else if (comment.includes("Düşük basınç")) {
    emoji = "🌪️";
    theme = "night";
    playAlertSound();
  } else if (comment.includes("Sıcak")) {
    emoji = "🔥";
    theme = "day";
  } else if (comment.includes("sakin")) {
    emoji = "🌤️";
    theme = "morning";
  } else {
    emoji = "🌡️";
    theme = "day";
  }

  if (icon) icon.innerText = emoji;
  body.className = theme;
}

function playAlertSound() {
  const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_351fbbae7d.mp3?filename=warning-1-46134.mp3");
  audio.play();
}
// LED durumunu değiştir (Firebase'e yazar)
function setLED(state) {
  const ledRef = ref(db, "/led");
  set(ledRef, state)
    .then(() => {
      console.log("LED durumu güncellendi:", state);
    })
    .catch((error) => {
      console.error("LED durumu güncellenemedi:", error);
    });
}

