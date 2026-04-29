# QuantaWeb

The official marketing and documentation website for [QuantaLLM](https://github.com/NaMan6122/QuantaLLM2) — an on-device LLM inference engine for Android.

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** — build tooling
- **Tailwind CSS 4** — utility-first styling
- **Motion** (Framer Motion) — scroll-triggered and interactive animations
- **Three.js** + React Three Fiber — 3D neural mesh, particle vortex, and hexagonal chip visuals
- **React Router** — client-side routing with lazy-loaded routes
- **Lucide React** — icon library

## Features

### Landing Page
- **Hero** — headline, CTA buttons, terminal mockup, Three.js neural network mesh background with mouse parallax
- **Features** — 8 feature cards across Privacy, Performance, and Developer groups with architecture diagram
- **Inference Pipeline** — animated SVG pipeline showing the full data flow from user prompt → ViewModel → Manager Layer → ModelEngine → InferenceEngine → llama.cpp/ONNX → Native, with pulsing connections and interactive nodes
- **Stats** — 6 animated counters with scroll-triggered count-up
- **Benchmarks** — performance table (8 device/model combos) with 3D hexagonal NPU chip visual, responsive card layout on mobile
- **Interactive Demo** — mock chat UI with character-by-character streaming animation, live tok/s counter
- **Pricing/Open Source** — comparison table (Community vs Developer)
- **CTA** — download/GitHub/docs links with Three.js particle vortex background

### Separate Routes
- `/docs` — 9-page documentation system with sidebar navigation, code blocks with copy button, prev/next navigation
- `/models` — HuggingFace API integration with search, sort, and pagination for GGUF models
- `/faq` — 15 accordion-style questions across 4 categories
- `/404` — branded not-found page

### Documentation Pages
| Page | Content |
|------|---------|
| Getting Started | System requirements, installation, first inference |
| Architecture | MVVM layers, manager deep dives, design patterns |
| Inference Engines | LlamaCppEngine, OnnxRuntimeEngine, ModelEngine singleton |
| Hexagon NPU | DSP/HTP architecture, SoC support, FastRPC, tuning |
| AIDL Service | Cross-app IPC, service/callback interfaces, integration guide |
| Model Formats | GGUF quantization, ONNX format, model scanning |
| Native Layer | JNI bridge, llama_jni.cpp, CMake, ARM64 compiler flags |
| API Reference | InferenceEngine, LlamaJni, GenerationConfig, error codes |
| Build from Source | Gradle, NDK, CMake, native libs, signing |

### Performance
- Code splitting via `React.lazy` — main bundle 433 KB, docs/models/FAQ/Three.js loaded on demand
- Three.js components lazy-loaded and share a single R3F chunk
- All scroll animations use `viewport={{ once: true }}` — fire once, no re-triggers
- Three.js renders use `useFrame` (no React re-renders), capped DPR, single-draw-call geometries

## Project Structure

```
src/
├── main.tsx                          # Entry point (BrowserRouter)
├── App.tsx                           # Route definitions, lazy loading, page transitions
├── index.css                         # Tailwind theme, custom utilities
├── components/
│   ├── Navbar.tsx                    # Fixed nav with mobile drawer
│   ├── Hero.tsx                      # Hero section + NeuralMeshBackground
│   ├── NeuralMeshBackground.tsx      # Three.js neural network mesh
│   ├── Features.tsx                  # Feature cards + architecture diagram
│   ├── InferencePipeline.tsx         # Animated SVG inference pipeline
│   ├── Stats.tsx                     # Animated stat counters
│   ├── Benchmarks.tsx                # Performance table + HexChipVisual
│   ├── HexChipVisual.tsx             # Three.js hexagonal NPU chip
│   ├── InteractiveDemo.tsx           # Mock chat with streaming
│   ├── Models.tsx                    # HuggingFace model browser
│   ├── Pricing.tsx                   # Open source comparison
│   ├── CTA.tsx                       # Call to action + ParticleVortex
│   ├── ParticleVortex.tsx            # Three.js particle vortex
│   ├── FAQ.tsx                       # Accordion FAQ
│   └── Footer.tsx                    # Site footer
├── docs/
│   ├── DocsLayout.tsx                # Sidebar + content + navigation
│   ├── DocsSidebar.tsx               # Collapsible sidebar sections
│   ├── CodeBlock.tsx                 # Syntax display with copy button
│   └── content/                      # 9 documentation pages (TSX)
├── pages/
│   ├── ModelsPage.tsx                # /models wrapper
│   ├── FAQPage.tsx                   # /faq wrapper
│   └── NotFound.tsx                  # 404 page
└── lib/
    └── utils.ts                      # cn() utility
```

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Design System

| Token | Value |
|-------|-------|
| Primary | `#ff9f4a` |
| Secondary | `#ff734c` |
| Surface | `#0e0e0e` |
| Surface Container | `#191919` |
| Headline Font | Space Grotesk |
| Body Font | Inter |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` |

## License

MIT
