# Akilli Kurtarma Ajani Proje Raporu

## 1. Proje Basligi

Akilli Kurtarma Ajani: A* Algoritmasi ile Grid Tabanli Afet Bolgesi Rota Planlama Oyunu

## 2. Takim Uyeleri

| Ogrenci Adi Soyadi | Ogrenci No |
| --- | --- |
| Takim uyesi 1 | ... |
| Takim uyesi 2 | ... |
| Takim uyesi 3 | ... |

## 3. Proje Fikri ve Oyun Senaryosu

Proje, afet sonrasi olusan bir sehir haritasinda kurtarma ajani kontrolunu konu alir. Kuzey Mahallesi'nde yollarin bir kismi kapanmis, bazi bolgeler riskli veya enkazli hale gelmistir. Hastanedeki ekipler dagilmis yardim paketlerini beklemektedir. Ajan baslangic noktasindan hareket eder, yardim paketlerini toplar ve hastaneye ulasmaya calisir. Haritada normal yollar, kapali yollar, riskli bolgeler ve enkazli bolgeler bulunur.

Bu senaryoda en kisa yol her zaman en iyi yol degildir. Ajan, hem paket toplama zorunlulugunu hem de hucre maliyetlerini dikkate alarak rota secmelidir.

## 4. Problem Tanimi

Problem, maliyetli grid uzerinde hedefe ulasma problemidir. Ajan, tum yardim paketlerini topladiktan sonra hastane hucresine ulasmalidir. Engel hucresinden gecemez. Riskli ve enkazli hucresinden gecebilir fakat bu hucreslerin hareket maliyeti daha yuksektir.

## 5. Problem Uzayi Modeli

| Baslik | Aciklama |
| --- | --- |
| Baslangic durumu | Ajanin `S` hucresinde bulunmasi ve paket maskesinin bos olmasi |
| Hedef durumu | Tum paketlerin toplanmasi ve ajanin `H` hucresinde bulunmasi |
| Durumlar | `(satir, sutun, toplananPaketMaskesi)` |
| Eylemler | Yukari, asagi, sol, sag |
| Gecisler | Ajan gecerli komsu hucreye hareket eder |
| Kisitlar | Grid disina cikilamaz, `#` engeli gecilemez |
| Engel yapisi | Kapali yol veya gecilemeyen enkaz `#` ile modellenir |
| Maliyet yapisi | Yol 1, riskli bolge 4, enkaz 6 |
| Basari olcutu | Tum paketleri toplayip hastaneye en dusuk toplam maliyetle ulasmak |

## 6. Kullanilan Arama Algoritmasi

Projede A* algoritmasi kullanilmistir. A*, gercek yol maliyeti ile hedefe kalan tahmini uzakligi birlikte degerlendirir.

Formul:

```text
f(n) = g(n) + h(n)
```

- `g(n)`: Baslangictan mevcut duruma kadar olan gercek toplam maliyet.
- `h(n)`: Kalan paketler ve hedef icin Manhattan uzakligi tabanli sezgisel tahmin.

A* algoritmasi bu proje icin uygundur cunku grid uzerinde hem engeller hem de farkli hucre maliyetleri bulunur.

## 7. Ajan Karar Verme Mekanizmasi

Ajan her adimda acik dugumler arasindan `f(n)` degeri en dusuk olan durumu secer. Engel hucresini eler, maliyetli hucresleri daha pahali kabul eder ve paket toplama durumunu durum modeline dahil eder. Paket toplandiginda paket maskesi guncellenir. Hedef durumu ancak tum paketler toplandiktan sonra gecerlidir.

## 8. Kullanilan Araclar ve Teknolojiler

- HTML
- CSS
- JavaScript
- Three.js
- A* arama algoritmasi
- Tarayici tabanli statik 3D prototip

## 9. Uygulama Ekran Goruntuleri

Ekran goruntuleri `docs/screenshots` klasorune eklenebilir.

## 10. Test Sonuclari

| Test | Beklenen Sonuc | Sonuc |
| --- | --- | --- |
| Hazir harita A | Tum paketler toplanarak hedefe ulasilir | Basarili |
| Hazir harita B | Kapali koridorlara ragmen rota bulunur | Basarili |
| Hazir harita C | Risk maliyetleri hesaba katilir | Basarili |
| Kapali hedef testi | Rota bulunamaz | Basarili |

## 11. Sonuc ve Degerlendirme

Proje, grid tabanli bir yapay zeka ajani oyunu olarak calisan prototip uretmistir. Ajan, A* algoritmasi ile maliyetli rota planlamasi yapar. Problem uzayina paket toplama bilgisi de dahil edildigi icin ajan sadece hedefe gitmekle kalmaz, gorev kosulunu da tamamlar.

## 12. Yapay Zeka Araclari Kullanimi

Bu projede yapay zeka araclarindan kod taslagi olusturma, algoritma mantigini duzenleme, hata giderme ve rapor taslagi hazirlama amaciyla destek alinmistir. Proje fikri, oyun kurallari, algoritma uyarlamasi ve nihai uygulama takim tarafindan incelenerek teslim edilmelidir.

## 13. Takim Gorev Dagilimi

Takim gorev dagilimi `docs/gorev_dagilimi.md` dosyasinda yer alir.
