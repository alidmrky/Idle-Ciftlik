# Koordinasyon ve entegrasyon

## 2026-09-23 — 0.2 tek ekran ve lojistik çalışması

- Kullanıcı yönlendirmesi: dashboard/sekme yapısı kaldırılacak; dünya tüm ekranı kaplayacak. Parsel üstü kontroller, görünür alan büyümesi, gerçek hasat/taşıma animasyonu ve yükseltilebilir traktör.
- Seçilen kural: her parsel 2×2 hücre; tek çiftçi kendi parselinden sorumlu. Parsel satın alma ve verim yükseltmesi farklı yatırımlar.
- `logistics_v2` ajanı: olay tabanlı ekonomi, hasat/taşıma/teslimat, kasa-hız, eski kayıt migrasyonu ve testler.
- `world_v2` ajanı: SVG dünya, fiziksel olarak artan parseller, sahne üzeri kontroller, durumla bağlı çiftçi ve traktör animasyonları.
- `hud_v2` ajanı: tam pencere ekranı, küçük HUD, aynı sahnede bölge seçimi, gerçek tam ekran düğmesi ve kayıt.
- Koordinatör: ortak `src/types.ts` sözleşmesi, entegrasyon, belge güncellemeleri, son tarayıcı ve test doğrulaması.
- Sunucu 5173 üzerinde zaten çalışıyor; ikinci sunucu başlatma denemesi 5174'e düştüğü için o süreç durduruldu.

## 2026-09-23 — Başlangıç

- İstek: tarayıcıda oynanabilir idle çiftlik; görev bazlı ajanlar ve dosyada ilerleme kayıtları; ileride Unity portu.
- Ekonomi ajanı: saf simülasyon, kayıt, büyük sayı gösterimi ve testler.
- Görsel ajanı: ürün ve seviye ile değişen izometrik SVG çiftlik.
- Arayüz ajanı: Türkçe oyun ekranı, harita, görevler, yükseltmeler ve kayıt bağlantısı.
- Koordinatör: React/Vite kurulumu, dosya sözleşmeleri, entegrasyon, derleme ve oyun doğrulaması.
- Başlangıç deposu boştu. Paket, TypeScript ve Vite yapılandırması oluşturuldu.
- Son doğrulama ve bilinen sınırlamalar entegrasyon tamamlandığında aşağıya eklenecek.

## 2026-09-23 — İlk oynanabilir sürüm tamamlandı

- Üç ajanın ekonomi, SVG sahne ve React arayüzü birleştirildi. Kullanıcı isteğiyle gelecekte görev bazlı ajan/progress akışı `AGENTS.md` içine yazıldı.
- `npm test`: 6/6 geçti. TypeScript ve Vite üretim derlemesi geçti.
- Tarayıcıda satışın bakiyeyi artırdığı, çiftçinin üretim hızını artırıp otomatik satışı açtığı, haritanın yetersiz bakiye ile bölgeleri kilitlediği ve yeniden yüklemede seviyenin/çiftçinin/bakiyenin korunduğu doğrulandı.
- Sahne kapsayıcısının hasat düğmesini kesmesi giderildi; yinelenen hava/başlık etiketleri kaldırıldı. Hasat düğmesinin +1 saniye üretim geri bildirimi doğrulandı.
- 390px genişlikte yatay taşma yok: belge clientWidth ve scrollWidth 375px. Masaüstü görünümü son kontrolde doğrulandı, geçici viewport ayarı geri alındı.
- Yerel sunucu: http://127.0.0.1:5173/ . Sunucu durursa `npm run dev` ile yeniden açılır.
- Kurulum/test/derleme araçları Windows sandbox erişim hatası verdi; aynı komutlar onaylı yükseltilmiş izinlerle başarıyla çalıştı. Bağımlılık denetimi sıfır güvenlik açığı bildirdi.
- Sınırlar: görevler şimdilik ödülsüz hedef takibi; mevsim görsel tema; hayvancılık ve seracılık yol haritasında. JavaScript sayı tavanı 1e300, seviye tavanı 10000; gerçek sınırsız ekonomi değildir. Harita şimdilik bölge seçme/açma ekranı. Unity portu henüz yapılmadı.
- Dengeleme simülasyonu aktif yatırımda biberi yaklaşık 97–105 saniyede açıyor; ayrıntılar ekonomi günlüğünde. Sonraki dilim depo/taşıma/pazar ve görev ödülleri olabilir.

