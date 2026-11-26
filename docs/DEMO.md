# Demo akışı (3–4 dakika)

Canlı site: https://synthetic-intelligence-khaki.vercel.app/

## Hazırlık (sunumdan önce, 2 dk)
- [ ] Siteyi aç, **ses açık**, tarayıcı zoom %100. (Anlatım kayıtlı ses dosyası; her tarayıcıda aynı.)
- [ ] Intro baştan açılsın diye konsolda: `localStorage.removeItem('si.introSeen')` → sayfayı yenile.
  (Ya da footer'daki **Replay intro** butonu.)
- [ ] İkinci sekmede: `/movies` hazır dursun (intro uzarsa doğrudan geçmek için).
- [ ] Mobil gösterim için DevTools → cihaz modu → 375 px (Ctrl+Shift+M) denenmiş olsun.
- [ ] Yedek: TMDB çökerse error durumunu gösterip README'deki ekran görüntüleriyle devam et.

## Akış

| Süre | Nerede | Ne yap / ne söyle | Ödevin hangi şartı |
|---|---|---|---|
| 0:00–0:25 | `/` ilk giriş | **Boot Sequence**: INITIALIZE → 2–3 sahne izlet → **Esc** ile geç. "Sahnelerde sitenin gerçek component'leri ve canlı TMDB verisi var; anlatım kayıtlı ses (ElevenLabs), dosya çalmazsa tarayıcı sesine ve altyazıya düşüyor; atlanabilir ve reduced-motion'a uyuyor." | Yaratıcılık / ekstra (%30) |
| 0:25–0:50 | Command Center | Temayı bir cümleyle anlat. Üst şerit: **TMDB ● ONLINE** ve **407 films / 124 series** — "uydurma değil, discover'ın `total_results` değeri." Bölüm kartları. | Home page: tema tanıtımı + bölümlere linkler; API entegrasyonu |
| 0:50–1:40 | `/movies` | **Subclass**'tan CYBORG'u kapat → sayı anında değişir. Genre / decade / sort seç. **Adres çubuğunu göster** (filtreler URL'de) → geri tuşu çalışır. Aşağı kaydır → **Load more**. Arama kutusuna "Interstellar" yaz → TMDB'nin tamamında arar; arşivde yüklü olanlarda *In archive* rozeti çıkar. Kısaca `/series` ve `/cast`'e geç ("3. liste: oyuncular, archive yapımlarının credits'inden derleniyor"). | 3 listeleme sayfası, pagination/Load more, reaktif arama + filtre, URL state |
| 1:40–2:05 | `/media/movie/62` | *2001: A Space Odyssey*'ye tıkla → **dinamik route**. Backdrop, cast (oyuncuya tıkla → `/person/:id`), fragman, recommendations ve "Archive analysis · Linked dossiers" kutusu (2001'de HAL 9000). | Dinamik detay sayfası, React Router |
| 2:05–2:35 | `/entity/hal-9000` | Dosya açılış animasyonu. **Cyan = TMDB'den canlı**, **mor = Archive Analysis (editoryal)** ayrımını göster. "Karakter adı TMDB credits'iyle doğrulandı" rozeti. → **Compare in Lab**. | Verinin anlamlı kullanımı; veri katmanlarının ayrımı |
| 2:35–2:55 | `/lab` | Radar chart, HAL 9000 vs TARS. "Skorlar öznel editoryal değerlendirme — sayfada yazıyor." Subject B'yi değiştir → URL güncellenir. | Ekstra özellik (Recharts) |
| 2:55–3:10 | `/network` | Grafikte bir düğüme tıkla. "Düz çizgi = TMDB ID bağlantısı, kesikli = editoryal ilişki." | Ekstra özellik (React Flow) |
| 3:10–3:30 | Her sayfa | **Ctrl+K** → `search movie her` → `open 1`. Tekrar Ctrl+K → `compare data ava`. "Sabit komut seti, yapay zekâ yok; bilinmeyen komut 'type help' der." | Ekstra özellik / UX |
| 3:30–3:45 | DevTools 375 px | Hamburger menü, liste ve dossier mobilde. `/media/movie/abc` → temalı **404**. | Responsive; error/empty durumları |
| 3:45–4:00 | Kod (VS Code / GitHub) | `src/services/tmdb.js` (bütün istekler burada, cache + AbortController), klasör yapısı, `npm test` → **75 test geçiyor**, README. | Component mimarisi, kod kalitesi, test |

## Söylenecek tek cümleler
- **Fikir:** "Bütün film, dizi ve oyuncu verisi canlı olarak TMDB'den geliyor; ben üstüne açıkça etiketlenmiş bir editoryal analiz katmanı ekledim."
- **Tema API'den:** "Arşiv elle seçilmiş 10 film değil; doğruladığım 17 TMDB keyword'üyle `discover`'dan gelen yüzlerce yapım."
- **Sahte veri yok:** "Bir istek başarısız olursa yer tutucu veri göstermiyorum; error durumu ve Retry butonu çıkıyor."
- **Durumlar:** "Her istekte temalı skeleton, error + Retry ve empty durumu var."

## Sorulursa
- **Neden React Router + Tailwind dışında kütüphane var?** Framer Motion (animasyon), Recharts (Lab), React Flow (Network), lucide-react (ikon). Hiçbiri UI kiti/şablon değil; stil tamamen Tailwind.
- **Token görünür mü?** Evet, `VITE_` değişkenleri istemciye gömülür; ücretsiz, salt-okunur TMDB token'ı için kabul edilebilir, README'de not var. `.env` hiç commit edilmedi.
- **Neden `similar` değil `recommendations`?** `similar` alakasız sonuçlar veriyordu; gerçek isteklerle karşılaştırıp `recommendations`'ı seçtim.
- **Diziler neden `aggregate_credits`?** Normal TV credits sadece son sezonu kapsıyor (Westworld'de doğrulandı).
