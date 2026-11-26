# CLAUDE.md — Synthetic Intelligence

> Bu dosya Claude Code için proje bağlamıdır. Buradaki kararlar, kullanıcı
> açıkça aksini söylemedikçe proje boyunca geçerlidir. Bir karar bu dosyayla
> çelişiyorsa önce kullanıcıya sor.

---

## 1. Proje özeti

- **Ad:** Synthetic Intelligence — *Fictional AI & Robotics Archive*
- **Ne:** Film ve dizilerdeki kurgusal yapay zekâları, androidleri ve robotları
  keşfetmek için interaktif bir wiki. Kullanıcı gizli bir araştırma kurumunun
  arşiv sistemine girmiş gibi hissetmeli.
- **Ders:** SE 3355 Web Programming — Midterm Project
- **Teslim:** 29.11.2026 23:59 (geç teslim kabul edilmez). Canlı site linki +
  GitHub repo linki teslim edilecek.
- **Geliştirici:** Tek kişi, React bilgisi iyi, 6 gün.
- **Arayüz dili:** İngilizce (tüm UI metinleri). Kod yorumları İngilizce.
  Kullanıcıyla sohbet Türkçe.

### Tek cümlelik ilke
**Bütün film, dizi ve oyuncu verisi canlı olarak TMDB'den gelir; proje bunun
üstüne açıkça etiketlenmiş bir editoryal analiz katmanı ekler.**

---

## 2. Ödevin zorunlu şartları (asla ihlal etme)

Hocanın yönergesinden:

> "Your application should consume a public movie/game/series-related API …
> and present the retrieved data in a clean, navigable, responsive and
> interactive interface built entirely with React and Tailwind."

Ödev metni wiki'nin "a specific movie/game/series universe, collection, **or
theme**" üzerine olabileceğini söylüyor. Bu proje bir **tema** projesidir.

Kontrol listesi:

- [ ] React (Vite), sadece **function component + hooks** (`useState`, `useEffect` vb.)
- [ ] Stil **sadece Tailwind CSS**. Hazır UI şablonu/tema kullanılmaz.
      (Component kütüphanesi olarak shadcn, MUI, Chakra vb. **kullanma**.)
- [ ] Ana veri kaynağı public API: **TMDB**. `fetch` ile istek.
- [ ] Her istekte **loading**, **error** (yeniden dene butonuyla) ve **empty** durumu
- [ ] **Ana içerik hard-coded olmaz.** Listeler ve detay sayfaları API yanıtıyla dolar.
- [ ] **Home page:** temanın tanıtımı + bölümlere linkler
- [ ] **En az 3 listeleme sayfası**, grid/list, **pagination veya "Load more"**
- [ ] **Dinamik route'lu detay sayfası** (örn. `/media/:type/:id`)
- [ ] **Arama ve/veya filtre**, kullanıcı girdisine reaktif güncellenir
- [ ] **Navbar** + **React Router** ile client-side routing
- [ ] Tutarlı görsel stil, **responsive** (mobilde de kullanılabilir)
- [ ] Klasör ayrımı: `services/` (API), `components/` (UI), layout (Navbar, Footer), `pages/`
- [ ] Temiz, anlamlı isimlendirme, gerektiği yerde yorum

### Puanlama (öncelik verirken kullan)
| Kriter | Ağırlık |
|---|---|
| API entegrasyonu, loading/error, verinin anlamlı kullanımı | %20 |
| Component mimarisi ve state yönetimi | %20 |
| Routing, navigasyon, UI/UX, responsive | %20 |
| Kod kalitesi ve klasör yapısı | %10 |
| **Yaratıcılık, ekstra özellikler, cila, test** | **%30** |

---

## 3. Veri modeli: iki katman

### A. TMDB katmanı (canlı, ana içerik)
Film/dizi listeleri, detaylar, posterler, backdrop'lar, overview, tarih, türler,
cast/credits, oyuncu profilleri, benzer yapımlar. **Hepsi API'den.**

