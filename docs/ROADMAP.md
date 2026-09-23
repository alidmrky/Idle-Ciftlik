# Geliştirme planı

## 0.1 — Oynanabilir temel

- Domates, biber, çilek ve bal bölgeleri.
- Üretim döngüleri, stok, satış, seviye ve çiftçiler.
- Bölge seçimi, dünya haritası ve hedefler.
- Otomatik kayıt ve sınırlı çevrimdışı üretim.
- Bağımsız ekonomi çekirdeği ve testleri.

## 0.2 — Tek ekran çiftlik ve lojistik

- Sayfa düzeninin yerini tam ekran oyun dünyası ve küçük HUD alır.
- Her parsel 2×2 ekim hücresidir; satın alınan her parsel sahnede yeni alan açar.
- Her parsele bir çiftçi: hasat, yükleme alanına taşıma ve geri dönme durumları.
- İlk hasatlar elle yapılır, çiftçi o parseli otomatikleştirir.
- Kapasiteli traktör, pazara gidiş/dönüş, teslimatta gelir; kasa ve hız yükseltmeleri.
- Kontroller parsellerin ve traktörün yanında; bölgeler aynı sahnenin alt kontrol şeridinde.
- Önceki kayıtların yeni veri modeline taşınması.

## Sonraki dilimler

0.3'te tamamlanan değişiklik: görünmeyen 40px tile ızgarası; çift taraflı tarla yolları, her parsel önünde koliler, çiftçi → koliler → traktör → depo → satış kamyonu zinciri. Parsel kontrolleri ayrı ayrılmış alanlarda. Dünya haritası düğmesi ve her bölge için 36 parçalı alan planı.

1. Dengeleme: ilk çiftçinin birkaç dakikada, ikinci bölgenin bir oyun oturumunda açılmasını gerçek oynama ölçümleriyle ayarlama. Gelir/harcama istatistikleri.
2. Lojistik geliştirme: depo kapasitesi, yükleme hızı ve ürünler arasında adil taşıma; üretim/teslimat darboğazlarını gösteren istatistikler.
3. Görev ödülleri ve kayıtlı görev durumu; günlük hedefler, çevrimdışı kazanç özeti, kayıt dışa/içe aktarma.
4. Seracılık, hayvancılık ve işlenmiş ürünler; örneğin domates → sos, süt → peynir. Her bölgeye ayrı mekanik.
5. Mevsimler ve uzman çiftçiler; kalıcı açılımlar sağlayan, oyuncunun seçtiği bir yeniden başlama sistemi.
6. Çok büyük sayı tipi (mantis/üs), ekonomi sürümleme ve kayıt migrasyonları.
7. Unity: C# simülasyon portu, aynı ekonomi testleri, mobil dokunmatik arayüz ve Steam kaydı. Platform yayınları ayrı aşamadır.

## Tasarım ilkeleri

İlk oyun reklam veya gerçek para satın alımı olmadan dengelenir. Bölge açılımları yalnızca yeni bir fiyat etiketi değil, üretimde yeni kararlar sunmalıdır. Sonsuz seviye fikri matematik ve içerik ölçeklemesi gerektirir; mevcut prototip bunu tamamlanmış saymaz. K → M → B → T → a → b … → z → aa → ab sırası binlik basamaklarla kullanılır.

## 0.4 — Gerçek 3D çiftlik

Three.js sahnesi, gölgeli düşük poligonlu modeller, döndürülebilir kamera, tam iki sıra ve yatay genişleme eklendi. Aynı durakta üst/alt koliler arasında kapasite paylaşılır. Parsel kontrolleri seçimle açılır. Bitkiler GPU instancing ile çizilir. İleri hedef: depo doluluk ve lojistik darboğaz göstergeleri.
