import { useState, useEffect, useRef, useCallback } from "react";

const TYPES = {
  living: { l: "Living / Library", c: "#F5F0E8" },
  kitchen: { l: "Kitchen / Service", c: "#FCEADB" },
  bedroom: { l: "Bedroom", c: "#DFEBF5" },
  bathroom: { l: "Bathroom", c: "#D5EDED" },
  utility: { l: "Utility / Storage", c: "#E9DDF2" },
  courtyard: { l: "Courtyard", c: "#DFECD6" },
  corridor: { l: "Corridor / Hall", c: "#EBE7DF" },
  iwan: { l: "Iwan / Outdoor", c: "#E5EED8" },
  entry: { l: "Entry", c: "#FFF5E6" },
  servants: { l: "Servants", c: "#F0DDE0" },
  stairs: { l: "Stairs / Elevator", c: "#DDD8D0" },
  garage: { l: "Garage / Parking", c: "#E0DDD8" },
  dining: { l: "Dining", c: "#F8F0E0" },
};
const DT = {
  single: { l: "Single Swing", w: 0.9 },
  double: { l: "Double Swing", w: 1.6 },
  sliding: { l: "Sliding", w: 1.2 },
  pocket: { l: "Pocket", w: 0.9 },
  fold: { l: "Bi-fold", w: 1.4 },
};
const WT = {
  standard: { l: "Standard", w: 1.2 },
  large: { l: "Large", w: 2 },
  small: { l: "Small", w: 0.6 },
  floor: { l: "Floor-to-ceiling", w: 1.5 },
};

const SNAP = 0.5,
  PAD = 36,
  M2FT = 3.28084,
  CM2IN = 0.393701;
