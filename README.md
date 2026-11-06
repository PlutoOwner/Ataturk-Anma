# 🕊️ Atatürk Anma Sayfası

Ulu Önder Gazi Mustafa Kemal Atatürk'ün aziz hatırasına saygı ve minnetimizi dijital ortamda sunmak için hazırlanmış bir anma sayfası.
Ziyaretçiler **karanfil bırakabilir**, **mum yakabilir**, adlarını ve kısa bir mesajlarını ekleyip bunu **hikâyelerinde paylaşabilirler**.

**🌐 Canlı site:** https://plutoowner.github.io/Ataturk-Anma/



---

## ✨ Özellikler

**Anma**
- 🌺 **Karanfil bırakma ve mum yakma:** Ad ve isteğe bağlı mesajla. Hazır mesajlar tek tıkla seçilebilir.
- 🌱 **Anma bahçesi:** Bırakılan her karanfil ve yakılan her mum bahçede yan yana dizilir.
- 📜 **Saygılarını sunanlar:** Mesajlar tarihleriyle birlikte, en yenisi üstte listelenir.

**10 Kasım**
- ⏳ **Geri sayım:** 10 Kasım saat 09.05'e kalan süreyi gösterir.
- 🕯️ **Saygı duruşu:** Saat 09.05'te sayfa açıksa ekran bir dakikalığına kararır.
- 📢 **Siren:** İsteğe bağlı olarak saygı duruşunda bir dakikalık siren çalar. Ses dosyası kullanılmaz, ses tarayıcıda üretilir.

**Paylaşım**
- 📱 **Hikâye görseli:** Karanfil bırakınca kişinin adı ve mesajıyla 1080×1920 boyutunda bir görsel oluşur. Telefonda doğrudan paylaşılabilir, bilgisayarda indirilebilir.
- 🔗 **Bağlantı önizlemesi:** Link WhatsApp, X, Telegram ve benzerlerinde paylaşıldığında görsel, başlık ve açıklamayla görünür.

**İçerik**
- 🎖️ **Gençliğe Hitabe:** Tam metin ve eski kelimeler için küçük bir sözlük.
- 🗓️ **Hayatından kilometre taşları:** 1881'den 1938'e önemli tarihler.
- 💬 **Atatürk'ten sözler:** Belirli aralıklarla değişir.

**Güvenlik ve erişilebilirlik**
- 🛡️ **Küfür ve spam filtresi:** Harf ayırma (`s.i.k`), rakamla yazma (`0r0spu`) ve harf uzatma gibi hileleri de yakalar; bağlantı paylaşımını engeller.
- 🔒 Kullanıcı girdileri güvenli şekilde gösterilir (XSS koruması).
- ♿ Form etiketleri, klavye ile kullanım, ekran okuyucu desteği ve hareketi azaltma tercihine uyum.
- 💻 Mobil ve masaüstü uyumlu.

---

## 🗂️ Dosya Yapısı

```
├── index.html      # Sayfanın içeriği
├── style.css       # Tüm tasarım
├── main.js         # Karanfil/mum, bahçe, geri sayım, siren, paylaşım
├── filtre.js       # Küfür ve spam filtresi
├── og-image.jpg    # Bağlantı önizleme görseli (1200×630)
├── atatürk.png     # Arka plan görseli
└── LICENSE
```

---

## 🚀 Kendi Bilgisayarında Çalıştırma

Herhangi bir kurulum gerekmez. Bir yerel sunucu ile açman yeterli:

```bash
git clone https://github.com/plutoowner/Ataturk-Anma.git
cd Ataturk-Anma
python3 -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini aç.

> `index.html` dosyasına çift tıklayarak da açabilirsin, ama bu durumda paylaşım görseli arka plansız oluşur. Bu, tarayıcıların bir güvenlik kuralından kaynaklanır.

### Saygı duruşunu denemek

Adresin sonuna `?deneme` ekle:

```
http://localhost:8000/?deneme
```

Saygı duruşu 15 saniye sonra başlar. Sireni denemek için önce "Saygı duruşunda siren çalsın" butonuna bas.

### Filtreye kelime eklemek

`filtre.js` dosyasının başındaki üç listeyi düzenle:

| Liste | Ne yapar |
|---|---|
| `KOKLER` | Bu kökle **başlayan** kelimeleri engeller (`orospu` → `orospunun`) |
| `TAM` | Sadece kelimenin **tam hâlini** engeller (`am`, `aq` gibi kısa kalıplar için) |
| `ICINDE` | Metnin **herhangi bir yerinde** geçerse engeller (bağlantılar için) |

Kelimeleri Türkçe karakter ve harf tekrarı olmadan yaz (ör. `götveren` yerine `gotveren`).

---

## ⚠️ Bilinen Sınırlamalar

- Karanfiller ve mesajlar ziyaretçinin **kendi tarayıcısında** (`localStorage`) saklanır. Her ziyaretçi yalnızca kendi bıraktıklarını görür; sayaç ve bahçe herkes için ortak değildir.
- Siren, telefonun ekranı kilitlendiğinde tarayıcı tarafından durdurulabilir. En iyi sonuç için 09.05'te sayfa açık ve ekran uyanık olmalıdır.

---

## 🛠️ Kullanılan Teknolojiler

- **HTML5**, **CSS3**, **JavaScript**: herhangi bir kütüphane veya çerçeve kullanılmadı
- **Web Audio API**: siren sesi
- **Canvas API** ve **Web Share API**: paylaşım görseli
- **GitHub Pages**: barındırma
- Yazı tipleri: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) ve [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

---

## 🤝 Katkıda Bulunmak

1. Repoyu forkla
2. Yeni bir dal oluştur: `git checkout -b feature/yeni-ozellik`
3. Değişikliklerini kaydet: `git commit -m "Yeni özellik: ..."`
4. Dalını gönder: `git push origin feature/yeni-ozellik`
5. Pull request aç

Hata bildirmek ya da öneride bulunmak için [Issues](https://github.com/plutoowner/Ataturk-Anma/issues) sekmesini kullanabilirsin.

---

## 📜 Lisans

Bu proje [GNU Genel Kamu Lisansı v3.0](LICENSE) (GPL-3.0) ile lisanslanmıştır.
Kodu kullanabilir, değiştirebilir ve paylaşabilirsin; değiştirilmiş sürümleri de aynı lisansla ve kaynak koduyla birlikte paylaşman gerekir.

---

> “Benim naçiz vücudum elbet bir gün toprak olacaktır; fakat Türkiye Cumhuriyeti ilelebet payidar kalacaktır.”
> — **Mustafa Kemal Atatürk**