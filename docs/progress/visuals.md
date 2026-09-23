# Görsel tasarım ajanı — ilerleme

## 23 Eylül 2026 — İlk oynanabilir sürüm

- `src/FarmScene.tsx`: Bağımsız React bileşeni ve tamamen SVG ile çizilmiş izometrik çiftlik tamamlandı.
- Ada zemini, yükseltilmiş 4 ekim alanı, terracotta çatılı çiftlik evi, gölet, ağaçlar, çit, çiftçiler, ürün kasası, ahşap tabela ve kelebekler çizildi.
- Domates, biber, çilek ve arıcılık için ürün rengi/kovan görünümleri eklendi; seviye, çalışan ve büyüme durumu props ile bağlandı.
- `src/FarmScene.css`: Krem, adaçayı ve toprak renkleri; küçük animasyonlar; mobil ölçekleme; klavye odağı ve azaltılmış hareket desteği eklendi.
- Harici görsel, emoji veya görsel kütüphanesi kullanılmadı. Vektör çizim yüksek DPI ekranlarda keskin kalır.

## Arayüz sözleşmesi

`FarmScene({ cropId, level, workers, progress, onHarvest })`; `progress` 0–1 aralığındadır. `onHarvest` hasat düğmesinden tetiklenir. Ana ajan entegrasyon ve tarayıcı doğrulamasını yapar.

## Sonraki görsel adımlar

- Bölgelere özgü arazi biçimleri, mevsimler, daha çok çiftlik binası.
- Ürün teslimatı ve hasat anında kısa parçacık animasyonları.
- Unity geçişinde bu SVG sahnesi bir sanat yönü referansıdır; oyun hesaplamalarıyla bağlantısı yalnızca props düzeyindedir.

## 2026-09-23 — 0.3 koordinatör tamamlaması
- Eski perspektif serbest çizimi kaldırıldı. FieldWorld.tsx ve layout.ts gizli tile ızgarası üzerinden tüm çizimleri yerleştirir.
- Çiftçiler tarladan kendi koli noktasına taşır. Traktör dik açılı yol düğümlerini izler; kamyon ayrı üst yolda satışa gider.
- Yol ve tarla kontrolleri için ayrılmış alanlar var. Çok sayıda parselde kamera yakınlaştırma ve sürükleme sağlar.
- 36 parselin görsel/kontrol ayak izleri birbirinden ayrıdır; otomatik test eklendi.

## Son yerleşim düzeltmesi
- layout.ts tüm parselleri yolun iki tarafına yerleştiriyor. Yol düğümleri çizim ve araç hareketi için aynı kaynak.
- Yeni yol sıraları arasında 21 tile mesafe ayrıldı; kontrol kutuları ve ürünler üst üste binmiyor. 36 parselle otomatik doğrulandı.
- Kullanılmayan FarmScene dosyaları kaldırıldı; FieldWorld etkin sahnedir.
