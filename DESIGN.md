# DESIGN

Sistema de diseño NVIDIA-inspired para Memoria-OS Sim.

## Filosofía

Estética de **terminal técnica**: negro profundo, verde NVIDIA como acento principal, tipografía mono para todo lo numérico, glow sutil en elementos activos. Cero gradientes morados, cero glassmorphism. El usuario tiene que sentir que está leyendo el output de una herramienta de bajo nivel.

## Tokens de color

| Token           | Valor      | Uso |
|-----------------|------------|-----|
| `ink-950`       | `#050606`  | Fondo de página |
| `ink-900`       | `#0a0c0a`  | Superficies primarias |
| `ink-800`       | `#13161a`  | Cards, paneles, segmented controls |
| `ink-700`       | `#1c2026`  | Bordes |
| `neon-green`    | `#76B900`  | Acento NVIDIA — procesos activos, CTAs, foco |
| `neon-cyan`     | `#22d3ee`  | Procesos secundarios, métricas |
| `neon-magenta`  | `#ff2bd6`  | Compactación, eventos críticos |
| `neon-amber`    | `#ffb020`  | Warnings, idle, zonas de fragmentación |
| `neon-rose`     | `#ff5577`  | Errores, "no entra" |

## Paleta cíclica por proceso

8 acentos. Cada `pid` se mapea de forma determinística por el número final del identificador (`P1 → green`, `P2 → cyan`, …). El mismo color se reutiliza en: caja de memoria, cilindrito de wait-mem, celda del gantt, badge del event log, fila de la tabla de procesos.

| pid | color    |
|-----|----------|
| P1  | green    |
| P2  | cyan     |
| P3  | magenta  |
| P4  | amber    |
| P5  | rose     |
| P6  | lime     |
| P7  | violet   |
| P8  | orange   |

## Tipografía

- **JetBrains Mono** — tablas, IDs, dimensiones en KB/MB, código.
- **Inter** — prose, descripciones, ayuda.
- Headlines en mono uppercase con `tracking-wider`, vibe terminal.

## Efectos

- Glow en bordes activos: `box-shadow: 0 0 18px -2px <hex with alpha>`.
- Grid de fondo: dos `linear-gradient` 32px a 4% de alpha sobre verde.
- Animaciones de Framer Motion para entrada/salida de bloques de memoria y cilindritos. Se desactivan con `prefers-reduced-motion`.
- Sin `transition: all`. Sólo transiciones explícitas de opacidad, layout y color.

## Layout

Toda la app vive en `100vh × 100vw`, sin scroll de página. Los paneles internos hacen scroll cuando necesitan. Tres columnas en el modo Contiguo: izquierda (config + procesos, 320px), centro (memoria + cola), derecha (stats + log, 320px). Timeline + Gantt como footer fijo de 140px.

## Accesibilidad

- Contraste mínimo AA en todos los textos sobre `ink-950` y `ink-900`.
- Foco visible con `ring` neón en botones, inputs y controles.
- `aria-live="polite"` en el event log.
- Atajos de teclado para play/pause/step/reset.
- Inputs aceptan tanto KB como `64 MB` (con prefijo de unidad).

## Reglas

1. No introducir nuevos tonos sin agregarlos al token set.
2. Las animaciones nunca obstruyen la lectura del tick actual.
3. El gantt y la columna de memoria siempre comparten paleta — leer el gantt tiene que ser leer la memoria.
