# GUIA PER AFEGIR NOUS PROJECTES A LA WEB
### Peralta Urbanisme · Flux de treball pas a pas

---

## COM FUNCIONA

Són 4 passos en ordre. Cada pas = obrir VS Code + Claude Code + enganxar el prompt + omplir els [CORXETS].

```
PASO 1 — Renombrar imágenes          (Claude renombra en el orden correcto)
     ↓
PASO 2 — Extraer datos del Excel     (Claude lee el Excel y crea DADES_NOM.txt)
     ↓  → TÚ revisas y marcas las etiquetas con [x]
PASO 3 — Generar textos del PDF      (Claude lee la memoria y redacta en catalán)
     ↓  → TÚ lees y apruebas los textos
PASO 4 — Publicar en la web          (Claude crea el JSON, hace push → Netlify publica en 2 min)
```

**Regla:** No pasar al paso siguiente sin revisar el resultado del anterior.

---

---

# PASO 1 — RENOMBRAR IMÁGENES

**Preparación previa:** Las imágenes deben estar ya en el orden correcto en que se verán en la web. La forma más fácil: añade un número delante del nombre (`01_foto.jpg`, `02_plano.jpg`...). Claude respetará ese orden.

---

## ▶ PROMPT 1 — Copia esto entero en Claude Code y rellena los [CORXETS]

```
Ets un assistent tècnic de Peralta Urbanisme, un despatx d'arquitectes urbanistes de Barcelona.
Estem construint el lloc web corporatiu del despatx. El repositori es troba a:
C:\Users\Delfina\Desktop\web-peralta-urbanisme

Cada projecte a la web necessita les seves imatges amb un nom concret:
  web_[slug]_01.jpg
  web_[slug]_02.jpg
  web_[slug]_03.jpg  ...

El "slug" és el nom del projecte per a la URL: minúscules, sense accents, paraules separades per guions.
Exemple: "Terrassa Model Rieres" → slug: terrassa-model-rieres

TASCA: Renombrar les imatges d'un projecte al format web correcte.

DADES DEL PROJECTE:
- Carpeta amb les imatges: [RUTA COMPLETA — ej: C:\Users\Delfina\Desktop\PROJECTES\NOM DEL PROJECTE\FOTOS WEB]
- Slug del projecte: [SLUG — ej: terrassa-model-rieres]

INSTRUCCIONS:
1. Llista totes les imatges de la carpeta (JPG, JPEG, PNG, WEBP) en l'ordre en
   que les renombraràs (ordre alfabètic del nom de fitxer actual).
   Mostra-les numerades i espera la meva confirmació ABANS de fer res.

2. Un cop confirmades:
   - Renombra-les: web_[slug]_01.jpg, web_[slug]_02.jpg... (sempre 2 dígits: 01, 02, 03...)
   - Usa PowerShell amb Copy-Item -LiteralPath (no Rename-Item) per evitar errors
     amb espais i caràcters especials als noms.
   - Les imatges renombrades han de quedar a la MATEIXA carpeta.

3. Al finalitzar, llista les imatges renombrades i confirma quantes s'han processat.

Si hi ha subcarpetes dins la carpeta indicada, pregunta'm abans de processar-les.
```

---

---

# PASO 2 — EXTRAER DATOS DEL EXCEL MAESTRO

**Después:** Abre el fichero `DADES_*.txt` generado, comprueba que los datos son correctos, y **marca con [x] las etiquetas** que corresponden al proyecto. Ese fichero revisado es el que usará el Paso 4.

---

## ▶ PROMPT 2 — Copia esto entero en Claude Code y rellena los [CORXETS]

