# Filiz — Idle Farm

Türkçe, tarayıcıda oynanan bir idle çiftlik prototipi. React + TypeScript + Vite kullanır. Görseller kodla üretilmiş SVG çizimleridir.

## Çalıştırma

```sh
npm install
npm run dev
```

Tarayıcıda terminalin gösterdiği yerel adresi açın. Üretim derlemesi: `npm run build`. Ekonomi testleri: `npm test`.

## Oyun döngüsü

Tek oyun sahnesinde 2×2'lik bir parselle başlarsın. Ürün olgunlaşınca hasat düğmesiyle parselin yol kenarındaki kolilerine taşırsın. Çiftçi satın alınca kendi parselini hasat eder, ürünü kolilere bırakır ve geri döner. Traktör sadece yollardan ilerler, kolileri kapasitesi kadar toplar ve depoya götürür. Ayrı satış kamyonu depodan pazara gider; altın yalnızca kamyon teslimatında kazanılır. Parseller, verim, traktör kasası/hızı ve kamyon kasası ayrı yatırımlardır. Dünya haritası düğmesiyle bölgelere geçilir; ayrı web sayfası veya sekme yoktur.

Oyun pencerenin tamamını kaplar; sağ üstteki tam ekran düğmesi tarayıcının gerçek tam ekran modunu açar. Biber, çilek ve arıcılık sonraki üretim kollarıdır. Kayıt bu tarayıcıda tutulur ve eski 0.1 kaydı yeni modele taşınır. Çevrimdışı ilerleme en fazla 8 saat hesaplanır. Çiftçisi olmayan parseller bir hasat olgunlaşınca bekler; kendiliğinden toplanmaz.

## Mimari ve Unity yolu

- `src/game.ts`: React'tan bağımsız ekonomi, zaman simülasyonu, kayıt ve sayı biçimlendirme.
- `src/types.ts`: Parsel, çiftçi ve traktör durumları için ortak veri sözleşmesi.
- `src/App.tsx`: arayüz, zamanlayıcı ve tarayıcı depolaması.
- `src/FieldWorld.tsx`: görünmez tile ızgarası üzerinde çizilen çiftlik, çiftçiler, koli durakları ve araçlar.
- `src/layout.ts`: 40px mantıksal tile ölçüsü, çakışmayan parsel/kontrol alanları, dik açılı yollar ve rota interpolasyonu.
- `src/FarmMap.tsx`: parsel sayısına göre dolan bölgeler ve yeni bölge açılımları.
- `docs/progress/`: ajanların sorumluluk ve ilerleme kayıtları.
- `docs/ROADMAP.md`: prototip kapsamı ve sonraki geliştirmeler.

Unity geçişi otomatik bir dönüştürme değildir. Saf ekonomi fonksiyonları C#'a port edilir; aynı girdilerle aynı çıktıları üreten testler korunur. Ürün tanımları ileride JSON/ScriptableObject verisine ayrılır. Görseller ve kullanıcı arayüzü Unity'de yeniden oluşturulur. İlk prototip sonlu JavaScript sayıları kullanır; gerçek sınırsız ekonomi için mantis/üs tabanlı sayı tipi sonraki bir geliştirmedir.

## İlerleme kaydı kuralı

Her geliştirmede ilgili ajan `docs/progress/` içindeki kendi dosyasına yapılan değişiklik, doğrulama ve açık konuları ekler. Koordinasyon ve entegrasyon sonucu `integration.md` içinde tutulur.

## Prototip sınırları

Her bölgede en fazla 36 parsel vardır. Büyük çiftlikte yakınlaştırma ve sürükleme kullanılır. Tek traktör açık bölgeler arasında sırayla dolaşır; bulunduğu bölge depo göstergesinde yazılır. Depo henüz kapasitesizdir. Mevsimler, hayvancılık ve seralar planlanmaktadır. Kayıt sürümü 3, önceki 1/2 kayıtlarını okuyabilir. Gerçek sınırsız sayı sistemi henüz yoktur.
