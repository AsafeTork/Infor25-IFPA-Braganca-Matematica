const { PI } = Math;

const NOTABLE = [
  { a:0,           label:"0",      sin:"0",     cos:"1",     tan:"0"     },
  { a:PI/6,        label:"π/6",    sin:"1/2",   cos:"√3/2",  tan:"√3/3"  },
  { a:PI/4,        label:"π/4",    sin:"√2/2",  cos:"√2/2",  tan:"1"     },
  { a:PI/3,        label:"π/3",    sin:"√3/2",  cos:"1/2",   tan:"√3"    },
  { a:PI/2,        label:"π/2",    sin:"1",     cos:"0",     tan:"∄"     },
  { a:2*PI/3,      label:"2π/3",   sin:"√3/2",  cos:"-1/2",  tan:"-√3"   },
  { a:3*PI/4,      label:"3π/4",   sin:"√2/2",  cos:"-√2/2", tan:"-1"    },
  { a:5*PI/6,      label:"5π/6",   sin:"1/2",   cos:"-√3/2", tan:"-√3/3" },
  { a:PI,          label:"π",      sin:"0",     cos:"-1",    tan:"0"     },
  { a:7*PI/6,      label:"7π/6",   sin:"-1/2",  cos:"-√3/2", tan:"√3/3"  },
  { a:5*PI/4,      label:"5π/4",   sin:"-√2/2", cos:"-√2/2", tan:"1"     },
  { a:4*PI/3,      label:"4π/3",   sin:"-√3/2", cos:"-1/2",  tan:"√3"    },
  { a:3*PI/2,      label:"3π/2",   sin:"-1",    cos:"0",     tan:"∄"     },
  { a:5*PI/3,      label:"5π/3",   sin:"-√3/2", cos:"1/2",   tan:"-√3"   },
  { a:7*PI/4,      label:"7π/4",   sin:"-√2/2", cos:"√2/2",  tan:"-1"    },
  { a:11*PI/6,     label:"11π/6",  sin:"-1/2",  cos:"√3/2",  tan:"-√3/3" },
];

const NOTABLE_NEG = NOTABLE.map(({ a, label, sin, cos, tan }) => ({
  a: -a,
  label: label.startsWith("-") ? label : (label === "0" ? "0" : "-" + label),
  sin: sin.startsWith("-") ? sin.slice(1) : (sin === "0" ? "0" : "-" + sin),
  cos: cos,
  tan: tan === "∄" ? "∄" : (tan.startsWith("-") ? tan.slice(1) : (tan === "0" ? "0" : "-" + tan)),
}));

function trySnap(t, threshold = 0.01) {
  const abs = t < 0 ? -t : t;
  for (const n of NOTABLE) {
    const diff = abs - n.a;
    const d = diff < 0 ? -diff : diff;
    if (d < threshold) return t < 0 ? { ...n, a: -n.a, label: "-" + n.label } : n;
  }
  for (const n of NOTABLE_NEG) {
    const diff = abs - (-n.a);
    const d = diff < 0 ? -diff : diff;
    if (d < threshold) return t < 0 ? n : { ...n, a: -n.a, label: n.label.replace(/^-/, "") };
  }
  return null;
}

function formatAngle(theta) {
  if (theta === 0) return "0";
  const abs = theta < 0 ? -theta : theta;
  const snap = trySnap(abs, 0.01);
  if (snap) return theta < 0 ? "-" + snap.label : snap.label;
  const deg = (180 / PI) * abs;
  return theta < 0 ? "-" + deg.toFixed(1) + "°" : deg.toFixed(1) + "°";
}

export { NOTABLE, NOTABLE_NEG, trySnap, formatAngle };
