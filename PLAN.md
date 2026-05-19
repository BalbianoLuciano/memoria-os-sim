# PLAN — Memoria-OS Sim

Visualizador interactivo de **Administración de Memoria + Planificación de CPU** para Arquitectura y Sistemas Operativos (UTN-FRRe).

> Documento de planificación. **No se escribe código hasta que esto se apruebe.**

---

## 1. Objetivo

Construir una webapp estática, desplegada en GitHub Pages, que permita configurar y *visualizar paso a paso* qué pasa en memoria y en CPU cuando un conjunto de procesos compite por los recursos del sistema, replicando exactamente la mecánica de los ejercicios del práctico de la cátedra (Guía Unidad IV, 2019).

El usuario tiene que poder, **sin salir de la única pantalla**:

- Cargar la tabla de procesos (TR, TA, TI, tamaño, prioridad).
- Elegir esquema de memoria (MFT con particiones fijas o MVT con FF/BF/WF, con o sin compactación) o paginación.
- Elegir planificador de CPU (FCFS, Round Robin con quantum, SJF, Prioridad).
- Setear el tamaño del SO y la memoria total (con conversor MB↔KB).
- Avanzar la simulación instante por instante, pausarla, scrubbearla con una barra de tiempo, o reproducirla en auto-play.
- Leer en tiempo real: fragmentación interna y externa, cola de espera por memoria (los "cilindritos"), cola de listos, proceso en CPU, eventos del tick actual y diagrama de Gantt acumulado.

El objetivo pedagógico es entender *por qué* pasa cada decisión: cuándo un proceso queda esperando, qué hueco se eligió y por qué, cuándo se gatilla la compactación y cuánto cuesta.

---

## 2. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | Tipado fuerte para los modelos del simulador, export estático nativo |
| Estilos | **Tailwind CSS** con tokens NVIDIA-inspired | Iteración rápida, sin CSS-in-JS |
| Animación | **Framer Motion** | Transiciones suaves de bloques de memoria entre estados |
| Estado | **React (useReducer + Context)** | No hace falta Zustand para este alcance, todo cabe en memoria |
| Iconos | **lucide-react** | Set consistente, tree-shakeable |
| Sin backend | — | Toda la simulación corre en el cliente, sin DB ni APIs |
| Deploy | **GitHub Pages** (output: 'export') | El usuario tiene SSH configurado en `github-personal` |

---

## 3. Modelo conceptual

El simulador modela un sistema con tres recursos compartidos: **memoria**, **CPU** y **cola de espera**.

### Estados de un proceso

```
new ──arribo──▶ wait-mem ──asignación──▶ ready ──dispatch──▶ running ──burst=0──▶ finished
                    ▲                      ▲                       │
                    │                      └──preempt (RR/SJF)─────┘
                    └─── no entra (esperando hueco / compactación) ──┘
```

- **new**: aún no llegó (arrival > t).
- **wait-mem**: arribó pero no entró a memoria (los "cilindritos" del pizarrón).
- **ready**: en memoria, esperando CPU.
- **running**: tiene el CPU.
- **finished**: terminó, liberó su bloque.

### Tick discreto

Tiempo en unidades enteras. En cada tick `t`:

1. Procesar arribos (`arrival === t`).
2. Intentar cargar procesos de `wait-mem` aplicando la política de ajuste (FF/BF/WF).
3. Si no entra y MVT con compactación habilitada y `freeTotal ≥ size`: compactar. La compactación bloquea el CPU durante `costo_por_ranura × ranuras_compactadas` ticks (lo dice el práctico).
4. Despachar CPU según la política activa.
5. Ejecutar 1 unidad de tiempo. Si remaining=0 → finished y libera memoria. Si RR y quantum=0 → preempt.
6. Emitir un **snapshot** con el estado completo + eventos del tick.

