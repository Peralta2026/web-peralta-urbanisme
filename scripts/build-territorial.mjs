// Cartografia pròpia de la vista TERRITORIAL.
//
// Fonts oficials:
//   - ICGC, Divisions administratives v2r2 (Catalunya, províncies, municipis)
//     https://datacloud.icgc.cat/datacloud/divisions-administratives/
//   - IGN/CNIG, Unidades administrativas (INSPIRE) — províncies d'Espanya
//     https://www.ign.es/wfs-inspire/unidades-administrativas
//
// Genera a public/territorial/ geometries simplificades (topologia preservada,
// sense línies dobles) per a MapLibre:
//   spain.json        línies d'Espanya (país, CCAA, províncies) — context
//   cat.json          contorn de Catalunya i límits provincials (ICGC)
//   muni-lines.json   límits municipals generalitzats
//   muni-detail.json  límits municipals de detall (es carreguen en apropar-se)
//   muni-poly.json    polígons municipals (hover i ressaltat), codi + nom
//
// Ús:  node scripts/build-territorial.mjs   (descarrega a .cache/territorial)
import fs from "fs";
import path from "path";
import mapshaper from "mapshaper";

const ROOT = process.cwd();
const CACHE = path.join(ROOT, ".cache", "territorial");
const OUT = path.join(ROOT, "public", "territorial");
const ICGC = "https://datacloud.icgc.cat/datacloud/divisions-administratives/json_unzip/divisions-administratives-v2r2";
const ICGC_DATE = "20260120";
const IGN = "https://www.ign.es/wfs-inspire/unidades-administrativas?service=WFS&version=2.0.0&request=GetFeature&outputFormat=application/geo%2Bjson";

fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

async function download(url, file) {
  const dest = path.join(CACHE, file);
  if (fs.existsSync(dest)) return dest;
  console.log("↓", file);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

/* ── IGN: les 52 províncies (el servei barreja nivells; es filtren) ── */
async function ignProvinces() {
  const dest = path.join(CACHE, "ign-provinces.json");
  if (fs.existsSync(dest)) return dest;
  const out = new Map();
  const keep = (fc) => {
    for (const f of fc.features) {
      if (f.properties?.nationalLevelName?.LocalisedCharacterString !== "Provincia") continue;
      const c = f.properties.nationalCode;
      out.set(c, { type: "Feature", properties: { ccaa: c.slice(2, 4), prov: c.slice(4, 6) }, geometry: f.geometry });
    }
  };
  for (let start = 0; start <= 90; start += 10) {
    const file = await download(`${IGN}&typenames=au:AdministrativeUnit&count=10&startIndex=${start}`, `ign-page-${start}.json`);
    keep(JSON.parse(fs.readFileSync(file, "utf8")));
  }
  // Les que no surten a les primeres pàgines es demanen pel seu identificador
  const found = new Set([...out.keys()].map((c) => c.slice(4, 6)));
  const ccaaOf = { "01": "16", "02": "08", "03": "10", "04": "01", "05": "07", "06": "11", "07": "04" };
  const missing = Object.keys(ccaaOf).filter((p) => !found.has(p)).map((p) => `AU_ADMINISTRATIVEUNIT_34${ccaaOf[p]}${p}00000`);
  if (missing.length) {
    const file = await download(`${IGN}&RESOURCEID=${missing.join(",")}`, "ign-missing.json");
    keep(JSON.parse(fs.readFileSync(file, "utf8")));
  }
  console.log("IGN províncies:", out.size);
  fs.writeFileSync(dest, JSON.stringify({ type: "FeatureCollection", features: [...out.values()] }));
  return dest;
}

async function run(cmd) {
  const outputs = await mapshaper.applyCommands(cmd.replace(/\s+/g, " ").trim());
  return outputs;
}

/* mapshaper escriu GeometryCollection quan les línies no tenen atributs */
function features(json) {
  const fc = JSON.parse(json);
  if (fc.features) return fc.features;
  return (fc.geometries ?? [fc]).map((geometry) => ({ type: "Feature", properties: {}, geometry }));
}

/* Marca els trams de línia que pertanyen a Catalunya (vora o interior):
   el contorn català de l'IGN només es veu a escala d'Espanya. */
function onCatalonia(line, catRings) {
  const pts = line.geometry.type === "LineString" ? line.geometry.coordinates : line.geometry.coordinates.flat();
  let hits = 0;
  for (const p of pts) if (catRings.some((ring) => nearRing(p, ring) || insideRing(p, ring))) hits++;
  return hits / pts.length > 0.6;
}
function insideRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function nearRing([x, y], ring) {
  for (const [rx, ry] of ring) if (Math.abs(rx - x) < 1e-7 && Math.abs(ry - y) < 1e-7) return true;
  return false;
}

const size = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;
const write = (name, fc) => {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, JSON.stringify(fc));
  console.log("→", name, size(file), `(${fc.features.length} elements)`);
};

