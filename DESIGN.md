# DESIGN.md — Synthetic Intelligence görsel dili

> Bu dosya CLAUDE.md bölüm 7'deki onaylanmış tasarım yönünü **genişletir**, onun
> yerine geçmez. Renk token'ları, Inter + JetBrains Mono, mavi = TMDB / mor =
> editoryal ayrımı aynen geçerlidir. Referans görseller `design-refs/` klasöründe
> (repoya gitmez).
>
> Referanslar **sadece ilham** içindir: içlerindeki logolar, film kareleri,
> oyun arayüzleri ve yazılar sitede kullanılmaz, birebir kopyalanmaz. Sitedeki
> bütün görseller TMDB'den gelir.

---

## 1. Ortak görsel dil (referanslardan çıkan)

| Motif | Referans | Web karşılığı |
|---|---|---|
| **Kesik köşeli paneller** (chamfer) | Nova dosyası, Jarvis, oyun HUD'u, Bay City Police | `clip-path: polygon(...)` ile tek bir `<HudPanel>` component'i; 1 veya 2 köşe kesik |
| **Panel başlık sekmesi** | Robot HUD ("VIEW 01", "SKILL"), Bay City | Panelin sol üstünde küçük, monospace, büyük harfli etiket şeridi |
| **`::` önekli etiket–değer satırları** | Nova dosyası, Hurley profili | `<DataRow label="ORIGIN" value="..." />` → `:: ORIGIN  Interstellar (2014)` |
| **Köşe braketleri** | Nova dosyası | Önemli panellerde 4 köşede ince L şeklinde çizgiler |
| **Tonlanmış portre** | Hurley/Altered Carbon, Bay City | TMDB görseli: hafif desatürasyon + mavi ton katmanı; hover'da renk geri gelir |
| **Portre üzerinde tarama noktaları** | Hurley yüz takibi | Dossier portresinde birkaç küçük parlayan nokta + yatay tarama çizgisi (sadece açılışta) |
| **Durum renkleri** | Nova "Mission Successful / Failure / [CLASSIFIED]" | Yeşil = olumlu, kırmızı = tehdit, turuncu = `[CLASSIFIED]`/uyarı. Her zaman metinle birlikte |
| **Taralı (hatched) barlar** | Robot HUD "SKILL", "LEVEL" | `repeating-linear-gradient` ile skor barları |
| **HUD halkaları** | Robot HUD, Jarvis küresi | Merkezde dönen kesikli SVG halkalar (yavaş, `prefers-reduced-motion`'da durur) |
| **Paneller arası bağlantı çizgileri** | Hurley profili, Knowledge Graph | Dossier'de portre ile "Associated Media" paneli arasında ince SVG eğri; Network sayfasının görsel dili |
| **Durum çubuğu** | Jarvis "SYSTEM STATUS: OPTIMAL" | Üst barda gerçek durum: TMDB bağlantısı (son istek başarılı mı), arşivdeki gerçek kayıt sayısı |
| **Dosya numaraları / kodlar** | Bay City "CASE FILE", Nova "AGENT #" | Entity ID (`SI-001`), TMDB ID'si (`TMDB #157336`) monospace etiket olarak |

### Renk notu
Referansların çoğu **camgöbeği/teal** ağırlıklı. Mevcut `signal` (#38bdf8) buna
yakın; gerekirse biraz daha camgöbeğine kaydırılabilir (`#22d3ee` civarı).
Mor (`pulse`) editoryal katman için **kalır**. Mor-turuncu neon sahnesi
(sistem diyagnostik görseli) çok yoğun; sadece mor vurgunun ilhamı olarak alınır.

---

## 2. Sayfa bazında uygulama

### Command Center `/` ← Jarvis dashboard + Robot HUD
- Masaüstünde **dashboard grid'i**: ortada hero, etrafında paneller
- **Hero:** öne çıkan bir entity'nin TMDB görseli, etrafında yavaş dönen HUD
  halkaları, altında adı ve "OPEN DOSSIER" butonu. Her ziyarette rastgele bir entity
- **Durum çubuğu:** `SYSTEM STATUS ● ONLINE` (TMDB isteği başarılıysa), gerçek saat,
  arşivdeki film/dizi sayısı (`total_results`)
- **"Latest Intelligence Feed" paneli:** temadaki en yeni çıkan yapımlar
  (TMDB, tarihe göre sıralı) — Jarvis'teki "Live Intelligence Feed" karşılığı, ama
  **tamamen gerçek veri**
- **Hızlı erişim panelleri:** Movies / Series / Cast / Entities / Lab
- Mobilde paneller tek sütuna dizilir

### Liste sayfaları `/movies`, `/series`, `/cast` ← Bay City Police paneli
- Kartlar = küçük HUD panelleri: tonlanmış görsel, altta koyu bilgi şeridi
  (`TITLE`, `YEAR`, `RATING`, `TMDB #id`)
- Hover'da: renk geri gelir, kenar parlar, köşe braketleri belirir
- Filtre çubuğu "kontrol paneli" görünümünde: monospace etiketli segmentli butonlar
- Sonuç sayısı `RECORDS FOUND: 407` şeklinde

### Classified Dossier `/entity/:slug` ← Nova dosyası + Hurley profili + oyun HUD'u
**Sitenin vitrini. En çok özen burada.**
- Büyük kesik köşeli çerçeve, ortada başlık plakası (`HAL 9000`), 4 köşede braket
- Sol: tonlanmış portre (TMDB backdrop veya oyuncu profili), üzerinde açılışta
  tarama çizgisi ve birkaç takip noktası
- Sağ: iki sütun `::` satırları — üst blok **TMDB verisi (mavi)**: Origin, First
  Appearance, Portrayed by, TMDB ID; alt blok **ARCHIVE ANALYSIS (mor)**:
  Classification, Intelligence Type, Threat Assessment
- Alt sol "ASSOCIATED MEDIA" listesi (Nova'daki "Key Missions" düzeni), alt sağ
  "ANALYST NOTES" paragrafı (Nova'daki "Wrangler Notes" düzeni; editoryal, mor)
- `[CLASSIFIED]` turuncu redaksiyon motifi editoryal metinlerde birkaç yerde
  (hover'da açılabilir — küçük bir eğlence)
- Portre ile Associated Media arasında ince bağlantı çizgisi (masaüstünde)
- Mobilde: çerçeve sadeleşir, sütunlar alt alta

### Media Detail `/media/:type/:id` ve Person `/person/:id`
- Dossier'in daha sade versiyonu: aynı panel ve `::` satır sistemi, braket yok,
  damga yok. Böylece Dossier özel kalır.

### Comparison Lab `/lab` ← Robot HUD
- Ortada radar chart, etrafında HUD halkası
- Sol ve sağda iki entity paneli: portre + taralı skor barları
- Üstte `ANALYZING...` → `ANALYSIS COMPLETE` kısa durum metni
  (gerçek bir bekleme değil, 300–500 ms geçiş animasyonu)

### Intelligence Network `/network` ← Knowledge Graph
- Siyah zemin, parlayan camgöbeği düğümler, ince çizgiler
- Sol panel: entity listesi (tıklayınca graf o düğüme odaklanır)
- Sağ panel: seçili düğümün özeti ve detay linki
- Referanstaki gibi yüzlerce düğüm **değil**: 10 entity + ilgili yapımlar

### 404 ve hata ekranları ← Bay City "ANALYSIS FAILED"
- `FILE NOT FOUND` / `SIGNAL LOST` başlıkları, `ANALYSIS FAILED` gibi durum satırları

---

## 3. Yapılmayacaklar (referanslardaki riskli şeyler)

- **Okunamayan küçük yazılar yok.** Referanslardaki 8px'lik dekoratif metinler
  sitede olmaz. Gövde metni min 14px, etiketler min 11px.
- **Sahte veri yok.** Referanslardaki CPU yüzdeleri, sahte grafikler, anlamsız kod
  satırları sitede **gösterilmez**. Her sayı ya TMDB'den ya da etiketli editoryal
  katmandan gelir. Dekorasyon gerekiyorsa veri gibi görünmeyen soyut çizgiler kullanılır.
- **Metnin arkasında motif yok.** Grid, tarama çizgisi ve glow metnin okunabildiği
  alanların arkasına girmez.
- **Sürekli animasyon az.** Sadece HUD halkaları yavaşça döner; geri kalanı tek seferlik.
  `prefers-reduced-motion` açıksa hepsi durur.
- **Görsel dosya ve font kopyalama yok.** Referanslardaki logolar, oyun
  arayüzleri ve fontlar kullanılmaz.

---

## 4. Tekrar kullanılabilir yapı taşları (önce bunlar)

Tasarımın %80'i bu birkaç component'le kurulur; sayfalar bunları birleştirir:

1. `HudPanel` — kesik köşe, opsiyonel başlık sekmesi, opsiyonel köşe braketleri, `variant: 'data' | 'editorial'` (mavi/mor kenar)
2. `DataRow` — `:: LABEL  value` satırı, monospace etiket
3. `TintedImage` — TMDB görseli + ton katmanı + hover'da renk + placeholder
4. `HatchedBar` — taralı skor barı (0–10), erişilebilir etiketli
5. `HudRings` — dekoratif SVG halkalar (`aria-hidden`)
6. `StatusDot` — gerçek durum göstergesi (online / error)
7. `Redacted` — `[CLASSIFIED]` metni, hover/focus ile açılabilir

Hepsi Tailwind ile; gerekirse `index.css` içinde küçük yardımcı sınıflar
(`clip-path`, `repeating-linear-gradient`) tanımlanır.

---

## 5. Öncelik (zaman daralırsa)

1. Yapı taşları 1–4 + liste kartları + Dossier çerçevesi
2. Command Center dashboard düzeni + durum çubuğu
3. Lab'deki HUD halkaları ve taralı barlar
4. Dossier tarama/takip noktası animasyonu, bağlantı çizgisi, `[CLASSIFIED]` açılması
5. Network görsel dili