La simulación corre offline al cambiar config (genera todos los snapshots de una). La UI sólo lee `snapshots[t]`. Esto hace que el scrub sea instantáneo y la lógica testable.

---

## 4. Layout y viewport

**Restricción dura: toda la app cabe en `100vh × 100vw`, sin scroll de página.** Los paneles internos pueden tener scroll propio cuando hay overflow (tabla de procesos larga, log de eventos, gantt extenso), pero el chasis nunca se desplaza.

### Repartición vertical (en 1080p)

| Zona | Altura | Comportamiento si overflow |
|---|---|---|
| Header (logo + segmented control + toggle KB/MB) | `56 px` fijo | sin scroll, todo siempre visible |
| Área principal (3 columnas) | `calc(100vh − 56 − 140)` ≈ 884 px | scroll interno en cada columna |
| Timeline + Gantt | `140 px` fijo | Gantt con scroll horizontal interno si > N ticks |

### Repartición horizontal del área principal

| Columna | Ancho | Contenido |
|---|---|---|
| Izquierda | `320 px` fijo | Config + tabla de procesos (en tabs internos para que entre) |
| Centro | `flex (1)` | Memoria + cola de espera (cilindritos) + indicador de proceso en CPU |
| Derecha | `320 px` fijo | Stats (frag, libre) + event log del tick |

### Responsive degradation

- **≥ 1280 px de ancho**: layout completo de tres columnas.
- **1024–1279 px**: las columnas laterales se angostan a 280 px.
- **< 1024 px**: las columnas laterales se colapsan a botones-toggle que abren *drawers* (overlay) sobre el centro. La memoria siempre queda visible. El gantt se ubica abajo igual.
- **< 640 px** (mobile): la app sigue siendo usable pero advierte que se diseñó para desktop ("para mejor experiencia, usá una pantalla más grande").

---

## 5. Arquitectura del proyecto

**Una sola página, una sola URL.** Toda la app vive en `/`. Los modos (contiguo / paginación / reemplazo) no son rutas separadas, son secciones que se intercambian con un *segmented control* en el header. El estado de simulación es global y se mantiene al cambiar de modo.

```
memoria-os-sim/
├── package.json
├── next.config.js              # output: 'export', basePath para GH Pages
├── tailwind.config.ts          # tokens neón NVIDIA
├── tsconfig.json
├── DESIGN.md                   # sistema de diseño (NVIDIA-inspired)
├── README.md                   # cómo correr y desplegar
├── PLAN.md                     # este archivo
├── public/
│   └── .nojekyll
├── .github/workflows/
│   └── deploy.yml              # CI: build + push a gh-pages
└── src/
    ├── app/
    │   ├── layout.tsx          # root, fuentes, theme
    │   ├── page.tsx            # ÚNICA página — orquesta todo en 100vh
    │   └── globals.css
    ├── components/
    │   ├── Header.tsx          # logo + segmented control + toggle KB/MB
    │   ├── ModeContiguous.tsx  # layout 3-columnas para MFT/MVT
    │   ├── ModePaging.tsx      # layout alternativo para paginación
    │   ├── ModeReplacement.tsx # layout alternativo para reemplazo
    │   ├── MemoryColumn.tsx    # las cajitas verticales apiladas
    │   ├── WaitQueue.tsx       # cilindritos de procesos esperando
    │   ├── GanttChart.tsx
    │   ├── TimelineControls.tsx# play/pause/step/scrub/velocidad
    │   ├── ProcessTable.tsx    # editor de procesos (TR, TA, TI, tam, prio)
    │   ├── ConfigPanel.tsx     # esquema, política, quantum, SO, mem total
    │   ├── StatsPanel.tsx      # frag interna/externa, libre, accum
    │   ├── EventLog.tsx        # qué pasó en cada tick
    │   ├── UnitConverter.tsx   # KB ↔ MB
    │   ├── PageTable.tsx
    │   └── ReplacementGrid.tsx
    ├── lib/
    │   ├── types.ts            # ProcessSpec, Snapshot, Config…
    │   ├── contiguousSim.ts    # motor MFT/MVT + integración CPU
    │   ├── cpuSched.ts         # FCFS, RR, SJF, Prioridad
    │   ├── paging.ts           # P/D → traducción, tabla de páginas
    │   ├── replacement.ts      # FIFO, LRU, OPT
    │   └── presets.ts          # caso del pizarrón, ejercicios del PDF
    └── hooks/
        └── useSimulationClock.ts
```

