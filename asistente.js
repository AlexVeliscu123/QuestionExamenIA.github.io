// Mini asistente "mini Google": responde preguntas cortas SOLO sobre el contenido de los tests.
// No usa internet ni IA externa: busca en un glosario y en las preguntas del test (questions.js).
(function () {
  const $ = (id) => document.getElementById(id);
  const fab = $("ay-fab");
  const panel = $("ay-panel");
  const list = $("ay-list");
  const form = $("ay-form");
  const input = $("ay-input");
  if (!fab || !panel) return;

  const norm = (s) =>
    String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  const NO_AYUDO = "Con eso no te puedo ayudar 😅 Solo respondo sobre los tests de IA: AutoML, tipos de aprendizaje, CNN, RNN, Transformers…";

  // k = palabras clave (sin tildes, en minúsculas) · r = respuesta corta
  const GLOSARIO = [
    { k: ["hola", "buenas", "hey", "buenos dias", "buenas tardes", "que tal"], r: "¡Hola! 👋 Pregúntame algo de los tests. Por ejemplo: ¿Qué es AutoML?" },
    { k: ["gracias", "vale gracias"], r: "¡De nada! 😊" },
    { k: ["automl", "auto ml"], r: "AutoML automatiza parte del trabajo necesario para crear modelos de IA." },
    { k: ["transferencia", "transfer learning"], r: "Aprovechar un modelo que ya ha aprendido y adaptarlo a una tarea nueva." },
    { k: ["preentrenado", "pre entrenado", "preentrenamiento"], r: "Es un modelo que ya ha sido entrenado antes con muchos datos." },
    { k: ["supervisado", "aprendizaje supervisado"], r: "Aprende con datos etiquetados (que ya traen la respuesta)." },
    { k: ["no supervisado", "aprendizaje no supervisado"], r: "Busca grupos o patrones en datos sin etiquetar, sin respuestas previas." },
    { k: ["semisupervisado", "semi supervisado"], r: "Usa datos etiquetados y sin etiquetar a la vez: los que conoce ayudan a clasificar los que no." },
    { k: ["aprendizaje por refuerzo", "refuerzo", "recompensa", "penalizacion", "feedback", "ensayo y error"], r: "Aprende por ensayo y error: recibe recompensa si lo hace bien y penalización si lo hace mal." },
    { k: ["metodo de refuerzo", "boosting", "metodo de boosting"], r: "Los modelos trabajan uno detrás de otro y cada nuevo modelo corrige los errores del anterior." },
    { k: ["aprendizaje en conjunto", "en conjunto", "ensemble"], r: "Usa varios modelos de IA a la vez para conseguir una predicción mejor que con uno solo." },
    { k: ["promediacion", "promediar", "media de las predicciones", "promedio"], r: "Se hace una media de las predicciones de varios modelos. Así se reduce el riesgo de error de un solo modelo." },
    { k: ["clasificacion", "regresion"], r: "Clasificación predice una categoría. Regresión predice un número." },
    { k: ["modelo generativo", "generativo"], r: "Aprende cómo suelen ser los diferentes grupos. Con un dato nuevo, lo compara con ellos para ver a cuál se parece más." },
    { k: ["metaaprendizaje", "meta aprendizaje", "meta learning"], r: "Una IA que ayuda a mejorar o entrenar otra IA (una IA de alto nivel optimiza una de nivel inferior)." },
    { k: ["heuristic"], r: "Una regla práctica para decidir rápido. No tiene que ser perfecto." },
    { k: ["red neuronal", "redes neuronales", "neurona"], r: "Una red de capas (entrada, ocultas y salida) que procesa información para dar una respuesta." },
    { k: ["capa de entrada", "entrada"], r: "La capa de entrada recibe la información." },
    { k: ["capas ocultas", "capa oculta", "ocultas"], r: "Procesan la información y buscan patrones." },
    { k: ["capa de salida", "salida"], r: "La capa de salida ofrece la respuesta final." },
    { k: ["dropout", "abandono"], r: "La capa de abandono (dropout) desactiva algunas unidades de forma aleatoria." },
    { k: ["capa convolucional", "convolucional", "convolucion", "filtros"], r: "Usa filtros para extraer características como bordes, formas y colores." },
    { k: ["cnn", "redes neuronales convolucionales", "red neuronal convolucional"], r: "Redes que se usan sobre todo para analizar imágenes." },
    { k: ["capas de una cnn", "capas de la cnn", "capas tiene una cnn", "capas cnn", "que capas tiene"], r: "Entrada, convolucional, agrupamiento, activación, completamente conectada, abandono (dropout) y salida." },
    { k: ["rnn", "redes neuronales recurrentes", "red neuronal recurrente", "recurrente"], r: "Trabajan con información donde importa el orden, como palabras o audio." },
    { k: ["transformers", "transformer"], r: "Procesan lenguaje natural: traducen, responden preguntas, resumen documentos y generan respuestas." },
    { k: ["diferenciar", "distinguir", "tipos de aprendizaje", "tipo de aprendizaje", "como se que tipo", "supervisado y no supervisado", "supervisado vs", "trucos"], r: "Con respuestas → supervisado. Grupos sin definir → no supervisado. Pocas etiquetas y muchas sin ellas → semisupervisado. Recompensas → refuerzo. Varios modelos combinados → en conjunto." }
  ];

  const STOP = new Set(["que", "como", "para", "cual", "cuales", "sobre", "esta", "este", "esto", "tipo", "datos", "modelo", "modelos", "inteligencia", "artificial", "test", "tests", "pregunta", "explica", "explicame", "dime", "significa", "quiere", "decir", "hace", "sirve", "puede", "tiene", "entre", "cuando", "donde", "porque"]);

  function respuestaGlosario(q) {
    const n = " " + norm(q) + " ";
    let mejor = null, mejorScore = 0;
    GLOSARIO.forEach((e) => {
      let s = 0;
      e.k.forEach((k) => {
        const ok = k.length <= 4 ? n.includes(" " + k + " ") : n.includes(k);
        if (ok && k.length > s) s = k.length;
      });
      if (s > mejorScore) { mejorScore = s; mejor = e; }
    });
    return mejor ? mejor.r : null;
  }

  // Plan B: busca la pregunta del test teórico que más se parezca y da su respuesta correcta
  function respuestaPreguntas(q) {
    if (typeof QUESTIONS === "undefined") return null;
    const tokens = norm(q).split(" ").filter((w) => w.length >= 4 && !STOP.has(w));
    if (tokens.length < 2) return null;
    let mejor = null, mejorScore = 0;
    QUESTIONS.forEach((item) => {
      if (item.t && item.t !== "teoria") return;
      const texto = norm(item.q + " " + item.o[item.a]);
      const s = tokens.filter((w) => texto.includes(w)).length;
      if (s > mejorScore) { mejorScore = s; mejor = item; }
    });
    if (mejor && mejorScore >= 2 && mejorScore >= Math.ceil(tokens.length / 2)) return mejor.o[mejor.a];
    return null;
  }

  function responder(q) {
    return respuestaGlosario(q) || respuestaPreguntas(q) || NO_AYUDO;
  }

  function burbuja(texto, mio) {
    const div = document.createElement("div");
    div.className = "chat-msg" + (mio ? " mine" : "");
    const t = document.createElement("div");
    t.className = "chat-text";
    t.textContent = texto;
    div.appendChild(t);
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  function preguntar(texto) {
    const q = texto.trim().slice(0, 120);
    if (!q) return;
    burbuja(q, true);
    setTimeout(() => burbuja(responder(q), false), 250);
  }

  // Mensaje de bienvenida con sugerencias
  burbuja("¡Hola! Soy tu mini buscador de los tests 🔍 Respondo corto y solo sobre los tests de IA.", false);
  const chips = document.createElement("div");
  chips.className = "ay-chips";
  ["¿Qué es AutoML?", "¿Qué hace una CNN?", "¿Y las RNN?", "¿Cómo distingo los tipos?"].forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ay-chip";
    b.textContent = t;
    b.addEventListener("click", () => preguntar(t));
    chips.appendChild(b);
  });
  list.appendChild(chips);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    preguntar(input.value);
    input.value = "";
  });

  function toggle(force) {
    const abrir = typeof force === "boolean" ? force : panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !abrir);
    if (abrir) {
      // Si el chat de la derecha está abierto, se cierra para que no se solapen
      const chat = $("chat-panel");
      if (chat && !chat.classList.contains("hidden") && $("chat-close")) $("chat-close").click();
      list.scrollTop = list.scrollHeight;
      input.focus();
    }
  }
  fab.addEventListener("click", () => toggle());
  $("ay-close").addEventListener("click", () => toggle(false));
  const chatFab = $("chat-fab");
  if (chatFab) chatFab.addEventListener("click", () => toggle(false));

  // Solo se muestra en el menú de inicio
  function ajustar(estado) {
    const fuera = estado !== "menu";
    fab.classList.toggle("away", fuera);
    panel.classList.toggle("away", fuera);
  }
  window.addEventListener("estado-test", (e) => ajustar(e.detail));
  ajustar(window.__estado || "menu");
})();
