// Diccionario plano ES/EN/PT. Reemplazos de plantilla con {param}.
// Mantengo acrónimos técnicos sin traducir (KB, MB, MFT, MVT, FF/BF/WF,
// FCFS/RR/SJF, FIFO/LRU/OPT, P, D, CPU) porque son notación, no idioma.

export type Lang = "es" | "en" | "pt";
export const LANGS: Lang[] = ["es", "en", "pt"];

export const DICT = {
  // header / modos
  "header.contiguous": { es: "Contiguo", en: "Contiguous", pt: "Contíguo" },
  "header.paging": { es: "Paginación", en: "Paging", pt: "Paginação" },
  "header.replacement": { es: "Reemplazo", en: "Replacement", pt: "Substituição" },
  "header.help": { es: "Ayuda", en: "Help", pt: "Ajuda" },
  "header.modes": { es: "Modos de simulación", en: "Simulation modes", pt: "Modos de simulação" },
  "header.lang": { es: "Idioma", en: "Language", pt: "Idioma" },

  // tabs columna izquierda
  "mode.tab.config": { es: "config", en: "config", pt: "config" },
  "mode.tab.processes": { es: "procesos", en: "processes", pt: "processos" },

  // config panel
  "config.preset": { es: "preset", en: "preset", pt: "preset" },
  "config.preset.load": { es: "cargar…", en: "load…", pt: "carregar…" },
  "config.scheme": { es: "esquema", en: "scheme", pt: "esquema" },
  "config.fit": { es: "política de ajuste", en: "fit policy", pt: "política de ajuste" },
  "config.cpu": { es: "planificador cpu", en: "cpu scheduler", pt: "escalonador cpu" },
  "config.quantum": { es: "quantum", en: "quantum", pt: "quantum" },
  "config.totalMemory": { es: "memoria total", en: "total memory", pt: "memória total" },
  "config.osSize": { es: "tamaño SO", en: "OS size", pt: "tamanho SO" },
  "config.partitions": { es: "particiones", en: "partitions", pt: "partições" },
  "config.pageSize": { es: "tamaño de página", en: "page size", pt: "tamanho da página" },
  "config.partitions.delete": { es: "Borrar partición", en: "Delete partition", pt: "Apagar partição" },
  "config.compaction": { es: "compactación", en: "compaction", pt: "compactação" },
  "config.compaction.on": { es: "on", en: "on", pt: "on" },
  "config.compaction.off": { es: "off", en: "off", pt: "off" },

  "btn.add": { es: "agregar", en: "add", pt: "adicionar" },

  // tabla de procesos
  "table.processes": { es: "procesos", en: "processes", pt: "processos" },
  "table.col.id": { es: "ID", en: "ID", pt: "ID" },
  "table.col.arrival": { es: "TA", en: "AT", pt: "TC" },
  "table.col.burst": { es: "TR", en: "BT", pt: "TR" },
  "table.col.size": { es: "tam", en: "size", pt: "tam" },
  "table.col.priority": { es: "pr", en: "pr", pt: "pr" },
  "table.col.segments": { es: "segmentos", en: "segments", pt: "segmentos" },
  "table.col.segments.placeholder": {
    es: "ej. 4K, 2K, 1K",
    en: "e.g. 4K, 2K, 1K",
    pt: "ex. 4K, 2K, 1K",
  },
  "table.delete": { es: "Borrar {pid}", en: "Delete {pid}", pt: "Apagar {pid}" },

  // memoria
  "memory.label": { es: "memoria", en: "memory", pt: "memória" },
  "memory.os": { es: "SO", en: "OS", pt: "SO" },
  "memory.free": { es: "libre", en: "free", pt: "livre" },
  "memory.fragInternal": { es: "Frag interna: {size}", en: "Internal frag: {size}", pt: "Frag interna: {size}" },

  // cola de espera
  "waitqueue.label": { es: "wait-mem", en: "wait-mem", pt: "wait-mem" },
  "waitqueue.empty": { es: "vacía", en: "empty", pt: "vazia" },

  // cpu badge (CPU sigue como acrónimo)
  "cpu.idle": { es: "idle", en: "idle", pt: "ocioso" },

  // gantt
  "gantt.label": { es: "gantt", en: "gantt", pt: "gantt" },
  "gantt.ticks": { es: "{n} ticks", en: "{n} ticks", pt: "{n} ticks" },

  // timeline (aria)
  "timeline.reset": { es: "Reset", en: "Reset", pt: "Resetar" },
  "timeline.stepBack": { es: "Paso atrás", en: "Step back", pt: "Passo atrás" },
  "timeline.play": { es: "Reproducir", en: "Play", pt: "Reproduzir" },
  "timeline.pause": { es: "Pausar", en: "Pause", pt: "Pausar" },
  "timeline.stepForward": { es: "Paso adelante", en: "Step forward", pt: "Passo adiante" },
  "timeline.scrub": { es: "Scrub", en: "Scrub", pt: "Scrub" },

  // stats
  "stats.tick": { es: "tick", en: "tick", pt: "tick" },
  "stats.fragInternal": { es: "frag. interna", en: "int. frag", pt: "frag. interna" },
  "stats.fragExternal": { es: "frag. externa", en: "ext. frag", pt: "frag. externa" },
  "stats.freeTotal": { es: "libre total", en: "total free", pt: "livre total" },
  "stats.waitMem": { es: "wait-mem", en: "wait-mem", pt: "wait-mem" },
  "stats.ready": { es: "ready", en: "ready", pt: "ready" },

  // events
  "events.title": { es: "eventos t={t}", en: "events t={t}", pt: "eventos t={t}" },
  "events.empty": { es: "sin eventos", en: "no events", pt: "sem eventos" },
  "events.arrival": { es: "arribó", en: "arrived", pt: "chegou" },
  "events.load": { es: "cargó en memoria", en: "loaded in memory", pt: "carregou em memória" },
  "events.wait": { es: "no entra (espera)", en: "doesn't fit (waiting)", pt: "não cabe (aguardando)" },
  "events.compaction": { es: "compactación", en: "compaction", pt: "compactação" },
  "events.start": { es: "obtiene CPU", en: "gets CPU", pt: "obtém CPU" },
  "events.preempt": { es: "preempt (quantum)", en: "preempt (quantum)", pt: "preempt (quantum)" },
  "events.finish": { es: "termina y libera", en: "finishes and frees", pt: "termina e libera" },
  "events.idle": { es: "CPU idle", en: "CPU idle", pt: "CPU ocioso" },
  "events.cannotLoad": { es: "no puede cargar", en: "cannot load", pt: "não pode carregar" },

  // help
  "help.title": { es: "ayuda", en: "help", pt: "ajuda" },
  "help.modes.title": { es: "modos", en: "modes", pt: "modos" },
  "help.modes.contiguous": {
    es: "MFT/MVT con FF/BF/WF, compactación opcional, CPU schedulers.",
    en: "MFT/MVT with FF/BF/WF, optional compaction, CPU schedulers.",
    pt: "MFT/MVT com FF/BF/WF, compactação opcional, escalonadores de CPU.",
  },
  "help.modes.paging": {
    es: "traducción lógica→física, descomposición de bits, tabla de páginas.",
    en: "logical→physical translation, bit decomposition, page table.",
    pt: "tradução lógica→física, decomposição de bits, tabela de páginas.",
  },
  "help.modes.replacement": {
    es: "FIFO, LRU y OPT comparados sobre la misma cadena.",
    en: "FIFO, LRU and OPT compared on the same reference string.",
    pt: "FIFO, LRU e OPT comparados sobre a mesma cadeia.",
  },
  "help.shortcuts.title": { es: "atajos", en: "shortcuts", pt: "atalhos" },
  "help.shortcuts.space": { es: "Play / Pausa", en: "Play / Pause", pt: "Reproduzir / Pausar" },
  "help.shortcuts.right": { es: "Paso adelante", en: "Step forward", pt: "Passo adiante" },
  "help.shortcuts.left": { es: "Paso atrás", en: "Step back", pt: "Passo atrás" },
  "help.shortcuts.r": { es: "Reset", en: "Reset", pt: "Resetar" },
  "help.tip.title": { es: "tip", en: "tip", pt: "dica" },
  "help.tip.body": {
    es: "Los tamaños pueden ingresarse en KB o MB (ej. 64 MB). Toggle global en el header.",
    en: "Sizes can be entered in KB or MB (e.g. 64 MB). Global toggle in the header.",
    pt: "Os tamanhos podem ser inseridos em KB ou MB (ex. 64 MB). Toggle global no cabeçalho.",
  },
  "help.close": { es: "Cerrar", en: "Close", pt: "Fechar" },

  // small-screen overlay
  "smallscreen.title": {
    es: "Mejor desde una computadora",
    en: "Better on a computer",
    pt: "Melhor em um computador",
  },
  "smallscreen.body": {
    es: "Este simulador muestra varios paneles densos en simultáneo (memoria, procesos, gantt, estadísticas) y solo tiene sentido en pantallas grandes. Volvé a abrirlo desde una computadora.",
    en: "This simulator shows several dense panels at once (memory, processes, gantt, stats) and only makes sense on large screens. Please open it on a computer.",
    pt: "Este simulador mostra vários painéis densos ao mesmo tempo (memória, processos, gantt, estatísticas) e só faz sentido em telas grandes. Abra-o em um computador.",
  },

  // paginación
  "paging.title": { es: "paginación", en: "paging", pt: "paginação" },
  "paging.pBits": { es: "P (bits de página)", en: "P (page bits)", pt: "P (bits de página)" },
  "paging.dBits": { es: "D (bits de desplazamiento)", en: "D (offset bits)", pt: "D (bits de deslocamento)" },
  "paging.processSize": { es: "tamaño del proceso (KB)", en: "process size (KB)", pt: "tamanho do processo (KB)" },
  "paging.freeFrames": { es: "marcos libres (coma)", en: "free frames (comma)", pt: "quadros livres (vírgula)" },
  "paging.logicalAddr": {
    es: "dirección lógica (binario o decimal)",
    en: "logical address (binary or decimal)",
    pt: "endereço lógico (binário ou decimal)",
  },
  "paging.addressablePages": {
    es: "páginas direccionables: {n}",
    en: "addressable pages: {n}",
    pt: "páginas endereçáveis: {n}",
  },
  "paging.pageSize": {
    es: "tamaño página: {n} palabras",
    en: "page size: {n} words",
    pt: "tamanho página: {n} palavras",
  },
  "paging.totalAddr": {
    es: "espacio total direccionable: {n} palabras",
    en: "total addressable space: {n} words",
    pt: "espaço total endereçável: {n} palavras",
  },
  "paging.pagesNeeded": {
    es: "páginas que necesita: {n}",
    en: "pages needed: {n}",
    pt: "páginas necessárias: {n}",
  },
  "paging.unassigned": {
    es: "{n} página(s) sin marco libre",
    en: "{n} page(s) with no free frame",
    pt: "{n} página(s) sem quadro livre",
  },
  "paging.table": { es: "tabla de páginas", en: "page table", pt: "tabela de páginas" },
  "paging.col.page": { es: "página", en: "page", pt: "página" },
  "paging.col.frame": { es: "marco", en: "frame", pt: "quadro" },
  "paging.col.physBase": { es: "base física", en: "phys. base", pt: "base física" },
  "paging.translation": { es: "traducción", en: "translation", pt: "tradução" },
  "paging.logical": { es: "lógica:", en: "logical:", pt: "lógica:" },
  "paging.physical": { es: "física:", en: "physical:", pt: "física:" },
  "paging.page_eq": { es: "página = {p}, offset = {o}", en: "page = {p}, offset = {o}", pt: "página = {p}, offset = {o}" },
  "paging.frame_eq": { es: "marco = {f}", en: "frame = {f}", pt: "quadro = {f}" },
  "paging.noFrame": {
    es: "página sin marco asignado",
    en: "page has no assigned frame",
    pt: "página sem quadro atribuído",
  },

  // reemplazo
  "replacement.title": { es: "reemplazo", en: "replacement", pt: "substituição" },
  "replacement.refs": { es: "cadena de referencias", en: "reference string", pt: "cadeia de referências" },
  "replacement.frameCount": { es: "cantidad de marcos", en: "frame count", pt: "quantidade de quadros" },
  "replacement.faults": { es: "{f} fallos · {p}%", en: "{f} faults · {p}%", pt: "{f} faltas · {p}%" },
  "replacement.faultsOf": { es: "{f} fallos / {n}", en: "{f} faults / {n}", pt: "{f} faltas / {n}" },
  "replacement.col.ref": { es: "ref", en: "ref", pt: "ref" },

  // warnings (mensajes que vienen del motor — los traducimos en la UI)
  "warn.memTotal": { es: "La memoria total debe ser > 0.", en: "Total memory must be > 0.", pt: "A memória total deve ser > 0." },
  "warn.osTooBig": { es: "El SO no puede ser mayor o igual a la memoria total.", en: "OS cannot be >= total memory.", pt: "O SO não pode ser >= memória total." },
  "warn.partsExceed": { es: "La suma de particiones excede la memoria utilizable.", en: "Partition sum exceeds usable memory.", pt: "A soma das partições excede a memória utilizável." },
  "warn.quantum": { es: "El quantum debe ser > 0 para Round Robin.", en: "Quantum must be > 0 for Round Robin.", pt: "O quantum deve ser > 0 para Round Robin." },
  "warn.noProcesses": { es: "Ingresá al menos un proceso.", en: "Add at least one process.", pt: "Adicione ao menos um processo." },
  "warn.pageSize": {
    es: "El tamaño de página debe ser > 0.",
    en: "Page size must be > 0.",
    pt: "O tamanho da página deve ser > 0.",
  },
  "warn.tooBig": {
    es: "{pid} ({k}K) no entra en la memoria utilizable.",
    en: "{pid} ({k}K) doesn't fit in usable memory.",
    pt: "{pid} ({k}K) não cabe na memória utilizável.",
  },

  // presets
  "preset.whiteboard.label": {
    es: "Pizarrón: FCFS + MFT + First-Fit",
    en: "Whiteboard: FCFS + MFT + First-Fit",
    pt: "Quadro: FCFS + MFT + First-Fit",
  },
  "preset.whiteboard.desc": {
    es: "Caso del pizarrón de la cátedra. Particiones [12288, 8192, 8192, 4096, 5120].",
    en: "Classroom whiteboard case. Partitions [12288, 8192, 8192, 4096, 5120].",
    pt: "Caso do quadro da cátedra. Partições [12288, 8192, 8192, 4096, 5120].",
  },
  "preset.ej2.label": {
    es: "Ej. 2: MVT + First-Fit",
    en: "Ex. 2: MVT + First-Fit",
    pt: "Ex. 2: MVT + First-Fit",
  },
  "preset.ej2.desc": {
    es: "Memoria fragmentada inicial. Ideal para comparar FF/BF/WF y la compactación.",
    en: "Pre-fragmented memory. Ideal to compare FF/BF/WF and compaction.",
    pt: "Memória fragmentada inicial. Ideal para comparar FF/BF/WF e a compactação.",
  },
  "preset.ej5a.label": {
    es: "Ej. 5a: MFT + First-Fit + FCFS",
    en: "Ex. 5a: MFT + First-Fit + FCFS",
    pt: "Ex. 5a: MFT + First-Fit + FCFS",
  },
  "preset.ej5a.desc": {
    es: "Particiones fijas con quantum no aplicable (FCFS).",
    en: "Fixed partitions, quantum not applicable (FCFS).",
    pt: "Partições fixas com quantum não aplicável (FCFS).",
  },
  "preset.ej6.label": {
    es: "Ej. 6: MFT + Best-Fit + RR (q=4)",
    en: "Ex. 6: MFT + Best-Fit + RR (q=4)",
    pt: "Ex. 6: MFT + Best-Fit + RR (q=4)",
  },
  "preset.ej6.desc": {
    es: "Round Robin con quantum 4 sobre MFT/Best-Fit.",
    en: "Round Robin with quantum 4 on MFT/Best-Fit.",
    pt: "Round Robin com quantum 4 em MFT/Best-Fit.",
  },
  "preset.paging.label": {
    es: "Paginación: 4K/marco + FCFS",
    en: "Paging: 4K/frame + FCFS",
    pt: "Paginação: 4K/quadro + FCFS",
  },
  "preset.paging.desc": {
    es: "64K de memoria, 14 marcos de 4K. Cada proceso se divide en páginas y se asigna a marcos libres no contiguos.",
    en: "64K memory, 14 frames of 4K. Each process splits into pages assigned to non-contiguous free frames.",
    pt: "64K de memória, 14 quadros de 4K. Cada processo se divide em páginas atribuídas a quadros livres não contíguos.",
  },
  "preset.seg.label": {
    es: "Segmentación: BF + compactación",
    en: "Segmentation: BF + compaction",
    pt: "Segmentação: BF + compactação",
  },
  "preset.seg.desc": {
    es: "Cada proceso tiene 3 segmentos (CODE/DATA/STACK). Cada segmento entra en un hueco distinto (Best-Fit), con compactación habilitada.",
    en: "Each process has 3 segments (CODE/DATA/STACK). Each fits in its own hole (Best-Fit), with compaction enabled.",
    pt: "Cada processo tem 3 segmentos (CODE/DATA/STACK). Cada um cabe num buraco distinto (Best-Fit), com compactação habilitada.",
  },
} as const;

