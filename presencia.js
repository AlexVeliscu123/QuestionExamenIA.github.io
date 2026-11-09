// Contador de personas en línea (Firebase Realtime Database).
// Cada pestaña abierta guarda SOLO su estado ("menu", "teoria" o "clasif"), sin datos personales,
// y se borra sola al cerrar la pestaña. Las claves de Firebase para web son públicas por diseño;
// lo que protege los datos son las reglas de la base de datos.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAF1vUEsuYQzJ7GKepZMw12mAuzkFq2yhA",
  authDomain: "test-ia-3c85d.firebaseapp.com",
  databaseURL: "https://test-ia-3c85d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "test-ia-3c85d",
  storageBucket: "test-ia-3c85d.firebasestorage.app",
  messagingSenderId: "736647472975",
  appId: "1:736647472975:web:669700a0399aa54b6ac73a"
};

const box = document.getElementById("online");
const totalEl = document.getElementById("online-total");
const detailEl = document.getElementById("online-detail");

function pintar(counts, total) {
  totalEl.textContent = `${total} en línea`;
  const partes = [];
  if (counts.teoria) partes.push(`${counts.teoria} en el test teórico`);
  if (counts.clasif) partes.push(`${counts.clasif} en la práctica`);
  if (counts.menu) partes.push(`${counts.menu} en el menú`);
  detailEl.textContent = partes.join(" · ");
  box.classList.remove("hidden");
}

// En móvil (sin ratón) el desglose se abre y se cierra pulsando sobre el contador
box.addEventListener("click", () => box.classList.toggle("open"));

try {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const miRef = push(ref(db, "presencia"));
  let estado = window.__estado || "menu";

  const publicar = () => set(miRef, { estado }).catch(() => {});

  // Cada vez que (re)conecta: programa el borrado automático y publica el estado
  onValue(ref(db, ".info/connected"), (snap) => {
    if (snap.val() === true) {
      onDisconnect(miRef).remove().then(publicar).catch(() => {});
    }
  });

  // script.js avisa cuando cambias de pantalla
  window.addEventListener("estado-test", (e) => {
    estado = e.detail;
    publicar();
  });

  // Lista en vivo de personas conectadas
  onValue(
    ref(db, "presencia"),
    (snap) => {
      const counts = { menu: 0, teoria: 0, clasif: 0 };
      let total = 0;
      snap.forEach((hijo) => {
        total++;
        const e = hijo.val() && hijo.val().estado;
        if (e in counts) counts[e]++;
      });
      pintar(counts, total);
    },
    () => box.classList.add("hidden")
  );
} catch (e) {
  box.classList.add("hidden");
}
