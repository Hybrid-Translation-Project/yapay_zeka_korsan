# Korsan Hazine Avcısı

BİL 210 Yapay Zekanın İlkeleri hackathon projesi için hazırlanan 12x12 grid tabanlı 3D A* rota bulma oyun prototipidir.

## Çalıştırma

3D sahne ES module ve GLB modeller kullandığı için dosyayı doğrudan `index.html` olarak açmak yerine yerel sunucudan çalıştırın.

Kolay yol:

```bat
calistir.bat
```

Manuel yol:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Sonra tarayıcıda açın:

```text
http://127.0.0.1:8765/index.html
```

## Kısa Özet

- Başlangıç noktası: `S`
- Hedef noktası: `H`
- Hazine sandıkları: `P`
- Geçilemeyen kaya/engel: `#`
- Riskli top mevzisi: `R`, maliyet 4
- Batık gemi/enkaz: `E`, maliyet 6
- Normal yol/kumsal: `.`, maliyet 1
- Arama algoritması: A*

## Robot Notu

`Animated Robot - Oct 2018` klasöründeki FBX/OBJ robot dosyaları projede duruyor, ancak şu an aktif 3D sahnede o FBX robot kullanılmıyor. FBX yüklenince robot sahneden kaybolduğu için aktif ajan, Three.js ile oluşturulan garanti görünen 3D robot modelidir.

## Test

Node.js varsa:

```bash
node tests/run-tests.js
```
