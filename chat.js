// Mini chat en vivo (Firebase Realtime Database), abajo a la derecha.
// Guarda en "chat" los últimos mensajes: nombre, texto y hora. Sin cuentas ni datos personales.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, push, remove, get, onValue, onChildAdded, onChildRemoved, query, limitToLast, orderByChild, endAt, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAF1vUEsuYQzJ7GKepZMw12mAuzkFq2yhA",
  authDomain: "test-ia-3c85d.firebaseapp.com",
  databaseURL: "https://test-ia-3c85d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "test-ia-3c85d",
  storageBucket: "test-ia-3c85d.firebasestorage.app",
  messagingSenderId: "736647472975",
  appId: "1:736647472975:web:669700a0399aa54b6ac73a"
};

const $ = (id) => document.getElementById(id);
const panel = $("chat-panel");
const fab = $("chat-fab");
const list = $("chat-list");
const form = $("chat-form");
const input = $("chat-input");
const nameInput = $("chat-name");
const badge = $("chat-badge");

const NAME_KEY = "test-ia-chat-nombre";
const MAX_MSG = 200;
const MAX_NAME = 20;
const VIDA_MS = 12 * 60 * 60 * 1000; // los mensajes duran 12 horas
const REVISAR_CADA_MS = 30 * 60 * 1000; // limpieza cada 30 min mientras la web está abierta
let desfase = 0; // diferencia entre el reloj del servidor y el de este dispositivo
const ahoraServidor = () => Date.now() + desfase;
const elementos = {}; // clave del mensaje -> elemento en pantalla
let abierto = false;
let sinLeer = 0;
let ultimoEnvio = 0;
let cargaInicial = true;

// Nombre guardado o uno aleatorio
let nombre = "";
try { nombre = localStorage.getItem(NAME_KEY) || ""; } catch (e) {}
if (!nombre) nombre = "Anónimo" + Math.floor(1000 + Math.random() * 9000);
nameInput.value = nombre;
nameInput.maxLength = MAX_NAME;
input.maxLength = MAX_MSG;

nameInput.addEventListener("change", () => {
  nombre = nameInput.value.trim().slice(0, MAX_NAME) || "Anónimo" + Math.floor(1000 + Math.random() * 9000);
  nameInput.value = nombre;
  try { localStorage.setItem(NAME_KEY, nombre); } catch (e) {}
});

function setBadge() {
  badge.textContent = sinLeer > 9 ? "9+" : String(sinLeer);
  badge.classList.toggle("hidden", sinLeer === 0);
}

function toggle(force) {
  abierto = typeof force === "boolean" ? force : !abierto;
  panel.classList.toggle("hidden", !abierto);
  if (abierto) {
    sinLeer = 0;
    setBadge();
    list.scrollTop = list.scrollHeight;
    input.focus();
  }
}
fab.addEventListener("click", () => toggle());

// Solo se muestra en el menú de inicio (script.js avisa al cambiar de pantalla)
function ajustarPantalla(estado) {
  const fuera = estado !== "menu";
  fab.classList.toggle("away", fuera);
  panel.classList.toggle("away", fuera);
  const online = $("online");
  if (online) online.classList.toggle("away", fuera);
}
window.addEventListener("estado-test", (e) => ajustarPantalla(e.detail));
ajustarPantalla(window.__estado || "menu");
$("chat-close").addEventListener("click", () => toggle(false));

function hora(ts) {
  const d = new Date(ts || Date.now());
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function pintarMensaje(key, m) {
  const cerca = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  const div = document.createElement("div");
  div.className = "chat-msg" + (m.n === nombre ? " mine" : "");
  const head = document.createElement("div");
  head.className = "chat-meta";
  head.textContent = `${m.n} · ${hora(m.ts)}`;
  const body = document.createElement("div");
  body.className = "chat-text";
  body.textContent = m.t; // textContent: nunca se interpreta como HTML
  div.append(head, body);
  elementos[key] = div;
  list.appendChild(div);
  while (list.children.length > 80) list.removeChild(list.firstChild);
  if (cerca || m.n === nombre) list.scrollTop = list.scrollHeight;
}

try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const chatRef = ref(db, "chat");

  onChildAdded(query(chatRef, limitToLast(50)), (snap) => {
    const m = snap.val();
    if (!m || typeof m.t !== "string" || typeof m.n !== "string") return;
    if (typeof m.ts === "number" && m.ts < ahoraServidor() - VIDA_MS) return; // ya caducado
    pintarMensaje(snap.key, m);
    if (!abierto && !cargaInicial) {
      sinLeer++;
      setBadge();
    }
  });
  // Si se borra un mensaje (limpieza), desaparece también de la pantalla
  onChildRemoved(chatRef, (snap) => {
    const el = elementos[snap.key];
    if (el) { el.remove(); delete elementos[snap.key]; }
  });

  // Limpieza automática: borra los mensajes de más de 12 horas
  async function limpiar() {
    try {
      const limite = ahoraServidor() - VIDA_MS;
      const viejos = await get(query(chatRef, orderByChild("ts"), endAt(limite)));
      viejos.forEach((hijo) => { remove(hijo.ref).catch(() => {}); });
    } catch (e) { /* sin permisos o sin conexión: se ignora */ }
  }
  onValue(ref(db, ".info/serverTimeOffset"), (s) => {
    desfase = s.val() || 0;
    limpiar();
  });
  setInterval(limpiar, REVISAR_CADA_MS);

  // Pasado un momento, lo que llegue ya cuenta como "nuevo"
  setTimeout(() => { cargaInicial = false; }, 2500);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = input.value.trim().slice(0, MAX_MSG);
    if (!texto) return;
    const ahora = Date.now();
    if (ahora - ultimoEnvio < 2000) return; // anti-spam: 1 mensaje cada 2 s
    ultimoEnvio = ahora;
    push(chatRef, { n: nombre, t: texto, ts: serverTimestamp() }).catch(() => {});
    input.value = "";
  });

  fab.classList.remove("hidden");
} catch (e) {
  fab.classList.add("hidden");
}