const snpM = (v) => Math.round(v / SNAP) * SNAP,
  snpF = (v) => Math.round(v * 10) / 10;
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const useMob = () => {
  const [m, s] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const h = () => s(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
};
const dU = (m, u) =>
  u === "imperial"
    ? Math.floor(m * M2FT) +
      "'" +
      Math.round((m * M2FT - Math.floor(m * M2FT)) * 12) +
      '"'
    : m + "m";
const dA = (a, u) =>
  u === "imperial"
    ? (a * M2FT * M2FT).toFixed(1) + " ft2"
    : (a % 1 === 0 ? a : a.toFixed(1)) + "m2";
const wD = (cm, u) =>
  u === "imperial" ? (cm * CM2IN).toFixed(1) + '"' : cm + "cm";

async function LI(st) {
  try {
    const r = await st.get("fp-index");
    return r ? JSON.parse(r.value) : [];
  } catch {
    return [];
  }
}
async function SI(st, i) {
  await st.set("fp-index", JSON.stringify(i));
}
async function LP(st, id) {
  try {
    const r = await st.get("fp-proj-" + id);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}
async function SP(st, p) {
  await st.set("fp-proj-" + p.id, JSON.stringify(p));
}
async function DPj(st, id) {
  await st.delete("fp-proj-" + id);
}

function NumInput({ value: v, onChange: oc, step: st, min: mn, style: sy }) {
  const [l, sL] = useState(String(v));
  const [f, sF] = useState(false);
  useEffect(() => {
    if (!f) sL(String(v));
  }, [v, f]);
  const cm = () => {
    const n = parseFloat(l);
    if (!isNaN(n)) {
      const x = mn != null ? Math.max(mn, n) : n;
      oc(x);
      sL(String(x));
    } else sL(String(v));
  };
  return (
    <input
      type="number"
      step={st || 1}
      min={mn}
      className="fps-input"
      style={sy}
      value={f ? l : String(v)}
      onFocus={() => {
        sF(true);
        sL(String(v));
      }}
      onBlur={() => {
        cm();
        sF(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          cm();
          e.target.blur();
        }
      }}
      onChange={(e) => sL(e.target.value)}
    />
  );
}
function TextInput({ value: v, onChange: oc, style: sy, placeholder: ph }) {
  const [l, sL] = useState(v);
  const [f, sF] = useState(false);
  useEffect(() => {
    if (!f) sL(v);
  }, [v, f]);
  return (
    <input
      type="text"
      className="fps-input"
      style={sy}
      placeholder={ph}
      value={f ? l : v}
      onFocus={() => {
        sF(true);
        sL(v);
      }}
      onBlur={() => {
        oc(l);
        sF(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          oc(l);
          e.target.blur();
        }
      }}
      onChange={(e) => sL(e.target.value)}
    />
  );
}

const STY_ID = "fps-s";
function injectCSS() {
  if (document.getElementById(STY_ID)) return;
  const s = document.createElement("style");
  s.id = STY_ID;
  s.textContent = `@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes si{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.6}}
.fps-fade{animation:fi .3s ease both}.fps-scale{animation:si .25s ease both}
.fps-btn{transition:all .15s ease!important}.fps-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}.fps-btn:active{transform:translateY(0);filter:brightness(.95)}
.fps-card{transition:border-color .2s,box-shadow .2s,transform .15s!important}.fps-card:hover{border-color:#845EC2!important;box-shadow:0 4px 20px rgba(132,94,194,.15)!important;transform:translateY(-2px)}
.fps-input{transition:border-color .2s,box-shadow .2s!important}.fps-input:focus{border-color:#845EC2!important;box-shadow:0 0 0 2px rgba(132,94,194,.2)!important}
.fps-tab{transition:all .2s!important}.fps-tab:hover{border-color:#845EC2!important;color:#845EC2!important}
.fps-li{transition:background .15s,color .15s!important}.fps-li:hover{background:rgba(132,94,194,.08)!important}
.fps-sheet{transition:transform .35s cubic-bezier(.4,0,.2,1)!important}
@media print{.no-print{display:none!important}.print-only{display:block!important}}`;
  document.head.appendChild(s);
}

// ── Undo/Redo Hook ──
function useHistory(initial) {
  const hist = useRef([JSON.stringify(initial)]);
  const idx = useRef(0);
  const [val, setVal] = useState(initial);
  const push = useCallback((v) => {
    const s = JSON.stringify(v);
    if (s === hist.current[idx.current]) return;
    hist.current = hist.current.slice(0, idx.current + 1);
    hist.current.push(s);
    if (hist.current.length > 50) hist.current.shift();
    else idx.current++;
    setVal(v);
  }, []);
  const undo = useCallback(() => {
    if (idx.current > 0) {
      idx.current--;
      setVal(JSON.parse(hist.current[idx.current]));
    }
  }, []);
  const redo = useCallback(() => {
    if (idx.current < hist.current.length - 1) {
      idx.current++;
      setVal(JSON.parse(hist.current[idx.current]));
    }
  }, []);
  const canUndo = idx.current > 0,
    canRedo = idx.current < hist.current.length - 1;
  return { val, push, undo, redo, canUndo, canRedo, setDirect: setVal };
}

// ── Smart Snap: find nearest room edges ──
function getSnapGuides(rooms, movingId, x, y, w, h, pw, ph) {
  const guides = [],
    T = 0.3;
  const edges = {
    l: x,
    r: x + w,
    cx: x + w / 2,
    t: y,
    b: y + h,
    cy: y + h / 2,
  };
  rooms.forEach((rm) => {
    if (rm.id === movingId) return;
    const re = {
      l: rm.x,
      r: rm.x + rm.w,
      cx: rm.x + rm.w / 2,
      t: rm.y,
      b: rm.y + rm.h,
      cy: rm.y + rm.h / 2,
    };
    // vertical guides (x alignment)
    [
      ["l", "l"],
      ["r", "r"],
      ["l", "r"],
      ["r", "l"],
      ["cx", "cx"],
    ].forEach(([a, b]) => {
      if (Math.abs(edges[a] - re[b]) < T)
        guides.push({
          type: "v",
          pos: re[b],
          from: Math.min(edges.t, re.t),
          to: Math.max(edges.b, re.b),
        });
    });
    // horizontal guides (y alignment)
    [
      ["t", "t"],
      ["b", "b"],
      ["t", "b"],
      ["b", "t"],
      ["cy", "cy"],
    ].forEach(([a, b]) => {
      if (Math.abs(edges[a] - re[b]) < T)
        guides.push({
          type: "h",
          pos: re[b],
          from: Math.min(edges.l, re.l),
          to: Math.max(edges.r, re.r),
        });
    });
  });
  return guides;
}

// ── SVG Components ──
function RoomSVG({ rm, sc, sel, onPD }) {
  const rx = PAD + rm.x * sc,
    ry = PAD + rm.y * sc,
    rw = rm.w * sc,
    rh = rm.h * sc,
    cl = TYPES[rm.type]?.c || "#EEE",
    a = rm.w * rm.h;
  const t = rm.w < 2 || rm.h < 2,
    m = rm.w < 1.5 || rm.h < 1.5;
  const f1 = m
      ? 5.5
      : t
        ? 7
        : Math.min(9, (rw / Math.max(rm.name.length, 1)) * 1.4),
    f2 = m ? 4 : t ? 5 : 6;
  return (
    <g
      onPointerDown={(e) => {
        e.stopPropagation();
        onPD(e, rm.id);
      }}
      style={{ cursor: "move", touchAction: "none" }}
    >
      {rm.type === "stairs" && (
        <rect x={rx} y={ry} width={rw} height={rh} fill="url(#stP)" />
      )}
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        fill={cl}
        opacity={rm.type === "stairs" ? 0.5 : 0.92}
        style={{ transition: "opacity .15s" }}
      />
      {sel && (
        <rect
          x={rx - 1}
          y={ry - 1}
          width={rw + 2}
          height={rh + 2}
          fill="none"
          stroke="#00C9A7"
          strokeWidth={2.5}
          strokeDasharray="6,3"
          style={{ animation: "pu 2s ease infinite" }}
        />
      )}
      {!m && (
        <text
          x={rx + rw / 2}
          y={ry + rh / 2 - (t ? 0 : 2.5)}
          textAnchor="middle"
          fontFamily="Outfit"
          fontSize={f1}
          fill="#3A3548"
          fontWeight="500"
          pointerEvents="none"
        >
          {rm.name}
        </text>
      )}
      {!m && !t && (
        <text
          x={rx + rw / 2}
          y={ry + rh / 2 + 5.5}
          textAnchor="middle"
          fontFamily="Outfit"
          fontSize={f2}
          fill="#8A80A0"
          pointerEvents="none"
        >
          {rm.w}x{rm.h}m {a % 1 === 0 ? a : a.toFixed(1)}m2
        </text>
      )}
    </g>
  );
}

function Handles({ rm, scale, onHD, mob }) {
  const rx = PAD + rm.x * scale,
    ry = PAD + rm.y * scale,
    rw = rm.w * scale,
    rh = rm.h * scale,
    hs = mob ? 12 : 7;
  const H = [
    ["nw", rx, ry],
    ["n", rx + rw / 2, ry],
    ["ne", rx + rw, ry],
    ["e", rx + rw, ry + rh / 2],
    ["se", rx + rw, ry + rh],
    ["s", rx + rw / 2, ry + rh],
    ["sw", rx, ry + rh],
    ["w", rx, ry + rh / 2],
  ];
  return (
    <g>
      {H.map(([h, cx, cy]) => (
        <rect
          key={h}
          x={cx - hs / 2}
          y={cy - hs / 2}
          width={hs}
          height={hs}
          fill="#00C9A7"
          stroke="#00A88A"
          strokeWidth={0.5}
          rx={mob ? 2 : 1}
          style={{
            cursor: h + "-resize",
            touchAction: "none",
            transition: "transform .1s",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onHD(e, rm.id, h);
          }}
        />
      ))}
    </g>
  );
}

function ColSVG({ el, sc, sel, onPD }) {
  const cx = PAD + el.x * sc,
    cy = PAD + el.y * sc,
    r = Math.max(((el.size || 0.3) * sc) / 2, 2);
  return (
    <g
      onPointerDown={(e) => {
        e.stopPropagation();
        onPD(e, el.id);
      }}
      style={{ cursor: "pointer", touchAction: "none" }}
    >
      <circle cx={cx} cy={cy} r={r + 1} fill="#8A7A68" opacity={0.3} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#6A5A48"
        stroke={sel ? "#00C9A7" : "#4A3A28"}
        strokeWidth={sel ? 2 : 1}
      />
    </g>
  );
}

function DoorSVG({ el, sc, sel, onPD, wp }) {
  const w = el.width * sc,
    px = PAD + el.x * sc,
    py = PAD + el.y * sc,
    isH = el.orient === "h";
  const gW = isH ? w : wp * 2.5,
    gH = isH ? wp * 2.5 : w,
    gx = isH ? px : px - wp * 1.25,
    gy = isH ? py - wp * 1.25 : py;
  const dt = el.doorType || "single";
  let d;
  if (dt === "single") {
    const r = w;
    d = isH ? (
      <g>
        <line
          x1={px}
          y1={py}
          x2={px + w}
          y2={py}
          stroke="#8B6914"
          strokeWidth={2}
        />
        <path
          d={
            "M" +
            px +
            "," +
            py +
            " A" +
            r +
            "," +
            r +
            " 0 0,1 " +
            (px + r * 0.866) +
            "," +
            (py - r * 0.5)
          }
          fill="none"
          stroke="#8B6914"
          strokeWidth={0.8}
          strokeDasharray="3,2"
        />
      </g>
    ) : (
      <g>
        <line
          x1={px}
          y1={py}
          x2={px}
          y2={py + w}
          stroke="#8B6914"
          strokeWidth={2}
        />
        <path
          d={
            "M" +
            px +
            "," +
            py +
            " A" +
            r +
            "," +
            r +
            " 0 0,0 " +
            (px + r * 0.5) +
            "," +
            (py + r * 0.866)
          }
          fill="none"
          stroke="#8B6914"
          strokeWidth={0.8}
          strokeDasharray="3,2"
        />
      </g>
    );
  } else if (dt === "double") {
    const h = w / 2;
    d = isH ? (
      <g>
        <line
          x1={px}
          y1={py}
          x2={px + w}
          y2={py}
          stroke="#8B6914"
          strokeWidth={2}
        />
        <path
          d={
            "M" +
            px +
            "," +
            py +
            " A" +
            h +
            "," +
            h +
            " 0 0,1 " +
            (px + h * 0.707) +
            "," +
            (py - h * 0.707)
          }
          fill="none"
          stroke="#8B6914"
          strokeWidth={0.8}
          strokeDasharray="3,2"
        />
        <path
          d={
            "M" +
            (px + w) +
            "," +
            py +
            " A" +
            h +
            "," +
            h +
            " 0 0,0 " +
            (px + w - h * 0.707) +
            "," +
            (py - h * 0.707)
          }
          fill="none"
          stroke="#8B6914"
          strokeWidth={0.8}
          strokeDasharray="3,2"
        />
      </g>
    ) : (
      <g>
        <line
          x1={px}
          y1={py}
          x2={px}
          y2={py + w}
          stroke="#8B6914"
          strokeWidth={2}
        />
        <path
          d={
            "M" +
            px +
            "," +
            py +
            " A" +
            h +
            "," +
            h +
            " 0 0,0 " +
            (px + h * 0.707) +
            "," +
            (py + h * 0.707)
          }
          fill="none"
          stroke="#8B6914"
          strokeWidth={0.8}
          strokeDasharray="3,2"
        />
      </g>
    );
  } else if (dt === "sliding") {
    d = isH ? (
      <line
        x1={px}
        y1={py}
        x2={px + w}
        y2={py}
        stroke="#8B6914"
        strokeWidth={2.5}
      />
    ) : (
      <line
        x1={px}
        y1={py}
        x2={px}
        y2={py + w}
        stroke="#8B6914"
        strokeWidth={2.5}
      />
    );
  } else {
    const da = dt === "fold" ? "4,3" : "6,2";
    d = isH ? (
      <line
        x1={px}
        y1={py}
        x2={px + w}
        y2={py}
        stroke="#8B6914"
        strokeWidth={1.5}
        strokeDasharray={da}
      />
    ) : (
      <line
        x1={px}
        y1={py}
        x2={px}
        y2={py + w}
        stroke="#8B6914"
        strokeWidth={1.5}
        strokeDasharray={da}
      />
    );
  }
  return (
    <g
      onPointerDown={(e) => {
        e.stopPropagation();
        onPD(e, el.id);
      }}
      style={{ cursor: "pointer", touchAction: "none" }}
    >
      <rect
        x={gx - 2}
        y={gy - 2}
        width={gW + 4}
        height={gH + 4}
        fill="#FEFEDF"
        opacity={0.9}
      />
      {d}
      {sel && (
        <rect
          x={gx - 4}
          y={gy - 4}
          width={gW + 8}
          height={gH + 8}
          fill="none"
          stroke="#00C9A7"
          strokeWidth={1.5}
          strokeDasharray="4,2"
          rx={2}
        />
      )}
    </g>
  );
}

function WinSVG({ el, sc, sel, onPD, wp }) {
  const w = el.width * sc,
    px = PAD + el.x * sc,
    py = PAD + el.y * sc,
    isH = el.orient === "h",
    o = Math.max(wp * 0.8, 2);
  return (
    <g
      onPointerDown={(e) => {
        e.stopPropagation();
        onPD(e, el.id);
      }}
      style={{ cursor: "pointer", touchAction: "none" }}
    >
      <rect
        x={isH ? px : px - o - 1}
        y={isH ? py - o - 1 : py}
        width={isH ? w : o * 2 + 2}
        height={isH ? o * 2 + 2 : w}
        fill="#FEFEDF"
        opacity={0.9}
      />
      {isH ? (
        <g>
          <rect
            x={px}
            y={py - o}
            width={w}
            height={o * 2}
            fill="#D0EAF4"
            opacity={0.3}
          />
          <line
            x1={px}
            y1={py - o}
            x2={px + w}
            y2={py - o}
            stroke="#5AA0C0"
            strokeWidth={1.5}
          />
          <line
            x1={px}
            y1={py + o}
            x2={px + w}
            y2={py + o}
            stroke="#5AA0C0"
            strokeWidth={1.5}
          />
        </g>
      ) : (
        <g>
          <rect
            x={px - o}
            y={py}
            width={o * 2}
            height={w}
            fill="#D0EAF4"
            opacity={0.3}
          />
          <line
            x1={px - o}
            y1={py}
            x2={px - o}
            y2={py + w}
            stroke="#5AA0C0"
            strokeWidth={1.5}
          />
          <line
            x1={px + o}
            y1={py}
            x2={px + o}
            y2={py + w}
            stroke="#5AA0C0"
            strokeWidth={1.5}
          />
        </g>
      )}
      {sel && (
        <rect
          x={(isH ? px : px - o) - 4}
          y={(isH ? py - o : py) - 4}
          width={(isH ? w : o * 2) + 8}
          height={(isH ? o * 2 : w) + 8}
          fill="none"
          stroke="#00C9A7"
          strokeWidth={1.5}
          strokeDasharray="4,2"
          rx={2}
        />
      )}
    </g>
  );
}

// ── Editor ──
function Editor({ project, onBack, st }) {
  const {
    val: proj,
    push: pushH,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(project);
  const [fIdx, setFIdx] = useState(0);
  const [selId, setSelId] = useState(null);
  const [selCat, setSelCat] = useState("room");
  const [tool, setTool] = useState("select");
  const [drag, setDrag] = useState(null);
  const [pan, setPan] = useState("props");
  const [panO, setPanO] = useState(false);
  const [showAF, setShowAF] = useState(false);
  const [nfn, setNfn] = useState("");
  const [guides, setGuides] = useState([]);
  const svgR = useRef(null);
  const stR = useRef(null);
  const wrapR = useRef(null);
  const mob = useMob();

  useEffect(() => {
    injectCSS();
  }, []);

  // Block ALL touch scrolling while actively dragging a room/element
  useEffect(() => {
    if (!drag) return;
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("touchmove", prevent, { passive: false });
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("touchmove", prevent);
      document.body.style.overflow = "";
    };
  }, [!!drag]);

  const fl = proj.floors[fIdx] || proj.floors[0];
  const rms = fl?.rooms || [];
  const els = fl?.elements || [];
  const pw = proj.plotWidth,
    ph = proj.plotHeight,
    wt = proj.wallThickness || 0.2,
    un = proj.units || "metric";
  const md = Math.max(pw, ph, 1);
  const sc = Math.max(
    10,
    Math.min(28, (mob ? window.innerWidth - 40 : 520) / md),
  );
  const cvw = pw * sc + PAD * 2,
    cvh = ph * sc + PAD * 2,
    wp = wt * sc;

  const autoSave = useCallback(
    (p) => {
      if (stR.current) clearTimeout(stR.current);
      stR.current = setTimeout(() => {
        const u = { ...p, updatedAt: new Date().toISOString() };
        SP(st, u);
        LI(st).then((ix) => {
          SI(
            st,
            ix.map((it) =>
              it.id === u.id
                ? { ...it, name: u.name, updatedAt: u.updatedAt }
                : it,
            ),
          );
        });
      }, 800);
    },
    [st],
  );
  const upd = useCallback(
    (fn) => {
      const n = JSON.parse(JSON.stringify(proj));
      fn(n);
      n.floors.forEach((f) => {
        if (!f.elements) f.elements = [];
        if (!f.columns) f.columns = [];
        if (f.height == null) f.height = 3;
      });
      autoSave(n);
      pushH(n);
    },
    [proj, autoSave, pushH],
  );

  const gPt = (e) => {
    const s = svgR.current,
      r = s.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (cvw / r.width),
      y: (e.clientY - r.top) * (cvh / r.height),
    };
  };
  const selRoom = (id) => {
    setSelId(id);
    setSelCat("room");
    setPan("props");
    if (mob) setPanO(true);
  };
  const selEl = (id) => {
    setSelId(id);
    setSelCat("element");
    setPan("props");
    if (mob) setPanO(true);
  };
  const clr = () => {
    setSelId(null);
    setSelCat("room");
    setGuides([]);
  };
  const sRoom = selCat === "room" ? rms.find((r) => r.id === selId) : null;
  const sEl = selCat === "element" ? els.find((e) => e.id === selId) : null;

  const onRD = (e, id) => {
    if (tool !== "select" || e.button !== 0) return;
    e.preventDefault();
    selRoom(id);
    const pt = gPt(e),
      rm = rms.find((r) => r.id === id);
    if (!rm) return;
    setDrag({ m: "move", id, c: "room", sp: pt, sr: { ...rm } });
    svgR.current.setPointerCapture(e.pointerId);
  };
  const onHD = (e, id, h) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const pt = gPt(e),
      rm = rms.find((r) => r.id === id);
    if (!rm) return;
    setDrag({ m: "resize", id, c: "room", h, sp: pt, sr: { ...rm } });
    svgR.current.setPointerCapture(e.pointerId);
  };
  const onED = (e, id) => {
    if (tool !== "select" || e.button !== 0) return;
    e.preventDefault();
    selEl(id);
    const pt = gPt(e),
      el = els.find((x) => x.id === id);
    if (!el) return;
    setDrag({ m: "move", id, c: "el", sp: pt, sr: { ...el } });
    svgR.current.setPointerCapture(e.pointerId);
  };

  const onPM = (e) => {
    if (!drag) return;
    // Canvas pan mode
    if (drag.c === "canvas") {
      if (wrapR.current) {
        wrapR.current.scrollLeft = drag.sr.sl - (e.clientX - drag.sp.x);
        wrapR.current.scrollTop = drag.sr.st - (e.clientY - drag.sp.y);
      }
      return;
    }
    const pt = gPt(e),
      dx = (pt.x - drag.sp.x) / sc,
      dy = (pt.y - drag.sp.y) / sc,
      sr = drag.sr;
    if (drag.c === "room") {
      const n = JSON.parse(JSON.stringify(proj));
      const rm = n.floors[fIdx].rooms.find((r) => r.id === drag.id);
      if (!rm) return;
      if (drag.m === "move") {
        rm.x = Math.max(0, Math.min(pw - rm.w, snpM(sr.x + dx)));
        rm.y = Math.max(0, Math.min(ph - rm.h, snpM(sr.y + dy)));
        setGuides(getSnapGuides(rms, rm.id, rm.x, rm.y, rm.w, rm.h, pw, ph));
      } else {
        const h = drag.h;
        let nx = sr.x,
          ny = sr.y,
          nw = sr.w,
          nh = sr.h;
        if (h.includes("w")) {
          nx = snpM(sr.x + dx);
          nw = sr.w - (nx - sr.x);
        }
        if (h.includes("e")) nw = snpM(sr.w + dx);
        if (h.includes("n")) {
          ny = snpM(sr.y + dy);
          nh = sr.h - (ny - sr.y);
        }
        if (h.includes("s")) nh = snpM(sr.h + dy);
        if (nw < 1) {
          if (h.includes("w")) nx = sr.x + sr.w - 1;
          nw = 1;
        }
        if (nh < 1) {
          if (h.includes("n")) ny = sr.y + sr.h - 1;
          nh = 1;
        }
        nx = Math.max(0, nx);
        ny = Math.max(0, ny);
        if (nx + nw > pw) nw = pw - nx;
        if (ny + nh > ph) nh = ph - ny;
        rm.x = nx;
        rm.y = ny;
        rm.w = nw;
        rm.h = nh;
        setGuides(getSnapGuides(rms, rm.id, rm.x, rm.y, rm.w, rm.h, pw, ph));
      }
      n.floors.forEach((f) => {
        if (!f.elements) f.elements = [];
        if (!f.columns) f.columns = [];
      });
      autoSave(n);
      pushH(n);
    }
    if (drag.c === "el") {
      const n = JSON.parse(JSON.stringify(proj));
      const el = n.floors[fIdx].elements.find((x) => x.id === drag.id);
      if (!el) return;
      if (el.type === "column") {
        el.x = snpF(Math.max(0, Math.min(pw, sr.x + dx)));
        el.y = snpF(Math.max(0, Math.min(ph, sr.y + dy)));
      } else if (el.orient === "h") {
        el.x = snpF(Math.max(0, Math.min(pw - el.width, sr.x + dx)));
        el.y = snpF(Math.max(0, Math.min(ph, sr.y + dy)));
      } else {
        el.x = snpF(Math.max(0, Math.min(pw, sr.x + dx)));
        el.y = snpF(Math.max(0, Math.min(ph - el.width, sr.y + dy)));
      }
      n.floors.forEach((f) => {
        if (!f.elements) f.elements = [];
        if (!f.columns) f.columns = [];
      });
      autoSave(n);
      pushH(n);
    }
  };
  const onPU = () => {
    setDrag(null);
    setGuides([]);
  };

  const findWall = (mx, my) => {
    let b = { d: Infinity, x: mx, y: my, o: "h" };
    const ck = (wx, wy, o) => {
      const d = o === "h" ? Math.abs(my - wy) : Math.abs(mx - wx);
      if (d < b.d) b = { d, x: o === "h" ? mx : wx, y: o === "h" ? wy : my, o };
    };
    ck(mx, 0, "h");
    ck(mx, ph, "h");
    ck(0, my, "v");
    ck(pw, my, "v");
    rms.forEach((r) => {
      ck(mx, r.y, "h");
      ck(mx, r.y + r.h, "h");
      ck(r.x, my, "v");
      ck(r.x + r.w, my, "v");
    });
    return b;
  };

  const onBgDown = (e) => {
    if (e.button !== 0) return;
    const pt = gPt(e),
      mx = (pt.x - PAD) / sc,
      my = (pt.y - PAD) / sc;
    if (tool === "door" || tool === "window") {
      if (mx < 0 || my < 0 || mx > pw || my > ph) return;
      const sn = findWall(mx, my),
        id = uid(),
        w = tool === "door" ? 0.9 : 1.2;
      const ne = {
        id,
        type: tool,
        x:
          sn.o === "h"
            ? snpF(Math.max(0, Math.min(pw - w, sn.x - w / 2)))
            : snpF(sn.x),
        y:
          sn.o === "h"
            ? snpF(sn.y)
            : snpF(Math.max(0, Math.min(ph - w, sn.y - w / 2))),
        orient: sn.o,
        width: w,
      };
      if (tool === "door") ne.doorType = "single";
      else ne.winType = "standard";
      upd((p) => {
        p.floors[fIdx].elements.push(ne);
      });
      selEl(id);
      return;
    }
    if (tool === "column") {
      if (mx < 0 || my < 0 || mx > pw || my > ph) return;
      const id = uid();
      const ne = { id, type: "column", x: snpF(mx), y: snpF(my), size: 0.3 };
      upd((p) => {
        p.floors[fIdx].elements.push(ne);
      });
      selEl(id);
      return;
    }
    // In select mode, touching background starts canvas pan
    clr();
    if (mob) setPanO(false);
    if (wrapR.current) {
      e.preventDefault();
      const wr = wrapR.current;
      setDrag({
        m: "pan",
        c: "canvas",
        sp: { x: e.clientX, y: e.clientY },
        sr: { sl: wr.scrollLeft, st: wr.scrollTop },
      });
      svgR.current.setPointerCapture(e.pointerId);
    }
  };

  const addRm = () => {
    const id = uid();
    upd((p) => {
      p.floors[fIdx].rooms.push({
        id,
        name: "New Room",
        type: "living",
        x: 0,
        y: 0,
        w: 4,
        h: 3,
      });
    });
    selRoom(id);
  };
  const dupRm = () => {
    if (!sRoom) return;
    const id = uid();
    upd((p) => {
      p.floors[fIdx].rooms.push({
        ...JSON.parse(JSON.stringify(sRoom)),
        id,
        name: sRoom.name + " Copy",
        x: Math.min(sRoom.x + 1, pw - sRoom.w),
        y: Math.min(sRoom.y + 1, ph - sRoom.h),
      });
    });
    selRoom(id);
  };
  const delSel = () => {
    if (!selId) return;
    if (selCat === "room")
      upd((p) => {
        p.floors[fIdx].rooms = p.floors[fIdx].rooms.filter(
          (r) => r.id !== selId,
        );
      });
    else
      upd((p) => {
        p.floors[fIdx].elements = p.floors[fIdx].elements.filter(
          (x) => x.id !== selId,
        );
      });
    clr();
  };
  const addFl = () => {
    const nm = nfn.trim() || "Floor " + (proj.floors.length + 1);
    upd((p) => {
      p.floors.push({
        id: uid(),
        name: nm,
        rooms: [],
        elements: [],
        columns: [],
        height: 3,
      });
    });
    setFIdx(proj.floors.length);
    setShowAF(false);
    setNfn("");
  };
  const copyFl = () => {
    upd((p) => {
      const src = JSON.parse(JSON.stringify(p.floors[fIdx]));
      src.id = uid();
      src.name = src.name + " (Copy)";
      src.rooms.forEach((r) => (r.id = uid()));
      src.elements.forEach((e) => (e.id = uid()));
      p.floors.push(src);
    });
    setFIdx(proj.floors.length);
  };
  const delFl = () => {
    if (proj.floors.length <= 1) return;
    upd((p) => {
      p.floors.splice(fIdx, 1);
    });
    setFIdx(Math.max(0, fIdx - 1));
    clr();
  };
  const expJ = () => {
    const b = new Blob([JSON.stringify(proj, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = (proj.name || "plan") + ".json";
    a.click();
  };
  const printPlan = () => {
    window.print();
  };

  const tA = rms.reduce((s, r) => s + r.w * r.h, 0);
  const plotA = pw * ph;
  const freeA = plotA - tA;
  const byType = {};
  rms.forEach((r) => {
    byType[r.type] = (byType[r.type] || 0) + r.w * r.h;
  });
  const fh = fl?.height || 3;
  // Stair calculator
  const stairRooms = rms.filter((r) => r.type === "stairs");
  const stairInfo =
    stairRooms.length > 0
      ? {
          riserH: fh / Math.round(fh / 0.18),
          numSteps: Math.round(fh / 0.18),
          treadD: 0.28,
          runLen: Math.round(fh / 0.18) * 0.28,
        }
      : null;

  useEffect(() => {
    const onK = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
        return;
      }
      if (!selId || ["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName))
        return;
      if (selCat === "room") {
        const st = e.shiftKey ? 1 : 0.5;
        let h = false;
        if (e.key === "ArrowLeft") {
          upd((p) => {
            const r = p.floors[fIdx].rooms.find((r2) => r2.id === selId);
            if (r) r.x = Math.max(0, r.x - st);
          });
          h = true;
        }
        if (e.key === "ArrowRight") {
          upd((p) => {
            const r = p.floors[fIdx].rooms.find((r2) => r2.id === selId);
            if (r) r.x = Math.min(pw - r.w, r.x + st);
          });
          h = true;
        }
        if (e.key === "ArrowUp") {
          upd((p) => {
            const r = p.floors[fIdx].rooms.find((r2) => r2.id === selId);
            if (r) r.y = Math.max(0, r.y - st);
          });
          h = true;
        }
        if (e.key === "ArrowDown") {
          upd((p) => {
            const r = p.floors[fIdx].rooms.find((r2) => r2.id === selId);
            if (r) r.y = Math.min(ph - r.h, r.y + st);
          });
          h = true;
        }
        if (h) e.preventDefault();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        delSel();
        e.preventDefault();
      }
      if (e.key === "Escape") {
        setTool("select");
        clr();
      }
    };
    window.addEventListener("keydown", onK);
    return () => window.removeEventListener("keydown", onK);
  }, [selId, selCat, fIdx, pw, ph, proj]);

  // ── Panel Renderers ──
  const rProps = () => {
    if (sEl) {
      if (sEl.type === "column") {
        return (
          <div className="fps-fade">
            <div
              style={{
                fontSize: 16,
                color: "#845EC2",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Column
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <div>
                <div style={lS}>X</div>
                <NumInput
                  step={0.1}
                  value={sEl.x}
                  onChange={(v) =>
                    upd((p) => {
                      const el = p.floors[fIdx].elements.find(
                        (x) => x.id === selId,
                      );
                      if (el) el.x = v;
                    })
                  }
                  style={{ ...iS, padding: "6px", textAlign: "center" }}
                />
              </div>
              <div>
                <div style={lS}>Y</div>
                <NumInput
                  step={0.1}
                  value={sEl.y}
                  onChange={(v) =>
                    upd((p) => {
                      const el = p.floors[fIdx].elements.find(
                        (x) => x.id === selId,
                      );
                      if (el) el.y = v;
                    })
                  }
                  style={{ ...iS, padding: "6px", textAlign: "center" }}
                />
              </div>
              <div>
                <div style={lS}>Size (m)</div>
                <NumInput
                  step={0.05}
                  min={0.1}
                  value={sEl.size || 0.3}
                  onChange={(v) =>
                    upd((p) => {
                      const el = p.floors[fIdx].elements.find(
                        (x) => x.id === selId,
                      );
                      if (el) el.size = v;
                    })
                  }
                  style={{ ...iS, padding: "6px", textAlign: "center" }}
                />
              </div>
            </div>
            <button
              className="fps-btn"
              onClick={delSel}
              style={{
                ...bS,
                width: "100%",
                background: "#4A2848",
                color: "#E0C0F0",
              }}
            >
              Delete
            </button>
          </div>
        );
      }
      const isD = sEl.type === "door",
        tm = isD ? DT : WT,
        tk = isD ? sEl.doorType : sEl.winType;
      return (
        <div className="fps-fade">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 16, color: "#845EC2", fontWeight: 600 }}>
              {isD ? "Door" : "Window"}
            </span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 13, color: "#8A80A0" }}>{sEl.width}m</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={lS}>Type</div>
            <select
              className="fps-input"
              value={tk || Object.keys(tm)[0]}
              onChange={(e) => {
                const k = e.target.value;
                upd((p) => {
                  const el = p.floors[fIdx].elements.find(
                    (x) => x.id === selId,
                  );
                  if (!el) return;
                  if (isD) el.doorType = k;
                  else el.winType = k;
                  el.width = tm[k].w;
                });
              }}
              style={iS}
            >
              {Object.entries(tm).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.l} ({v.w}m)
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <div>
              <div style={lS}>X</div>
              <NumInput
                step={0.1}
                value={sEl.x}
                onChange={(v) =>
                  upd((p) => {
                    const el = p.floors[fIdx].elements.find(
                      (x) => x.id === selId,
                    );
                    if (el) el.x = v;
                  })
                }
                style={{ ...iS, padding: "6px", textAlign: "center" }}
              />
            </div>
            <div>
              <div style={lS}>Y</div>
              <NumInput
                step={0.1}
                value={sEl.y}
                onChange={(v) =>
                  upd((p) => {
                    const el = p.floors[fIdx].elements.find(
                      (x) => x.id === selId,
                    );
                    if (el) el.y = v;
                  })
                }
                style={{ ...iS, padding: "6px", textAlign: "center" }}
              />
            </div>
            <div>
              <div style={lS}>Width</div>
              <NumInput
                step={0.1}
                min={0.3}
                value={sEl.width}
                onChange={(v) =>
                  upd((p) => {
                    const el = p.floors[fIdx].elements.find(
                      (x) => x.id === selId,
                    );
                    if (el) el.width = v;
                  })
                }
                style={{ ...iS, padding: "6px", textAlign: "center" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={lS}>Orientation</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["h", "v"].map((o) => (
                <button
                  key={o}
                  className="fps-btn"
                  onClick={() =>
                    upd((p) => {
                      const el = p.floors[fIdx].elements.find(
                        (x) => x.id === selId,
                      );
                      if (el) el.orient = o;
                    })
                  }
                  style={{
                    ...bS,
                    flex: 1,
                    background: sEl.orient === o ? "#845EC2" : "transparent",
                    color: sEl.orient === o ? "#17141E" : "#B0A8C4",
                    border: sEl.orient === o ? "none" : "1px solid #3A3548",
                    padding: "8px",
                  }}
                >
                  {o === "h" ? "Horizontal" : "Vertical"}
                </button>
              ))}
            </div>
          </div>
          <button
            className="fps-btn"
            onClick={delSel}
            style={{
              ...bS,
              width: "100%",
              background: "#4A2848",
              color: "#E0C0F0",
            }}
          >
            Delete
          </button>
        </div>
      );
    }
    if (sRoom) {
      return (
        <div className="fps-fade">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 3,
                background: TYPES[sRoom.type]?.c,
                border: "1px solid #ccc",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <TextInput
                value={sRoom.name}
                onChange={(v) =>
                  upd((p) => {
                    const r = p.floors[fIdx].rooms.find(
                      (r2) => r2.id === selId,
                    );
                    if (r) r.name = v;
                  })
                }
                style={{
                  ...iS,
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "6px 8px",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#845EC2",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {dA(sRoom.w * sRoom.h, un)}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <select
              className="fps-input"
              value={sRoom.type}
              onChange={(e) =>
                upd((p) => {
                  const r = p.floors[fIdx].rooms.find((r2) => r2.id === selId);
                  if (r) r.type = e.target.value;
                })
              }
              style={iS}
            >
              {Object.entries(TYPES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.l}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 6,
              marginBottom: 8,
            }}
          >
            {[
              [
                "X",
                sRoom.x,
                (v) => ({ x: Math.max(0, Math.min(pw - sRoom.w, v)) }),
              ],
              [
                "Y",
                sRoom.y,
                (v) => ({ y: Math.max(0, Math.min(ph - sRoom.h, v)) }),
              ],
              ["W", sRoom.w, (v) => ({ w: Math.max(1, v) })],
              ["H", sRoom.h, (v) => ({ h: Math.max(1, v) })],
            ].map(([l, val, fn]) => (
              <div key={l}>
                <div style={lS}>{l}</div>
                <NumInput
                  step={0.5}
                  min={l === "W" || l === "H" ? 1 : 0}
                  value={val}
                  onChange={(v) =>
                    upd((p) => {
                      const r = p.floors[fIdx].rooms.find(
                        (r2) => r2.id === selId,
                      );
                      if (r) Object.assign(r, fn(v));
                    })
                  }
                  style={{ ...iS, padding: "6px", textAlign: "center" }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="fps-btn"
              onClick={dupRm}
              style={{
                ...bS,
                flex: 1,
                background: "#845EC2",
                color: "#FFFFFF",
              }}
            >
              Duplicate
            </button>
            <button
              className="fps-btn"
              onClick={delSel}
              style={{
                ...bS,
                flex: 1,
                background: "#4A2848",
                color: "#E0C0F0",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          color: "#5A5568",
          fontSize: 13,
          fontStyle: "italic",
          textAlign: "center",
          padding: "16px 0",
        }}
      >
        {tool === "select"
          ? "Tap a room or element to edit"
          : "Tap on the plan to place"}
      </div>
    );
  };

  const rList = () => (
    <div className="fps-fade">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: mob ? 120 : 180,
          overflowY: "auto",
        }}
      >
        {rms.map((rm) => (
          <div
            key={rm.id}
            className="fps-li"
            onClick={() => selRoom(rm.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 8px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              background:
                rm.id === selId && selCat === "room"
                  ? "rgba(132,94,194,.12)"
                  : "transparent",
              color:
                rm.id === selId && selCat === "room" ? "#00C9A7" : "#D0C8E0",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: TYPES[rm.type]?.c || "#EEE",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {rm.name}
            </div>
            <div style={{ color: "#8A80A0", fontSize: 10, flexShrink: 0 }}>
              {rm.w}x{rm.h}
            </div>
          </div>
        ))}
      </div>
      <button
        className="fps-btn"
        onClick={addRm}
        style={{
          ...bS,
          background: "#845EC2",
          color: "#FFFFFF",
          width: "100%",
          marginTop: 6,
          padding: "10px",
        }}
      >
        + Add Room
      </button>
      {els.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontSize: 11,
              color: "#845EC2",
              fontWeight: 500,
              borderBottom: "1px solid #2A2538",
              paddingBottom: 3,
              marginBottom: 3,
            }}
          >
            Doors, Windows, Columns ({els.length})
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxHeight: mob ? 80 : 120,
              overflowY: "auto",
            }}
          >
            {els.map((el) => (
              <div
                key={el.id}
                className="fps-li"
                onClick={() => selEl(el.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                  background:
                    el.id === selId && selCat === "element"
                      ? "rgba(132,94,194,.12)"
                      : "transparent",
                  color:
                    el.id === selId && selCat === "element"
                      ? "#00C9A7"
                      : "#D0C8E0",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color:
                      el.type === "door"
                        ? "#8B6914"
                        : el.type === "column"
                          ? "#6A5A48"
                          : "#5AA0C0",
                    width: 14,
                  }}
                >
                  {el.type === "door" ? "D" : el.type === "column" ? "C" : "W"}
                </span>
                <div style={{ flex: 1 }}>
                  {el.type === "door"
                    ? DT[el.doorType]?.l || "Door"
                    : el.type === "column"
                      ? "Column " + (el.size || 0.3) + "m"
                      : WT[el.winType]?.l || "Window"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const rSummary = () => (
    <div className="fps-fade">
      <div
        style={{
          fontSize: 13,
          color: "#845EC2",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Area Summary - {fl.name}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div style={{ background: "#2A2538", padding: 8, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: "#8A80A0" }}>Plot Area</div>
          <div style={{ fontSize: 16, color: "#FFFFFF" }}>{dA(plotA, un)}</div>
        </div>
        <div style={{ background: "#2A2538", padding: 8, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: "#8A80A0" }}>Used</div>
          <div style={{ fontSize: 16, color: "#845EC2" }}>{dA(tA, un)}</div>
        </div>
        <div style={{ background: "#2A2538", padding: 8, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: "#8A80A0" }}>Remaining</div>
          <div
            style={{ fontSize: 16, color: freeA < 0 ? "#E05050" : "#00C9A7" }}
          >
            {dA(freeA, un)}
          </div>
        </div>
        <div style={{ background: "#2A2538", padding: 8, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: "#8A80A0" }}>Coverage</div>
          <div style={{ fontSize: 16, color: "#FFFFFF" }}>
            {((tA / plotA) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#845EC2",
          fontWeight: 500,
          borderBottom: "1px solid #2A2538",
          paddingBottom: 3,
          marginBottom: 6,
        }}
      >
        By Type
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginBottom: 10,
        }}
      >
        {Object.entries(byType)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: TYPES[k]?.c || "#ccc",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, color: "#D0C8E0" }}>
                {TYPES[k]?.l || k}
              </div>
              <div style={{ color: "#8A80A0" }}>{dA(v, un)}</div>
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: "#2A2538",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: (v / plotA) * 100 + "%",
                    height: 4,
                    background: TYPES[k]?.c || "#888",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          ))}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#845EC2",
          fontWeight: 500,
          borderBottom: "1px solid #2A2538",
          paddingBottom: 3,
          marginBottom: 6,
        }}
      >
        Floor Height
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <NumInput
          step={0.1}
          min={2}
          value={fh}
          onChange={(v) =>
            upd((p) => {
              p.floors[fIdx].height = v;
            })
          }
          style={{ ...iS, width: 70, textAlign: "center" }}
        />
        <span style={{ fontSize: 12, color: "#8A80A0" }}>
          m ({(fh * M2FT).toFixed(1)} ft)
        </span>
      </div>
      {stairInfo && (
        <div
          style={{
            background: "#2A2538",
            padding: 10,
            borderRadius: 4,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#845EC2",
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            Staircase Calculator
          </div>
          <div style={{ fontSize: 11, color: "#D0C8E0", lineHeight: 1.6 }}>
            Steps: {stairInfo.numSteps} | Riser:{" "}
            {(stairInfo.riserH * 100).toFixed(1)}cm | Tread:{" "}
            {(stairInfo.treadD * 100).toFixed(0)}cm | Run length:{" "}
            {stairInfo.runLen.toFixed(1)}m
          </div>
        </div>
      )}
    </div>
  );

  const rSet = () => {
    const isImp = un === "imperial";
    return (
      <div className="fps-fade">
        <div style={{ marginBottom: 10 }}>
          <div style={lS}>Project Name</div>
          <TextInput
            value={proj.name}
            onChange={(v) =>
              upd((p) => {
                p.name = v;
              })
            }
            style={iS}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={lS}>Unit System</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["metric", "imperial"].map((u) => (
              <button
                key={u}
                className="fps-btn"
                onClick={() =>
                  upd((p) => {
                    p.units = u;
                  })
                }
                style={{
                  ...bS,
                  flex: 1,
                  background: un === u ? "#845EC2" : "transparent",
                  color: un === u ? "#17141E" : "#B0A8C4",
                  border: un === u ? "none" : "1px solid #3A3548",
                  padding: "8px",
                }}
              >
                {u === "metric" ? "Metric" : "Imperial"}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div>
            <div style={lS}>Width {isImp ? "(ft)" : "(m)"}</div>
            <NumInput
              min={1}
              step={1}
              value={isImp ? +(pw * M2FT).toFixed(1) : pw}
              onChange={(v) =>
                upd((p) => {
                  p.plotWidth = isImp
                    ? Math.max(1, +(v / M2FT).toFixed(2))
                    : Math.max(1, v);
                })
              }
              style={iS}
            />
          </div>
          <div>
            <div style={lS}>Height {isImp ? "(ft)" : "(m)"}</div>
            <NumInput
              min={1}
              step={1}
              value={isImp ? +(ph * M2FT).toFixed(1) : ph}
              onChange={(v) =>
                upd((p) => {
                  p.plotHeight = isImp
                    ? Math.max(1, +(v / M2FT).toFixed(2))
                    : Math.max(1, v);
                })
              }
              style={iS}
            />
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={lS}>Wall Thickness {isImp ? "(in)" : "(cm)"}</div>
          <NumInput
            min={1}
            step={1}
            value={
              isImp ? +(wt * 100 * CM2IN).toFixed(1) : Math.round(wt * 100)
            }
            onChange={(v) =>
              upd((p) => {
                p.wallThickness = isImp
                  ? Math.max(0.01, v / CM2IN / 100)
                  : Math.max(0.01, v / 100);
              })
            }
            style={iS}
          />
          <div style={{ fontSize: 10, color: "#5A5568", marginTop: 3 }}>
            Outer: {wD(+(wt * 1.5 * 100).toFixed(0), un)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button
            className="fps-btn"
            onClick={expJ}
            style={{
              ...bS,
              flex: 1,
              background: "transparent",
              border: "1px solid #3A3548",
              color: "#B0A8C4",
            }}
          >
            Export JSON
          </button>
          <button
            className="fps-btn"
            onClick={printPlan}
            style={{
              ...bS,
              flex: 1,
              background: "transparent",
              border: "1px solid #3A3548",
              color: "#B0A8C4",
            }}
          >
            Print / PDF
          </button>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#845EC2",
            fontWeight: 500,
            borderBottom: "1px solid #2A2538",
            paddingBottom: 3,
            marginBottom: 6,
          }}
        >
          Legend
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
          {Object.entries(TYPES).map(([k, v]) => (
            <div
              key={k}
              style={{ display: "flex", alignItems: "center", gap: 3 }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  background: v.c,
                }}
              />
              <span style={{ fontSize: 9, color: "#8A80A0" }}>{v.l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const pTabs = [
    { k: "props", l: sRoom || sEl ? "Edit" : "Properties" },
    { k: "rooms", l: "Rooms (" + rms.length + ")" },
    { k: "summary", l: "Summary" },
    { k: "settings", l: "Settings" },
  ];
  const tools = [
    { k: "select", l: "Select" },
    { k: "door", l: "Door" },
    { k: "window", l: "Window" },
    { k: "column", l: "Column" },
  ];

  const PanelContent = () => (
    <div style={{ width: "100%", minWidth: 0 }}>
      {pan === "props" && rProps()}
      {pan === "rooms" && rList()}
      {pan === "summary" && rSummary()}
      {pan === "settings" && rSet()}
    </div>
  );
  const TabBar = ({ s }) => (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, ...s }}
    >
      {pTabs.map((t) => (
        <button
          key={t.k}
          className="fps-tab fps-btn"
          onClick={() => {
            setPan(t.k);
            if (mob) setPanO(true);
          }}
          style={{
            ...tS,
            padding: "9px 8px",
            fontSize: 11,
            textAlign: "center",
            ...(pan === t.k ? tA2 : {}),
          }}
        >
          {t.l}
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#17141E",
        color: "#FFFFFF",
        fontFamily: "'Outfit', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          padding: mob ? "8px 10px" : "10px 16px",
          borderBottom: "1px solid #2A2538",
          gap: mob ? 4 : 10,
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        <button
          className="fps-btn"
          onClick={onBack}
          style={{
            ...bS,
            background: "transparent",
            border: "1px solid #3A3548",
            color: "#B0A8C4",
            padding: mob ? "6px 8px" : "8px 14px",
          }}
        >
          Back
        </button>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: mob ? 13 : 18,
            fontWeight: 400,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#845EC2", fontWeight: 600 }}>{proj.name}</span>
          <span
            style={{ color: "#8A80A0", fontSize: mob ? 9 : 12, marginLeft: 6 }}
          >
            {pw}x{ph}m walls {Math.round(wt * 100)}cm
          </span>
        </div>
        <button
          className="fps-btn"
          onClick={undo}
          disabled={!canUndo}
          style={{
            ...bS,
            background: "transparent",
            border: "1px solid #3A3548",
            color: canUndo ? "#B0A8C4" : "#3A3548",
            padding: "6px 10px",
            fontSize: 13,
          }}
          title="Undo (Ctrl+Z)"
        >
          &#8630;
        </button>
        <button
          className="fps-btn"
          onClick={redo}
          disabled={!canRedo}
          style={{
            ...bS,
            background: "transparent",
            border: "1px solid #3A3548",
            color: canRedo ? "#B0A8C4" : "#3A3548",
            padding: "6px 10px",
            fontSize: 13,
          }}
          title="Redo (Ctrl+Y)"
        >
          &#8631;
        </button>
      </div>
      {/* Toolbar */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          padding: mob ? "4px 8px" : "6px 16px",
          borderBottom: "1px solid #2A2538",
          gap: 3,
          flexShrink: 0,
        }}
      >
        {tools.map((t) => (
          <button
            key={t.k}
            className="fps-btn"
            onClick={() => {
              setTool(t.k);
              if (t.k !== "select") clr();
            }}
            style={{
              ...bS,
              padding: mob ? "5px 8px" : "6px 12px",
              fontSize: mob ? 10 : 12,
              background: tool === t.k ? "#845EC2" : "transparent",
              color: tool === t.k ? "#17141E" : "#B0A8C4",
              border: tool === t.k ? "none" : "1px solid #3A3548",
            }}
          >
            {t.l}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {tool !== "select" && (
          <span
            style={{
              fontSize: 10,
              color: "#845EC2",
              animation: "pu 2s ease infinite",
            }}
          >
            Click to place
          </span>
        )}
      </div>
      {/* Floor tabs */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          padding: mob ? "5px 8px" : "8px 16px",
          gap: 3,
          borderBottom: "1px solid #2A2538",
          overflowX: "auto",
          flexShrink: 0,
        }}
      >
        {proj.floors.map((f, i) => (
          <button
            key={f.id}
            className="fps-tab fps-btn"
            onClick={() => {
              setFIdx(i);
              clr();
            }}
            onDoubleClick={() => {
              const n = prompt("Rename:", f.name);
              if (n)
                upd((p) => {
                  p.floors[i].name = n;
                });
            }}
            style={{
              ...tS,
              padding: mob ? "5px 8px" : "6px 14px",
              fontSize: mob ? 9 : 11,
              whiteSpace: "nowrap",
              ...(i === fIdx ? tA2 : {}),
            }}
          >
            {f.name}
            {f.height ? " (" + f.height + "m)" : ""}
          </button>
        ))}
        <button
          className="fps-btn"
          onClick={copyFl}
          style={{
            ...tS,
            color: "#8A80A0",
            padding: mob ? "5px 8px" : "6px 14px",
            fontSize: mob ? 9 : 11,
          }}
          title="Duplicate current floor"
        >
          Copy Floor
        </button>
        {showAF ? (
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <input
              className="fps-input"
              autoFocus
              placeholder="Name..."
              value={nfn}
              onChange={(e) => setNfn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addFl();
                if (e.key === "Escape") setShowAF(false);
              }}
              style={{ ...iS, width: 80, padding: "4px 6px", fontSize: 10 }}
            />
            <button
              className="fps-btn"
              onClick={addFl}
              style={{
                ...bS,
                padding: "4px 6px",
                fontSize: 10,
                background: "#845EC2",
                color: "#FFFFFF",
              }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            className="fps-btn"
            onClick={() => setShowAF(true)}
            style={{
              ...tS,
              color: "#8A80A0",
              borderStyle: "dashed",
              whiteSpace: "nowrap",
              padding: mob ? "5px 8px" : "6px 14px",
              fontSize: mob ? 9 : 11,
            }}
          >
            + Floor
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: "#8A80A0", whiteSpace: "nowrap" }}>
          {rms.length}rm | {els.length}el | {dA(tA, un)}
        </span>
      </div>
      {/* Main */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          ref={wrapR}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: drag ? "hidden" : "auto",
            background: "#1B1726",
            padding: mob ? 6 : 16,
            paddingBottom: mob ? 80 : 16,
            cursor: tool !== "select" ? "crosshair" : "default",
            touchAction: drag ? "none" : "auto",
          }}
        >
          <svg
            ref={svgR}
            width={cvw}
            height={cvh}
            viewBox={"0 0 " + cvw + " " + cvh}
            style={{
              display: "block",
              userSelect: "none",
              touchAction: "none",
              margin: "0 auto",
              cursor: tool !== "select" ? "crosshair" : "default",
            }}
            onPointerMove={onPM}
            onPointerUp={onPU}
            onPointerLeave={onPU}
            onPointerDown={onBgDown}
          >
            <defs>
              <pattern
                id="gF"
                width={sc / 2}
                height={sc / 2}
                patternUnits="userSpaceOnUse"
                x={PAD}
                y={PAD}
              >
                <rect
                  width={sc / 2}
                  height={sc / 2}
                  fill="none"
                  stroke="#E8E4E8"
                  strokeWidth={0.15}
                />
              </pattern>
              <pattern
                id="gM"
                width={sc}
                height={sc}
                patternUnits="userSpaceOnUse"
                x={PAD}
                y={PAD}
              >
                <rect
                  width={sc}
                  height={sc}
                  fill="none"
                  stroke="#D4D0D8"
                  strokeWidth={0.3}
                />
              </pattern>
              <pattern
                id="stP"
                width={4}
                height={4}
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1={0}
                  y1={4}
                  x2={4}
                  y2={0}
                  stroke="#9A8A78"
                  strokeWidth={0.6}
                />
              </pattern>
            </defs>
            <rect data-bg="1" width={cvw} height={cvh} fill="#FEFEDF" />
            <rect
              data-bg="1"
              x={PAD}
              y={PAD}
              width={pw * sc}
              height={ph * sc}
              fill="url(#gF)"
            />
            <rect
              data-bg="1"
              x={PAD}
              y={PAD}
              width={pw * sc}
              height={ph * sc}
              fill="url(#gM)"
            />
            {rms.map((rm) => (
              <RoomSVG
                key={rm.id}
                rm={rm}
                sc={sc}
                sel={rm.id === selId && selCat === "room"}
                onPD={onRD}
              />
            ))}
            {rms.map((rm) => (
              <rect
                key={"w" + rm.id}
                x={PAD + rm.x * sc}
                y={PAD + rm.y * sc}
                width={rm.w * sc}
                height={rm.h * sc}
                fill="none"
                stroke="#4A3860"
                strokeWidth={wp}
                pointerEvents="none"
              />
            ))}
            <rect
              x={PAD}
              y={PAD}
              width={pw * sc}
              height={ph * sc}
              fill="none"
              stroke="#2A1848"
              strokeWidth={wp * 1.5}
              pointerEvents="none"
            />
            {/* Smart snap guides */}
            {guides.map((g, i) =>
              g.type === "v" ? (
                <line
                  key={i}
                  x1={PAD + g.pos * sc}
                  y1={PAD + g.from * sc}
                  x2={PAD + g.pos * sc}
                  y2={PAD + g.to * sc}
                  stroke="#00C9A7"
                  strokeWidth={0.5}
                  strokeDasharray="4,3"
                  pointerEvents="none"
                />
              ) : (
                <line
                  key={i}
                  x1={PAD + g.from * sc}
                  y1={PAD + g.pos * sc}
                  x2={PAD + g.to * sc}
                  y2={PAD + g.pos * sc}
                  stroke="#00C9A7"
                  strokeWidth={0.5}
                  strokeDasharray="4,3"
                  pointerEvents="none"
                />
              ),
            )}
            {/* Elements */}
            {els.map((el) =>
              el.type === "door" ? (
                <DoorSVG
                  key={el.id}
                  el={el}
                  sc={sc}
                  sel={el.id === selId && selCat === "element"}
                  onPD={onED}
                  wp={wp}
                />
              ) : el.type === "window" ? (
                <WinSVG
                  key={el.id}
                  el={el}
                  sc={sc}
                  sel={el.id === selId && selCat === "element"}
                  onPD={onED}
                  wp={wp}
                />
              ) : el.type === "column" ? (
                <ColSVG
                  key={el.id}
                  el={el}
                  sc={sc}
                  sel={el.id === selId && selCat === "element"}
                  onPD={onED}
                />
              ) : null,
            )}
            {sRoom && <Handles rm={sRoom} scale={sc} onHD={onHD} mob={mob} />}
            <text
              x={PAD + (pw * sc) / 2}
              y={PAD + ph * sc + 22}
              textAnchor="middle"
              fontFamily="Outfit"
              fontSize={7}
              fill="#845EC2"
            >
              {pw} m
            </text>
            <text
              x={PAD + pw * sc + 18}
              y={PAD + (ph * sc) / 2}
              textAnchor="middle"
              fontFamily="Outfit"
              fontSize={7}
              fill="#845EC2"
              transform={
                "rotate(90," +
                (PAD + pw * sc + 18) +
                "," +
                (PAD + (ph * sc) / 2) +
                ")"
              }
            >
              {ph} m
            </text>
            {/* Print title block */}
            <text
              className="print-only"
              x={PAD}
              y={PAD - 8}
              fontFamily="Outfit"
              fontSize={10}
              fill="#3A3548"
              style={{ display: "none" }}
            >
              {proj.name} - {fl.name} - {pw}x{ph}m - Scale 1:
              {Math.round(1 / ((sc / 100) * 100))}
            </text>
          </svg>
        </div>
        {/* Desktop panel */}
        {!mob && (
          <div
            className="no-print"
            style={{
              width: 380,
              minWidth: 380,
              background: "#1E1A28",
              borderLeft: "1px solid #2A2538",
              overflowY: "auto",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <TabBar />
            <PanelContent />
          </div>
        )}
      </div>
      {/* Mobile FAB + Sheet */}
      {mob && !panO && (
        <button
          className="fps-btn no-print"
          onClick={addRm}
          style={{
            position: "fixed",
            bottom: 60,
            right: 14,
            width: 52,
            height: 52,
            borderRadius: 26,
            background: "#845EC2",
            color: "#FFFFFF",
            fontSize: 26,
            border: "none",
            boxShadow: "0 4px 20px rgba(132,94,194,.4)",
            cursor: "pointer",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          +
        </button>
      )}
      {mob && (
        <div
          className="fps-sheet no-print"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#1E1A28",
            borderTop: "2px solid #845EC2",
            transform: panO ? "translateY(0)" : "translateY(calc(100% - 48px))",
            maxHeight: "55vh",
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
            borderRadius: "14px 14px 0 0",
            boxShadow: "0 -8px 30px rgba(0,0,0,.5)",
          }}
        >
          <div
            onClick={() => setPanO(!panO)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 16px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                background: "#4A4558",
                borderRadius: 2,
                marginBottom: 4,
              }}
            />
          </div>
          <TabBar s={{ padding: "0 12px 8px", flexShrink: 0 }} />
          <div style={{ overflowY: "auto", padding: "0 14px 16px", flex: 1 }}>
            <PanelContent />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Library ──
function Library({ onOpen, projects, onNew, onDelete, loading }) {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [pw, setPw] = useState(24);
  const [ph, setPh] = useState(25);
  const [wtCm, setWtCm] = useState(20);
  const [units, setUnits] = useState("metric");
  const mob = useMob();
  useEffect(() => {
    injectCSS();
  }, []);
  const create = () => {
    onNew({
      name: name.trim() || "Untitled House",
      plotWidth: pw,
      plotHeight: ph,
      wallThickness: wtCm / 100,
      units,
    });
    setShowNew(false);
    setName("");
    setPw(24);
    setPh(25);
    setWtCm(20);
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#17141E",
        color: "#FFFFFF",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: mob ? "24px 14px" : "40px 20px",
        }}
      >
        <div
          className="fps-fade"
          style={{ textAlign: "center", marginBottom: mob ? 24 : 40 }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: mob ? 28 : 42,
              fontWeight: 400,
              letterSpacing: 2,
            }}
          >
            Simple Plan{" "}
            <span style={{ color: "#845EC2", fontWeight: 600 }}>Space</span>
          </h1>
          <p
            style={{
              fontSize: mob ? 11 : 13,
              color: "#8A80A0",
              marginTop: 4,
              letterSpacing: 2,
            }}
          >
            DESIGN | EDIT | SAVE
          </p>
          <div
            style={{
              width: 50,
              height: 1.5,
              background: "#845EC2",
              margin: "14px auto 0",
            }}
          />
        </div>
        <div
          className="fps-fade"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 8,
            animationDelay: ".1s",
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: mob ? 17 : 20,
              fontWeight: 400,
            }}
          >
            My Projects
          </h2>
          <button
            className="fps-btn"
            onClick={() => setShowNew(true)}
            style={{
              ...bS,
              background: "#845EC2",
              color: "#FFFFFF",
              fontSize: mob ? 12 : 13,
              padding: mob ? "10px 16px" : "10px 20px",
            }}
          >
            + New Project
          </button>
        </div>
        {showNew && (
          <div
            className="fps-scale"
            style={{
              background: "#1E1A28",
              border: "1px solid #2A2538",
              borderRadius: 8,
              padding: mob ? 14 : 20,
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 16,
                fontWeight: 400,
                marginBottom: 12,
              }}
            >
              Create New House
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={lS}>Project Name</div>
                <input
                  className="fps-input"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Damascus Villa"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") create();
                  }}
                  style={{ ...iS, padding: "12px" }}
                />
              </div>
              <div>
                <div style={lS}>Units</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["metric", "imperial"].map((u) => (
                    <button
                      key={u}
                      className="fps-btn"
                      onClick={() => setUnits(u)}
                      style={{
                        ...bS,
                        flex: 1,
                        padding: "10px",
                        fontSize: 12,
                        background: units === u ? "#845EC2" : "transparent",
                        color: units === u ? "#FFFFFF" : "#B0A8C4",
                        border: units === u ? "none" : "1px solid #3A3548",
                      }}
                    >
                      {u === "metric" ? "Metric (m, cm)" : "Imperial (ft, in)"}
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div style={lS}>
                    {units === "imperial" ? "Width (ft)" : "Width (m)"}
                  </div>
                  <input
                    className="fps-input"
                    type="number"
                    min={1}
                    value={pw}
                    onChange={(e) => setPw(Math.max(1, +e.target.value))}
                    style={{ ...iS, padding: "12px" }}
                  />
                </div>
                <div>
                  <div style={lS}>
                    {units === "imperial" ? "Height (ft)" : "Height (m)"}
                  </div>
                  <input
                    className="fps-input"
                    type="number"
                    min={1}
                    value={ph}
                    onChange={(e) => setPh(Math.max(1, +e.target.value))}
                    style={{ ...iS, padding: "12px" }}
                  />
                </div>
                <div>
                  <div style={lS}>
                    {units === "imperial" ? "Wall (in)" : "Wall (cm)"}
                  </div>
                  <input
                    className="fps-input"
                    type="number"
                    min={1}
                    value={wtCm}
                    onChange={(e) => setWtCm(Math.max(1, +e.target.value))}
                    style={{ ...iS, padding: "12px" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="fps-btn"
                  onClick={create}
                  style={{
                    ...bS,
                    flex: 1,
                    background: "#845EC2",
                    color: "#FFFFFF",
                    padding: "12px 20px",
                    fontSize: 14,
                  }}
                >
                  Create Project
                </button>
                <button
                  className="fps-btn"
                  onClick={() => setShowNew(false)}
                  style={{
                    ...bS,
                    flex: 1,
                    background: "transparent",
                    border: "1px solid #3A3548",
                    color: "#8A80A0",
                    padding: "12px 20px",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#8A80A0",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              {pw}x{ph}
              {units === "imperial" ? "ft" : "m"} = {pw * ph}{" "}
              {units === "imperial" ? "ft2" : "m2"} | Walls: {wtCm}
              {units === "imperial" ? "in" : "cm"}
            </div>
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8A80A0" }}>
            Loading...
          </div>
        ) : projects.length === 0 ? (
          <div
            className="fps-fade"
            style={{
              textAlign: "center",
              padding: mob ? 40 : 60,
              color: "#4A4558",
            }}
          >
            <div style={{ fontSize: 15 }}>No projects yet</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "#3A3548" }}>
              Create your first floor plan above
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob
                ? "1fr"
                : "repeat(auto-fill, minmax(260px, 1fr))",
              gap: mob ? 12 : 16,
            }}
          >
            {projects.map((p, i) => (
              <div
                key={p.id}
                className="fps-card fps-fade"
                style={{
                  background: "#1E1A28",
                  border: "1px solid #2A2538",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: mob ? "row" : "column",
                  animationDelay: i * 0.06 + "s",
                }}
                onClick={() => onOpen(p.id)}
              >
                <div
                  style={{
                    width: mob ? 80 : undefined,
                    height: mob ? undefined : 100,
                    flexShrink: 0,
                    background: "#1B1726",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight: mob ? "1px solid #2A2538" : "none",
                    borderBottom: mob ? "none" : "1px solid #2A2538",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      border: "2px solid #3A3548",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 10,
                        color: "#8A80A0",
                      }}
                    >
                      {p.plotWidth || "?"}x{p.plotHeight || "?"}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    padding: mob ? "10px 12px" : "12px 14px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 15,
                      color: "#FFFFFF",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#8A80A0" }}>
                    {p.plotWidth}x{p.plotHeight}m | walls{" "}
                    {Math.round((p.wallThickness || 0.2) * 100)}cm
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 6,
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#4A4558" }}>
                      {p.updatedAt
                        ? "Updated " +
                          new Date(p.updatedAt).toLocaleDateString()
                        : ""}
                    </div>
                    <button
                      className="fps-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete?")) onDelete(p.id);
                      }}
                      style={{
                        fontSize: 10,
                        color: "#7A4880",
                        background: "transparent",
                        border: "1px solid #2A1838",
                        padding: "3px 10px",
                        borderRadius: 3,
                        cursor: "pointer",
                        fontFamily: "Outfit",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FloorPlanStudio({ storage: st }) {
  const [view, setView] = useState("library");
  const [projects, setProjects] = useState([]);
  const [activeProj, setActiveProj] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    LI(st).then((ix) => {
      setProjects(ix);
      setLoading(false);
    });
  }, []);
  const openP = async (id) => {
    const p = await LP(st, id);
    if (p) {
      setActiveProj(p);
      setView("editor");
    }
  };
  const newP = async ({
    name,
    plotWidth,
    plotHeight,
    wallThickness,
    units: un,
  }) => {
    const id = uid(),
      now = new Date().toISOString();
    const isImp = un === "imperial";
    const pwM = isImp ? +(plotWidth / M2FT).toFixed(2) : plotWidth;
    const phM = isImp ? +(plotHeight / M2FT).toFixed(2) : plotHeight;
    const wtM = isImp ? wallThickness / CM2IN / 100 : wallThickness || 0.2;
    const proj = {
      id,
      name,
      plotWidth: pwM,
      plotHeight: phM,
      wallThickness: wtM,
      units: un || "metric",
      createdAt: now,
      updatedAt: now,
      floors: [
        {
          id: uid(),
          name: "Ground Floor",
          rooms: [],
          elements: [],
          columns: [],
          height: 3,
        },
      ],
    };
    await SP(st, proj);
    const ix = [
      ...projects,
      {
        id,
        name,
        plotWidth: pwM,
        plotHeight: phM,
        wallThickness: wtM,
        units: un || "metric",
        createdAt: now,
        updatedAt: now,
      },
    ];
    await SI(st, ix);
    setProjects(ix);
    setActiveProj(proj);
    setView("editor");
  };
  const delP = async (id) => {
    await DPj(st, id);
    const ix = projects.filter((p) => p.id !== id);
    await SI(st, ix);
    setProjects(ix);
  };
  const goB = () => {
    LI(st).then((ix) => {
      setProjects(ix);
      setView("library");
      setActiveProj(null);
    });
  };
  if (view === "editor" && activeProj)
    return <Editor project={activeProj} onBack={goB} st={st} />;
  return (
    <Library
      projects={projects}
      loading={loading}
      onOpen={openP}
      onNew={newP}
      onDelete={delP}
    />
  );
}

const bS = {
  padding: "8px 14px",
  borderRadius: 4,
  border: "none",
  fontFamily: "'Outfit', sans-serif",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  letterSpacing: 0.5,
};
const iS = {
  background: "#2A2538",
  border: "1px solid #3A3548",
  color: "#FFFFFF",
  padding: "8px 10px",
  borderRadius: 4,
  fontFamily: "'Outfit', sans-serif",
  fontSize: 13,
  outline: "none",
  width: "100%",
  WebkitAppearance: "none",
};
const lS = {
  fontSize: 10,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "#8A80A0",
  marginBottom: 4,
};
const tS = {
  background: "transparent",
  border: "1px solid #3A3548",
  color: "#B0A8C4",
  padding: "8px 14px",
  fontFamily: "'Outfit', sans-serif",
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase",
  cursor: "pointer",
  borderRadius: 4,
};
const tA2 = {
  background: "#845EC2",
  borderColor: "#845EC2",
  color: "#FFFFFF",
  fontWeight: 500,
};
