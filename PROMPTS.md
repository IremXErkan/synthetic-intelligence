# Claude Code Prompt Sırası — Synthetic Intelligence

Kullanım:
1. Boş bir proje klasörü aç, `CLAUDE.md` dosyasını klasörün köküne koy.
2. TMDB'den API key al (themoviedb.org → hesap → Settings → API).
3. Klasörde terminalde `claude` çalıştır.
4. Aşağıdaki prompt'ları **sırayla**, her biri bitip test ettikten sonra yapıştır.
   Bir adım bitmeden sonrakine geçme.

İpucu: Büyük adımlarda Claude Code'u önce **plan modunda** (Shift+Tab) çalıştır,
planı onayla, sonra uygulat.

Her adımda geçerli kurallar CLAUDE.md'nin 14. bölümünde: mevcut kodu incele,
çalışan kodu gereksiz değiştirme, test sonuçlarını göstermeden ilerleme, sahte
veri üretme. Claude Code bunlardan saparsa şunu yazman yeterli:
`CLAUDE.md bölüm 14'e uy.`

---

## 0 — Başlangıç (ilk mesaj)

```
CLAUDE.md dosyasını baştan sona oku. Henüz kod yazma.

Bana Türkçe olarak şunları ver:
1. Projeyi ve ödevin zorunlu şartlarını 5-6 maddede özetle.
2. Zorunlu şartların hangi sayfa/özellikle karşılandığını gösteren bir eşleme tablosu.
3. Kullanacağımız TMDB endpoint'lerinin listesi ve her birinden hangi alanları
   kullanacağımız (bunları sonraki adımda gerçek istekle doğrulayacağız).
4. 1. günü 30-60 dakikalık küçük adımlara böl.
5. Başlamadan önce bana sorman gereken sorular (örneğin API key mi Bearer token mı).
```

---

## Gün 1 — Kurulum ve API doğrulama

### 1.1 Proje kurulumu
```
1. günün ilk adımını yap: Vite + React (JavaScript) projesi kur, Tailwind CSS'in
güncel resmi Vite kurulumunu ve React Router'ı ekle. CLAUDE.md'deki klasör
yapısının boş iskeletini oluştur. .gitignore'da .env olduğundan emin ol,
.env.example ekle. git init yap.

Henüz sayfa tasarımı yapma; sadece "Synthetic Intelligence" yazan, Tailwind'in
çalıştığını gösteren bir test sayfası ve 2 route yeterli.

ESLint yapılandırmasının gerçekten oluştuğunu ve package.json'da "lint"
script'inin tanımlı olduğunu kontrol et; yoksa ekle.

Bitince npm run build ve npm run lint çalıştır, çıktılarını göster, sonra bana
nasıl test edeceğimi söyle.
```

### 1.2 TMDB servis katmanı ve doğrulama
```
API key'imi .env dosyasına ekledim. Şimdi:

1. src/services/tmdb.js dosyasını oluştur: base URL, auth, ortak request
   fonksiyonu, hata yönetimi, basit bellek içi cache, image URL yardımcısı.
2. Gerçek isteklerle şunları doğrula ve her birinin yanıtından kullanacağımız
   alanları bana kısa bir tablo halinde göster:
   - /search/keyword ile şu keyword'lerin ID'leri: artificial intelligence, robot,
     android, cyborg, sentient AI, supercomputer (ve önerebileceğin benzerleri)
   - Bu keyword'lerle /discover/movie ve /discover/tv (VEYA mantığıyla): toplam
     sonuç sayısı ve ilk 5 sonuç başlığı. Sonuçlar tema ile alakalı mı?
   - Her keyword'ü ayrı ayrı da dene: hangisi gürültülü, hangisi temiz?
   - Minimum oy sayısı eşiği gibi bir filtrenin gürültüyü ne kadar azalttığını
     sayılarla göster. Interstellar, Ex Machina, WALL·E gibi bilinen yapımlar
     sonuçlarda çıkıyor mu?
   - Bir film detayı: append_to_response ile credits, keywords, similar, videos
   - Bir dizi detayı: credits ve aggregate_credits farkı
   - /person/{id} + combined_credits
3. Doğrulanan keyword ID'lerini yorumlarıyla src/config/themeKeywords.js'e yaz.

Hiçbir alan adını tahminle yazma; yanıtta görmediğin alanı kullanma.
```

