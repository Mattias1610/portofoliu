# Dr. Ramona Drilea · site

Site într-o singură pagină pentru **Cabinet Stomatologie Generală și Implantologie Dr. Ramona Drilea**, Focșani.
HTML, CSS și JavaScript simple, fără build. Lenis (smooth scroll) și fonturile (Cormorant Garamond, Source Sans 3, licență OFL) sunt incluse local.

## Pornire locală

```bash
cd dr-ramona-drilea
scripts/fetch-media.sh          # o singură dată: descarcă clipurile și generează assets/media
python3 -m http.server 8765     # apoi http://localhost:8765
```

## Media

Clipurile sunt generate cu Seedance 2.0 pe Higgsfield (std, 1080p, 16:9, fără sunet, 8 s), pornind de la două imagini de referință: (A) cabinetul, folosită pentru clipurile 1 și 3, și (B) implantul, folosită pentru clipul 2.

| Clip | Unde apare | Cum e folosit |
| --- | --- | --- |
| 1 · cabinetul în lumina dimineții | Hero | secvență de cadre WebP pe canvas, legată de scroll |
| 2 · implantul care se asamblează | Implantologie | secvență de cadre WebP pe canvas, legată de scroll |
| 3 · zâmbetul de lângă fereastră | Zâmbetul | MP4/WebM comprimat, rulează o dată când intră în ecran |

`scripts/build-media.sh` produce câte un set pentru desktop (16:9) și unul decupat pe portret pentru telefon, plus cadrele statice folosite ca poster și ca variantă fără animație. În total, aproximativ 7,5 MB, iar un telefon încarcă doar setul lui.

## Date reale folosite

Preluate din listarea Google Maps (octombrie 2026): adresa, programul, nota 4,9 din 64 de recenzii și trei recenzii de 5 stele, cu text nemodificat (Adriana D., Sela M., Andra T.).

## De completat înainte de publicare

- **Portretul medicului**: locul este marcat în secțiunea „Medicul tău” (`.doctor__portrait` în `index.html`).
- **Linkuri legale**: Politica de confidențialitate, Politica de cookies, ANPC (în footer, `data-placeholder`).
- **Programul**: Google afișează „Deschis 24 de ore” în fiecare zi. Confirmați-l sau actualizați lista `data-hours`.
- **Formularul**: fără server, cererea se deschide în WhatsApp cu mesajul gata scris. Pentru trimitere directă, puneți adresa unui endpoint (de ex. Formspree) în `data-endpoint` pe `<form>`; datele pleacă ca JSON prin POST.

## Accesibilitate și mișcare

- `prefers-reduced-motion`: fără scrub, fără smooth scroll, fără autoplay. Se afișează cadrele finale și tot textul.
- Fără JavaScript, pagina rămâne completă și se citește de sus până jos.