---

## 6. Motor: asignación contigua

### MFT (particiones fijas)

- El usuario define las particiones de usuario (ej: `[12288, 8192, 8192, 4096, 5120]` KB, replicando lo que parece haber en el pizarrón).
- Al cargar un proceso, se busca una partición libre que lo contenga según FF/BF/WF.
- **Fragmentación interna** = Σ (`partición.size − proceso.size`) para particiones ocupadas.
- **Fragmentación externa** = Σ tamaños de particiones libres que no alcanzan para el proceso pendiente más chico.

### MVT (particiones variables)

- Memoria = una sola región libre menos el SO.
- Al cargar un proceso, se busca un hueco que lo contenga según política y se talla *exactamente* el tamaño del proceso. El resto del hueco queda como hueco libre.
- Al liberar, los huecos adyacentes se fusionan automáticamente (coalescing).
- **Fragmentación externa** = suma de huecos libres que no alcanzan para el proceso pendiente más chico.
- **Fragmentación interna** = 0 (en MVT puro).

### Compactación (sólo MVT, opcional)

- Cuando un proceso pendiente no entra en ningún hueco individual pero `freeTotal ≥ size`, y la compactación está habilitada: se compacta.
- Costo: **1 unidad de tiempo por ranura compactada** (configurable, default 1, como dice el práctico).
- Durante la compactación el CPU está bloqueado (en el Gantt aparece como `COMPACT`).
- Se reporta el contraste de tiempos totales con vs sin compactación.

### Políticas de ajuste

| Política | Selección |
|---|---|
| First-Fit | Primer hueco que alcance, orden de dirección |
| Best-Fit | El hueco más chico que alcance |
| Worst-Fit | El hueco más grande que alcance |

---

## 7. Motor: paginación

Modo dentro de la misma página, accesible por el segmented control del header.

- Input: bits de página `P`, bits de desplazamiento `D`, lista de páginas físicas libres, tamaño del proceso en KB.
- Calcula: cantidad de páginas direccionables (`2^P`), tamaño de página (`2^D` palabras), memoria total direccionable (`2^(P+D)`), cuántas páginas necesita el proceso.
- Construye la tabla de páginas asignando libres en orden.
- Permite ingresar una dirección lógica en binario o decimal y mostrar la traducción a física, paso a paso (visualmente: descomposición de bits → lookup en tabla → dirección física).

Cubre ejercicios 7, 8, 9, 10 del PDF.

---

## 8. Motor: reemplazo de páginas

Modo dentro de la misma página, accesible por el segmented control del header.

- Input: cadena de referencias (ej `1-2-3-4-2-1-5-6-…`), cantidad de marcos, algoritmo.
- Algoritmos: **FIFO**, **LRU**, **OPT**.
- Output: tabla paso-a-paso con qué marcos están ocupados, si hubo fallo de página, qué página se reemplazó, total de fallos, tasa de fallos.
- Permite comparar los 3 algoritmos lado a lado para la misma cadena.

Cubre ejercicios 11, 12 del PDF.

---

## 9. Planificadores de CPU

| Política | Comportamiento |
|---|---|
| **FCFS** | Orden de entrada a la cola de listos (que en general es orden de arribo) |
| **Round Robin** | FIFO + quantum configurable. Preempt al terminar el quantum |
| **SJF** | No preemptivo: al elegir, toma el ready con menor burst original |
| **Prioridad** | No preemptivo: menor número de prioridad gana. Usa la columna del práctico |

