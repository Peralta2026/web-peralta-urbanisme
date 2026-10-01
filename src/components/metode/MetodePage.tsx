"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Translations ──────────────────────────────────────────────────────────── */

const T = {
  ca: {
    title: "Mètode",
    valors: {
      heading: "Els nostres valors fonamentals",
      items: [
        { name: "Esforç", desc: ["Tota la ", "dedicació", " necessària per assolir amb rigor els ", "objectius", " marcats, amb l'", "actitud", " i el convenciment que el propi trajecte aporta sempre nous ", "aprenentatges", "."] },
        { name: "Talent", desc: ["Confiança en la ", "creativitat", " i la ", "intuïció", " experta com a capacitats que s'alimenten d'una sòlida ", "experiència", " professional, una mirada ", "reflexiva", " i un llapis ", "audaç", "."] },
        { name: "Ètica",  desc: ["Una vocació sincera i ", "honesta", " per millorar les nostres ciutats i territoris des del principi fonamental de l'", "interès públic", " i la bona ", "gestió", " d'un marc jurídic complex."] },
      ],
    },
    pilars: {
      heading: "Els nostres pilars urbanístics",
      sub: "Tres eixos que orienten cada projecte",
      items: [
        { num: "01", name: "Estratègia", tagline: "Visió territorial i planificació", desc: "Analitzem el context des d'una mirada àmplia: mobilitat, usos, dinàmiques socials i econòmiques. Definim les estratègies que permeten transformar el territori de forma coherent i sostenible.", img: "/metode/sketch-estrategia-trim.png" },
        { num: "02", name: "Disseny",    tagline: "Proposta i forma urbana",          desc: "Projectem espais públics, teixits urbans i plans amb criteris de qualitat formal i funcional. El disseny és l'eina amb la qual materialitzem les idees i les fem habitables.",                img: "/metode/sketch-disseny-trim.png" },
        { num: "03", name: "Comunicació", tagline: "Participació i mediació",         desc: "L'urbanisme és un acte col·lectiu. Acompanyem els processos participatius, traduïm la complexitat tècnica en llenguatge comprensible i facilitem el consens entre actors diversos.",        img: "/metode/sketch-comunicacio-trim.png" },
      ],
    },
    modes: {
      heading: "Tres formes",
      headingLine2: "d'acompanyar-vos",
      sub: "Adaptem la nostra implicació a les necessitats reals de cada client i cada fase del projecte. Cada encàrrec és diferent: la nostra estructura és flexible per respondre-hi amb precisió.",
      items: [
        { name: "Assessorament", desc: "Oferim consultes tècniques puntuals i acompanyament estratègic en moments clau. Analitzem situacions complexes, avaluem opcions i donem suport en la presa de decisions urbanístiques i territorials.", tags: ["Consultes tècniques", "Dictàmens", "Suport a la decisió", "Administracions locals"] },
        { name: "Intervencions",  desc: "Redactem plans, estudis i projectes d'urbanisme des del principi fins al final. Assumim la responsabilitat tècnica completa de l'encàrrec: diagnosi, proposta, documentació i tràmit.", tags: ["Plans directors", "Plans parcials", "Espai públic", "Estudis de viabilitat"] },
        { name: "Desenvolupament", desc: "Col·laborem en projectes de llarga durada com a equip tècnic estable. Integrem-nos en l'estructura del client per garantir continuïtat, coherència i suport continu al llarg de tot el procés.", tags: ["Projectes plurianuals", "Suport continu", "Equip tècnic integrat", "Seguiment i gestió"] },
      ],
    },
    clients: "Han confiat en nosaltres",
    diagram: {
      states: ["Base", "Equip", "Àmbits"],
      vertices: { estrategia: "ESTRATÈGIA", projecte: "PROJECTE", territori: "TERRITORI", client: "CLIENT", clientSub: "AL CENTRE" },
      vertexSubs: { estrategia: "entendre · decidir · orientar", projecte: "definir · transformar", territori: "context · impacte" },
      wings: { social: "ÀMBIT SOCIAL", normatiu: "ÀMBIT NORMATIU", fisic: "ÀMBIT FÍSIC" },
      wingDoms: {
        social: ["Societat i Participació", "Mobilitat i Infraestructures", "Economia i Viabilitat"],
        normatiu: ["Regulació i Planejament", "Legalitat i Gestió", "Urbanisme i Paisatge"],
        fisic: ["Disseny Urbà i Espai Públic", "Medi Ambient i Territori"],
      },
      persons: ["Jordi\nPeralta", "Mar\nCastarlenas", "Julia\nReñones", "Marc\nVizcarra", "Delfina\nCapiglioni"],
    },
  },
  es: {
    title: "Método",
    valors: {
      heading: "Nuestros valores fundamentales",
      items: [
        { name: "Esfuerzo",  desc: ["Toda la ", "dedicación", " necesaria para alcanzar con rigor los ", "objetivos", " marcados, con la ", "actitud", " y la convicción de que el propio camino aporta siempre nuevos ", "aprendizajes", "."] },
        { name: "Talento",   desc: ["Confianza en la ", "creatividad", " y la ", "intuición", " experta como capacidades que se alimentan de una sólida ", "experiencia", " profesional, una mirada ", "reflexiva", " y un lápiz ", "audaz", "."] },
        { name: "Ética",     desc: ["Una vocación sincera y ", "honesta", " por mejorar nuestras ciudades y territorios desde el principio fundamental del ", "interés público", " y la buena ", "gestión", " de un marco jurídico complejo."] },
      ],
    },
    pilars: {
      heading: "Nuestros pilares urbanísticos",
      sub: "Tres ejes que orientan cada proyecto",
      items: [
        { num: "01", name: "Estrategia",    tagline: "Visión territorial y planificación", desc: "Analizamos el contexto desde una mirada amplia: movilidad, usos, dinámicas sociales y económicas. Definimos las estrategias que permiten transformar el territorio de forma coherente y sostenible.", img: "/metode/sketch-estrategia-trim.png" },
        { num: "02", name: "Diseño",        tagline: "Propuesta y forma urbana",           desc: "Proyectamos espacios públicos, tejidos urbanos y planes con criterios de calidad formal y funcional. El diseño es la herramienta con la que materializamos las ideas y las hacemos habitables.",      img: "/metode/sketch-disseny-trim.png" },
        { num: "03", name: "Comunicación",  tagline: "Participación y mediación",          desc: "El urbanismo es un acto colectivo. Acompañamos los procesos participativos, traducimos la complejidad técnica en lenguaje comprensible y facilitamos el consenso entre actores diversos.",         img: "/metode/sketch-comunicacio-trim.png" },
      ],
    },
    modes: {
      heading: "Tres formas",
      headingLine2: "de acompañaros",
      sub: "Adaptamos nuestra implicación a las necesidades reales de cada cliente y cada fase del proyecto. Cada encargo es diferente: nuestra estructura es flexible para responder con precisión.",
      items: [
        { name: "Asesoramiento",   desc: "Ofrecemos consultas técnicas puntuales y acompañamiento estratégico en momentos clave. Analizamos situaciones complejas, evaluamos opciones y damos apoyo en la toma de decisiones urbanísticas y territoriales.", tags: ["Consultas técnicas", "Dictámenes", "Apoyo a la decisión", "Administraciones locales"] },
        { name: "Intervenciones",  desc: "Redactamos planes, estudios y proyectos de urbanismo de principio a fin. Asumimos la responsabilidad técnica completa del encargo: diagnóstico, propuesta, documentación y trámite.", tags: ["Planes directores", "Planes parciales", "Espacio público", "Estudios de viabilidad"] },
        { name: "Desarrollo",      desc: "Colaboramos en proyectos de larga duración como equipo técnico estable. Nos integramos en la estructura del cliente para garantizar continuidad, coherencia y apoyo continuo a lo largo de todo el proceso.", tags: ["Proyectos plurianuales", "Apoyo continuo", "Equipo técnico integrado", "Seguimiento y gestión"] },
      ],
    },
    clients: "Han confiado en nosotros",
    diagram: {
      states: ["Base", "Equipo", "Ámbitos"],
      vertices: { estrategia: "ESTRATEGIA", projecte: "PROYECTO", territori: "TERRITORIO", client: "CLIENTE", clientSub: "EN EL CENTRO" },
      vertexSubs: { estrategia: "entender · decidir · orientar", projecte: "definir · transformar", territori: "contexto · impacto" },
      wings: { social: "ÁMBITO SOCIAL", normatiu: "ÁMBITO NORMATIVO", fisic: "ÁMBITO FÍSICO" },
      wingDoms: {
        social: ["Sociedad y Participación", "Movilidad e Infraestructuras", "Economía y Viabilidad"],
        normatiu: ["Regulación y Planeamiento", "Legalidad y Gestión", "Urbanismo y Paisaje"],
        fisic: ["Diseño Urbano y Espacio Público", "Medio Ambiente y Territorio"],
      },
      persons: ["Jordi\nPeralta", "Mar\nCastarlenas", "Julia\nReñones", "Marc\nVizcarra", "Delfina\nCapiglioni"],
    },
  },
  en: {
    title: "Method",
    valors: {
      heading: "Our core values",
      items: [
        { name: "Commitment", desc: ["All the ", "dedication", " needed to rigorously achieve our ", "goals", ", with the ", "attitude", " and conviction that the journey itself always brings new ", "learnings", "."] },
        { name: "Talent",     desc: ["Confidence in ", "creativity", " and expert ", "intuition", " as capacities nourished by solid professional ", "experience", ", a ", "reflective", " gaze and a ", "bold", " pencil."] },
        { name: "Ethics",     desc: ["A sincere and ", "honest", " vocation to improve our cities and territories based on the fundamental principle of ", "public interest", " and sound ", "governance", " within a complex legal framework."] },
      ],
    },
    pilars: {
      heading: "Our urban design pillars",
      sub: "Three axes that guide every project",
      items: [
        { num: "01", name: "Strategy",      tagline: "Territorial vision and planning", desc: "We analyse the context from a broad perspective: mobility, land use, social and economic dynamics. We define strategies that enable coherent and sustainable territorial transformation.", img: "/metode/sketch-estrategia-trim.png" },
        { num: "02", name: "Design",        tagline: "Proposal and urban form",         desc: "We design public spaces, urban fabrics and plans with criteria of formal and functional quality. Design is the tool through which we materialise ideas and make them liveable.",          img: "/metode/sketch-disseny-trim.png" },
        { num: "03", name: "Communication", tagline: "Participation and mediation",     desc: "Urbanism is a collective act. We support participatory processes, translate technical complexity into comprehensible language and facilitate consensus among diverse stakeholders.",    img: "/metode/sketch-comunicacio-trim.png" },
      ],
    },
    modes: {
      heading: "Three ways",
      headingLine2: "to work with you",
      sub: "We adapt our involvement to the real needs of each client and each project phase. Every commission is different: our structure is flexible to respond with precision.",
      items: [
        { name: "Advisory",      desc: "We provide targeted technical consultations and strategic support at key moments. We analyse complex situations, evaluate options and support decision-making in urban and territorial matters.", tags: ["Technical consultations", "Expert opinions", "Decision support", "Local authorities"] },
        { name: "Interventions", desc: "We draft plans, studies and urban design projects from start to finish. We assume full technical responsibility for the commission: diagnosis, proposal, documentation and processing.", tags: ["Master plans", "Partial plans", "Public space", "Feasibility studies"] },
        { name: "Development",   desc: "We collaborate on long-term projects as a stable technical team. We integrate into the client's structure to ensure continuity, coherence and ongoing support throughout the entire process.", tags: ["Multi-year projects", "Ongoing support", "Integrated technical team", "Monitoring and management"] },
      ],
    },
    clients: "They have trusted us",
    diagram: {
      states: ["Base", "Team", "Fields"],
      vertices: { estrategia: "STRATEGY", projecte: "PROJECT", territori: "TERRITORY", client: "CLIENT", clientSub: "AT THE CENTRE" },
      vertexSubs: { estrategia: "understand · decide · orient", projecte: "define · transform", territori: "context · impact" },
      wings: { social: "SOCIAL FIELD", normatiu: "NORMATIVE FIELD", fisic: "PHYSICAL FIELD" },
      wingDoms: {
        social: ["Society & Participation", "Mobility & Infrastructure", "Economics & Viability"],
        normatiu: ["Regulation & Planning", "Legality & Management", "Urbanism & Landscape"],
        fisic: ["Urban Design & Public Space", "Environment & Territory"],
      },
      persons: ["Jordi\nPeralta", "Mar\nCastarlenas", "Julia\nReñones", "Marc\nVizcarra", "Delfina\nCapiglioni"],
    },
  },
} as const;

