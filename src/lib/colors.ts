// Mapea pid → color de la paleta neón cíclica de 8 acentos.

const PALETTE = [
  { name: "green", hex: "#76B900", shadow: "rgba(118,185,0,0.55)" },
  { name: "cyan", hex: "#22d3ee", shadow: "rgba(34,211,238,0.5)" },
  { name: "magenta", hex: "#ff2bd6", shadow: "rgba(255,43,214,0.5)" },
  { name: "amber", hex: "#ffb020", shadow: "rgba(255,176,32,0.5)" },
  { name: "rose", hex: "#ff5577", shadow: "rgba(255,85,119,0.5)" },
  { name: "lime", hex: "#a3e635", shadow: "rgba(163,230,53,0.5)" },
  { name: "violet", hex: "#a78bfa", shadow: "rgba(167,139,250,0.5)" },
  { name: "orange", hex: "#fb923c", shadow: "rgba(251,146,60,0.5)" },
] as const;

export function colorFor(pid: string): { hex: string; shadow: string; name: string } {
  // Hash determinístico por sufijo numérico; fallback a charcode.
  const numMatch = pid.match(/(\d+)$/);
  let idx: number;
  if (numMatch) {
    idx = (parseInt(numMatch[1], 10) - 1) % PALETTE.length;
  } else {
    idx = pid.charCodeAt(0) % PALETTE.length;
  }
  return PALETTE[idx];
}

export const PALETTE_COLORS = PALETTE;