Todos respetan la restricción de que un proceso sólo puede correr si está cargado en memoria.

---

## 10. Algoritmo del tick (motor contiguo)

Pseudocódigo del paso de simulación. Entrada: `state` (estado actual) y `config`. Salida: `state` actualizado + un `snapshot` emitido. Esto es lo que se traduce a `contiguousSim.ts`.

```
function step(state, config, t):
  events = []

  # 1. Si hay compactación en curso, gasta el tick y no hace nada más
  if state.compactionLeft > 0:
    state.compactionLeft -= 1
    gantt.push('COMPACT')
    return emitSnapshot(state, events, t)

  # 2. Procesar arribos en este tick
  for p in processes where p.arrival == t:
    state.processes[p.id].state = 'wait-mem'
    state.waitQueue.push(p.id)
    events.push({kind: 'arrival', pid: p.id})

  # 3. Intentar cargar de wait-mem a memoria, FIFO sobre la cola de espera
  loop:
    progress = false
    for pid in state.waitQueue (en orden):
      block = findFit(state.blocks, p.size, config.fit, config.scheme)
      if block != null:
        allocate(state, block, pid)
        state.readyQueue.push(pid)
        state.processes[pid].state = 'ready'
        state.waitQueue.remove(pid)
        events.push({kind: 'load', pid})
        progress = true
      elif config.scheme == 'mvt' and config.compaction and totalFree(state.blocks) >= p.size:
        slots = compact(state.blocks)
        state.compactionLeft = slots * config.compactionCostPerSlot
        events.push({kind: 'compaction', slots})
        return emitSnapshot(state, events, t)   # compactar consume el tick
    if not progress: break

  # 4. Si no hay running, despachar CPU según política
  if state.running == null and state.readyQueue.length > 0:
    pid = pick(state.readyQueue, config.cpu)   # FCFS/RR/SJF/Prioridad
    state.running = pid
    state.processes[pid].state = 'running'
    if config.cpu == 'rr':
      state.quantumLeft = config.quantum
    events.push({kind: 'start', pid})

  # 5. Ejecutar 1 unidad
  if state.running:
    p = state.processes[state.running]
    p.remaining -= 1
    gantt.push(state.running)

    if p.remaining == 0:
      p.state = 'finished'
      free(state.blocks, state.running)
      events.push({kind: 'finish', pid: state.running})
      state.running = null
    elif config.cpu == 'rr':
      state.quantumLeft -= 1
      if state.quantumLeft == 0:
        state.readyQueue.push(state.running)
        p.state = 'ready'
        events.push({kind: 'preempt', pid: state.running})
        state.running = null
  else:
    gantt.push('IDLE')

  return emitSnapshot(state, events, t)
```

La simulación corre hasta que todos los procesos están `finished` o se alcanza `config.maxTime` (default 10000, para cortar deadlocks).

---

## 11. UI / UX

**Toda la app es una sola pantalla, 100vh.** El header tiene un segmented control con los 3 modos: `[ Contiguo (MFT/MVT) ]  [ Paginación ]  [ Reemplazo ]`. Al cambiar de modo, sólo cambia el contenido principal — el header y el footer (timeline + gantt) quedan.

### Layout general (modo contiguo, el principal)

