# Akilli Kurtarma Ajani Hikaye Metni

Kuzey Mahallesi'nde gece yarisi buyuk bir sarsinti olur. Haberlesme hatlari zayiflar, yollarin bir kismi kapanir ve bazi sokaklar enkazla doldugu icin gecis maliyeti artar. Hastanedeki ekipler, mahalleye dagilmis yardim paketlerini beklemektedir.

Kurtarma ajani, afet bolgesinin 12x12 grid haritasini alir. Haritada baslangic noktasi, hastane, kapali yollar, riskli bolgeler, enkazli alanlar ve yardim paketleri vardir. Ajanin gorevi sadece hastaneye ulasmak degildir; once tum yardim paketlerini toplamalidir.

Ajan her hamlede yukari, asagi, sol veya sag yonde ilerleyebilir. Kapali yollardan gecemez. Riskli bolgeler ve enkazli alanlar daha yuksek maliyetlidir. Bu nedenle en kisa rota her zaman en iyi rota olmayabilir.

A* algoritmasi, ajanin karar verme mekanizmasidir. Ajan, gercek maliyet ile hedefe kalan tahmini uzakligi birlikte hesaplar. Boylece hem paketleri toplar hem de hastaneye en dusuk toplam maliyetle ulasmaya calisir.

Gorev, tum paketler toplandiktan sonra ajanin hastaneye varmasiyla tamamlanir.
