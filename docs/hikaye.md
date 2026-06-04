# Akıllı Kurtarma Ajanı Hikaye Metni

Kuzey Mahallesi'nde gece yarısı büyük bir sarsıntı olur. Haberleşme hatları zayıflar, yolların bir kısmı kapanır ve bazı sokaklar enkazla dolduğu için geçiş maliyeti artar. Hastanedeki ekipler, mahalleye dağılmış yardım paketlerini beklemektedir.

Kurtarma ajanı, afet bölgesinin 12x12 grid haritasını alır. Haritada başlangıç noktası, hastane, kapalı yollar, riskli bölgeler, enkazlı alanlar ve yardım paketleri vardır. Ajanın görevi sadece hastaneye ulaşmak değildir; önce tüm yardım paketlerini toplamalıdır.

Ajan her hamlede yukarı, aşağı, sol veya sağ yönde ilerleyebilir. Kapalı yollardan geçemez. Riskli bölgeler ve enkazlı alanlar daha yüksek maliyetlidir. Bu nedenle en kısa rota her zaman en iyi rota olmayabilir.

A* algoritması, ajanın karar verme mekanizmasıdır. Ajan, gerçek maliyet ile hedefe kalan tahmini uzaklığı birlikte hesaplar. Böylece hem paketleri toplar hem de hastaneye en düşük toplam maliyetle ulaşmaya çalışır.

Görev, tüm paketler toplandıktan sonra ajanın hastaneye varmasıyla tamamlanır.
