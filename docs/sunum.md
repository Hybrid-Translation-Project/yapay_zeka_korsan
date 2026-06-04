# Akilli Kurtarma Ajani Sunum Taslagi

## Slayt 1 - Proje Adi ve Takim

- Akilli Kurtarma Ajani
- BIL 210 Yapay Zekanin Ilkeleri
- Takim uyeleri

## Slayt 2 - Oyun Fikri

- Kuzey Mahallesi'nde afet sonrasi kapali yollar ve riskli bolgeler olustu.
- Hastanedeki ekipler haritaya dagilmis yardim paketlerini bekliyor.
- Ajan paketleri toplar, riskli ve enkazli bolgelerin maliyetini hesaba katar.
- Gorev tum paketler toplandiktan sonra hastaneye ulasinca tamamlanir.

## Slayt 3 - Problem Uzayi

- Durum: `(satir, sutun, toplananPaketMaskesi)`
- Baslangic: `S`
- Hedef: Tum paketler + `H`
- Eylemler: Yukari, asagi, sol, sag
- Kisitlar: Engel ve grid sinirlari

## Slayt 4 - Kullanilan Algoritma

- A* arama algoritmasi
- `f(n) = g(n) + h(n)`
- `g(n)`: Gercek maliyet
- `h(n)`: Manhattan uzakligi
- Dusuk maliyetli rota secimi

## Slayt 5 - Ajan Karar Verme Yapisi

- Ajan en dusuk `f(n)` degerine sahip durumu secer.
- Riskli ve enkazli hucresler yuksek maliyetlidir.
- Paket toplandiginda durum maskesi degisir.
- Hedef sadece tum paketler toplaninca tamamlanir.

## Slayt 6 - Demo

- Harita A, B veya C secilir.
- Rota hesaplanir.
- Ajan 3D afet bolgesi uzerinde adim adim hareket ettirilir.
- Maliyet, adim, paket ve genisletilen dugum sayisi gosterilir.

## Slayt 7 - Test Sonuclari

- Engel hucresi gecilmiyor.
- Maliyetli hucresler rota secimini etkiliyor.
- Paketler hedef kosuluna dahil ediliyor.
- Rota yoksa sistem hata durumunu gosteriyor.

## Slayt 8 - Sonuc ve Gelistirme Onerileri

- Calisan A* tabanli grid ajani gelistirildi.
- Problem uzayi ve karar mekanizmasi acik sekilde modellendi.
- Gelistirme: dinamik rakip, zaman siniri, farkli sezgisel fonksiyonlar.
