# Ekonomi ajanı — ilerleme günlüğü

## 2026-09-23 · İlk oynanabilir simülasyon

- React bağımsız TypeScript çekirdeği: otomatik büyüme, stok, satış, seviye, çiftçi, sıralı bölge açılışları.
- Başlangıç: 100 coin, 1. seviye domates; ilk geliştirme 25 coin, ilk çiftçi 120 coin.
- Bir döngü hasadı = seviye × 2^floor(seviye/25). Her 25 seviyede üretim sıçraması.
- Döngü süresi = ürünün temel süresi / (1 + çiftçi × 0,5).
- Geliştirme maliyeti = ceil(temel fiyat × 2,5 × 1,14^(seviye−1)). Çiftçi maliyeti = ceil(temel fiyat × 12 × 2,2^çiftçi).
- İlk çiftçi tüm çiftlikte otomatik satışı açar. İlk bölümde manuel satış öğretici olarak çalışır.
- Bölgeler: domates → 2.500 coin biber → 60.000 coin çilek → 1.200.000 coin arıcılık. Açılan çiftlikler arka planda üretmeye devam eder.
- Kayıt sürümü 1; bozuk alanlar doğrulanır, gelecek zaman damgası ödül vermez, çevrimdışı süre 8 saatle sınırlıdır.
- Kısaltma: K, M, B, T, a…z, aa…az, ba…; Türkçe ondalık gösterim.
- Sayılar 1e300 ile sınırlıdır; bu ilk prototip gerçek matematiksel sonsuzluk iddiasında bulunmaz. Gelecekte mantis/üs tabanlı büyük sayı sınıfına geçilebilir.

## Unity taşıma sınırı

`GameState` düz veri, tüm ekonomi işlevleri yan etkisizdir. Zaman ve kayıt uygulama katmanında sağlanır. Aynı formüller C# servislerine aktarılabilir; React arayüzü Unity'ye otomatik dönüştürülmez. JSON kayıtları için sürümlü dönüşüm korunmalıdır.

## Doğrulama

`src/game.test.ts`: hasat/satış korunumu, maliyetler, çiftçi hızlandırması, bölge sırası, çevrimdışı tavanı, bozuk kayıtlar, taşma koruması, sayı kısaltmaları. Çalıştırma: `npx tsx --test src/game.test.ts`.

Doğrulandı: yerel Node 24 ile `node --experimental-strip-types --test src/game.test.ts` — **6/6 test başarılı**.

## Sonraki dengeleme

İlk 30 dakikanın oyuncu denemeleriyle ayarlanması; görev ödülleri, prestij/tohum sistemi, seracılık ve hayvancılık eklenmesi. Ekonomi değerleri prototip değerleridir.

## 2026-09-23 · Açılış ekonomisi simülasyonu

Doğrudan oyun motoruyla, bir saniyelik adımlarla üç deterministik strateji denendi. Manuel satış her saniye yapıldı; görev ödülleri, bonuslar ve çevrimdışı kazanç dahil edilmedi. Satın almalar yeterli bakiye oluşunca hemen gerçekleştirildi. Sonuçlar insan tepki süresini içermez.

| Strateji | İlk çiftçi | Biber açılışı | Açılıştaki domates üretimi |
| --- | --- | --- | --- |
| Yalnızca ilk çiftçiyi al, biriktir | 10 sn | 14 dk 04 sn | Seviye 1, 1 çiftçi, 3 coin/sn |
| Başlangıç parasıyla seviye 4; ilk çiftçi; seviye 10 ve 2 çiftçiye yatırım; biriktir | 15 sn | 1 dk 45 sn | Seviye 10, 2 çiftçi, 40 coin/sn |
| Başlangıçta seviye 4; ilk çiftçi; en hızlı geri ödenen yatırıma öncelik ver | 15 sn | 1 dk 37 sn | Seviye 15, 2 çiftçi, 60 coin/sn |

Üçüncü strateji, maliyet / ek coin-sn oranı en düşük geliştirmeyi seçer; yatırım kendisini mevcut hızla biber için kalan bekleme süresinden önce ödemeyecekse birikime geçer. Bu yaklaşık bir politika, küresel optimum iddiası değildir.

**Değerlendirme:** Aktif yeniden yatırım yapan oyuncu için açılışta tıkanma yok; ilk otomasyon yaklaşık 15 saniyede, ikinci bölge yaklaşık 2 dakikada erişilebilir. Sadece çiftçi alıp bekleyen oyuncu 14 dakika bekler; başlangıç görevlerinin geliştirmeyi ve ikinci çiftçiyi öğretmesi faydalı olur. Bu bulgu formül değişikliği gerektirecek ağır bir sorun sayılmadı; formüller korunmuştur.

## 2026-09-23 — 0.3 koordinatör tamamlaması
- Ajan kullanım sınırı sonrası saf ekonomi modeli koordinatör tarafından tamamlandı.
- Parsel waiting alanı yol kenarındaki koli stoğudur; farm.stock depo stoğudur. Çiftçi taşıma sonunda waiting'e bırakır; traktör ancak geldiğinde alır. Kamyon satışı gelir yaratır.
- Kayıt v3; v1/v2 migrasyonu. 10 test geçti: stok/değer korunumu, taşıma aşamaları, bölünmüş zaman eşdeğerliği, offline, migrasyon ve yerleşim.
- Prototip: 36 parsel/bölge, 1000 parsel seviyesi, traktör hız14/kasa1000, kamyon kasa100. Depo henüz sınırsız. Tek traktör tüm bölgeleri servis eder.