```
Ets un assistent tècnic de Peralta Urbanisme, un despatx d'arquitectes urbanistes de Barcelona.
Estem construint el lloc web corporatiu del despatx.

El despatx té un Excel mestre amb tots els projectes i les seves dades tècniques.
Necessito que llegeixis aquest Excel, trobis un projecte concret i cregis un fitxer
de text amb les dades, llest per usar al pas d'integració a la web.

LOCALITZACIÓ DEL FITXER EXCEL:
Ruta de xarxa: \\10.8.0.1\Servidor 1\MATERIAL\DIRECTORI (pendent d'ordenar)
Nom del fitxer: BASE DE DADES PROJECTES  (extensió .xlsx o .xls)
NOTA: El teu ordinador ha de tenir accés a la xarxa de l'oficina i Excel instal·lat.
Si no pots accedir al fitxer, avisa'm i para aquí.

DADES DEL PROJECTE A CERCAR:
- Nom del projecte al Excel: [NOM EXACTE — ej: MPGM LA LLAGOSTA - LA MIRALDA]
- Carpeta on guardar el resultat: [RUTA — ej: C:\Users\Delfina\Desktop\PROJECTES\LA LLAGOSTA]

INSTRUCCIONS:
1. Obre l'Excel usant PowerShell amb COM objects:
   $excel = New-Object -ComObject Excel.Application
   $excel.Visible = $false
   $wb = $excel.Workbooks.Open("\\10.8.0.1\Servidor 1\MATERIAL\DIRECTORI (pendent d'ordenar)\BASE DE DADES PROJECTES.xlsx")
   Busca el projecte a totes les fulles.

2. Busca la fila del projecte. El nom pot no ser exacte — busca la coincidència
   més propera i confirma'm quin has trobat ABANS d'extreure les dades.

3. Extreu aquests camps (si algun està buit al Excel, escriu "—"):
   TITOL OFICIAL:
   MUNICIPI:
   NOM:
   ID:
   CLIENT:
   ANY:
   TIPUS:
   ABAST:
   PREMI:
   AMBIT (m²):
   PROGRAMA:
   SOSTRE (m²):
   HABITATGES:

4. Crea un fitxer anomenat DADES_[NOM_PROJECTE].txt a la carpeta del projecte
   amb exactament aquest format:

   ====================================
   DADES DEL PROJECTE — [NOM]
   ====================================
   TITOL OFICIAL: [valor]
   MUNICIPI: [valor]
   NOM: [valor]
   ID: [valor]
   CLIENT: [valor]
   ANY: [valor]
   TIPUS: [valor]
   ABAST: [valor]
   PREMI: [valor o —]
   AMBIT (m²): [valor o —]
   PROGRAMA: [valor o —]
   SOSTRE (m²): [valor o —]
   HABITATGES: [valor o —]

   ====================================
   ETIQUETES (marca amb [x] les que corresponguin)
   ====================================
   [ ] residencial
   [ ] transformacio
   [ ] extensio
   [ ] regeneracio
   [ ] activitat-economica
   [ ] infraestructura-verda
   [ ] integracio-infraestructures
   [ ] estructura-urbana
   [ ] divulgacio
   [ ] espai-public
   [ ] participacio-ciutadana
   [ ] encaixos-singulars

5. Tanca el fitxer Excel i allibera el COM object.

6. No inventes cap dada. Si no trobes el projecte, explica exactament
   què has cercat i què has trobat.
```

---

---

# PASO 3 — GENERAR TEXTOS DEL PDF DE ENTREGA

**Después:** Lee los textos generados, corrígelos si hace falta, y apruébalos. Solo cuando estés conforme pasa al Paso 4. Los textos deben ser fieles al documento y representar bien el proyecto.

---

## ▶ PROMPT 3 — Copia esto entero en Claude Code y rellena los [CORXETS]