### 1.3 Entity kataloğu doğrulama
```
CLAUDE.md bölüm 6'daki 10 entity için TMDB doğrulaması yap:
- Doğru yapımı (yıl ve medya türüyle) bul, TMDB ID'sini al
- Credits'te karakter adı var mı, varsa tam olarak nasıl yazılmış ve oyuncu kim
- Poster ve backdrop var mı

Sonucu bana tablo olarak göster (doğrulanamayanları işaretle). Onay verirsem
src/data/entities.js dosyasını CLAUDE.md'deki şemayla oluştur. Editoryal
alanları (summary, capabilities, scores, threatLevel, related) makul ve
birbiriyle tutarlı şekilde doldur; skorları neden öyle verdiğini kısaca açıkla.
```

### 1.4 İlk deploy
```
Projeyi şimdiden Vercel'e deploy edilebilir hale getir: SPA rewrite için
vercel.json ekle, environment variable'ı Vercel'e nasıl ekleyeceğimi adım adım
anlat. Deploy ettikten sonra canlı sitede neyi kontrol etmem gerektiğini söyle.
Gün 1 özetini ver.
```

---

## Gün 2 — Tasarım sistemi ve Home

### 2.1 Tasarım sistemi + layout
```
CLAUDE.md bölüm 7'ye göre tasarım sistemini kur:
- Tailwind theme'de renk token'ları (zemin, yüzey, vurgu mavisi, mor, tehdit
  seviyesi renkleri), font'lar
- Navbar (mobilde hamburger), Footer (TMDB attribution dahil), PageShell
- Ortak component'ler: Skeleton kartlar, ErrorState (retry butonlu),
  EmptyState, Badge, SectionHeader
- Framer Motion ile basit sayfa geçişi; prefers-reduced-motion desteği
- Temalı 404 sayfası

Önce tasarım yönünü 5-6 maddede bana anlat (hangi motifler, nasıl
okunabilir kalacak), onaylarsam uygula. Sonuç 375px, 768px ve 1440px'te düzgün olmalı.
```

### 2.2 useFetch ve Home
```
1. hooks/useFetch (AbortController, loading/error/data, retry) ve hooks/useDebounce oluştur.
2. HomePage (Command Center): tema tanıtımı, TMDB'den canlı öne çıkan
   yapımlar, öne çıkan dossier'ler, discover total_results'tan gerçek
   istatistikler, global arama kutusu, bölümlere navigasyon kartları.

Loading, error ve empty durumlarının hepsini test edebileceğim bir yol söyle
(örn. key'i geçici bozmak, network'ü offline yapmak).
```

---

## Gün 3 — Listeleme sayfaları

### 3.1 Movies ve Series
```
/movies ve /series sayfalarını yap. İkisi aynı yapıda olduğu için ortak
component'ler kullan, kod tekrarı olmasın.

- Tema keyword'leriyle discover
- Debounce'lu arama (arama modunda davranışı önce bana öner)
- Filtreler: genre, onyıl/yıl, tema alt sınıfı (AI/Robot/Android/Cyborg)
- Sıralama: popülerlik, puan, tarih
- Tüm filtre/arama durumu URL query'de (useSearchParams)
- "Load more"
- Kart: poster, başlık, yıl, puan, kısa overview, detay linki
- Skeleton, error, empty durumları
```

### 3.2 Cast Registry
```
/cast sayfasını CLAUDE.md'deki tanıma göre yap. Önce bana yaklaşımını anlat:
ilk yüklemede ve her "Load more"da kaç istek atılacak, nasıl paralelleşecek,
cache nasıl çalışacak, aynı oyuncu nasıl tekilleştirilecek, "Probable
synthetic characters" sezgisel filtresi hangi kurallarla çalışacak. Listenin
sadece yüklenen yapımlardan derlendiği UI'da nasıl belirtilecek? Onaylarsam uygula.
```

---

