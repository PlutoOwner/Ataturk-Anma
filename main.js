(() => {
  // Eleman bulunamazsa (ör. index.html eski kaldıysa) kod durmasın diye boş bir yedek döner
  const $ = id => document.getElementById(id) || (console.warn(`#${id} bulunamadı; index.html güncel mi?`), document.createElement("div"));
  const STORAGE_KEY = "carnations";
  const PAGE = 20;
  const COOLDOWN_MS = 30_000;

  // ---------- Veri ----------
  let carnations = [];
  try { carnations = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { carnations = []; }
  // Filtre eklenmeden önce kaydedilmiş uygunsuz kayıtları temizle
  if (window.uygunsuzMu) carnations = carnations.filter(c => !uygunsuzMu(c.username) && !uygunsuzMu(c.message));
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(carnations)); } catch {} };

  // ---------- Yardımcılar ----------
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = item => {
    if (!item.ts) return item.time || "";            // eski kayıtlar sadece saat tutuyordu
    const d = new Date(item.ts);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return "az önce";
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    return d.toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // ---------- Saygı duvarı ----------
  const list = $("carnationList");
  const moreBtn = $("moreBtn");
  let shown = PAGE;

  const isCandle = item => item.kind === "mum";
  const icon = item => isCandle(item)
    ? '<span class="candle" aria-hidden="true"></span>'
    : '<svg aria-hidden="true"><use href="#karanfil"/></svg>';

  function render(newest = false) {
    const candles = carnations.filter(isCandle).length;
    $("totalCarnations").textContent = (carnations.length - candles).toLocaleString("tr-TR");
    $("totalCandles").textContent = candles.toLocaleString("tr-TR");
    renderGarden(newest);

    if (!carnations.length) {
      list.innerHTML = '<li class="empty">İlk karanfili bırakan, ilk mumu yakan siz olun.</li>';
      moreBtn.hidden = true;
      return;
    }
    const items = carnations.slice().reverse().slice(0, shown);
    list.innerHTML = items.map((item, i) => `
      <li class="${newest && i === 0 ? "is-new" : ""}">
        ${icon(item)}
        <div>
          <div class="who"><span class="name">${esc(item.username)}</span><span class="when">${esc(fmtDate(item))}</span></div>
          ${item.message ? `<p class="msg">“${esc(item.message)}”</p>` : ""}
        </div>
      </li>`).join("");
    moreBtn.hidden = carnations.length <= shown;
  }

  moreBtn.addEventListener("click", () => { shown += PAGE; render(); });

  // ---------- Anma bahçesi ----------
  const garden = $("garden");
  const GARDEN_MAX = 400;

  // Her kayıt için hep aynı çıkan küçük "rastgele" farklar (boy, eğim)
  const seeded = n => { const x = Math.sin(n) * 10000; return x - Math.floor(x); };

  function renderGarden(newest) {
    if (!carnations.length) {
      garden.innerHTML = '<p class="garden__empty">Bahçe ilk karanfili bekliyor.</p>';
      return;
    }
    const items = carnations.slice(-GARDEN_MAX);
    const extra = carnations.length - items.length;
    garden.innerHTML = (extra > 0 ? `<span class="garden__more">+${extra.toLocaleString("tr-TR")}</span>` : "") +
      items.map((item, i) => {
        const r = seeded(item.ts || i + 1);
        const scale = (0.85 + r * 0.35).toFixed(2);
        const rot = isCandle(item) ? 0 : Math.round((seeded((item.ts || i) + 7) - .5) * 18);
        const isNew = newest && i === items.length - 1;
        return `<span class="garden__item${isNew ? " is-new" : ""}" title="${esc(item.username)}"
          style="transform: scale(${scale}) rotate(${rot}deg)">${icon(item)}</span>`;
      }).join("");
    if (newest) garden.scrollTop = garden.scrollHeight;
  }

  // ---------- Form ----------
  const form = $("carnationForm");
  const nameIn = $("usernameInput");
  const msgIn = $("messageInput");
  const err = $("formError");
  const btn = $("dropCarnationBtn");

  const kind = () => form.querySelector('input[name="kind"]:checked')?.value || "karanfil";
  function updateButton() {
    const mum = kind() === "mum";
    $("btnLabel").textContent = mum ? "Mum Yak" : "Karanfil Bırak";
    $("btnIcon").innerHTML = mum ? '<span class="candle" aria-hidden="true"></span>' : '<svg><use href="#karanfil"/></svg>';
  }
  form.querySelectorAll('input[name="kind"]').forEach(r => r.addEventListener("change", updateButton));

  const updateCount = () => { $("charCount").textContent = `${msgIn.value.length}/100`; };
  msgIn.addEventListener("input", updateCount);
  nameIn.addEventListener("input", () => { nameIn.removeAttribute("aria-invalid"); err.textContent = ""; });

  $("chips").addEventListener("click", e => {
    if (e.target.tagName !== "BUTTON") return;
    msgIn.value = e.target.textContent;
    updateCount();
    msgIn.focus();
  });

  // Mesaj kutusunda Enter = gönder, Shift+Enter = yeni satır
  msgIn.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  function flyCarnations(mum) {
    const r = btn.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      let el;
      if (mum) {
        el = document.createElement("span");
        el.className = "fly-flame";
      } else {
        el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        el.setAttribute("class", "fly");
        el.innerHTML = '<use href="#karanfil"/>';
      }
      el.style.left = `${r.left + r.width / 2 - 13 + (Math.random() * 120 - 60)}px`;
      el.style.top = `${r.top - 20}px`;
      el.style.animationDelay = `${i * 90}ms`;
      el.style.setProperty("--rot", `${Math.random() * 40 - 20}deg`);
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  let lastDrop = 0;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const username = nameIn.value.trim();
    const message = msgIn.value.trim();

    if (username.length < 2) {
      nameIn.setAttribute("aria-invalid", "true");
      err.textContent = "Lütfen en az 2 harfli bir ad yazın.";
      nameIn.focus();
      return;
    }
    if (window.uygunsuzMu?.(username) || window.uygunsuzMu?.(message)) {
      err.textContent = "Lütfen bu sayfanın anlamına yakışır bir dil kullanın.";
      return;
    }
    if (Date.now() - lastDrop < COOLDOWN_MS) {
      err.textContent = "Saygınızı sundunuz. Bir sonraki için biraz bekleyin.";
      return;
    }

    const k = kind();
    lastDrop = Date.now();
    carnations.push({ username, message, ts: lastDrop, kind: k });
    save();
    flyCarnations(k === "mum");
    render(true);
    list.scrollTop = 0;
    form.reset();
    const radio = form.querySelector(`input[value="${k}"]`);
    if (radio) radio.checked = true;                              // seçimi koru
    updateCount();
    err.textContent = "";

    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; }, 2000);
    setTimeout(() => openShare(username, message, k), 900);   // karanfiller uçtuktan sonra
  });

  // ---------- Paylaşım görseli: hikâye (1080×1920) ----------
  const SITE = "plutoowner.github.io/Ataturk-Anma";
  const SITE_URL = `https://${SITE}/`;
  const modal = $("shareModal");
  const share = { name: "", message: "", mum: false, file: null, url: null };

  // Fotoğraf paylasim-foto.js içinde gömülü; sadece ilk paylaşımda yüklenir
  let fotoPromise = null;
  function loadFoto() {
    if (window.PAYLASIM_FOTO) return Promise.resolve(window.PAYLASIM_FOTO);
    fotoPromise ||= new Promise((ok, fail) => {
      const sc = document.createElement("script");
      sc.src = "paylasim-foto.js";
      sc.onload = () => window.PAYLASIM_FOTO ? ok(window.PAYLASIM_FOTO) : fail(new Error("foto yok"));
      sc.onerror = () => { fotoPromise = null; fail(new Error("paylasim-foto.js yüklenemedi")); };
      document.head.appendChild(sc);
    });
    return fotoPromise;
  }

  const loadImg = src => new Promise((ok, fail) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = fail;
    im.src = src;
  });

  function wrap(ctx, text, maxW) {
    const words = text.split(/\s+/), lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  const spaced = (ctx, px) => { if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`; };

  function drawCandle(ctx, cx, top, s = 1) {
    let h = ctx.createRadialGradient(cx, top + 35 * s, 0, cx, top + 35 * s, 110 * s);
    h.addColorStop(0, "rgba(255,170,60,.35)"); h.addColorStop(1, "rgba(255,170,60,0)");
    ctx.fillStyle = h; ctx.fillRect(cx - 120 * s, top - 80 * s, 240 * s, 240 * s);
    const body = ctx.createLinearGradient(cx - 18 * s, 0, cx + 18 * s, 0);
    body.addColorStop(0, "#cdb894"); body.addColorStop(.45, "#f6ead5"); body.addColorStop(1, "#d9c6a3");
    ctx.fillStyle = body; ctx.fillRect(cx - 18 * s, top + 60 * s, 36 * s, 70 * s);
    ctx.fillStyle = "#3a2a1a"; ctx.fillRect(cx - 1.5 * s, top + 50 * s, 3 * s, 12 * s);
    const f = ctx.createRadialGradient(cx, top + 40 * s, 2, cx, top + 30 * s, 30 * s);
    f.addColorStop(0, "#fff8e0"); f.addColorStop(.3, "#ffd35a"); f.addColorStop(.75, "#ff8a1c"); f.addColorStop(1, "rgba(255,80,0,0)");
    ctx.fillStyle = f;
    ctx.beginPath(); ctx.ellipse(cx, top + 28 * s, 13 * s, 26 * s, 0, 0, Math.PI * 2); ctx.fill();
  }

  async function drawCard({ name, message, mum }, withBg) {
    const W = 1080, H = 1920;
    const story = true;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const SERIF = '"Cormorant Garamond", Georgia, serif';
    const SANS = "Inter, system-ui, sans-serif";

    ctx.fillStyle = "#0b0907";
    ctx.fillRect(0, 0, W, H);

    // Fotoğraf: genişliğe sığdır, yüz üst bölümde kalsın
    if (withBg) {
      const bg = await loadImg(await loadFoto());
      const scale = W / bg.width;
      const y = story ? 0 : -60;
      ctx.save();
      ctx.filter = "contrast(1.05) brightness(.92)";
      ctx.drawImage(bg, 0, y, W, bg.height * scale);
      ctx.restore();
    }

    // Kararmalar: üstte ince, altta yazının okunacağı kadar güçlü
    let g = ctx.createLinearGradient(0, 0, 0, 260);
    g.addColorStop(0, "rgba(11,9,7,.8)"); g.addColorStop(1, "rgba(11,9,7,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 260);
    const fadeFrom = story ? 820 : 640, fadeTo = story ? 1220 : 930;
    g = ctx.createLinearGradient(0, fadeFrom, 0, fadeTo);
    g.addColorStop(0, "rgba(11,9,7,0)"); g.addColorStop(1, "rgba(11,9,7,.96)");
    ctx.fillStyle = g; ctx.fillRect(0, fadeFrom, W, H - fadeFrom);
    ctx.fillStyle = "rgba(11,9,7,.96)"; ctx.fillRect(0, fadeTo, W, H - fadeTo);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const cx = W / 2;

    // Üst etiket
    ctx.fillStyle = "#d8c3a0";
    ctx.font = `500 ${story ? 30 : 26}px ${SANS}`;
    spaced(ctx, 9);
    ctx.fillText("10 KASIM · 09.05", cx, story ? 140 : 80);
    spaced(ctx, 0);

    // Konumlar
    const L = story
      ? { icon: 1090, t1: 1330, t2: 1430, tSize: 104, rule: 1470, name: 1560, sub: 1612, msg: 1700, msgLines: 2, dates: 1830, url: 1885 }
      : { icon: null, t1: 1000, t2: null, tSize: 76, rule: 1040, name: 1115, sub: 1160, msg: 1228, msgLines: 1, dates: 1290, url: 1328 };

    // Karanfil ya da mum (sadece hikâyede)
    if (L.icon) {
      if (mum) drawCandle(ctx, cx, L.icon - 60);
      else {
        const sym = document.getElementById("karanfil").innerHTML;
        const flower = await loadImg("data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 120">${sym}</svg>`));
        ctx.drawImage(flower, cx - 34, L.icon - 60, 68, 128);
      }
    }

    // Başlık
    ctx.fillStyle = "#f4efe7";
    ctx.font = `700 ${L.tSize}px ${SERIF}`;
    if (L.t2) { ctx.fillText("Ebedi Saygı", cx, L.t1); ctx.fillText("ve Minnetle", cx, L.t2); }
    else ctx.fillText("Ebedi Saygı ve Minnetle", cx, L.t1);

    ctx.fillStyle = "#e30a17";
    ctx.fillRect(cx - 60, L.rule, 120, 3);

    // İsim
    ctx.fillStyle = "#f4efe7";
    ctx.font = `600 ${story ? 54 : 48}px ${SANS}`;
    ctx.fillText(name, cx, L.name);
    ctx.fillStyle = "#b7ad9f";
    ctx.font = `400 ${story ? 34 : 30}px ${SANS}`;
    ctx.fillText(mum ? "bir mum yaktı" : "bir karanfil bıraktı", cx, L.sub);

    // Mesaj
    if (message) {
      ctx.fillStyle = "#e6ddd0";
      ctx.font = `italic 500 ${story ? 50 : 44}px ${SERIF}`;
      let lines = wrap(ctx, `“${message}”`, 880);
      if (lines.length > L.msgLines) {
        lines = lines.slice(0, L.msgLines);
        lines[L.msgLines - 1] = lines[L.msgLines - 1].replace(/\s*\S*$/, "…”");
      }
      lines.forEach((l, i) => ctx.fillText(l, cx, L.msg + i * 60));
    }

    // 1881 — 193∞
    ctx.font = `500 ${story ? 44 : 34}px ${SANS}`;
    spaced(ctx, 8);
    const left = "1881 — 193";
    const lw = ctx.measureText(left).width;
    spaced(ctx, 0);
    const iw = ctx.measureText("∞").width;
    const x0 = cx - (lw + iw) / 2;
    ctx.textAlign = "left";
    spaced(ctx, 8);
    ctx.fillStyle = "#d8c3a0";
    ctx.fillText(left, x0, L.dates);
    spaced(ctx, 0);
    ctx.fillStyle = "#ff4d57";
    ctx.fillText("∞", x0 + lw, L.dates);

    // Site adresi
    ctx.textAlign = "center";
    ctx.fillStyle = "#8f857a";
    ctx.font = `500 ${story ? 28 : 24}px ${SANS}`;
    ctx.fillText(SITE, cx, L.url);

    return new Promise((ok, fail) => {
      try { c.toBlob(b => b ? ok(b) : fail(new Error("boş")), "image/png"); }
      catch (e) { fail(e); }
    });
  }

  async function makeCard(opts) {
    try { await Promise.all([
      document.fonts.load('700 104px "Cormorant Garamond"'),
      document.fonts.load('italic 500 50px "Cormorant Garamond"'),
      document.fonts.load("600 54px Inter")
    ]); } catch {}
    // Fotoğraf yüklenemezse ya da (dosyadan açınca) tuval kilitlenirse fotoğrafsız çiz
    try { return await drawCard(opts, true); }
    catch (e) { console.warn("Fotoğraf çizilemedi:", e); return drawCard(opts, false); }
  }

  const shareText = () =>
    `Atatürk'ün aziz hatırasına ${share.mum ? "bir mum yaktım" : "bir karanfil bıraktım"}. Sen de katıl:`;

  function note(text) { $("shareNote").textContent = text; }

  async function refreshCard() {
    const blob = await makeCard(share);
    if (share.url) URL.revokeObjectURL(share.url);
    const fname = `${share.mum ? "mum" : "karanfil"}-ataturk.png`;
    share.file = new File([blob], fname, { type: "image/png" });
    share.url = URL.createObjectURL(blob);
    $("sharePreview").src = share.url;
    $("downloadBtn").href = share.url;
    $("downloadBtn").download = fname;
    $("shareNative").hidden = !(navigator.canShare && navigator.canShare({ files: [share.file] }));
  }

  function closeShare() {
    modal.hidden = true;
    if (share.url) URL.revokeObjectURL(share.url);
    share.url = null; share.file = null;
    btn.focus();
  }

  async function openShare(name, message, k) {
    Object.assign(share, { name, message, mum: k === "mum" });
    try {
      $("shareTitle").textContent = share.mum ? "Mumunuz yakıldı" : "Karanfiliniz bırakıldı";
      note("");
      await refreshCard();
      modal.hidden = false;
      $("shareClose").focus();
    } catch (e) {
      console.warn("Paylaşım görseli oluşturulamadı:", e);
    }
  }

  const canShareFile = () => navigator.canShare && share.file && navigator.canShare({ files: [share.file] });
  const nativeShare = () => navigator.share({ files: [share.file], text: `${shareText()} ${SITE_URL}` });
  const openUrl = url => window.open(url, "_blank", "noopener");
  const enc = encodeURIComponent;

  $("shareWhatsapp").addEventListener("click", () =>
    openUrl(`https://wa.me/?text=${enc(`${shareText()} ${SITE_URL}`)}`));

  $("shareX").addEventListener("click", () =>
    openUrl(`https://x.com/intent/post?text=${enc(shareText())}&url=${enc(SITE_URL)}`));

  $("shareThreads").addEventListener("click", () =>
    openUrl(`https://www.threads.net/intent/post?text=${enc(`${shareText()} ${SITE_URL}`)}`));

  // Instagram'ın internet sitelerinden paylaşım bağlantısı yok:
  // telefonda görseli paylaşım menüsüne gönderiyoruz, bilgisayarda indiriyoruz.
  $("shareInstagram").addEventListener("click", async () => {
    if (canShareFile()) {
      try { await nativeShare(); } catch {}
      return;
    }
    $("downloadBtn").click();
    note("Görsel indirildi. Instagram'da + → Hikâye ile paylaşabilirsin.");
  });

  $("shareNative").addEventListener("click", async () => { try { await nativeShare(); } catch {} });
  $("shareClose").addEventListener("click", closeShare);
  modal.addEventListener("click", e => { if (e.target === modal) closeShare(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeShare(); });

  // ---------- Kaçıncı yıl ----------
  // 2026'daki anma 88. yıl dönümüdür
  $("yearsSince").textContent = `${new Date().getFullYear() - 1938}.`;

  // ---------- Geri sayım ve saygı duruşu ----------
  // 09.05 İstanbul saati = 06.05 UTC (Türkiye yıl boyu UTC+3)
  // Denemek için adresin sonuna ?deneme ekle: saygı duruşu 15 saniye sonra başlar.
  const silence = $("silence");
  const pad = n => String(n).padStart(2, "0");
  const TEST = new URLSearchParams(location.search).has("deneme");
  const testTarget = Date.now() + 15_000;
  const SILENCE_MS = 60_000;

  function nextTarget(t = Date.now()) {
    if (TEST) return testTarget;
    const y = new Date(t).getUTCFullYear();
    const thisYear = Date.UTC(y, 10, 10, 6, 5);
    return t < thisYear + SILENCE_MS ? thisYear : Date.UTC(y + 1, 10, 10, 6, 5);
  }

  // ---------- Siren (ses dosyası yok, tarayıcıda üretilir) ----------
  const siren = { ctx: null, on: false, nodes: [], scheduledFor: 0, endsAt: 0 };
  const toggle = $("sirenToggle");
  const muteBtn = $("silenceMute");

  function playSiren(when, dur, peak = 0.16) {
    const ctx = siren.ctx;
    const ramp = Math.min(6, dur / 3);
    const out = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1800;
    const o1 = ctx.createOscillator(); o1.type = "sawtooth";
    const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.detune.value = 9;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.4;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 5;

    for (const o of [o1, o2]) {
      const f = o.frequency;
      f.setValueAtTime(90, when);
      f.exponentialRampToValueAtTime(440, when + ramp);        // yükselme
      f.setValueAtTime(440, when + dur - ramp);                // sabit ses
      f.exponentialRampToValueAtTime(110, when + dur);         // sönme
      lfoGain.connect(f);
      o.connect(lp);
    }
    lfo.connect(lfoGain);
    lp.connect(out); out.connect(ctx.destination);

    out.gain.setValueAtTime(0, when);
    out.gain.linearRampToValueAtTime(peak, when + Math.min(3, ramp));
    out.gain.setValueAtTime(peak, when + dur - ramp);
    out.gain.linearRampToValueAtTime(0, when + dur);

    for (const o of [o1, o2, lfo]) { o.start(when); o.stop(when + dur + 0.1); }
    siren.nodes.push(o1, o2, lfo);
  }

  function stopSiren() {
    siren.nodes.forEach(n => { try { n.stop(); } catch {} });
    siren.nodes = [];
    siren.scheduledFor = 0;
    siren.endsAt = 0;
    muteBtn.hidden = true;
  }

  // Siren, hedef saate 15 dakikadan az kalınca ses saatine göre planlanır
  // (arka plandaki sekmelerde zamanlayıcılar yavaşlasa da ses saati şaşmaz).
  function maybeSchedule(t, target) {
    if (!siren.on || siren.scheduledFor === target) return;
    const untilStart = target - t;
    if (untilStart > 15 * 60_000 || t >= target + SILENCE_MS) return;
    const startIn = Math.max(0, untilStart) / 1000;
    // Sayfa saygı duruşunun ortasında açıldıysa sadece kalan süre kadar çalar
    const len = (target + SILENCE_MS - Math.max(t, target)) / 1000;
    if (len < 2) return;
    playSiren(siren.ctx.currentTime + startIn, len);
    siren.scheduledFor = target;
    siren.endsAt = target + SILENCE_MS;
  }

  toggle.addEventListener("click", async () => {
    if (!siren.on) {
      siren.ctx = siren.ctx || new (window.AudioContext || window.webkitAudioContext)();
      await siren.ctx.resume();
      siren.on = true;
      playSiren(siren.ctx.currentTime + 0.05, 2.5, 0.1);     // kısa önizleme: ses çalışıyor mu?
      tick();
    } else {
      siren.on = false;
      stopSiren();
    }
    toggle.setAttribute("aria-pressed", siren.on);
    $("sirenLabel").textContent = siren.on ? "Siren açık · kapatmak için dokunun" : "Saygı duruşunda siren çalsın";
    $("sirenNote").hidden = !siren.on;
  });

  muteBtn.addEventListener("click", () => {
    stopSiren();
    siren.scheduledFor = nextTarget();    // bu yıl tekrar çalmasın
  });

  function tick() {
    const t = Date.now();
    const target = nextTarget(t);
    const inSilence = t >= target && t < target + SILENCE_MS;
    silence.hidden = !inSilence;
    muteBtn.hidden = !(inSilence && siren.on && siren.nodes.length);

    maybeSchedule(t, target);

    const left = Math.max(0, target - t) / 1000;
    $("cdD").textContent = Math.floor(left / 86400);
    $("cdH").textContent = pad(Math.floor(left % 86400 / 3600));
    $("cdM").textContent = pad(Math.floor(left % 3600 / 60));
    $("cdS").textContent = pad(Math.floor(left % 60));
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Dönen sözler ----------
  const quotes = [
    "Hayatta en hakiki mürşit ilimdir.",
    "Yurtta sulh, cihanda sulh.",
    "Egemenlik kayıtsız şartsız milletindir.",
    "Ne mutlu Türküm diyene!",
    "Öğretmenler! Yeni nesil sizin eseriniz olacaktır.",
    "Benim manevi mirasım ilim ve akıldır."
  ];
  const qEl = $("quoteText");
  let qi = 0;
  setInterval(() => {
    qEl.classList.add("fade");
    setTimeout(() => {
      qi = (qi + 1) % quotes.length;
      qEl.textContent = `“${quotes[qi]}”`;
      qEl.classList.remove("fade");
    }, 600);
  }, 7000);

  render();
})();