```
┌─────────────────────────────────────────────────────────────────────┐
│ MEMORIA-OS  [ Contiguo ▮ ]  [ Paginación ]  [ Reemplazo ]   KB ⇄ MB │
├─────────────────────────────────────────────────────────────────────┤
│ CONFIG (izq, 320px) │  MEMORIA + COLA (centro)  │ STATS + LOG (der) │
│ ┌─Tabs──────────┐   │  ┌───┐         ┌───┐      │ Tick: 9           │
│ │ Config│Procesos│  │  │ SO│         │ P4│ ◀ cilindrito wait-mem    │
│ ├───────────────┤   │  ├───┤         └───┘      │ Frag int: 6700K   │
│ │ ─ esquema     │   │  │P1 │  frag                Frag ext: 0K      │
│ │ ─ política    │   │  ├───┤                    │ Libre: 17408K     │
│ │ ─ CPU+quantum │   │  │P2 │  frag              │ ─────────────     │
│ │ ─ tam SO      │   │  ├───┤                    │ Eventos t=9:      │
│ │ ─ tam memoria │   │  │P3 │  frag              │ · P4 arribó       │
│ │ ─ particiones │   │  ├───┤                    │ · P4 no entra,    │
│ │               │   │  │ . │                    │   pasa a wait-mem │
│ │ Presets ▾     │   │  └───┘                    │                   │
│ └───────────────┘   │  CPU: ▶ P3                │ [scroll interno]  │
├─────────────────────────────────────────────────────────────────────┤
│ TIMELINE: ◀◀ ◀ ▶ ▶▶  ─────●────────  velocidad: 1×  t=9/28           │
│ GANTT: │P1 P1 P1 P1 P1│P2 P2 P2 P2 P2 P2 P2 P2│P3 P3 P3│COMPACT│…   │
└─────────────────────────────────────────────────────────────────────┘
```

Modos **Paginación** y **Reemplazo** reutilizan el mismo header y timeline cuando aplique, pero reemplazan el área central por sus propias visualizaciones (tabla de páginas + descomposición de bits / grilla de marcos).

### Visualización de memoria (componente central)

Columna vertical de cajas apiladas. La altura de cada caja es proporcional a su tamaño en KB. Cada caja muestra:

- Tamaño del bloque/partición.
- Proceso adentro (color del proceso, ID).
- Si MFT y hay frag interna: zona rayada en la parte inferior representando el desperdicio.
- Huecos libres se muestran translúcidos con un patrón de cuadrícula.

Transiciones animadas: cuando un proceso entra/sale, el bloque cambia de color con un fade-in; cuando se compacta, los bloques se "desplazan" hacia arriba con motion (efecto visual del slot collapsing).

### Cola de espera ("cilindritos")

Al costado derecho de la columna de memoria, fila vertical de cilindros pequeños (tipo el que se hace en el pizarrón). Cada cilindro etiquetado con el PID. Indica visualmente cuáles procesos están en `wait-mem`. Click sobre el cilindro abre un mini-popover con info del proceso (tam, motivo de espera).

### Indicador de CPU

Pequeño badge fijo abajo de la columna de memoria: `CPU: ▶ P3` con animación pulse-soft en verde NVIDIA mientras corre. En idle: `CPU: idle` apagado. En compactación: `CPU: COMPACT` en magenta.

### Timeline

- Botones: play, pause, step forward, step back, reset.
- Slider scrubbeable (rango: 0 → ticks totales).
- Velocidad: 0.5×, 1×, 2×, 4×.
- Atajos de teclado: espacio = play/pause, → = step, ← = step back, R = reset.
- Indicador `t = X / TOTAL` siempre visible.

### Diagrama de Gantt

Tira horizontal en la parte inferior, una celda por tick. Color por proceso. Celdas especiales para `IDLE` (gris) y `COMPACT` (ámbar). Sincronizado con el timeline (línea vertical que marca el tick actual). Scroll horizontal interno si la simulación es muy larga.

### Conversor MB↔KB

Toggle global en el header. Toda la UI se re-renderiza en la unidad elegida. Los inputs aceptan ambas (se puede tipear `64 MB` o `65536`) y normalizan internamente a KB.

### Identidad visual de cada proceso

Cada `pid` se mapea de forma determinística a un color de una paleta de 8 acentos neón cíclica:

```
P1 → green   P2 → cyan   P3 → magenta   P4 → amber
P5 → rose    P6 → lime   P7 → violet    P8 → orange
```

