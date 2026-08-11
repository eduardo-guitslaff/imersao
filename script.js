// =========================================================
// Mensagem surpresa — comportamento da página
// =========================================================

/* ---------------------------------------------------------
   CONFIGURAÇÃO DO EVENTO
   Ajuste data, hora e local antes de publicar.
--------------------------------------------------------- */
const EVENTO = {
  titulo: "Um encontro especial",
  // ano, mês (1-12), dia, hora, minuto
  dataInicio: { ano: 2026, mes: 8, dia: 15, hora: 19, minuto: 0 },
  dataFim:    { ano: 2026, mes: 8, dia: 15, hora: 21, minuto: 0 },
  local: "a confirmar",
  descricao: "Você foi convidado(a). Guarde esta data.",
  fusoHorario: "America/Sao_Paulo",
};

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     1. CÉU ANIMADO (canvas)
  ========================================================= */
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  let w, h, stars, shootingStar = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeStars(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        baseOpacity: Math.random() * 0.5 + 0.35,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.02,
        driftY: (Math.random() - 0.5) * 0.02,
      });
    }
    return arr;
  }

  function maybeSpawnShootingStar() {
    if (shootingStar || Math.random() > 0.0035) return;
    const startX = Math.random() * w * 0.6;
    shootingStar = {
      x: startX,
      y: -10,
      vx: 4 + Math.random() * 2,
      vy: 3 + Math.random() * 1.5,
      life: 1,
    };
  }

  function drawShootingStar() {
    if (!shootingStar) return;
    const s = shootingStar;
    const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
    grad.addColorStop(0, "rgba(238,217,155,0.95)");
    grad.addColorStop(1, "rgba(238,217,155,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12);
    ctx.stroke();

    s.x += s.vx;
    s.y += s.vy;
    if (s.x > w + 20 || s.y > h + 20) shootingStar = null;
  }

  function tick(t) {
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.x += s.driftX;
      s.y += s.driftY;
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;

      const twinkle = prefersReducedMotion
        ? s.baseOpacity
        : s.baseOpacity + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.25;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, twinkle)})`;
      ctx.fill();
    }

    if (!prefersReducedMotion) {
      maybeSpawnShootingStar();
      drawShootingStar();
      requestAnimationFrame(tick);
    }
  }

  resize();
  stars = makeStars(Math.min(140, Math.floor((w * h) / 9000)));
  window.addEventListener("resize", () => {
    resize();
    stars = makeStars(Math.min(140, Math.floor((w * h) / 9000)));
  });
  requestAnimationFrame(tick);
  if (prefersReducedMotion) tick(0); // desenha um frame estático

  /* =========================================================
     2. PERSONALIZAR NOME VIA ?nome=
  ========================================================= */
  const params = new URLSearchParams(window.location.search);
  const nome = params.get("nome");
  const nomeEl = document.getElementById("nomeDestinatario");
  if (nome && nomeEl) {
    const nomeSeguro = nome.slice(0, 40).replace(/[<>]/g, "");
    nomeEl.textContent = nomeSeguro;
  }

  /* =========================================================
     3. RASTREIO DO PEDIDO -> REVELAR CARTA
  ========================================================= */
  const scene = document.getElementById("scene");
  const letterSection = document.getElementById("letterSection");
  const trackingCode = document.getElementById("trackingCode");
  const trackingStatus = document.getElementById("trackingStatus");
  const progressFill = document.getElementById("progressFill");
  const skipBtn = document.getElementById("skipTracking");
  const steps = document.querySelectorAll(".step");

  // código de pedido fake, só pra parecer real
  if (trackingCode) {
    const codigo = Math.floor(100000 + Math.random() * 900000);
    trackingCode.textContent = `#PED-${codigo}`;
  }

  const ETAPAS = [
    { pct: 15,  status: "preparando seu pedido..." },
    { pct: 45,  status: "seu pedido está em transporte..." },
    { pct: 75,  status: "saiu para entrega..." },
    { pct: 100, status: "entregue! 🎉" },
  ];

  let etapaAtual = 0;
  let sequenciaTimer = null;
  let revealed = false;

  function marcarEtapa(index) {
    steps.forEach((step) => {
      const n = Number(step.dataset.step);
      step.classList.toggle("is-done", n < index);
      step.classList.toggle("is-active", n === index);
    });
  }

  function avancarEtapa() {
    if (revealed) return;
    const etapa = ETAPAS[etapaAtual];
    if (progressFill) progressFill.style.width = etapa.pct + "%";
    if (trackingStatus) trackingStatus.textContent = etapa.status;
    marcarEtapa(etapaAtual);

    if (etapaAtual === ETAPAS.length - 1) {
      // chegou em "entregue"
      marcarEtapa(ETAPAS.length); // marca todos como concluídos
      dispararConfete();
      sequenciaTimer = setTimeout(revelarCarta, 1400);
      return;
    }

    etapaAtual++;
    const delay = prefersReducedMotion ? 200 : 1100;
    sequenciaTimer = setTimeout(avancarEtapa, delay);
  }

  function dispararConfete() {
    if (prefersReducedMotion) return;
    const cores = ["#f5822c", "#ffb066", "#cba135", "#eed99b", "#f8f2e2"];
    const total = 60;
    for (let i = 0; i < total; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = cores[Math.floor(Math.random() * cores.length)];
      piece.style.animationDuration = 2 + Math.random() * 1.5 + "s";
      piece.style.animationDelay = Math.random() * 0.4 + "s";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  }

  function revelarCarta() {
    if (revealed) return;
    revealed = true;
    clearTimeout(sequenciaTimer);

    scene.classList.add("is-hidden");
    letterSection.classList.add("is-visible");
    letterSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pularRastreio() {
    if (revealed) return;
    clearTimeout(sequenciaTimer);
    etapaAtual = ETAPAS.length - 1;
    if (progressFill) progressFill.style.width = "100%";
    if (trackingStatus) trackingStatus.textContent = ETAPAS[ETAPAS.length - 1].status;
    marcarEtapa(ETAPAS.length);
    dispararConfete();
    setTimeout(revelarCarta, 700);
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", pularRastreio);
  }

  // inicia a sequência automaticamente
  sequenciaTimer = setTimeout(avancarEtapa, 500);

  /* =========================================================
     4. SCROLL REVEAL (convite + rodapé)
  ========================================================= */
  const revealTargets = document.querySelectorAll("#inviteSection, #siteFooter");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     5. CONTAGEM REGRESSIVA
  ========================================================= */
  const alvo = new Date(
    EVENTO.dataInicio.ano,
    EVENTO.dataInicio.mes - 1,
    EVENTO.dataInicio.dia,
    EVENTO.dataInicio.hora,
    EVENTO.dataInicio.minuto
  ).getTime();

  const elDays = document.getElementById("cdDays");
  const elHours = document.getElementById("cdHours");
  const elMinutes = document.getElementById("cdMinutes");
  const elSeconds = document.getElementById("cdSeconds");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    const diff = alvo - Date.now();

    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMinutes.textContent = "00";
      elSeconds.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  if (elDays) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* =========================================================
     6. ADICIONAR À AGENDA — sem revelar remetente
  ========================================================= */
  const ctaCalendar = document.getElementById("ctaCalendar");
  const ctaIcs = document.getElementById("ctaIcs");

  function formatCalendarDate(d) {
    return (
      d.ano.toString().padStart(4, "0") +
      String(d.mes).padStart(2, "0") +
      String(d.dia).padStart(2, "0") +
      "T" +
      String(d.hora).padStart(2, "0") +
      String(d.minuto).padStart(2, "0") +
      "00"
    );
  }

  // botão principal: abre o Google Agenda direto, já preenchido
  function abrirGoogleCalendar() {
    const dtStart = formatCalendarDate(EVENTO.dataInicio);
    const dtEnd = formatCalendarDate(EVENTO.dataFim);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: EVENTO.titulo,
      dates: `${dtStart}/${dtEnd}`,
      details: EVENTO.descricao,
      location: EVENTO.local,
      ctz: EVENTO.fusoHorario,
    });

    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      "_blank",
      "noopener"
    );
  }

  // botão secundário: baixa .ics (Apple Calendar, Outlook, etc.)
  function baixarConvite() {
    const dtStart = formatCalendarDate(EVENTO.dataInicio);
    const dtEnd = formatCalendarDate(EVENTO.dataFim);
    const uid = `${Date.now()}@convite`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//convite//pt-BR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStart}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${EVENTO.titulo}`,
      `DESCRIPTION:${EVENTO.descricao}`,
      `LOCATION:${EVENTO.local}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "convite.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (ctaCalendar) {
    ctaCalendar.addEventListener("click", abrirGoogleCalendar);
  }
  if (ctaIcs) {
    ctaIcs.addEventListener("click", baixarConvite);
  }
});
