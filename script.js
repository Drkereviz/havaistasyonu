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
const havaRef = ref(db, "/hava");

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
      x: { display: false },
      y: { beginAtZero: true }
    }
  }
});

onValue(havaRef, (snapshot) => {
  const data = snapshot.val();

  updateAnimatedValue("temp", data.sicaklik + " °C");
  updateAnimatedValue("hum", data.nem + " %");
  updateAnimatedValue("pres", data.basinc + " hPa");
  updateAnimatedValue("yorum", data.yorum);

  const time = new Date().toLocaleTimeString();
  tempData.labels.push(time);
  tempData.datasets[0].data.push(data.sicaklik);
  if (tempData.labels.length > 12) {
    tempData.labels.shift();
    tempData.datasets[0].data.shift();
  }
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
