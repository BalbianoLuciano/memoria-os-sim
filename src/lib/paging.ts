// Paginación: dirección lógica (P,D) → física, dado un proceso y los marcos
// libres que se le asignan en orden.

export interface PagingConfig {
  pBits: number; // bits de número de página
  dBits: number; // bits de desplazamiento
  processSizeKB: number; // tamaño del proceso a paginar (en KB)
  freeFrames: number[]; // marcos físicos disponibles (en orden)
  wordSizeBytes?: number; // por defecto, 1 palabra = 1 byte
}

export interface PageTableEntry {
  page: number;
  frame: number;
}

export interface PagingResult {
  pageCount: number; // 2^P
  pageSizeWords: number; // 2^D
  totalAddrSpaceWords: number; // 2^(P+D)
  pagesNeeded: number;
  table: PageTableEntry[];
  unassigned: number; // si no hay suficientes marcos libres
}

export function computePaging(cfg: PagingConfig): PagingResult {
  const pageCount = 2 ** cfg.pBits;
  const pageSizeWords = 2 ** cfg.dBits;
  const totalAddrSpaceWords = pageCount * pageSizeWords;
  const bytesPerWord = cfg.wordSizeBytes ?? 1;
  const processBytes = cfg.processSizeKB * 1024;
  const pageSizeBytes = pageSizeWords * bytesPerWord;
  const pagesNeeded = Math.ceil(processBytes / pageSizeBytes);

  const table: PageTableEntry[] = [];
  for (let i = 0; i < Math.min(pagesNeeded, cfg.freeFrames.length); i++) {
    table.push({ page: i, frame: cfg.freeFrames[i] });
  }
  const unassigned = Math.max(0, pagesNeeded - cfg.freeFrames.length);
  return {
    pageCount,
    pageSizeWords,
    totalAddrSpaceWords,
    pagesNeeded,
    table,
    unassigned,
  };
}

export interface TranslationStep {
  logical: number;
  page: number;
  offset: number;
  frame: number | null;
  physical: number | null;
  bitsLogical: string;
  bitsPhysical: string | null;
}

export function translate(
  logical: number,
  pBits: number,
  dBits: number,
  table: PageTableEntry[]
): TranslationStep {
  const totalBits = pBits + dBits;
  const offsetMask = (1 << dBits) - 1;
  const page = logical >> dBits;
  const offset = logical & offsetMask;
  const entry = table.find((t) => t.page === page);
  const frame = entry ? entry.frame : null;
  const physical = frame !== null ? (frame << dBits) | offset : null;
  const bitsLogical = logical.toString(2).padStart(totalBits, "0");
  const bitsPhysical =
    physical !== null ? physical.toString(2).padStart(totalBits, "0") : null;
  return {
    logical,
    page,
    offset,
    frame,
    physical,
    bitsLogical,
    bitsPhysical,
  };
}
