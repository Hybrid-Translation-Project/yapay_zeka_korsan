# Korsan Hazine Avcisi

BIL 210 Yapay Zekanin Ilkeleri hackathon projesi icin hazirlanan 12x12 grid tabanli 3D A* rota bulma oyun prototipidir.

## Calistirma

3D sahne ES module ve GLB modeller kullandigi icin dosyayi dogrudan `index.html` olarak acmak yerine yerel sunucudan calistirin.

Kolay yol:

```bat
calistir.bat
```

Manuel yol:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Sonra tarayicida acin:

```text
http://127.0.0.1:8765/index.html
```

## Kisa Ozet

- Baslangic noktasi: `S`
- Hedef noktasi: `H`
- Hazine sandiklari: `P`
- Gecilemeyen kaya/engel: `#`
- Riskli top mevzisi: `R`, maliyet 4
- Batik gemi/enkaz: `E`, maliyet 6
- Normal yol/kumsal: `.`, maliyet 1
- Arama algoritmasi: A*

## Robot Notu

`Animated Robot - Oct 2018` klasorundeki FBX/OBJ robot dosyalari projede duruyor, ancak su an aktif 3D sahnede o FBX robot kullanilmiyor. FBX yuklenince robot sahneden kayboldugu icin aktif ajan, Three.js ile olusturulan garanti gorunen 3D robot modelidir.

## Test

Node.js varsa:

```bash
node tests/run-tests.js
```