```
Ets un assistent tècnic de Peralta Urbanisme, un despatx d'arquitectes urbanistes de Barcelona.
Estem construint el lloc web corporatiu del despatx.

Cada projecte a la web mostra dos textos:
  - descriptionShort: text curt de màxim 80 paraules. És el primer que llegeix el visitant.
    Ha de capturar l'essència del projecte de forma clara, professional i directa.
  - descriptionLong: text llarg de màxim 400 paraules. Explica la complexitat del projecte
    amb detall: context, diagnòstic, proposta, aspectes rellevants, impacte urbà.
    El to ha de ser tècnic i professional, i pot tenir una certa poeticitat urbanística
    quan el projecte ho permet.

Ambdós textos han d'estar en CATALÀ, basats estrictament en el document de referència
(la memòria de lliurament final del projecte), sense inventar absolutament res.

DADES DEL PROJECTE:
- PDF de referència (document final de lliurament): [RUTA COMPLETA AL PDF]
  (Si hi ha diversos PDFs, indica quin és el document principal o la memòria final)
- Nom del projecte: [NOM DEL PROJECTE]
- Carpeta on guardar el resultat: [RUTA DE LA CARPETA DEL PROJECTE]

INSTRUCCIONS:
1. Llegeix el PDF complet. Si és molt extens (més de 50 pàgines), prioritza en aquest
   ordre: portada, índex, memòria descriptiva, objectius, proposta i conclusions.
   Avisa'm si hi ha parts que no has pogut llegir.

2. Crea un fitxer anomenat TEXTS_[NOM_PROJECTE].txt a la carpeta del projecte
   amb exactament aquest format:

   ====================================
   TEXTOS WEB — [NOM DEL PROJECTE]
   ====================================

   --- DESCRIPCIÓ CURTA (màxim 80 paraules) ---

   [Escriu aquí el text curt en català.
   Ha d'explicar: què és el projecte, a quin lloc s'intervé, quina és la proposta principal.
   Com el tràiler d'una pel·lícula: el més important per a algú que no sap res d'aquest projecte.
   Llenguatge tècnic, professional, sense floritures.
   MÀXIM 80 paraules. 100% basat en el document. Sense inventar res.]

   RECOMPTE PARAULES CURTA: [N paraules]

   --- DESCRIPCIÓ LLARGA (màxim 400 paraules) ---

   [Escriu aquí el text llarg en català.
   Pot explicar: context territorial i urbanístic, diagnòstic, proposta detallada,
   criteris principals, aspectes clau de l'ordenació, impacte o repercussió.
   To tècnic, professional, amb caràcter urbanístic. Pot tenir un to poètic quan
   el projecte i el document ho permeten.
   MÀXIM 400 paraules (pot ser menys si s'ha explicat tot el fonamental).
   100% basat en el document original. Sense inventar absolutament res.]

   RECOMPTE PARAULES LLARGA: [N paraules]

   ====================================
   NOTA DE QUALITAT
   ====================================
   Font utilitzada: [nom del PDF]
   Informació disponible: [abundant text / text limitat / majoritàriament imatges]
   Advertències: [cap / o descriure qualsevol dubte, contradicció o limitació trobada]

REGLES ESTRICTES:
- Idioma: català en ambdós textos
- No inventar cap dada, xifra, nom, data ni afirmació que no estigui al document
- Si el PDF té principalment imatges i poc text (habitual en estudis), redacta
  amb el que hi hagi i indica-ho a la secció "Informació disponible"
- Si hi ha contradiccions entre parts del document, usa la versió més recent
  o més detallada, i avisa'm a "Advertències"
- Compta les paraules de cada text i indica-ho
```

---

---

# PASO 4 — PUBLICAR EN LA WEB

**Antes de ejecutar este prompt, confirma:**
- ✅ Imágenes renombradas (Paso 1) — están en su carpeta con formato `web_[slug]_01.jpg`...
- ✅ Fichero `DADES_*.txt` revisado y con etiquetas marcadas con `[x]` (Paso 2)
- ✅ Fichero `TEXTS_*.txt` con textos aprobados (Paso 3)
- ✅ Coordenadas GPS del municipio (Google Maps → clic derecho → "¿Qué hay aquí?")

---

## ▶ PROMPT 4 — Copia esto entero en Claude Code y rellena los [CORXETS]

