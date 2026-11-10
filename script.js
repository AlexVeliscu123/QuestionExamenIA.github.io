(function () {
  const $ = (id) => document.getElementById(id);
  const LETTERS = ["A", "B", "C", "D"];
  const MODES = {
    teoria: { name: "Test teórico", badge: "📘 Test teórico", hint: "Atajos: A–D o 1–4 para responder · Enter para continuar" },
    clasif: { name: "Práctica: tipo de aprendizaje", badge: "🧪 Tipo de aprendizaje", hint: "Atajos: A–E o 1–5 para responder · Enter para continuar" }
  };

  // Tipo por defecto y numeración dentro de cada tipo
  const counters = { teoria: 0, clasif: 0 };
  QUESTIONS.forEach((item) => {
    item.t = item.t || "teoria";
    item.n = ++counters[item.t];
  });

  const screens = { start: $("start"), quiz: $("quiz"), result: $("result") };
  let mode = "teoria";
  let retrying = false;   // true cuando se repasan solo los fallos
  let order = [];         // índices de preguntas en el orden actual
  let current = 0;
  let answered = false;
  let givenAnswers = {};  // índice de pregunta -> opción elegida

  // ---------- Utilidades ----------
  function show(name) {
    Object.entries(screens).forEach(([k, el]) => el.classList.toggle("hidden", k !== name));
    window.scrollTo({ top: 0 });
    // Avisa al contador de personas en línea de dónde está esta persona
    const estado = name === "quiz" ? mode : "menu";
    $("prob").classList.toggle("away", estado !== "menu");
    window.__estado = estado;
    window.dispatchEvent(new CustomEvent("estado-test", { detail: estado }));
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const letterOf = (item, i) => (item.l ? item.l[i] : LETTERS[i]);
  const isOk = (qi) => givenAnswers[qi] === QUESTIONS[qi].a;
  const totalOk = () => order.filter(isOk).length;
  const indicesOf = (t) => QUESTIONS.map((_, i) => i).filter((i) => QUESTIONS[i].t === t);

  // Mejor nota guardada (si el navegador lo permite)
  const KEY = "test-ia-mejor-";
  function getBest(t) {
    try { return JSON.parse(localStorage.getItem(KEY + t)); } catch (e) { return null; }
  }
  function saveBest(t, ok, total) {
    try {
      const prev = getBest(t);
      const pct = ok / total;
      if (!prev || pct > prev.ok / prev.total) {
        localStorage.setItem(KEY + t, JSON.stringify({ ok, total }));
        return true;
      }
    } catch (e) { /* sin almacenamiento */ }
    return false;
  }

  // ---------- Probabilidad de aprobar ----------
  // Se guardan los últimos intentos completos de cada test (no los repasos de fallos).
  // Estimación: media ponderada (los intentos recientes pesan más) y curva logística
  // centrada en el 50 % (nota mínima de aprobado). Es solo orientativa.
  const HIST_KEY = "test-ia-hist-";
  const HIST_MAX = 5;
  const NOTA_APROBADO = 0.5;
  function getHist(t) {
    try {
      const h = JSON.parse(localStorage.getItem(HIST_KEY + t));
      return Array.isArray(h) ? h.filter((x) => typeof x === "number") : [];
    } catch (e) { return []; }
  }
  function saveHist(t, frac) {
    try {
      const h = getHist(t);
      h.push(frac);
      localStorage.setItem(HIST_KEY + t, JSON.stringify(h.slice(-HIST_MAX)));
    } catch (e) { /* sin almacenamiento */ }
  }
  function scoreOf(t) {
    const h = getHist(t);
    if (!h.length) return null;
    let sum = 0, w = 0;
    h.forEach((v, i) => { const p = i + 1; sum += v * p; w += p; });
    return sum / w;
  }
  function probabilidad() {
    const scores = Object.keys(MODES).map(scoreOf).filter((s) => s !== null);
    if (!scores.length) return null;
    const media = scores.reduce((a, b) => a + b, 0) / scores.length;
    const p = 1 / (1 + Math.exp(-10 * (media - NOTA_APROBADO)));
    return Math.round(p * 100);
  }
  function paintProb() {
    const p = probabilidad();
    const box = $("prob");
    $("prob-val").textContent = p === null ? "Haz un test" : `${p}%`;
    box.style.setProperty("--prob-color", p === null ? "var(--muted)" : p >= 70 ? "var(--ok)" : p >= 40 ? "var(--primary)" : "var(--bad)");
    box.title = p === null
      ? "Haz algún test para calcular tu probabilidad de aprobar"
      : "Probabilidad estimada de aprobar, según tus últimos intentos en los tests";
  }

  function refreshMenu() {
    paintProb();
    Object.keys(MODES).forEach((t) => {
      const n = indicesOf(t).length;
      $("count-" + t).textContent = t === "clasif" ? `${n} casos` : `${n} preguntas`;
      const best = getBest(t);
      $("best-" + t).textContent = best ? `🏅 Mejor: ${best.ok}/${best.total}` : "";
    });
  }

  // ---------- Test ----------
  function startQuiz(t, indices, isRetry) {
    mode = t;
    retrying = !!isRetry;
    order = indices.slice();
    if ($("shuffle").checked) shuffleArray(order);
    current = 0;
    givenAnswers = {};
    $("mode-name").textContent = retrying ? `${MODES[t].name} · Repaso de fallos` : MODES[t].name;
    $("hint").textContent = MODES[t].hint;
    show("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    const item = QUESTIONS[order[current]];
    $("counter").textContent = `Pregunta ${current + 1} de ${order.length}`;
    $("score-live").textContent = `Aciertos: ${totalOk()}`;
    $("bar-fill").style.width = `${(current / order.length) * 100}%`;
    $("badge").textContent = MODES[item.t].badge;
    $("question").textContent = item.q;
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    $("just").classList.add("hidden");
    $("just").textContent = "";
    $("btn-next").classList.add("hidden");
    $("btn-next").textContent = current === order.length - 1 ? "Ver resultado" : "Siguiente →";

    const box = $("options");
    box.innerHTML = "";
    item.o.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.innerHTML = '<span class="letter"></span><span class="txt"></span>';
      btn.querySelector(".letter").textContent = letterOf(item, i);
      btn.querySelector(".txt").textContent = text;
      btn.addEventListener("click", () => choose(i));
      box.appendChild(btn);
    });
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    const qIndex = order[current];
    const item = QUESTIONS[qIndex];
    givenAnswers[qIndex] = i;

    const buttons = $("options").querySelectorAll(".option");
    buttons.forEach((b, idx) => {
      b.disabled = true;
      if (idx !== item.a && idx !== i) b.classList.add("dim");
    });
    buttons[item.a].classList.add("correct");

    const fb = $("feedback");
    if (i === item.a) {
      fb.textContent = "✅ ¡Correcto!";
      fb.classList.add("ok");
    } else {
      buttons[i].classList.add("wrong");
      fb.textContent = `❌ Incorrecto. La respuesta correcta es ${letterOf(item, item.a)}.`;
      fb.classList.add("bad");
    }

    // La justificación solo aparece DESPUÉS de responder.
    // En la práctica se muestra siempre; en el test teórico, solo si se falla.
    if (item.j && (item.t === "clasif" || i !== item.a)) {
      $("just").textContent = "💡 " + item.j;
      $("just").classList.remove("hidden");
    }

    $("score-live").textContent = `Aciertos: ${totalOk()}`;
    $("btn-next").classList.remove("hidden");
    $("btn-next").focus();
  }

  function next() {
    if (!answered) return;
    if (current < order.length - 1) {
      current++;
      renderQuestion();
    } else {
      showResult();
    }
  }

  // ---------- Resultados ----------
  function showResult() {
    $("bar-fill").style.width = "100%";
    const total = order.length;
    const ok = totalOk();
    const pct = Math.round((ok / total) * 100);

    $("result-mode").textContent = retrying ? `${MODES[mode].name} · Repaso de fallos` : MODES[mode].name;
    $("ring").style.setProperty("--pct", pct);
    $("ring").style.setProperty("--ring-color", pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--primary)" : "var(--bad)");
    $("ring-pct").textContent = `${pct}%`;
    $("ring-num").textContent = `${ok} / ${total}`;

    let msg;
    if (pct === 100) msg = "🏆 ¡Perfecto! Has acertado todas.";
    else if (pct >= 80) msg = "🎉 ¡Muy bien! Dominas el tema.";
    else if (pct >= 50) msg = "👍 Aprobado. Repasa los fallos para mejorar.";
    else msg = "📚 Toca repasar un poco. ¡Tú puedes!";
    $("final-msg").textContent = msg;

    // Solo se guarda la mejor nota en intentos completos (no en repasos de fallos)
    const bestMsg = $("best-msg");
    bestMsg.textContent = "";
    if (!retrying) {
      saveHist(mode, ok / total);
      const isNew = saveBest(mode, ok, total);
      if (isNew && pct > 0) bestMsg.textContent = "⭐ ¡Nuevo récord personal!";
      refreshMenu();
    }

    // Revisión de fallos
    const review = $("review");
    review.innerHTML = "";
    const wrongList = order.filter((qi) => !isOk(qi));
    $("btn-retry-wrong").classList.toggle("hidden", wrongList.length === 0);

    if (wrongList.length) {
      const h = document.createElement("h3");
      h.textContent = `Revisión de fallos (${wrongList.length})`;
      review.appendChild(h);

      wrongList.forEach((qi) => {
        const item = QUESTIONS[qi];
        const chosen = givenAnswers[qi];
        const div = document.createElement("div");
        div.className = "review-item";

        const q = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${item.n}. ${item.q}`;
        q.appendChild(strong);

        const mine = document.createElement("p");
        mine.className = "your";
        mine.textContent = `Tu respuesta: ${letterOf(item, chosen)}) ${item.o[chosen]}`;

        const right = document.createElement("p");
        right.className = "right";
        right.textContent = `Correcta: ${letterOf(item, item.a)}) ${item.o[item.a]}`;

        div.append(q, mine, right);
        if (item.j) {
          const j = document.createElement("p");
          j.className = "muted";
          j.textContent = "💡 " + item.j;
          div.appendChild(j);
        }
        review.appendChild(div);
      });
    } else {
      const p = document.createElement("div");
      p.className = "perfect";
      p.textContent = "✨ Sin fallos. ¡Nada que repasar!";
      review.appendChild(p);
    }

    show("result");
  }

  // ---------- Eventos ----------
  document.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      const t = card.dataset.mode;
      startQuiz(t, indicesOf(t), false);
    });
  });
  $("btn-next").addEventListener("click", next);
  $("btn-exit").addEventListener("click", () => { refreshMenu(); show("start"); });
  $("btn-menu").addEventListener("click", () => { refreshMenu(); show("start"); });
  $("btn-restart").addEventListener("click", () => startQuiz(mode, indicesOf(mode), false));
  $("btn-retry-wrong").addEventListener("click", () => {
    startQuiz(mode, order.filter((qi) => !isOk(qi)), true);
  });

  // Atajos de teclado
  document.addEventListener("keydown", (e) => {
    if (screens.quiz.classList.contains("hidden")) return;
    const k = e.key.toLowerCase();
    if (k === "enter") {
      if (answered) { e.preventDefault(); next(); }
      return;
    }
    if (answered) return;
    const item = QUESTIONS[order[current]];
    const keys = ["a", "b", "c", "d", "e"];
    let idx = keys.indexOf(k);
    if (idx === -1 && /^[1-5]$/.test(k)) idx = Number(k) - 1;
    if (idx >= 0 && idx < item.o.length) choose(idx);
  });

  // ---------- Tema claro / oscuro ----------
  const THEME_KEY = "test-ia-tema";
  const root = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");

  function paintThemeButton() {
    // Muestra el icono del tema al que se cambiará al pulsar
    $("theme-toggle").textContent = currentTheme() === "dark" ? "☀️" : "🌙";
  }

  $("theme-toggle").addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* sin almacenamiento */ }
    paintThemeButton();
  });
  paintThemeButton();

  refreshMenu();
})();