**Tema API'den gelir:** Film ve dizi listeleri TMDB `discover` endpoint'inin
**keyword filtresiyle** çekilir (yapay zekâ / robot / android / cyborg vb.
keyword'ler). Böylece arşiv sabit 8–10 kayıt değil, API'den gelen yüzlerce
yapımdır.

### B. Editoryal katman (`src/data/entities.js`)
Küçük, elle yazılmış bir "dossier" kataloğu: varlık türü, yetenekler,
karşılaştırma skorları, tehdit sınıfı, ilişkili varlıklar.

Kurallar:
1. Editoryal alanlar UI'da **her zaman** "Archive Analysis" / "Editorial
   Classification" gibi bir etiketle ve görsel olarak ayrı bir kutuda gösterilir.
2. Editoryal veri **asla** TMDB verisiymiş gibi sunulmaz.
3. Bir entity'nin yapımına ait her şey (poster, backdrop, özet, yıl, oyuncu)
   TMDB'den **canlı** çekilir; `entities.js` sadece TMDB ID'sini ve analiz
   alanlarını tutar.
4. Skorlar (1–10) öznel proje değerlendirmesidir; UI'da bunu belirten kısa bir
   not bulunur. Bilimsel ölçüm gibi sunulmaz.
5. Entity görseli için internetten rastgele resim **kullanma**. Yapımın
   backdrop'u veya karakteri canlandıran/seslendiren oyuncunun TMDB profil
   görseli kullanılır.

---

## 4. TMDB API kuralları

- Dokümantasyon: https://developer.themoviedb.org/docs/getting-started
- **Endpoint'ler ve response alanları hakkında tahmin yürütme.** Kullanmadan
  önce gerçek bir istekle (curl veya küçük bir Node scripti) doğrula ve
  kullanıcıya örnek yanıtın ilgili kısmını göster.
- Kimlik doğrulama: `.env` içinde `VITE_TMDB_API_KEY` (v3 key) **veya**
  `VITE_TMDB_READ_TOKEN` (Bearer). Hangisinin kullanılacağını kullanıcıya sor,
  tek bir yöntem seç.
- `.env` **`.gitignore`'da olmalı**. `.env.example` dosyası (boş değerlerle)
  repoya eklenir.
- `VITE_` değişkenleri derlenmiş JS'e girer, yani istemcide görünür. Ders
  projesi için kabul edilebilir; README'de not düş.
- Görsel URL'leri TMDB'nin image base URL + size + `file_path` kuralıyla
  oluşturulur (tek bir yardımcı fonksiyonda). `null` path için placeholder.
- **Attribution:** Footer'da ve `/about` sayfasında TMDB logosu ve
  "This product uses the TMDB API but is not endorsed or certified by TMDB."
  ifadesi. Kullanım koşullarını teslim öncesi tekrar kontrol et.
- Muhtemel endpoint'ler (hepsini ilk gün doğrula):
  - `/search/keyword` → tema keyword ID'lerini bulmak için
  - `/discover/movie`, `/discover/tv` → `with_keywords`, `with_genres`, yıl, `sort_by`, `page`
  - `/search/movie`, `/search/tv`, `/search/person`
  - `/movie/{id}`, `/tv/{id}` → `append_to_response` ile credits, keywords, recommendations, videos
    (doğrulandı: `similar` alakasız sonuç veriyor, yerine `recommendations` kullanılır;
    dizilerde `credits` sadece son sezonu kapsar → `aggregate_credits` kullanılır)
    (dizilerde `aggregate_credits` olabilir; doğrula)
  - `/person/{id}` → `combined_credits`
  - `/genre/movie/list`, `/genre/tv/list`
- Keyword ID'lerini **kod içine tahminle yazma**. `/search/keyword` ile bul,
  doğrula, `src/config/themeKeywords.js` gibi tek bir yerde sabitle ve
  hangi ID'nin hangi keyword olduğunu yorumla yaz.
- Keyword'lerde mantıksal VEYA (`|`) / VE (`,`) davranışını doğrula; tema
  listeleri için VEYA istenir.

### Keyword riski (projenin en kritik teknik riski)
Keyword'ler hem alakasız yapımları getirebilir (gürültü) hem de bazı ilgili
yapımları kaçırabilir (eksik etiketleme). Bu yüzden:
- Her keyword'ün ilk sonuçlarını tematik uygunluk açısından incele ve kullanıcıya göster.
- Gürültüyü azaltmak için minimum oy sayısı (`vote_count.gte` benzeri, doğrula)
  gibi bir eşik dene; etkisini sayılarla raporla.
- Keyword'ler UI'da **gruplar halinde ayrı ayrı** filtrelenebilir olsun
  (AI / Robot / Android / Cyborg), kullanıcı gürültülü bir grubu kapatabilsin.
- Sonuçlar kabul edilemeyecek kadar gürültülüyse kendi başına çözüm uydurma;
  seçenekleri kullanıcıya sun.

---

## 5. Sayfalar ve route'lar

```
/                     Command Center (Home)
/movies               Cinematic Archive — Movies        [LİSTE 1, TMDB]
/series               Cinematic Archive — Series        [LİSTE 2, TMDB]
/cast                 Cast Registry                     [LİSTE 3, TMDB]
/entities             Intelligence Database (dossier'ler) [ekstra liste]
/media/:type/:id      Media Detail                      [DİNAMİK DETAY, TMDB]
/entity/:slug         Classified Dossier                [DİNAMİK DETAY, hibrit]
/person/:id           Person Detail                     [DİNAMİK DETAY, TMDB]
/lab                  Comparison Lab                    [WOW]
/network              Intelligence Network              [WOW, en düşük öncelik]
/about                Hakkında + TMDB attribution + metodoloji
*                     404 — "FILE NOT FOUND" temalı
```

### `/` Command Center
- Temanın kısa tanıtımı (ne olduğu, neden ilginç)
- Öne çıkan dossier'ler (editoryal) + öne çıkan yapımlar (TMDB, canlı)
- Global arama kutusu
- **Gerçek** API verisinden hesaplanan istatistikler (örn. discover'ın
  `total_results` değerinden "X films in archive"). Uydurma sayı yok.
- Bölümlere büyük navigasyon kartları

### `/movies` ve `/series`
- Tema keyword'leriyle discover (VEYA)
- Arama (debounce'lu; arama varken `/search/*` kullanılır ve sonuçlar mümkünse
  temaya göre işaretlenir veya kullanıcıya "tüm TMDB'de arıyorsun" bilgisi verilir —
  davranışı kullanıcıyla netleştir)
- Filtreler: tür (genre), yıl aralığı/onyıl, **tema alt sınıfı** (AI / Robot /
  Android / Cyborg — keyword bazlı)
- Sıralama: popülerlik, puan, yayın tarihi
- **Filtre ve arama durumu URL query'de** (`useSearchParams`) → link paylaşılabilir,
  geri tuşu çalışır
- "Load more" veya sayfalama
- Kart: poster, başlık, yıl, puan, kısa overview

### `/cast` Cast Registry (3. API listesi)
- Tema yapımlarının credits'inden derlenen oyuncu/seslendirmen listesi
  (örn. discover'ın bir sayfasındaki yapımların top-billed cast'i; "Load more"
  bir sonraki sayfanın yapımlarını getirir). İstekler paralel ve cache'li.
- Kartta: oyuncu fotoğrafı, ad, **canlandırdığı karakter**, yapım
- **"Probable synthetic characters only"** toggle'ı: karakter adında
  robot/android/AI/computer/cyborg/voice vb. terimler geçenleri veya
  katalogdaki entity'lerle eşleşenleri gösterir. Bunun **sezgisel bir filtre**
  olduğu UI'da belirtilir.
- İsimle arama, departman/medya türü filtresi
- Akış: tema yapımlarını getir → her yapımın cast'ini al → birleştir →
  **aynı oyuncuyu tekilleştir** (birden fazla yapımda oynadıysa rolleri tek kartta
  topla) → karakter ve yapım bilgisiyle listele.
- UI'da listenin **sadece şu ana kadar yüklenen yapımlardan** derlendiğini
  belirten kısa bir not olsun ("Compiled from N archived productions").
- Bu sayfanın istek sayısını makul tut (yapım başına tek credits isteği, cache,
  sayfa başına sınırlı yapım); implementasyondan önce yaklaşımı ve tahmini
  istek sayısını kullanıcıya özetle.

### `/entities` Intelligence Database
- `entities.js` kataloğu + her kart için TMDB'den canlı poster/yıl
- Filtre: entity türü (AI, Android, Robot, Supercomputer…), medya türü (film/dizi)
- Arama, sıralama
- Bu sayfa ekstra; zorunlu 3 liste `/movies`, `/series`, `/cast`'tir.

### `/media/:type/:id` Media Detail
- Backdrop hero, poster, başlık, tagline, yıl, süre/sezon, türler, puan, overview
- Cast (oyuncu → `/person/:id` linki), varsa fragman
- **Bu yapımla ilişkili dossier'ler** (katalogda varsa) → `/entity/:slug`
- Benzer yapımlar (TMDB `recommendations`)
- `type` sadece `movie` veya `tv` olabilir; geçersizse 404 durumu

### `/entity/:slug` Classified Dossier
- "Gizli dosya" görünümü: Entity ID, Classification, Origin, First Appearance
  (TMDB tarihinden), Intelligence Type, Capabilities, Threat Assessment,
  Associated Media
- Üst kısım TMDB (backdrop, yapım, oyuncu/seslendiren — credits'te bulunursa),
  alt kısım etiketli "Archive Analysis"
- Karakter credits'te bulunamadıysa: "Character match: editorial" rozeti
- Kısa açılış animasyonu (tarama çizgisi / dosya açılma), `prefers-reduced-motion`'a saygı
- "Compare in Lab" butonu → `/lab?a=slug`
- Geçersiz slug → temalı 404

### `/person/:id`
- Profil, biyografi, temaya giren rolleri öne çıkarılmış combined credits

### `/lab` Comparison Lab
- İki entity seç (URL: `/lab?a=hal-9000&b=tars`)
- Radar chart (Recharts) + kriter bazlı barlar
- Kriterler: Autonomy, Human Interaction, Physical Mobility, Decision-Making, Adaptability
- Her kriterin ne anlama geldiğinin açıklaması + "editorial assessment" notu
- Her iki varlığın yapım bilgisi TMDB'den canlı

### `/network` Intelligence Network (zaman kalırsa)
- React Flow ile küçük, önceden tanımlı graf: entity düğümleri, yapım düğümleri,
  entity→yapım kenarları (TMDB ID), entity↔entity kenarları (editoryal)
- Kaynak kenarlar ile editoryal kenarlar görsel olarak ayrışır (düz / kesikli çizgi + legend)
- Düğüme tıklayınca ilgili detay sayfası
- Düğüm stilleri Tailwind ile

---

## 6. Başlangıç entity kataloğu

Her biri için TMDB ID'si **doğrulanmadan** katalogda `tmdbId: null` kalır.
Doğrulama: arama → doğru yıl/yapım → credits'te karakter adı var mı?

| slug | Varlık | Yapım | Medya | Tür |
|---|---|---|---|---|
| hal-9000 | HAL 9000 | 2001: A Space Odyssey (1968) | movie | Supercomputer / AI |
| tars | TARS | Interstellar (2014) | movie | Robot |
| wall-e | WALL-E | WALL·E (2008) | movie | Robot |
| skynet | Skynet | The Terminator (1984) | movie | AI network |
| jarvis | J.A.R.V.I.S. | Iron Man (2008) | movie | AI assistant |
| ava | Ava | Ex Machina (2014) | movie | Android |
| baymax | Baymax | Big Hero 6 (2014) | movie | Robot |
| samantha | Samantha | Her (2013) | movie | AI (OS) |
| dolores | Dolores Abernathy | Westworld (2016) | tv | Android (host) |
| data | Data | Star Trek: The Next Generation (1987) | tv | Android |

- GLaDOS ve diğer oyun karakterleri **kapsam dışı** (TMDB'de yok).
- Skynet gibi credits'te karakteri olmayan varlıklar "editorial match" olarak işaretlenir.

### `entities.js` şeması (öneri)
```js
{
  slug: 'hal-9000',
  name: 'HAL 9000',
  aliases: ['Heuristically programmed ALgorithmic computer'],
  entityType: 'supercomputer',        // ai | android | robot | supercomputer | network | assistant
  media: { type: 'movie', tmdbId: null, title: '2001: A Space Odyssey', year: 1968 },
  creditCharacterName: 'HAL 9000 (voice)', // doğrulanınca doldur; yoksa null
  // ---- EDITORIAL (UI'da "Archive Analysis" olarak etiketlenir) ----
  summary: '...',
  capabilities: ['...'],
  threatLevel: 'high',                 // low | moderate | high | critical
  scores: { autonomy: 8, humanInteraction: 6, mobility: 1, decisionMaking: 9, adaptability: 5 },
  related: ['skynet'],
}
```

---

## 7. Görsel kimlik

- **Atmosfer:** karanlık araştırma laboratuvarı / gizli istihbarat arşivi
- **Renkler:** koyu lacivert, siyah, antrasit zemin; elektrik mavisi + mor vurgu;
  tehdit seviyeleri için tutarlı bir renk ölçeği. Tailwind theme'de token olarak tanımla.
- **Tipografi:** okunabilir bir sans (gövde) + teknik etiketler için monospace
- **Detaylar:** ince grid çizgileri, ölçülü neon glow, tarama çizgisi, köşe
  braketleri, "CLASSIFIED" damgası gibi motifler — **okunabilirliği bozmadan**
- **Animasyon:** Framer Motion ile kısa sayfa/panel geçişleri; `prefers-reduced-motion`'a uy
- **Skeleton loading** (düz "Loading…" yerine temalı iskelet kartlar)
- **Responsive:** masaüstü öncelikli ama 375px genişlikte her sayfa kullanılabilir;
  mobilde navbar hamburger menüye döner
- **Erişilebilirlik:** semantik HTML, görünür focus, `alt` metinleri, yeterli kontrast,
  klavyeyle gezilebilirlik

---

## 8. Teknoloji yığını

Zorunlu: **React, Tailwind CSS**

Kullanılacak:
- **Vite** (React şablonu, JavaScript — TypeScript değil, kullanıcı aksini söylemedikçe)
- **Tailwind CSS** — güncel sürümün resmi Vite kurulum yöntemini dokümantasyondan kontrol et
- **React Router** — güncel sürüm; import edilen paket adını dokümantasyondan doğrula
- **fetch** (axios gerekmez)
- **Framer Motion** — animasyonlar
- **Recharts** — Lab grafikleri
- **React Flow** (`@xyflow/react`) — sadece Network sayfası, en son eklenir
- **lucide-react** — ikonlar

Yeni bir kütüphane eklemeden önce kullanıcıya sor. Global state kütüphanesi
(Redux, Zustand) **gerekmez**; props + gerekirse tek bir Context yeterli.

---

## 9. Klasör yapısı

```
src/
├── components/
│   ├── layout/      Navbar, Footer, PageShell
│   ├── common/      Loader/Skeleton, ErrorState, EmptyState, SearchBar, FilterBar, LoadMore, Badge
│   ├── media/       MediaCard, MediaGrid, CastList
│   ├── entity/      EntityCard, DossierHeader, AnalysisPanel, ScoreBars
│   └── person/      PersonCard
├── pages/           HomePage, MoviesPage, SeriesPage, CastPage, EntitiesPage,
│                    MediaDetailPage, EntityDetailPage, PersonDetailPage,
│                    LabPage, NetworkPage, AboutPage, NotFoundPage
├── services/
│   └── tmdb.js      Tüm TMDB istekleri burada. Component'ler fetch çağırmaz.
├── hooks/           useFetch (AbortController + loading/error/data), useDebounce
├── config/          themeKeywords.js (doğrulanmış keyword ID'leri)
├── data/            entities.js (editoryal katalog)
├── utils/           imageUrl, formatDate, vb.
├── App.jsx          Route tanımları
└── main.jsx
```

Gereksiz soyutlama yapma. Bir şey tek yerde kullanılıyorsa ayrı dosyaya çıkarmak zorunlu değil.

---

## 10. Kod kuralları

- Function component + hooks. Class component yok.
- Component'ler veri çekmeyi `services/tmdb.js` + `useFetch` üzerinden yapar.
- `useEffect` içindeki isteklerde **AbortController** ile cleanup (race condition ve
  unmount sonrası setState olmasın).
- Basit bellek içi cache (aynı URL ikinci kez istenmesin) — `services` katmanında.
- Arama girdisi debounce'lu (~300–400 ms).
- Liste/filtre durumu URL query'de.
- Anlamlı isimler, kısa ve amaçlı yorumlar (ne yaptığını değil, neden yaptığını).
- Prop drilling 2–3 seviyeyi geçerse Context düşün; öncesinde değil.
- `console.log` teslimden önce temizlenir.
- ESLint uyarısız.

---

## 11. Deploy

- **Vercel** (veya Netlify). Environment variable'ı platform panelinden ekle.
- SPA olduğu için doğrudan bir alt sayfa URL'si yenilenince 404 olmaması için
  rewrite kuralı gerekir (Vercel: `vercel.json` ile tüm yolları `index.html`'e yönlendir).
- Deploy sonrası her route'u canlı sitede doğrudan URL ile ve yenileyerek test et.
- README: proje açıklaması, ekran görüntüleri, canlı link, kurulum adımları,
  `.env.example`, kullanılan API, veri katmanları (TMDB vs editoryal) açıklaması,
  özellik listesi.

---

## 12. 6 günlük plan ve öncelik

| Gün | Tarih | Hedef |
|---|---|---|
| 1 | 24.11 | Kurulum (Vite, Tailwind, Router), `.env`, `tmdb.js`, endpoint + keyword doğrulama, entity TMDB ID doğrulama, ilk deploy |
| 2 | 25.11 | Tasarım sistemi, layout (Navbar/Footer), Home, ortak loading/error/empty component'leri |
| 3 | 26.11 | `/movies`, `/series`, `/cast` + arama, filtre, sıralama, load more, URL state |
| 4 | 27.11 | `/media/:type/:id`, `/person/:id`, `/entities`, `/entity/:slug` |
| 5 | 28.11 | Lab, animasyonlar, cila; zaman kalırsa Network |
| 6 | 29.11 | Responsive + hata testleri, README, attribution, son deploy — **akşam 20:00'den önce teslim** |

**Zaman daralırsa öncelik:**
1. Zorunlu şartlar (3 liste, detay, arama/filtre, loading/error, router, responsive)
2. Classified Dossier tasarımı
3. Comparison Lab
4. Cila ve animasyonlar
5. Network (kesilebilir) — tamamlandı
6. Boot Sequence intro (26.11'de eklendi)
7. Archive Terminal — **opsiyonel**, sadece intro tamamen bittikten sonra ve zaman kalırsa

### Kapsam kararı: Boot Sequence intro (26.11'de eklendi)
Kullanıcı onayıyla eklenen ekstra özellik. §13'teki "aşırı animasyon" maddesiyle
çelişmez çünkü isteğe bağlı, her an atlanabilir ve `prefers-reduced-motion`'a uyar.
- Siteye **sadece `/` adresinden ilk girişte** açılır; doğrudan linkler (`/movies`,
  `/entity/...` vb.) intro'yu atlar. Açılış ekranında **[SKIP INTRO]** butonu vardır.
  İzlenince/atlanınca tekrar otomatik açılmaz; footer'da "Replay intro".
- Holografik panel görünümü (referans: Vietnamca oyun HUD'u, `design-refs/qBo10…jpg`).
- Ses: Web Speech API (`speechSynthesis`); ses dosyası/video/API key yok. Ses yoksa
  intro altyazılı ve sessiz devam eder.
- Sahnelerde sitenin **gerçek** component'leri ve canlı TMDB verisi kullanılır; sahte
  veri, sahte grafik, film sahnesi veya video yok.
- Kod `src/components/intro/` altında, `React.lazy` ile ayrı parça.
- **27.11 akşamı** intro hâlâ bitmemişse eksik sahneler çıkarılır, çalışan kısmıyla
  bırakılır; intro işi 28.11'e taşınmaz.

### Kapsam kararı: Archive Terminal (26.11'de eklendi) — OPSİYONEL
Sadece intro tamamen bittikten sonra ve zaman kalırsa yapılır.
- Komut satırı tarzı arama/gezinme paneli. **Ctrl+K** ile açılır, **Esc** ile kapanır,
  **↑/↓** ok tuşlarıyla komut geçmişi.
- **Sabit komut listesi** + `help` komutu. Serbest metin yorumlanmaz; bilinmeyen komut
  "unknown command, type help" hatası verir.
- **Yapay zekâ / LLM yok.** Sohbet botu gibi görünmez (konuşma balonu, avatar, "asistan"
  dili yok); terminal/komut satırı görünümünde olur.
- Veriyi mevcut `services/tmdb.js` fonksiyonlarıyla ve `entities.js` kataloğuyla alır;
  sahte çıktı üretmez.

### Özellik dondurma
- **28.11 öğlen:** Terminal o saate kadar tam çalışır halde değilse **tamamen çıkarılır**,
  yarım bırakılmaz.
- **28.11 öğleden sonra:** README ve son kontroller; yeni özellik yok.
- **29.11:** sadece kontrol, README düzeltmeleri ve teslim; yeni özellik yok.

---

## 13. Kapsam dışı

Kapsam **film ve dizilerdeki** kurgusal yapay zekâlar ve robotlardır. Sitede,
README'de veya sunumda projenin oyun arşivi de içerdiği söylenmez.

Backend, veritabanı, kullanıcı girişi, gerçek AI/LLM entegrasyonu, chatbot,
oyun API'si, admin paneli, büyük ve doğrulanmamış karakter kataloğu, TypeScript'e
geçiş (istenmedikçe), aşırı animasyon, API'de olmayan veriyi API verisi gibi göstermek.

---

## 14. Claude Code çalışma biçimi

1. Her oturumun ve **her adımın** başında bu dosyayı ve ilgili mevcut dosyaları
   incele; varsayım yapma. Çalışan kodu adımın gerektirmediği sürece değiştirme.
2. **Küçük ve bitirilebilir adımlarla** ilerle. Her adımdan önce hangi dosyaları
   oluşturacağını/değiştireceğini kısaca söyle.
3. Çalışan kodu baştan yazma; gerekirse önce sor.
4. API alanlarını **gerçek yanıtla doğrula**, tahmin etme.
5. TMDB verisi ile editoryal veriyi hem kodda hem UI'da ayrı tut.
6. Her adımın sonunda:
   - `npm run build` ve `npm run lint` çalıştır, hataları düzelt
   - Kullanıcıya **nasıl test edeceğini** (hangi URL, neye bakacağını) söyle
   - Mantıklı bir noktada git commit öner (anlamlı commit mesajıyla)
7. Büyük bir adımı bitirmeden sonrakine geçme. Adım sonunda **build/lint ve test
   sonuçlarını göster**, kullanıcıdan onay almadan sonraki adıma başlama.
8. **Sahte veri yasak.** API başarısız olursa, bir alan boş gelirse veya
   doğrulama yapılamazsa mock/uydurma veri üretme ve hiçbir şeyi API'den gelmiş
   gibi gösterme. Error/empty durumunu göster ve durumu kullanıcıya bildir.
9. Ödev şartlarına aykırı bir şey (başka framework, Tailwind dışı stil kütüphanesi,
   hazır şablon) önerme.
10. Gün sonunda kısa bir durum özeti ver: ne bitti, ne kaldı, plana göre neredeyiz.
11. Kullanıcıyla Türkçe konuş; kod, UI metni ve commit mesajları İngilizce.