```
Ets un assistent tècnic de Peralta Urbanisme, un despatx d'arquitectes urbanistes de Barcelona.
Estàs treballant sobre el repositori del lloc web corporatiu del despatx, que es troba a:
C:\Users\Delfina\Desktop\web-peralta-urbanisme

TECNOLOGIA:
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Contingut dels projectes: fitxers JSON a content/projects/[slug].json
- Imatges dels projectes: a public/projects/[slug]/
- Publicació: git push a GitHub → Netlify fa el desplegament automàtic en ~2 minuts

ESTRUCTURA DEL JSON DE CADA PROJECTE (basada en src/lib/types.ts):
{
  "slug": "la-llagosta-la-miralda",           ← URL del projecte
  "coverImage": "web_la-llagosta-la-miralda_01.jpg",   ← primera imatge (portada)
  "images": ["web_la-llagosta-la-miralda_01.jpg", "web_la-llagosta-la-miralda_02.jpg"],
  "tags": ["residencial", "estructura-urbana"],  ← NOMÉS els slugs marcats
  "coordinates": { "lat": 41.4958, "lng": 2.1844 },
  "ca": {
    "title": "La Miralda — La Llagosta",
    "municipality": "La Llagosta",
    "year": "2024",
    "status": "En curs",
    "tipus": "Modificació puntual del PGOU",
    "premi": null,                    ← null si no hi ha premi
    "ambitM2": 15000,                 ← número enter, o null si no hi ha dada
    "programa": "Ús residencial",     ← text, o null si no hi ha dada
    "sostreM2": null,
    "habitatges": null,
    "descriptionShort": "Text curt en català...",
    "descriptionLong": "Text llarg en català..."
  },
  "es": { ...mateixos camps en castellà... },
  "en": { ...mateixos camps en anglès... }
}

ETIQUETES VÀLIDES (usar exactament aquests valors, en minúscules):
"residencial", "transformacio", "extensio", "regeneracio", "activitat-economica",
"infraestructura-verda", "integracio-infraestructures", "estructura-urbana",
"divulgacio", "espai-public", "participacio-ciutadana", "encaixos-singulars"

---

DADES DEL PROJECTE A INTEGRAR:
- Slug: [SLUG — ej: terrassa-model-rieres]
- Carpeta amb el material preparat: [RUTA — ej: C:\Users\Delfina\Desktop\PROJECTES\TERRASSA]
  Dins d'aquesta carpeta hi ha:
  · Imatges: web_[slug]_01.jpg, web_[slug]_02.jpg...
  · Fitxer de dades revisat: DADES_[NOM].txt (amb etiquetes marcades amb [x])
  · Fitxer de textos aprovats: TEXTS_[NOM].txt
- Coordenades GPS del municipi: lat [LAT], lng [LNG]

---

INSTRUCCIONS:
1. Llegeix els fitxers DADES_*.txt i TEXTS_*.txt.
   Mostra'm un resum del que has trobat:
   - Títol, municipi, any, tipus, etiquetes marcades, nombre d'imatges
   Espera la meva confirmació ABANS de fer res més.

2. Un cop confirmat:

   a) Copia les imatges web_[slug]_*.jpg a:
      C:\Users\Delfina\Desktop\web-peralta-urbanisme\public\projects\[slug]\
      Usa PowerShell amb Copy-Item -LiteralPath per evitar errors amb espais.

   b) Crea el fitxer:
      C:\Users\Delfina\Desktop\web-peralta-urbanisme\content\projects\[slug].json
      seguint exactament l'estructura del JSON d'exemple de dalt.

      REGLES PER OMPLIR EL JSON:
      - "images": llista TOTES les imatges en ordre (web_[slug]_01.jpg, 02, 03...)
      - "coverImage": sempre la primera imatge (web_[slug]_01.jpg)
      - "tags": NOMÉS les etiquetes marcades amb [x] al DADES, amb el slug exacte
      - ambitM2, sostreM2, habitatges: número enter sense cometes, o null si buit
      - premi: null si buit, o "text del premi" entre cometes si n'hi ha
      - programa: null si buit, o "text" si n'hi ha
      - Per a "es" i "en": si no hi ha traducció, copia els textos en català
        i afegeix un comentari al missatge indicant-ho

3. Executa la verificació:
   cd C:\Users\Delfina\Desktop\web-peralta-urbanisme
   npm run build
   Si hi ha errors, corregeix-los ABANS de continuar. No facis push si el build falla.

4. Si el build va bé, fes el push:
   git add content/projects/[slug].json public/projects/[slug]/
   git commit -m "Add projecte [slug]"
   git push origin main

5. Confirma que el push s'ha completat correctament.
   El projecte serà visible a la web en aproximadament 2 minuts.
```

---

---

# REFERÈNCIA RÀPIDA

| Element | Format | On es guarda |
|---------|--------|-------------|
| Imatges preparades | `web_[slug]_01.jpg`, `02.jpg`... | Carpeta del projecte |
| Dades del projecte | `DADES_[NOM].txt` | Carpeta del projecte |
| Textos per la web | `TEXTS_[NOM].txt` | Carpeta del projecte |
| JSON a la web | `[slug].json` | `content/projects/` |
| Imatges a la web | `web_[slug]_01.jpg`... | `public/projects/[slug]/` |

---

# PROBLEMES HABITUALS

**"No puedo acceder al Excel de red"**
→ Comprova que el VPN o la xarxa d'oficina està activa. Si no, copia manualment els camps
del Excel a un fitxer .txt amb el format del Pas 2 i salta directament al Pas 3.

**"El PDF tiene muchas imágenes y poco texto"**
→ El Pas 3 generarà textos més curts o menys detallats. Revisa'ls amb cura i edita'ls
manualment si cal. Avisa a Claude al prompt que el document pot ser principalment visual.

**"El build da error en el Paso 4"**
→ No facis push. Di-li a Claude: *"El build ha donat aquest error: [copia l'error]. Corregeix-lo."*

**"Quiero modificar el texto de un proyecto ya publicado"**
→ Edita directament `content/projects/[slug].json` i fes commit + push.
Pots demanar-li a Claude: *"Edita el projecte [slug] i canvia el camp descriptionShort per: [text nou]"*

---

_Peralta Urbanisme · Web corporativa · Última actualització: juny 2026_
