# Arayüz ajanı ilerleme kaydı

## 2026-09-23 — İlk oynanabilir arayüz
- `App.tsx` ve `App.css` oluşturuldu. Türkçe Filiz markası, sabit navigasyon, canlı ekonomi kartları, çiftlik sahnesi entegrasyonu, seviye/işçi/satış kontrolleri eklendi.
- Dünya haritası bölge açma ve geçiş, hedef listesi ve rehber modalı çalışır durumda.
- 200 ms oyun döngüsü, yerel kayıt, 8 saat üst sınırla çevrimdışı üretim ve bildirimler bağlandı.
- Masaüstü, tablet ve mobil için uyumlu düzen, klavye odak halkaları ve hareket azaltma desteği eklendi.
- Bağımlılıklar: React; oyun motoru `game.ts` ve bağımsız `FarmScene` bileşeni ile sözleşmeli entegrasyon.
- Birleşik `npm run build` doğrulaması başarılı (TypeScript + Vite üretim derlemesi).
- Entegrasyon düzeltmesi: çevrimdışı üretim yalnızca oyun motorundaki `loadGame` tarafından uygulanır; arayüz sadece dönüş bildirimini gösterir. Sıralı bölge açma koşulları butonlara yansıtıldı, Escape ile modal kapatma eklendi.
- Tarayıcı görsel kontrolü sonrası ortak sahne bileşeninin doğal yüksekliği korundu; yinelenen başlık katmanları kaldırıldı ve sahnenin hasat düğmesinin görünürlüğü sağlandı.

## 2026-09-23 — Tek ekran oyun arayüzü (0.2)
- Yönetim panosu, kenar çubuğu, ayrı görev/rehber/harita pencereleri kaldırıldı. `FarmScene` tüm görüntü alanını kaplıyor; alt bölge seçimleri sahneyi değiştiriyor.
- Üst HUD: altın, teorik üretim değeri/saniye, seçili alandaki tarla/çiftçi sayısı, kayıt durumu ve gerçek tarayıcı tam ekran düğmesi. Alt HUD: kısa ilerleme hedefi ve bölge kilit/açma maliyetleri.
- Tarla geliştirme, hasat, alan açma, işçi alma ve traktör geliştirme olayları sahnedeki nesnelere bağlandı. Hasat doğrudan altın olarak sunulmuyor; traktör teslimatı satış yapıyor.
- 100 ms gerçek süreli simülasyon; kayıt 1,5 saniyelik sabit aralıkla, sayfa gizlendiğinde ve kapanırken güncel ref üzerinden yapılır. Aynı yerel kayıt anahtarı korunur, eski kaydı motor taşır.
- Dış font bağımlılığı kaldırıldı. Mobil/dar ve yatay kısa ekran HUD uyarlaması; klavye odak halkaları, azaltılmış hareket tercih desteği.
- Doğrulama: yeni API sözleşmesine statik uyarlama tamamlandı; birleşik derleme ve tarayıcı doğrulaması koordinatörün entegrasyon aşamasında yürütülecek.
- Sınırlamalar: hayvancılık/seracılık, görev ödülleri ve platform dağıtımı bu geliştirmeye dahil değil. Üretim değeri etiketi teoriktir; satış hızı traktör kapasitesine ve yol süresine bağlıdır.
- Sonraki adım: gerçek cihazlarda etkileşim boyutları ve ilerleyen çok alanlı çiftliklerde okunabilirliği iyileştirme.

## 2026-09-23 — 0.3 koordinatör tamamlaması
- Alt ürün kartları kaldırıldı, dünya haritası ikon düğmesi eklendi. FarmMap aynı ekranda bölge açar/seçer; her bölgede 36 parsel dilimi görünür.
- HUD tam ekran, kayıt, bakiye ve üretim göstergelerini korur. Üretim göstergesi teslim edilen gelir değildir.
- Yeni rehber zinciri çiftçi→traktör→depo→kamyon. Depo ekranı traktörün hangi bölgede olduğunu gösterir.