## Gün 4 — Detay sayfaları

### 4.1 Media ve Person detay
```
/media/:type/:id ve /person/:id sayfalarını yap (CLAUDE.md bölüm 5).
Geçersiz type veya id için temalı hata/404 durumu olsun. Media detayında
bu yapımla ilişkili dossier'lere link ver.
```

### 4.2 Entities ve Classified Dossier
```
/entities listesini ve /entity/:slug Classified Dossier sayfasını yap.
TMDB verisi ile "Archive Analysis" editoryal bölümü görsel olarak net ayrılsın.
Karakter credits'te yoksa "Character match: editorial" rozeti göster.
Kısa bir dosya açılma/tarama animasyonu ekle. "Compare in Lab" butonu /lab?a=slug'a gitsin.
```

---

## Gün 5 — WOW özellikleri

### 5.1 Comparison Lab
```
/lab sayfasını yap: iki entity seçimi (URL'de a ve b), Recharts radar chart,
kriter bazlı barlar, her kriterin açıklaması, "editorial assessment" notu,
iki yapımın TMDB'den canlı bilgisi. Mobilde de kullanılabilir olsun.
```

### 5.2 Cila
```
Tüm siteyi bir kullanıcı gözüyle gez ve bana iyileştirme listesi çıkar:
tutarsız boşluklar, eksik hover/focus durumları, yavaş yüklenen yerler,
mobil sorunları, erişilebilirlik eksikleri. Etkisi yüksek olanlardan başlayarak
düzelt. Yeni büyük özellik ekleme.
```

### 5.3 Network (sadece zaman kalırsa)
```
Zaman ve kod durumu uygunsa /network sayfasını React Flow ile CLAUDE.md'deki
gibi küçük ve önceden tanımlı bir graf olarak yap. Kaynak ve editoryal kenarlar
görsel olarak ayrışsın, legend olsun, düğümler detay sayfalarına gitsin.
Uygun değilse bunu bana söyle ve atla.
```

---

## Gün 6 — Test ve teslim

### 6.1 Son kontrol
```
Teslim öncesi kontrolü yap:
1. CLAUDE.md bölüm 2'deki kontrol listesini kodla tek tek karşılaştır,
   eksik olan var mı?
2. Tüm route'ları listele; her biri için loading/error/empty durumu var mı?
3. npm run build ve npm run lint temiz mi? console.log kaldı mı?
4. .env repoda değil mi, .env.example var mı?
5. TMDB attribution footer'da ve About'ta var mı?
6. Responsive: 375 / 768 / 1440 px kontrol listesi
Bulduklarını düzelt ve bana rapor ver.
```

### 6.2 README ve deploy
```
README.md yaz: proje açıklaması, canlı link ve repo linki için yer, özellik
listesi, ekran görüntüleri için yer, kurulum adımları, .env.example, kullanılan
API, veri katmanları (TMDB vs editoryal) ve neden böyle tasarlandığı, kullanılan
kütüphaneler. Sonra son deploy'u yap ve canlı sitede her route'u doğrudan URL ile
açıp yenileyerek test etmem için bir kontrol listesi ver.
```

### 6.3 Sunum (isteğe bağlı)
```
Hocaya projeyi 3-4 dakikada gösterebileceğim bir demo akışı hazırla: hangi
sayfadan başlayayım, hangi özellikleri hangi sırayla göstereyim, ödevin hangi
şartını nerede karşıladığımı nasıl vurgulayayım.
```

---

## İşler ters giderse kullanabileceğin prompt'lar

```
Bu hatayı alıyorum: [hata mesajını yapıştır]. Önce nedenini açıkla, sonra en
küçük değişiklikle düzelt. Çalışan başka bir şeyi bozma.
```

```
Plana göre geride kaldım. CLAUDE.md'deki öncelik sırasına göre kalan
zamanda neyi bitirmeliyim, neyi kesmeliyim? Kod yazmadan önce planı göster.
```

```
Yeni bir oturuma başlıyorum. CLAUDE.md'yi ve mevcut kodu incele, git log'a bak,
ne bittiğini ve sıradaki adımın ne olduğunu bana özetle.
```
