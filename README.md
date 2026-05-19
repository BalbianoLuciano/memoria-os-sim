# Memoria-OS Sim

Visualizador interactivo de **administración de memoria + planificación de CPU** para Arquitectura y Sistemas Operativos (UTN-FRRe).

Una sola pantalla, tres modos: **Contiguo** (MFT/MVT con FF/BF/WF y compactación), **Paginación** (traducción lógica → física, tabla de páginas) y **Reemplazo** (FIFO, LRU, OPT comparados sobre la misma cadena).

Cubre los ejercicios del práctico de la Unidad IV (2019) y replica la mecánica del pizarrón.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS con tokens neón inspirados en NVIDIA
- Framer Motion para transiciones de bloques de memoria
- React (useState + useMemo) — el motor de simulación corre 100% en el cliente
- lucide-react para iconos
- Sin backend, sin base de datos, sin tracking

## Desarrollo local

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build estático

```bash
npm run build        # genera ./out con export estático
```

## Deploy

Push a `main` dispara el workflow `.github/workflows/deploy.yml`, que builda con `NEXT_PUBLIC_BASE_PATH=/memoria-os-sim` y publica en GitHub Pages.

URL final: `https://balbianoluciano.github.io/memoria-os-sim/`.

Para habilitarlo la primera vez:

1. `Settings → Pages` del repo
2. `Build and deployment: GitHub Actions`

## Atajos

| Tecla    | Acción           |
|----------|------------------|
| Espacio  | Play / Pausa     |
| →        | Paso adelante    |
| ←        | Paso atrás       |
| R        | Reset            |

## Estructura

```
src/
├── app/                # entrada Next App Router
├── components/         # shell, modos, paneles, gantt, timeline
├── hooks/              # useSimulationClock
└── lib/                # motor (contiguousSim, cpuSched, paging, replacement),
                        # presets y utilidades
```

Ver [PLAN.md](./PLAN.md) y [DESIGN.md](./DESIGN.md) para el detalle de diseño y arquitectura.

## Licencia

MIT.