export type Key = keyof typeof DICT;

export function translate(
  key: Key,
  lang: Lang,
  params?: Record<string, string | number>
): string {
  const entry = DICT[key];
  if (!entry) return key;
  let s: string = entry[lang] ?? entry.es;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

// Códigos de warning que devuelve el motor, mapeados a claves i18n.
// Los warnings genuinos pueden incluir parámetros — ver translateWarning.
export function translateWarning(raw: string, lang: Lang): string {
  if (raw === "La memoria total debe ser > 0.") return translate("warn.memTotal", lang);
  if (raw === "El SO no puede ser mayor o igual a la memoria total.")
    return translate("warn.osTooBig", lang);
  if (raw === "La suma de particiones excede la memoria utilizable.")
    return translate("warn.partsExceed", lang);
  if (raw === "El quantum debe ser > 0 para Round Robin.")
    return translate("warn.quantum", lang);
  if (raw === "Ingresá al menos un proceso.")
    return translate("warn.noProcesses", lang);
  if (raw === "El tamaño de página debe ser > 0.")
    return translate("warn.pageSize", lang);
  const m = raw.match(/^(P\w+) \((\d+)K\) no entra en la memoria utilizable\.$/);
  if (m) return translate("warn.tooBig", lang, { pid: m[1], k: m[2] });
  return raw;
}

export const LANG_LABEL: Record<Lang, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
};