El mismo color se usa en: caja de memoria, cilindrito, celda del gantt, badge del event log, fila de la tabla de procesos. Coherencia visual instantánea.

---

## 12. Sistema de diseño

NVIDIA-inspired: **negro profundo + verde NVIDIA + acentos neón**.

| Token | Valor | Uso |
|---|---|---|
| `--ink-950` | `#050606` | fondo de página |
| `--ink-900` | `#0a0c0a` | superficies primarias |
| `--ink-800` | `#13161a` | cards, panels |
| `--neon-green` | `#76B900` | acento principal NVIDIA (procesos activos, CTAs) |
| `--neon-cyan` | `#22d3ee` | procesos secundarios |
| `--neon-magenta` | `#ff2bd6` | compactación, eventos críticos |
| `--neon-amber` | `#ffb020` | warnings, idle, fragmentación |
| `--neon-rose` | `#ff5577` | errores, "no entra" |

Tipografía: **JetBrains Mono** para tablas, IDs, números técnicos. **Inter** para prose. Headlines en mono uppercase tracked-wider, vibe terminal.

Efectos: glow sutil en los bordes de las cajas activas (`box-shadow: 0 0 18px -2px rgba(118,185,0,0.55)`), grid faint de fondo, noise overlay opcional. Cero gradientes morados.

---

## 13. Validación y casos borde

El motor verifica antes de simular y bloquea el botón "Run" hasta corregir:

- **Proceso > memoria total usable**: imposible cargarlo. Badge rojo en la tabla, evento `cannot-load` y se omite de la simulación.
- **Proceso > toda partición MFT**: idem, no entra en ninguna fija.
- **Suma de particiones > memoria usable**: bloqueo de "Run", warning en config panel.
- **Quantum ≤ 0 con RR**: bloqueo.
- **Prioridad sin valor**: asume prioridad 0 (máxima) por default y muestra hint.
- **Memoria total = 0 o SO ≥ memoria total**: bloqueo.
- **Empates en políticas**: FCFS/SJF/Prioridad rompen empates por arrival → id (alfabético).
- **Ningún proceso ingresado**: el "Run" queda deshabilitado.
- **maxTime excedido**: la simulación se detiene y muestra warning (`¿deadlock?, ¿proceso > memoria?, ¿quantum muy bajo?`).

---

## 14. Onboarding, accesibilidad, performance

**First-run**: al abrir la app por primera vez se carga el preset del pizarrón (FCFS + MFT + First-Fit con la tabla de P1..P5). Botón `?` en el header abre un overlay con los atajos de teclado y un tour breve de 4 pasos sobre los componentes (memoria, cola de espera, timeline, gantt).

**Accesibilidad**:
- Contraste mínimo AA en todos los textos (verde, magenta, ámbar sobre negro pasan).
- Foco visible con anillo neón en todos los controles.
- `aria-live="polite"` en el event log para lectores de pantalla.
- `aria-label` en los botones del timeline.
- Animaciones respetan `prefers-reduced-motion: reduce` (se desactivan las transiciones de Framer Motion).

**Performance**:
- Snapshots se regeneran sólo al cambiar config o procesos (memoización con clave `JSON.stringify(config) + JSON.stringify(processes)`).
- Para simulaciones largas (>500 ticks) se computan en un Web Worker para no bloquear UI. Punto de corte de seguridad: `maxTime = 10000`.
- Render virtualizado del gantt cuando hay >200 ticks (sólo renderiza la ventana visible).
- `useMemo` en el cálculo de las alturas relativas de las cajas de memoria (sólo cambia cuando cambia config).

---

## 15. Despliegue a GitHub Pages

### Configuración del repo

1. Repo público en `github-personal`, nombre sugerido: **`memoria-os-sim`**.
2. Branch `main` para fuente, branch `gh-pages` autogenerada por CI.
3. En *Settings → Pages*: source = `gh-pages` branch, root.

