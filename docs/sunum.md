# Akıllı Kurtarma Ajanı Sunum Taslağı

## Slayt 1 - Proje Adı ve Takım

- Akıllı Kurtarma Ajanı
- BİL 210 Yapay Zekanın İlkeleri
- Takım üyeleri

## Slayt 2 - Oyun Fikri

- Kuzey Mahallesi'nde afet sonrası kapalı yollar ve riskli bölgeler oluştu.
- Hastanedeki ekipler haritaya dağılmış yardım paketlerini bekliyor.
- Ajan paketleri toplar, riskli ve enkazlı bölgelerin maliyetini hesaba katar.
- Görev tüm paketler toplandıktan sonra hastaneye ulaşınca tamamlanır.

## Slayt 3 - Problem Uzayı

- Durum: `(satır, sütun, toplananPaketMaskesi)`
- Başlangıç: `S`
- Hedef: Tüm paketler + `H`
- Eylemler: Yukarı, aşağı, sol, sağ
- Kısıtlar: Engel ve grid sınırları

## Slayt 4 - Kullanılan Algoritma

- A* arama algoritması
- `f(n) = g(n) + h(n)`
- `g(n)`: Gerçek maliyet
- `h(n)`: Manhattan uzaklığı
- Düşük maliyetli rota seçimi

## Slayt 5 - Ajan Karar Verme Yapısı

- Ajan en düşük `f(n)` değerine sahip durumu seçer.
- Riskli ve enkazlı hücreler yüksek maliyetlidir.
- Paket toplandığında durum maskesi değişir.
- Hedef sadece tüm paketler toplanınca tamamlanır.

## Slayt 6 - Demo

- Harita A, B veya C seçilir.
- Rota hesaplanır.
- Ajan 3D afet bölgesi üzerinde adım adım hareket ettirilir.
- Maliyet, adım, paket ve genişletilen düğüm sayısı gösterilir.

## Slayt 7 - Test Sonuçları

- Engel hücresi geçilmiyor.
- Maliyetli hücreler rota seçimini etkiliyor.
- Paketler hedef koşuluna dahil ediliyor.
- Rota yoksa sistem hata durumunu gösteriyor.

## Slayt 8 - Sonuç ve Geliştirme Önerileri

- Çalışan A* tabanlı grid ajanı geliştirildi.
- Problem uzayı ve karar mekanizması açık şekilde modellendi.
- Geliştirme: dinamik rakip, zaman sınırı, farklı sezgisel fonksiyonlar.
