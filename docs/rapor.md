# Akıllı Kurtarma Ajanı Proje Raporu

## 1. Proje Başlığı

Akıllı Kurtarma Ajanı: A* Algoritması ile Grid Tabanlı Afet Bölgesi Rota Planlama Oyunu

## 2. Takım Üyeleri

| Öğrenci Adı Soyadı | Öğrenci No |
| --- | --- |
| Takım üyesi 1 | ... |
| Takım üyesi 2 | ... |
| Takım üyesi 3 | ... |

## 3. Proje Fikri ve Oyun Senaryosu

Proje, afet sonrası oluşan bir şehir haritasında kurtarma ajanı kontrolünü konu alır. Kuzey Mahallesi'nde yolların bir kısmı kapanmış, bazı bölgeler riskli veya enkazlı hale gelmiştir. Hastanedeki ekipler dağılmış yardım paketlerini beklemektedir. Ajan başlangıç noktasından hareket eder, yardım paketlerini toplar ve hastaneye ulaşmaya çalışır. Haritada normal yollar, kapalı yollar, riskli bölgeler ve enkazlı bölgeler bulunur.

Bu senaryoda en kısa yol her zaman en iyi yol değildir. Ajan, hem paket toplama zorunluluğunu hem de hücre maliyetlerini dikkate alarak rota seçmelidir.

## 4. Problem Tanımı

Problem, maliyetli grid üzerinde hedefe ulaşma problemidir. Ajan, tüm yardım paketlerini topladıktan sonra hastane hücresine ulaşmalıdır. Engel hücresinden geçemez. Riskli ve enkazlı hücrelerden geçebilir fakat bu hücrelerin hareket maliyeti daha yüksektir.

## 5. Problem Uzayı Modeli

| Başlık | Açıklama |
| --- | --- |
| Başlangıç durumu | Ajanın `S` hücresinde bulunması ve paket maskesinin boş olması |
| Hedef durumu | Tüm paketlerin toplanması ve ajanın `H` hücresinde bulunması |
| Durumlar | `(satır, sütun, toplananPaketMaskesi)` |
| Eylemler | Yukarı, aşağı, sol, sağ |
| Geçişler | Ajan geçerli komşu hücreye hareket eder |
| Kısıtlar | Grid dışına çıkılamaz, `#` engeli geçilemez |
| Engel yapısı | Kapalı yol veya geçilemeyen enkaz `#` ile modellenir |
| Maliyet yapısı | Yol 1, riskli bölge 4, enkaz 6 |
| Başarı ölçütü | Tüm paketleri toplayıp hastaneye en düşük toplam maliyetle ulaşmak |

## 6. Kullanılan Arama Algoritması

Projede A* algoritması kullanılmıştır. A*, gerçek yol maliyeti ile hedefe kalan tahmini uzaklığı birlikte değerlendirir.

Formül:

```text
f(n) = g(n) + h(n)
```

- `g(n)`: Başlangıçtan mevcut duruma kadar olan gerçek toplam maliyet.
- `h(n)`: Kalan paketler ve hedef için Manhattan uzaklığı tabanlı sezgisel tahmin.

A* algoritması bu proje için uygundur çünkü grid üzerinde hem engeller hem de farklı hücre maliyetleri bulunur.

## 7. Ajan Karar Verme Mekanizmasi

Ajan her adımda açık düğümler arasından `f(n)` değeri en düşük olan durumu seçer. Engel hücresini eler, maliyetli hücreleri daha pahalı kabul eder ve paket toplama durumunu durum modeline dahil eder. Paket toplandığında paket maskesi güncellenir. Hedef durumu ancak tüm paketler toplandıktan sonra geçerlidir.

## 8. Kullanılan Araçlar ve Teknolojiler

- HTML
- CSS
- JavaScript
- Three.js
- A* arama algoritması
- Tarayıcı tabanlı statik 3D prototip

## 9. Uygulama Ekran Görüntüleri

Ekran görüntüleri `docs/screenshots` klasörüne eklenebilir.

## 10. Test Sonuçları

| Test | Beklenen Sonuç | Sonuç |
| --- | --- | --- |
| Hazır harita A | Tüm paketler toplanarak hedefe ulaşılır | Başarılı |
| Hazır harita B | Kapalı koridorlara rağmen rota bulunur | Başarılı |
| Hazır harita C | Risk maliyetleri hesaba katılır | Başarılı |
| Kapalı hedef testi | Rota bulunamaz | Başarılı |

## 11. Sonuç ve Değerlendirme

Proje, grid tabanlı bir yapay zeka ajanı oyunu olarak çalışan prototip üretmiştir. Ajan, A* algoritması ile maliyetli rota planlaması yapar. Problem uzayına paket toplama bilgisi de dahil edildiği için ajan sadece hedefe gitmekle kalmaz, görev koşulunu da tamamlar.

## 12. Yapay Zeka Araçları Kullanımı

Bu projede yapay zeka araçlarından kod taslağı oluşturma, algoritma mantığını düzenleme, hata giderme ve rapor taslağı hazırlama amacıyla destek alınmıştır. Proje fikri, oyun kuralları, algoritma uyarlaması ve nihai uygulama takım tarafından incelenerek teslim edilmelidir.

## 13. Takım Görev Dağılımı

Takım görev dağılımı `docs/gorev_dagilimi.md` dosyasında yer alır.