### `next.config.js`

```js
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
module.exports = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};
```

### `.github/workflows/deploy.yml`

GitHub Action que, en cada push a `main`:
1. Instala Node 20.
2. `npm ci && NEXT_PUBLIC_BASE_PATH=/memoria-os-sim npm run build`.
3. Toca `out/.nojekyll`.
4. Publica `out/` a la branch `gh-pages` con `peaceiris/actions-gh-pages@v3`.

URL final: `https://<usuario>.github.io/memoria-os-sim/`.

### Workflow local

```bash
git clone git@github-personal:<usuario>/memoria-os-sim.git
cd memoria-os-sim
npm install
npm run dev          # http://localhost:3000
git push origin main # dispara el deploy
```

---

## 16. Hoja de ruta de implementación

Una vez el plan se apruebe, el orden de construcción es:

1. **Scaffold** (Next + Tailwind + TS + config GH Pages) → arranca y muestra el shell vacío.
2. **Tipos + motor contiguo** (`types.ts`, `contiguousSim.ts`, `cpuSched.ts`) con tests mentales contra el ejemplo del pizarrón.
3. **MemoryColumn + WaitQueue + GanttChart** estáticos sobre un snapshot hardcoded.
4. **TimelineControls** conectados al array de snapshots.
5. **ProcessTable + ConfigPanel** editables que regeneren snapshots al cambiar (con validación).
6. **StatsPanel + EventLog**.
7. **Compactación** integrada al motor + a la UI (animación de slot-collapse).
8. **Header + segmented control** de modos.
9. **Modo Paginación** (componente, no ruta).
10. **Modo Reemplazo de páginas** (componente, no ruta).
11. **Presets**: el caso del pizarrón + los ejercicios del PDF (5, 6, 7, 11, 12).
12. **Polish de diseño**: animaciones, glow, atajos de teclado, responsive drawers.
13. **README** + **deploy** + verificación en GH Pages.

---

## 17. Presets / casos de prueba

- **`whiteboard-fcfs-mft-ff`**: tabla del práctico (P1–P5), particiones fijas `[12288, 8192, 8192, 4096, 5120]`, FCFS + MFT + First-Fit. Verifica visualmente los `F: 7168, 4652, 2048…` del pizarrón.
- **`ej-2-fcfs-mvt`**: ejercicio 2 del PDF (P1 180K libre 400K P2 100K libre 150K + P4/P5/P6 en cola FIFO), MVT con FF/BF/WF.
- **`ej-5a-mft-ff-fcfs`**: ejercicio 5a del PDF.
- **`ej-6-mft-bf-rr`**: ejercicio 6 con Round Robin Q=4.
- **`ej-11-replacement-3frames`**: cadena `1-2-3-4-2-1-5-6-…` con 3 marcos, los 3 algoritmos comparados.

---

## 18. Decisiones abiertas (necesito que me confirmes antes de codear)

1. **Nombre del repo**: ¿va `memoria-os-sim` o preferís otro? Esto define el `basePath`.
2. **Particiones del pizarrón**: con la imagen no termino de leer si son `[8192, 12288, 8192, 4096, 5120]` o `[12288, 8192, 8192, 4096, 5120]`. La segunda es la que hace cuadrar el `F: 7168K` del primer instante. ¿Confirmás?
3. **SJF/Prioridad**: ¿los querés en versión **no preemptiva** (estándar académico) o agrego también las preemptivas (SRTF, Prioridad expulsiva)?
4. **Tabla de procesos vs ConfigPanel en la columna izquierda**: ¿lo hago con tabs (cabe mejor en 320 px) o querés panel acordeón colapsable?
5. **Idioma de la UI**: ¿español confirmado, o lo dejo bilingüe ES/EN con toggle?

---

Cuando lo apruebes (o me marques cambios), arranco con el scaffold y vamos hito por hito de la sección 16.
