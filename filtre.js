/*
 * Uygunsuz içerik filtresi
 * ------------------------
 * Kelime eklemek/çıkarmak için sadece aşağıdaki üç listeyi düzenle.
 * Kelimeleri Türkçe karakter KULLANMADAN ve harf tekrarı OLMADAN yaz
 * (ör. "yarrak" değil "yarak", "götveren" değil "gotveren").
 */
(() => {
  // 1) Kelime bu kökle BAŞLIYORSA engellenir (ekler de yakalanır: orospunun, siktirin...)
  const KOKLER = [
    "orospu", "yarak", "siktir", "sikey", "sikim", "sikik", "sikerim", "siker",
    "amina", "amini", "aminiz", "amcik", "amcig", "pezevenk", "kahpe", "kaltak", "gavat",
    "serefsiz", "haysiyetsiz", "ibne", "pust", "surtuk", "yavsak", "dalyarak", "tasak",
    "gotveren", "gotlek", "gotos", "pice", "pici",
    "gerizekali", "salak", "aptal", "dangalak",
    "fuck", "shit", "bitch", "bastard", "dick", "asshole", "kürdistan", "atanı", "atanın", "oce",
    "sikik"
  ];

  // 2) Kelime TAM OLARAK buysa engellenir (başka kelimelerin içinde geçebilecek kısa kalıplar)
  const TAM = [
    "am", "amk", "amq", "aq", "awk", "mk", "mq", "oc", "sik", "sg", "sktr",
    "got", "gotu", "gotun", "gote", "gotten", "pic", "ipne", "it"
  ];

  // 3) Metnin içinde HERHANGİ bir yerde geçerse engellenir (bağlantı/spam)
  const ICINDE = ["http", "www.", ".com", ".net", "t.me", "discord.gg"];

  // ---- Normalleştirme ----
  const TR = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };
  const LEET = { "0": "o", "1": "i", "!": "i", "3": "e", "4": "a", "@": "a", "5": "s", "$": "s", "7": "t" };

  function normalize(text) {
    let t = text.toLocaleLowerCase("tr-TR").replace(/[çğıöşüâîû]/g, c => TR[c]);
    t = t.replace(/[01!34@5$7]/g, c => LEET[c]);
    // "s.i.k", "s i k", "s-i-k" gibi harf harf ayrılmış yazımları birleştir
    t = t.replace(/(?<![a-z])(?:[a-z][\s.\-_*+,]+){2,}[a-z](?![a-z])/g, m => m.replace(/[^a-z]/g, ""));
    // "siiiiktir" → "siktir"
    t = t.replace(/([a-z])\1+/g, "$1");
    return t;
  }

  const kokSet = KOKLER.map(normalize);
  const tamSet = new Set(TAM.map(normalize));

  window.uygunsuzMu = function (text) {
    if (!text) return false;
    const lower = text.toLocaleLowerCase("tr-TR");
    if (ICINDE.some(p => lower.includes(p))) return true;

    const words = normalize(text).split(/[^a-z]+/).filter(Boolean);
    return words.some(w => tamSet.has(w) || kokSet.some(k => k.length > 2 ? w.startsWith(k) : w === k));
  };
})();