const CLIENTS = [
  { name: "AMB",                         file: "amb.jpg" },
  { name: "Diputació de Barcelona",      file: "diputacio-bcn.png" },
  { name: "Barcelona Regional",          file: "barcelona-regional.png" },
  { name: "Incasol",                     file: "incasol.jpg" },
  { name: "Federació Catalana de Municipis", file: "federacio-municipis.jpg" },
  { name: "Terrassa",                    file: "terrassa.png" },
  { name: "Granollers",                  file: "granollers.jpg" },
  { name: "Sant Cugat",                  file: "sant-cugat.jpg" },
  { name: "Rubí",                        file: "rubi.png" },
  { name: "Cornellà",                    file: "cornella.png" },
  { name: "Castelldefels",              file: "castelldefels.png" },
  { name: "Gavà",                        file: "gava.png" },
  { name: "El Prat de Llobregat",       file: "el-prat.png" },
  { name: "Premià de Mar",              file: "premia-de-mar.jpg" },
  { name: "La Llagosta",                file: "la-llagosta.png" },
  { name: "Calaf",                      file: "calaf.jpg" },
  { name: "Molins de Rei",              file: "molins-de-rei.png" },
  { name: "Sant Just Desvern",          file: "sant-just.jpg" },
  { name: "Pineda de Mar",             file: "pineda-de-mar.png" },
  { name: "Bigues",                     file: "bigues.png" },
  { name: "Montcada i Reixac",         file: "montcada.png" },
  { name: "L'Hospitalet",              file: "hospitalet.jpg" },
  { name: "Barberà del Vallès",        file: "barbera.jpg" },
];

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("met-in"); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".met-reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── PillarCols ─────────────────────────────────────────────────────────────── */

