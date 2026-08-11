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
     3. ABRIR SELO -> REVELAR CARTA
  ========================================================= */
  const seal = document.getElementById("seal");
  const scene = document.getElementById("scene");
  const letterSection = document.getElementById("letterSection");
  const tapHint = document.getElementById("tapHint");

  let opened = false;

  function openLetter() {
    if (opened) return;
    opened = true;

    seal.classList.add("is-open");
    if (tapHint) tapHint.style.opacity = "0";

    setTimeout(() => {
      scene.classList.add("is-hidden");
      letterSection.classList.add("is-visible");
      letterSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 650);
  }

  if (seal) {
    seal.addEventListener("click", openLetter);
    seal.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLetter();
      }
    });
  }

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
