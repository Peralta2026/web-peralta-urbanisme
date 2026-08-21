import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const projectsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "projects");

// Snapshot verified against _instrucciones/COORDENADES.xlsx on 2026-08-21.
const coordinates = {
  "22-focus": [41.40083783082518, 2.189933816272212],
  "alella-estudi-equipaments": [41.49711868484441, 2.2934327915172927],
  "alella-parc": [41.48755521111315, 2.30184969199798],
  "amb-model-riera-st-just": [41.388525992085604, 2.072748112378181],
  "amb-ppu-hospital-valles": [41.489999121322015, 2.1540662686413756],
  "barbera-estudi-placa-ajuntament": [41.5157909963115, 2.1249403155128785],
  "caesmar-suport-urbanistic": [41.271385613202966, 1.9983890217116866],
  "calaf-nucli-antic": [41.73257796812215, 1.5144811070239792],
  "can-carreres-st-boi": [41.34830883897354, 2.0210579554394315],
  "castelldefels-mpgm-la-pava": [41.272553912038326, 1.9961453635273],
  "cornella-mpgm-densitat": [41.356753251798516, 2.0691717010858937],
  "dies-sant-feliu-codines": [41.6892208425061, 2.162340925817185],
  "diputacio-calaf": [41.73255255863149, 1.513555490108261],
  "el-prat-br-pla-d-infraestructura-verda": [41.32202518420527, 2.0946996125261435],
  "gava-casc-antic": [41.30633611357442, 2.006040615296051],
  "la-miralda-pendent": [41.51406125396769, 2.1954963465883637],
  "molins-de-rei-mpgm-nou-equipament": [41.41853089775398, 2.015456758729485],
  "montmelo-pae-circuit": [41.57070786657149, 2.2598212903355983],
  "mpgm-bonaigua": [41.382742320557746, 2.0741534183629797],
  "mpgm-usos-gava": [41.30314875424475, 2.002757236848704],
  "palau-solita-espai-public": [41.58393864707083, 2.1804913111895914],
  "pmu-granollers-110b": [41.60606806536717, 2.2926042723251707],
  "premia-plantes-baixes": [41.49466095619401, 2.3590349948048313],
  "rubi-comunicacio-model": [41.497109729512616, 2.034977717857918],
  "rubi-cuines-fantasma": [41.497109729512616, 2.034977717857918],
  "sant-cugat-andana": [41.467844043644654, 2.0776930108728187],
  "sant-just-desvern-mpgm-densitat": [41.38269652822659, 2.0741607821294963],
  "st-boi-pe-area-lleure": [41.3549400884118, 2.01695310533991],
  "st-cugat-sorli": [41.47763847406426, 2.0671920846100282],
  "terrassa-model-rieres": [41.563123786175325, 2.0056634660584076],
};

for (const [slug, [lat, lng]] of Object.entries(coordinates)) {
  const file = path.join(projectsDir, `${slug}.json`);
  const project = JSON.parse(fs.readFileSync(file, "utf8"));
  project.coordinates = { lat, lng };
  fs.writeFileSync(file, `${JSON.stringify(project, null, 2)}\n`, "utf8");
}

console.log(`Updated ${Object.keys(coordinates).length} projects.`);