const NARROW = "(max-width: 900px)";
const isNarrow = () => typeof window !== "undefined" && window.matchMedia(NARROW).matches;

function PillarCols({ items }: { items: typeof T["ca"]["pilars"]["items"] }) {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [tapped,  setTapped]  = useState<string | null>(null);
  const locked = visited.size >= 3;

  return (
    <div className={`met-pillar-cols${locked ? " is-locked" : ""}`}>
      {items.map((p) => {
        const key = p.num;
        const isOpen = !locked && hovered === key;
        const contentVisible = locked || isOpen;
        return (
          <div
            key={key}
            className={`met-pillar-col${isOpen ? " is-open" : ""}${tapped === key ? " is-tapped" : ""}`}
            onMouseEnter={() => { if (!locked && !isNarrow()) { setHovered(key); setVisited((prev) => new Set([...prev, key])); } }}
            onMouseLeave={() => { if (!locked && !isNarrow()) setHovered(null); }}
          >
            <button
              type="button"
              className="met-pillar-word-v"
              aria-expanded={tapped === key}
              onClick={() => { if (isNarrow()) setTapped((t) => (t === key ? null : key)); }}
            >
              <span>{p.name}</span>
              <span className="met-pillar-plus" aria-hidden="true">+</span>
            </button>
            <div className="met-pillar-expand" aria-hidden={!contentVisible}>
              <div className="met-pillar-e-inner">
                <div className="met-pillar-e-text">
                  <p className="met-pillar-e-num">{p.num}</p>
                  <h3 className="met-pillar-e-title">{p.name}</h3>
                  <p className="met-pillar-e-tagline">{p.tagline}</p>
                  <p className="met-pillar-e-desc">{p.desc}</p>
                </div>
                <div className="met-pillar-e-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── ServiceItem (always open, no accordion) ──────────────────────────────── */

function ServiceItem({ name, desc, tags }: { name: string; desc: string; tags: readonly string[] }) {
  return (
    <div className="met-service-item">
      <h3 className="met-service-name">{name}</h3>
      <p className="met-service-desc">{desc}</p>
      <p className="met-service-tags">{tags.join(" / ")}</p>
    </div>
  );
}

/* ─── MethodDiagram ─────────────────────────────────────────────────────────── */

const DIAGRAM_HINT: Record<"ca" | "es" | "en", { click: string; tap: string }> = {
  ca: { click: "Clica el triangle", tap: "Toca el triangle" },
  es: { click: "Haz clic en el triángulo", tap: "Toca el triángulo" },
  en: { click: "Click the triangle", tap: "Tap the triangle" },
};

function MethodDiagram({ d, lang }: { d: typeof T["ca"]["diagram"]; lang: "ca" | "es" | "en" }) {
  const [st, setSt] = useState(0);
  const [hint, setHint] = useState(false);
  const [touched, setTouched] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);

  // Mentre ningú l'ha tocat, el diagrama insinua el pas següent quan és a la vista
  useEffect(() => {
    const el = outerRef.current;
    if (!el || touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timers: number[] = [];
    let interval = 0;
    const pulse = () => {
      setHint(true);
      timers.push(window.setTimeout(() => setHint(false), 1300));
    };
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(interval);
      timers.forEach(window.clearTimeout);
      timers = [];
      if (!entry.isIntersecting) { setHint(false); return; }
      timers.push(window.setTimeout(pulse, 600));
      interval = window.setInterval(pulse, 6000);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(interval);
      timers.forEach(window.clearTimeout);
    };
  }, [touched]);

  const go = (next: number) => {
    setTouched(true);
    setHint(false);
    setSt(next);
  };
  const [col, setCol] = useState({
    z0: "#F9EE76", z1: "#B4EFC5", z2: "#A8DEF5",
    wf0: "rgba(180,239,197,.11)", wf1: "rgba(168,222,245,.11)", wf2: "rgba(249,238,118,.11)",
  });

  useEffect(() => {
    const P = ["#F9EE76","#B4EFC5","#A8DEF5","#F5C0DA"];
    const s = [...P].sort(() => Math.random() - .5);
    const t = (h: string, a: number) => {
      const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16);
      return `rgba(${r},${g},${b},${a})`;
    };
    setCol({ z0:s[0], z1:s[1], z2:s[2], wf0:t(s[1],.11), wf1:t(s[2],.11), wf2:t(s[0],.11) });
  }, []);

  const sc = `md-s${st}`;
  const [p0line1, p0line2] = d.persons[0].split("\n");
  const [p1line1, p1line2] = d.persons[1].split("\n");
  const [p2line1, p2line2] = d.persons[2].split("\n");
  const [p3line1, p3line2] = d.persons[3].split("\n");
  const [p4line1, p4line2] = d.persons[4].split("\n");

  return (
    <div
      ref={outerRef}
      className={`md-svg-outer ${sc}${hint ? " md-hint" : ""}`}
      onClick={() => go((st + 1) % 3)}
      title={d.states[(st + 1) % 3]}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && go((st + 1) % 3)}
      aria-label={`${d.states[st]} — ${d.states[(st+1)%3]}`}
    >
      <svg className="md-svg" viewBox="104 0 892 812" xmlns="http://www.w3.org/2000/svg">
        {/* Wing fills */}
        <polygon className="md-ext-fill" style={{fill:col.wf0}} points="550,65 338,432 126,65"/>
        <polygon className="md-ext-fill" style={{fill:col.wf1}} points="550,65 762,432 974,65"/>
        <polygon className="md-ext-fill" style={{fill:col.wf2}} points="338,432 762,432 550,799"/>
        {/* Colour zones */}
        <polygon className="md-z" style={{fill:col.z0}} points="550,65 444,248 656,248"/>
        <polygon className="md-z" style={{fill:col.z1}} points="338,432 444,248 550,432"/>
        <polygon className="md-z" style={{fill:col.z2}} points="762,432 656,248 550,432"/>
        <polygon fill="#fff" points="444,248 656,248 550,432"/>
        {/* Triangle structure */}
        <polygon className="md-tri-inner" points="444,248 656,248 550,432"/>
        <polygon className="md-tri-outer" points="550,65 338,432 762,432"/>
        {/* Vertex dots */}
        <circle cx="550" cy="65"  r="4" fill="#111"/>
        <circle cx="338" cy="432" r="4" fill="#111"/>
        <circle cx="762" cy="432" r="4" fill="#111"/>
        {/* Zone dividers */}
        <line className="md-zdiv" x1="400" y1="325" x2="461" y2="432"/>
        <line className="md-zdiv" x1="700" y1="325" x2="639" y2="432"/>
        {/* Vertex labels */}
        <text x="550" y="24"  className="md-vl">{d.vertices.estrategia}</text>
        <text x="550" y="38"  className="md-vs">{d.vertexSubs.estrategia}</text>
        <text x="338" y="460" className="md-vl">{d.vertices.projecte}</text>
        <text x="338" y="474" className="md-vs">{d.vertexSubs.projecte}</text>
        <text x="762" y="460" className="md-vl">{d.vertices.territori}</text>
        <text x="762" y="474" className="md-vs">{d.vertexSubs.territori}</text>
        {/* CLIENT centre */}
        <text x="550" y="316" className="md-cl">{d.vertices.client}</text>
        <text x="550" y="333" className="md-cl-sub">{d.vertices.clientSub}</text>
        {/* Person names */}
        <text x="550" y="180" className="md-pn">{p0line1}</text>
        <text x="550" y="197" className="md-pn">{p0line2}</text>
        <text x="460" y="314" className="md-pn">{p1line1}</text>
        <text x="460" y="331" className="md-pn">{p1line2}</text>
        <text x="410" y="392" className="md-pn">{p2line1}</text>
        <text x="410" y="409" className="md-pn">{p2line2}</text>
        <text x="640" y="314" className="md-pn">{p3line1}</text>
        <text x="640" y="331" className="md-pn">{p3line2}</text>
        <text x="690" y="392" className="md-pn">{p4line1}</text>
        <text x="690" y="409" className="md-pn">{p4line2}</text>
        {/* Outer network edges */}
        <g className="md-ext-edges">
          <line className="md-ext-edge" x1="126" y1="65"  x2="550" y2="65"/>
          <line className="md-ext-edge" x1="126" y1="65"  x2="338" y2="432"/>
          <line className="md-ext-edge" x1="550" y1="65"  x2="974" y2="65"/>
          <line className="md-ext-edge" x1="974" y1="65"  x2="762" y2="432"/>
          <line className="md-ext-edge" x1="338" y1="432" x2="550" y2="799"/>
          <line className="md-ext-edge" x1="762" y1="432" x2="550" y2="799"/>
        </g>
        {/* Domain text in wings */}
        <g className="md-ext-txt">
          <line className="md-wsep" x1="218" y1="117" x2="458" y2="117"/>
          <text x="338" y="108" className="md-wlabel">{d.wings.social}</text>
          <text x="338" y="142" className="md-wdom">{d.wingDoms.social[0]}</text>
          <line className="md-wsep" x1="240" y1="174" x2="436" y2="174"/>
          <text x="338" y="196" className="md-wdom">{d.wingDoms.social[1]}</text>
          <line className="md-wsep" x1="258" y1="228" x2="418" y2="228"/>
          <text x="338" y="250" className="md-wdom">{d.wingDoms.social[2]}</text>
          <line className="md-wsep" x1="270" y1="282" x2="406" y2="282"/>
          <line className="md-wsep" x1="642" y1="117" x2="882" y2="117"/>
          <text x="762" y="108" className="md-wlabel">{d.wings.normatiu}</text>
          <text x="762" y="142" className="md-wdom">{d.wingDoms.normatiu[0]}</text>
          <line className="md-wsep" x1="664" y1="174" x2="860" y2="174"/>
          <text x="762" y="196" className="md-wdom">{d.wingDoms.normatiu[1]}</text>
          <line className="md-wsep" x1="682" y1="228" x2="842" y2="228"/>
          <text x="762" y="250" className="md-wdom">{d.wingDoms.normatiu[2]}</text>
          <line className="md-wsep" x1="694" y1="282" x2="830" y2="282"/>
          <line className="md-wsep" x1="386" y1="498" x2="714" y2="498"/>
          <text x="550" y="488" className="md-wlabel">{d.wings.fisic}</text>
          <text x="550" y="526" className="md-wdom">{d.wingDoms.fisic[0]}</text>
          <line className="md-wsep" x1="410" y1="564" x2="690" y2="564"/>
          <text x="550" y="596" className="md-wdom">{d.wingDoms.fisic[1]}</text>
          <line className="md-wsep" x1="432" y1="634" x2="668" y2="634"/>
        </g>
      </svg>
      <div className="md-steps" onClick={(e) => e.stopPropagation()}>
        {d.states.map((label, i) => (
          <span key={label} style={{ display: "contents" }}>
            {i > 0 && <i>/</i>}
            <button type="button" className={i === st ? "is-active" : ""} onClick={() => go(i)}>{label}</button>
          </span>
        ))}
        <span className={`md-steps-hint${touched ? " is-gone" : ""}`}>
          <span className="md-hint-click">{DIAGRAM_HINT[lang].click}</span>
          <span className="md-hint-tap">{DIAGRAM_HINT[lang].tap}</span>
        </span>
      </div>
    </div>
  );
}

/* ─── MetodePage ─────────────────────────────────────────────────────────────── */

export default function MetodePage({ locale = "ca" }: { locale?: string }) {
  useReveal();
  const lang = (locale === "es" || locale === "en") ? locale : "ca";
  const t = T[lang];

  return (
    <>
      <style>{`
        /* ── HEADER ── */
        .met-page-header { padding-top: var(--header-height); }
        .met-page-title-row { padding: clamp(36px,5vh,64px) var(--margin-page) 0; }
        .met-page-title { font-family: var(--font-sans); font-size: clamp(32px,4vw,60px); font-weight: 700; letter-spacing: -0.04em; line-height: 1; color: #000; margin: 0; }
        .met-page-sep { margin: clamp(16px,2.5vh,28px) var(--margin-page) 0; height: 1px; background: rgba(0,0,0,0.08); }

        /* ── SECTION HEADINGS ── */
        .met-section-heading {
          font-family: var(--font-sans);
          font-size: clamp(30px, 3.6vw, 52px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--color-fg);
        }

        /* ── VALORS ── */
        .met-values { padding: 88px var(--margin-page) 80px; }
        .met-values .met-section-heading { margin-bottom: 52px; display: block; }
        .met-values-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .met-value { padding-right: 32px; }
        .met-value:not(:last-child) { border-right: 1px solid var(--color-border-soft); margin-right: 32px; }
        .met-value-name { font-family: var(--font-sans); font-size: clamp(26px, 2.8vw, 40px); font-weight: 700; letter-spacing: -.035em; line-height: 1.0; margin-bottom: 18px; }
        .met-value-desc { font-family: var(--font-sans); font-size: 14px; line-height: 1.65; color: var(--color-muted); max-width: 260px; }
        .met-value-desc strong { font-weight: 700; color: var(--color-fg); }

        /* ── PILARS ── */
        .met-pilars-top { padding: 72px var(--margin-page) 48px; border-top: 1px solid rgba(0,0,0,0.08); }
        .met-pilars-top .met-section-heading { display: block; margin-bottom: 12px; }
        .met-pilars-h2 { font-family: var(--font-sans); font-size: clamp(22px, 2vw, 30px); font-weight: 500; letter-spacing: -.02em; margin: 0; }
        .met-pilars-h2 strong { font-weight: 900; }

        /* Pillar interactive columns */
        .met-pillar-cols { display: flex; min-height: 58vh; border-top: 1px solid rgba(0,0,0,0.08); border-bottom: 1px solid rgba(0,0,0,0.08); }
        .met-pillar-col { flex: 1; min-width: 0; overflow: hidden; transition: flex 0.65s cubic-bezier(0.22,1,0.36,1); border-right: 1px solid rgba(0,0,0,0.08); position: relative; cursor: default; }
        .met-pillar-col:last-child { border-right: none; }
        .met-pillar-col.is-open { flex: 4; }
        .met-pillar-cols.is-locked .met-pillar-col { flex: 1 !important; }

        /* Vertical word */
        .met-pillar-word-v {
          position: absolute; inset: 0;
          width: 100%; border: 0; background: none; cursor: inherit;
          display: flex; align-items: center; justify-content: center;
          writing-mode: horizontal-tb; transform: none;
          font-family: var(--font-sans); font-size: clamp(16px,1.6vw,24px); font-weight: 700; letter-spacing: -0.03em;
          color: var(--color-fg); padding: 16px 8px;
          opacity: 1; transition: opacity 0.22s ease; pointer-events: none;
          text-align: center;
        }
        .met-pillar-plus { display: none; }
        .met-pillar-e-inner { display: contents; }
        .met-pillar-col.is-open .met-pillar-word-v,
        .met-pillar-cols.is-locked .met-pillar-word-v { opacity: 0; }

        /* Expanded content */
        .met-pillar-expand {
          position: absolute; inset: 0;
          padding: 40px clamp(24px,3vw,48px) 32px;
          display: flex; flex-direction: column; gap: 0;
          min-width: 0;
          opacity: 0; transition: opacity 0.28s ease 0.22s; pointer-events: none; overflow: hidden;
        }
        .met-pillar-col.is-open .met-pillar-expand,
        .met-pillar-cols.is-locked .met-pillar-expand { opacity: 1; pointer-events: auto; }
        .met-pillar-e-num { font-family: var(--font-sans); font-size: clamp(28px,3vw,48px); font-weight: 900; letter-spacing: -0.04em; color: var(--color-fg); margin: 0 0 12px; line-height: 1; }
        .met-pillar-e-title { font-family: var(--font-sans); font-size: clamp(22px,2.2vw,34px); font-weight: 700; letter-spacing: -0.04em; line-height: 1.0; margin: 0 0 14px; }
        .met-pillar-e-tagline { font-family: var(--font-sans); font-size: var(--size-meta); color: var(--color-muted); margin: 0 0 16px; }
        .met-pillar-e-desc { font-family: var(--font-sans); font-size: 14px; line-height: 1.65; color: var(--color-muted); max-width: 340px; margin: 0; }
        .met-pillar-e-img { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding-top: 24px; }
        .met-pillar-e-img img { width: 100%; height: 100%; max-height: 300px; object-fit: contain; display: block; mix-blend-mode: multiply; }
        /* Columna oberta: text a l'esquerra, dibuix gran a la dreta */
        .met-pillar-col.is-open .met-pillar-expand { flex-direction: row; align-items: stretch; gap: clamp(32px, 4vw, 72px); }
        .met-pillar-col.is-open .met-pillar-e-text { flex: 0 0 auto; width: min(360px, 40%); }
        .met-pillar-col.is-open .met-pillar-e-img { padding-top: 0; }
        .met-pillar-col.is-open .met-pillar-e-img img { max-height: min(46vh, 440px); }

        /* ── MODES / SERVICES ── */
        .met-modes {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          border-top: 1px solid rgba(0,0,0,0.08);
          align-items: start;
        }
        .met-modes-left { padding-bottom: 80px; }
        .met-modes-right {
          position: sticky;
          top: var(--header-height, 64px);
          height: calc(100vh - var(--header-height, 64px));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px clamp(16px, 2vw, 40px);
        }
        .met-modes-header-block { padding: 72px var(--margin-page) 56px; }
        .met-modes-header-block h2 {
          font-family: var(--font-sans);
          font-size: clamp(30px,3.6vw,52px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.0;
          margin: 0 0 20px;
        }
        .met-modes-header-block > p { font-family: var(--font-sans); font-size: 14px; color: var(--color-muted); line-height: 1.65; max-width: 380px; margin: 0; }
        .met-modes-list { padding: 0 var(--margin-page); }

        /* Service items — always visible, no accordion */
        .met-service-item { padding: 40px 0; }
        .met-service-item + .met-service-item { border-top: 1px solid rgba(0,0,0,0.06); }
        .met-service-name {
          font-family: var(--font-sans);
          font-size: clamp(22px,2.4vw,34px);
          font-weight: 700;
          letter-spacing: -0.035em;
          color: var(--color-fg);
          margin: 0 0 16px;
        }
        .met-service-desc {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--color-fg);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 0 20px;
        }
        .met-service-tags {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 700;
          line-height: 1.6;
          color: var(--color-fg);
          margin: 0;
          letter-spacing: -0.01em;
        }

        /* Diagram in column context */
        .met-modes-right .md-svg-outer { width: 100%; max-width: 900px; }

        /* ── TRIANGLE DIAGRAM ── */
        .md-svg-outer { cursor: pointer; outline: none; display: flex; flex-direction: column; align-items: center; }
        .md-svg-outer .md-svg { transition: transform 600ms var(--ease-smooth); }
        @media (hover: hover) {
          .md-svg-outer:hover .md-svg { transform: scale(1.015); }
          /* En passar per sobre s'insinua el següent estat */
          .md-svg-outer.md-s0:hover .md-z { opacity: .3; }
          .md-svg-outer.md-s0:hover .md-pn { opacity: .3; }
          .md-svg-outer.md-s1:hover .md-ext-edges,
          .md-svg-outer.md-s1:hover .md-ext-fill { opacity: .35; }
        }
        /* Gest d'invitació quan el diagrama entra a la pantalla */
        .md-svg-outer.md-hint.md-s0 .md-z { opacity: .55; transition-duration: 900ms; }
        .md-svg-outer.md-hint.md-s0 .md-pn { opacity: .5; transition-duration: 900ms; }
        .md-svg-outer.md-hint .md-svg { transform: scale(1.02); }
        .md-steps {
          display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 10px;
          margin-top: 18px;
          font-family: var(--font-sans); font-size: var(--size-meta); color: #bbb;
        }
        .md-steps button { padding: 6px 0; border: 0; background: none; cursor: pointer; font: inherit; color: inherit; transition: color var(--dur-fast) ease; }
        .md-steps button:hover { color: #555; }
        .md-steps button.is-active { color: #000; font-weight: 600; }
        .md-steps i { font-style: normal; color: #ddd; }
        .md-steps-hint { margin-left: 8px; color: #999; transition: opacity 400ms ease; }
        .md-steps-hint.is-gone { opacity: 0; }
        .md-hint-tap { display: none; }
        @media (hover: none) {
          .md-hint-click { display: none; }
          .md-hint-tap { display: inline; }
        }
        .md-svg-outer:focus-visible { outline: 1px dashed rgba(0,0,0,0.2); outline-offset: 4px; }
        .md-svg { width: 100%; height: auto; overflow: visible; display: block; }
        .md-svg text { font-family: var(--font-sans), sans-serif; }
        /* zones */
        .md-z { opacity: 0; transition: opacity .65s cubic-bezier(.4,0,.2,1); }
        .md-s1 .md-z, .md-s2 .md-z { opacity: 1; }
        /* dividers */
        .md-zdiv { fill: none; stroke: rgba(0,0,0,.14); stroke-width: .75; stroke-dasharray: 3.5 4; opacity: 0; transition: opacity .4s ease .3s; }
        .md-s1 .md-zdiv, .md-s2 .md-zdiv { opacity: 1; }
        /* person names */
        .md-pn { font-size: 13px; font-weight: 600; fill: rgba(0,0,0,.76); text-anchor: middle; opacity: 0; transition: opacity .45s ease .3s; }
        .md-s1 .md-pn, .md-s2 .md-pn { opacity: 1; }
        /* triangle lines */
        .md-tri-outer { fill: none; stroke: #111; stroke-width: 1.5; }
        .md-tri-inner { fill: none; stroke: rgba(0,0,0,.22); stroke-width: 1.0; stroke-dasharray: 6 4; }
        /* vertex labels */
        .md-vl { font-size: 13.5px; font-weight: 700; fill: #111; text-anchor: middle; letter-spacing: .04em; }
        .md-vs { font-size: 10px; fill: #c0c0c0; text-anchor: middle; }
        .md-cl { font-size: 18px; font-weight: 700; fill: #111; text-anchor: middle; letter-spacing: -.03em; }
        .md-cl-sub { font-size: 9.5px; fill: #ccc; text-anchor: middle; letter-spacing: .04em; }
        /* outer network */
        .md-ext-fill { opacity: 0; transition: opacity .55s ease .05s; }
        .md-s2 .md-ext-fill { opacity: 1; }
        .md-ext-edges { opacity: 0; transition: opacity .55s ease .05s; }
        .md-s2 .md-ext-edges { opacity: 1; }
        .md-ext-edge { fill: none; stroke: #111; stroke-width: 1.1; stroke-dasharray: 9 6; }
        .md-ext-txt { opacity: 0; transition: opacity .5s ease .55s; }
        .md-s2 .md-ext-txt { opacity: 1; }
        .md-wdom { font-size: 12px; font-weight: 600; fill: #222; text-anchor: middle; }
        .md-wlabel { font-size: 8.5px; font-weight: 600; fill: #bbb; text-anchor: middle; letter-spacing: .1em; }
        .md-wsep { fill: none; stroke: rgba(0,0,0,.1); stroke-width: .6; stroke-dasharray: 3 4; }

        /* ── REVEAL ── */
        .met-reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.6s var(--ease-smooth), transform 0.6s var(--ease-smooth); }
        .met-reveal.met-in { opacity: 1; transform: none; }
        .met-d1 { transition-delay: 80ms; } .met-d2 { transition-delay: 160ms; } .met-d3 { transition-delay: 240ms; }

        /* ── Han confiat en nosaltres ── */
        .met-clients-section {
          border-top: 1px solid rgba(0,0,0,0.07);
          padding: clamp(36px,5vh,64px) 0;
          background: #fff;
          overflow: hidden;
        }
        .met-clients-label {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          color: #888;
          margin: 0 0 clamp(20px,3vh,32px);
          padding: 0 var(--margin-page);
        }
        .met-clients-wrap {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          cursor: pointer;
        }
        .met-clients-track {
          display: flex;
          align-items: center;
          gap: clamp(40px, 5vw, 80px);
          width: max-content;
          padding: 8px 0;
          animation: met-marquee 42s linear infinite;
          animation-play-state: paused;
        }
        .met-clients-wrap:hover .met-clients-track { animation-play-state: running; }
        @keyframes met-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .met-client-logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
          filter: grayscale(100%);
          transition: opacity 300ms ease, filter 300ms ease;
        }
        .met-clients-wrap:hover .met-client-logo { opacity: 0.7; }
        .met-client-logo:hover { opacity: 1 !important; filter: grayscale(0%) !important; }
        .met-client-img { max-height: 36px; max-width: 110px; width: auto; height: auto; object-fit: contain; display: block; }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          /* Pilars: acordió que s'obre en tocar */
          .met-pillar-cols { flex-direction: column; min-height: auto; }
          .met-pillar-col { flex: none !important; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); overflow: visible; }
          .met-pillar-col:last-child { border-bottom: none; }
          .met-pillar-word-v {
            position: static; opacity: 1 !important; pointer-events: auto;
            justify-content: space-between; text-align: left;
            padding: 18px var(--margin-page);
            font-size: clamp(20px, 5.4vw, 26px);
            cursor: pointer;
          }
          .met-pillar-plus {
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 22px; font-weight: 300; line-height: 1;
            transition: transform 350ms var(--ease-smooth);
          }
          .met-pillar-col.is-tapped .met-pillar-plus { transform: rotate(45deg); }
          .met-pillar-expand,
          .met-pillar-col.is-open .met-pillar-expand,
          .met-pillar-cols.is-locked .met-pillar-expand {
            position: static;
            display: grid; grid-template-rows: 0fr;
            opacity: 0; pointer-events: none;
            padding: 0 var(--margin-page);
            transition: grid-template-rows 450ms var(--ease-smooth), opacity 300ms ease;
          }
          .met-pillar-e-inner { display: block; min-height: 0; overflow: hidden; }
          .met-pillar-col.is-tapped .met-pillar-expand { grid-template-rows: 1fr; opacity: 1; pointer-events: auto; }
          .met-pillar-col .met-pillar-e-text { width: auto !important; }
          .met-pillar-e-num, .met-pillar-e-title { display: none; }
          .met-pillar-e-tagline { margin: 0 0 10px; }
          .met-pillar-e-desc { max-width: none; font-size: 14px; }
          .met-pillar-e-img, .met-pillar-col.is-open .met-pillar-e-img { padding: 20px 0 28px; display: block; }
          .met-pillar-e-img img, .met-pillar-col.is-open .met-pillar-e-img img { width: 100%; height: auto; max-height: 260px; }

          /* Diagrama: més gran i més a prop del text */
          .met-modes { grid-template-columns: 1fr; }
          .met-modes-left { padding-bottom: 8px; }
          .met-modes-right {
            position: static;
            height: auto;
            padding: 0 4px 48px;
            border: none;
            justify-content: center;
          }
          .met-modes-right .md-svg-outer { width: 100%; max-width: 100%; }
          .md-vl { font-size: 24px; }
          .md-vs { font-size: 17px; fill: #aaa; }
          .md-cl { font-size: 32px; }
          .md-cl-sub { font-size: 16px; fill: #aaa; }
          .md-pn { font-size: 21px; }
          .md-wlabel { font-size: 15px; }
          .md-wdom { font-size: 19px; }
        }
        @media (max-width: 768px) {
          .met-values-grid { grid-template-columns: 1fr; gap: 40px; }
          .met-value:not(:last-child) { border-right: none; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 40px; margin-right: 0; }
          .met-client-img { max-height: 28px; max-width: 80px; }
          .met-clients-track { gap: 32px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="met-page-header">
        <div className="met-page-title-row">
          <h1 className="met-page-title">{t.title}</h1>
        </div>
        <div className="met-page-sep" />
      </div>

      {/* ── VALORS FONAMENTALS ── */}
      <section className="met-values">
        <p className="met-section-heading met-reveal">{t.valors.heading}</p>
        <div className="met-values-grid">
          {t.valors.items.map((v, i) => (
            <div key={v.name} className={`met-value met-reveal met-d${i + 1}`}>
              <h3 className="met-value-name">{v.name}</h3>
              <p className="met-value-desc">
                {v.desc.map((chunk, j) =>
                  j % 2 === 0 ? chunk : <strong key={j}>{chunk}</strong>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PILARS URBANÍSTICS ── */}
      <section>
        <div className="met-pilars-top met-reveal">
          <p className="met-section-heading">{t.pilars.heading}</p>
          <h2 className="met-pilars-h2"><strong>{t.pilars.items.length === 3 ? (lang === "ca" ? "Tres" : lang === "es" ? "Tres" : "Three") : t.pilars.items.length}</strong> {lang === "ca" ? "eixos que orienten cada projecte" : lang === "es" ? "ejes que orientan cada proyecto" : "axes that guide every project"}</h2>
        </div>
        <PillarCols items={t.pilars.items as typeof T["ca"]["pilars"]["items"]} />
      </section>

      {/* ── TRES FORMES ── */}
      <section className="met-modes">
        <div className="met-modes-left">
          <div className="met-modes-header-block met-reveal">
            <h2>{t.modes.heading}<br />{t.modes.headingLine2}</h2>
            <p>{t.modes.sub}</p>
          </div>
          <div className="met-modes-list">
            {t.modes.items.map((item) => (
              <ServiceItem key={item.name} name={item.name} desc={item.desc} tags={item.tags} />
            ))}
          </div>
        </div>
        <div className="met-modes-right">
          <MethodDiagram d={t.diagram as unknown as typeof T["ca"]["diagram"]} lang={lang} />
        </div>
      </section>

      {/* ── Han confiat en nosaltres ── */}
      <section className="met-clients-section">
        <p className="met-clients-label">{t.clients}</p>
        <div className="met-clients-wrap">
          <div className="met-clients-track">
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <div key={i} className="met-client-logo" title={c.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/clients/${c.file}`} alt={c.name} className="met-client-img" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