/* ── 1. Espanya (IGN) ── */
const ignFile = await ignProvinces();
{
  const out = await run(`-i "${ignFile}" -simplify 1.2% weighted keep-shapes -clean
    -lines ccaa + name=lines
    -target 1 -dissolve ccaa + name=ccaa
    -target lines,ccaa -o format=geojson precision=0.0001`);
  const lines = JSON.parse(out["lines.json"]);
  const ccaa = JSON.parse(out["ccaa.json"]);
  const cat = ccaa.features.find((f) => f.properties.ccaa === "09");
  const catRings = (cat.geometry.type === "Polygon" ? [cat.geometry.coordinates] : cat.geometry.coordinates).map((poly) => poly[0]);
  const kind = { outer: "pais", ccaa: "ccaa", inner: "prov" };
  const features = lines.features.map((f) => ({
    type: "Feature",
    properties: { k: kind[f.properties.TYPE] ?? "prov", cat: onCatalonia(f, catRings) ? 1 : 0 },
    geometry: f.geometry,
  }));
  write("spain.json", { type: "FeatureCollection", features });
}

/* ── 2. Catalunya (ICGC) ── */
const catFile = await download(`${ICGC}-catalunya-250000-${ICGC_DATE}.json`, "icgc-catalunya-250000.json");
const provFile = await download(`${ICGC}-provincies-250000-${ICGC_DATE}.json`, "icgc-provincies-250000.json");
const muni250 = await download(`${ICGC}-municipis-250000-${ICGC_DATE}.json`, "icgc-municipis-250000.json");
const muni50 = await download(`${ICGC}-municipis-50000-${ICGC_DATE}.json`, "icgc-municipis-50000.json");
{
  const outline = features((await run(`-i "${catFile}" -simplify 12% weighted keep-shapes -lines -o format=geojson precision=0.00001 out.json`))["out.json"]);
  const prov = features((await run(`-i "${provFile}" -simplify 12% weighted keep-shapes -innerlines -o format=geojson precision=0.00001 out.json`))["out.json"]);
  write("cat.json", {
    type: "FeatureCollection",
    features: [
      ...outline.map((f) => ({ type: "Feature", properties: { k: "cat" }, geometry: f.geometry })),
      ...prov.map((f) => ({ type: "Feature", properties: { k: "catprov" }, geometry: f.geometry })),
    ],
  });
}
{
  const lines = features((await run(`-i "${muni250}" -simplify 9% weighted keep-shapes -innerlines -o format=geojson precision=0.00001 out.json`))["out.json"]);
  write("muni-lines.json", { type: "FeatureCollection", features: lines });
  const detail = features((await run(`-i "${muni50}" -simplify 7% weighted keep-shapes -innerlines -o format=geojson precision=0.00001 out.json`))["out.json"]);
  write("muni-detail.json", { type: "FeatureCollection", features: detail });
  const poly = JSON.parse((await run(`-i "${muni250}" -simplify 9% weighted keep-shapes -clean -filter-fields CODIMUNI,NOMMUNI -rename-fields c=CODIMUNI,n=NOMMUNI -o format=geojson precision=0.00001 id-field=c out.json`))["out.json"]);
  write("muni-poly.json", poly);
}

fs.writeFileSync(path.join(OUT, "ATTRIBUTION.txt"),
  "Límits de Catalunya: © Institut Cartogràfic i Geològic de Catalunya (ICGC), CC BY 4.0.\n" +
  "Límits d'Espanya: Obra derivada de BDDAE CC-BY 4.0 ign.es.\n");
console.log("fet");