## 2026-09-23 — 0.3: Tile yerleşimi ve iki aşamalı taşıma

- Son kullanıcı çizimi esas alındı: depodan çıkan ana yol ve iki tarafına parseller dizilen yatay yollar. Kullanıcıya tile ızgarası gösterilmiyor.
- Alt ajanların kullanım limiti nedeniyle yarıda kalan entegrasyonu koordinatör tamamladı. Eski çarpık SVG parselleri kaldırılıp FieldWorld/layout ile değiştirildi.
- Parsel/kontrol/koli yerleşimleri aynı 40px ızgaradan geliyor. 36 parselin çakışmayan ayak izleri ve yalnız yatay/dikey araç rotaları otomatik testte denetleniyor.
- Çiftçi hasadı kendi yol kenarı kolisine bırakır; traktör koliyi alıp depoya teslim eder. Depodan satışa ayrı kamyon gider. Traktör teslimatı altın üretmez.
- Traktör kapasite/hız ve kamyon kapasite yatırımları çalışır. Birden fazla ürün arasında dönüşümlü toplama ve depodan eşit paylı yükleme uygulanır.
- Yeni kayıt sürümü 3; 1 ve 2 sürümlerinden bakiye, parsel ilerlemesi, stok ve yoldaki ürün değeri taşınır.
- Dünya haritası ürün kartlarının yerini aldı; bölgelerin parselleri büyük haritada görünür. İlerlemenin canlı kaydı korunur.
- npm test: 10/10 geçti. 144 çiftçi / 8 saat simülasyonu yaklaşık 91ms. Derleme başarılı; tarayıcı görsel kontrolleri sürüyor.
- Önceki 0.2 notlarındaki traktör→pazar anlatımı bu sürümde geçerli değildir.

## 2026-09-23 — Son tile düzeni doğrulaması
- Kullanıcının Paint çizimi son yerleşim kaynağı oldu: depo solda, dikey ana yol, iki yanına 2×2 parseller yerleşen yatay sokaklar; parsel önünde koli noktaları.
- Parsel ve kontrol alanları 40px mantıksal tile'a bağlandı. 36 parsel çakışma/rota testi geçti. Yol ızgarası kullanıcıya çizilmez.
- Çiftçi artık traktörü beklemeden kolileri bırakıp geri döner. Traktör yol düğümlerini izleyip kolileri alır, depoya boşaltır. Tek traktör açık bölgeleri sırayla servis eder.
- 10/10 test ve üretim derlemesi başarılı. Tarayıcıda yeni kayıtla 10 domates elle hasat edildi; kamyon satışı sonrasında bakiye 100→200 oldu. İlk çiftçi alımı, otomatik hasat, harita ve bölge kilitleri kontrol edildi.
- 390×844 görünümde scrollWidth390/bodyHeight844: sayfa taşması yok. Büyük çiftlikler kamera yakınlaştırma ve sürükleme ile incelenir.
- GitHub hedefi kullanıcı tarafından yetkilendirildi: alidmrky/Idle-Ciftlik. Uzak depo kontrolünde henüz dal/commit yoktu.

## 2026-09-23 — 0.4 / iki sıra ve gerçek 3D

paired_pickups ve three_models görevleri ajanlara bölündü; kullanım limiti sonrası entegrasyon koordinatörce tamamlandı. Mevcut kayıtlar korunarak 3D sahne App içine bağlandı. Tarayıcıda parsel paneli, araç paneli ve seviye yükseltme çalıştı; konsolda hata görülmedi. Görüntü yakalama aracı zaman aşımı verdiği için piksel düzeyinde görsel doğrulama tamamlanamadı.

Doğrulama: npm test 13/13 geçti; npm run build başarılı. Derlemede Three.js kaynaklı 840 KB JS paket boyutu uyarısı var (gzip 230 KB). Sınır: bölge başına 36 parsel, WebGL gereksinimi; mobil cihaz performansı henüz ölçülmedi. Sonraki adım: görsel cihaz testleri ve lojistik darboğaz göstergesi.
