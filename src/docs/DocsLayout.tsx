import { useState, useMemo } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import { Menu, X, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import DocsSidebar, { sections } from "./DocsSidebar";
import DocsSearch from "./DocsSearch";
import TableOfContents from "./TableOfContents";

import GettingStarted from "./content/GettingStarted";
import Architecture from "./content/Architecture";
import InferenceEngines from "./content/InferenceEngines";
import HexagonNPU from "./content/HexagonNPU";
import AIDLService from "./content/AIDLService";
import ModelFormats from "./content/ModelFormats";
import NativeLayer from "./content/NativeLayer";
import APIReference from "./content/APIReference";
import BuildFromSource from "./content/BuildFromSource";

// Flat ordered list of all pages for prev/next navigation
const allPages = sections.flatMap((s) => s.items);

const pageTitleMap: Record<string, string> = {};
allPages.forEach((p) => {
  pageTitleMap[p.path] = p.label;
});

const GITHUB_BASE = "https://github.com/NaMan6122/QuantaLLM2/edit/main/QuantaWeb/src/docs/content";
const editPathMap: Record<string, string> = {
  "/docs": "GettingStarted.tsx",
  "/docs/getting-started": "GettingStarted.tsx",
  "/docs/architecture": "Architecture.tsx",
  "/docs/inference-engines": "InferenceEngines.tsx",
  "/docs/hexagon-npu": "HexagonNPU.tsx",
  "/docs/native-layer": "NativeLayer.tsx",
  "/docs/aidl-service": "AIDLService.tsx",
  "/docs/model-formats": "ModelFormats.tsx",
  "/docs/api-reference": "APIReference.tsx",
  "/docs/build-from-source": "BuildFromSource.tsx",
};

export default function DocsLayout() {
  const location = useLocation();
  const activePath = location.pathname.replace(/\/$/, "") || "/docs";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentIndex = allPages.findIndex((p) => p.path === activePath);
  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  const breadcrumb = useMemo(() => {
    const title = pageTitleMap[activePath] ?? "Docs";
    const section = sections.find((s) => s.items.some((i) => i.path === activePath));
    return { section: section?.title, title };
  }, [activePath]);

  return (
    <div className="min-h-screen bg-[var(--surface)] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-[var(--surface-container)]/80 backdrop-blur border-b border-[var(--outline-variant)]">
        {/* Mobile menu */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden p-1.5 rounded-md hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="font-headline font-bold text-lg text-[var(--primary)] shrink-0"
        >
          QuantaLLM
        </Link>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--on-surface-variant)] min-w-0">
          <span>/</span>
          <Link to="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          {breadcrumb.section && (
            <>
              <span>/</span>
              <span className="truncate">{breadcrumb.section}</span>
            </>
          )}
          {breadcrumb.title && breadcrumb.title !== "Introduction" && (
            <>
              <span>/</span>
              <span className="truncate text-white">{breadcrumb.title}</span>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="hidden md:block">
          <DocsSearch />
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-[var(--outline-variant)] bg-[var(--surface-container)]">
          <DocsSidebar activePath={activePath} />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--surface-container)] border-r border-[var(--outline-variant)] lg:hidden"
              >
                <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--outline-variant)]">
                  <span className="font-headline font-bold text-[var(--primary)]">
                    Docs
                  </span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 rounded-md hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>
                <DocsSidebar
                  activePath={activePath}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-[800px] mx-auto px-6 py-10">
            <Routes>
              <Route index element={<GettingStarted />} />
              <Route path="getting-started" element={<GettingStarted />} />
              <Route path="architecture" element={<Architecture />} />
              <Route path="inference-engines" element={<InferenceEngines />} />
              <Route path="hexagon-npu" element={<HexagonNPU />} />
              <Route path="aidl-service" element={<AIDLService />} />
              <Route path="model-formats" element={<ModelFormats />} />
              <Route path="native-layer" element={<NativeLayer />} />
              <Route path="api-reference" element={<APIReference />} />
              <Route path="build-from-source" element={<BuildFromSource />} />
            </Routes>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-16 pt-6 border-t border-[var(--outline-variant)]">
              {prev ? (
                <Link
                  to={prev.path}
                  className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
                >
                  <ChevronLeft size={16} />
                  <div className="text-right">
                    <div className="text-xs text-[var(--on-surface-variant)]/60">Previous</div>
                    <div>{prev.label}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  to={next.path}
                  className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors text-right"
                >
                  <div>
                    <div className="text-xs text-[var(--on-surface-variant)]/60">Next</div>
                    <div>{next.label}</div>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Edit on GitHub */}
            {editPathMap[activePath] && (
              <div className="mt-4 flex justify-end">
                <a
                  href={`${GITHUB_BASE}/${editPathMap[activePath]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)]/60 hover:text-[var(--primary)] transition-colors"
                >
                  <Pencil size={12} />
                  Edit this page on GitHub
                </a>
              </div>
            )}
          </div>
        </main>

        {/* Right TOC placeholder (desktop only) */}
        <aside className="hidden xl:block w-[200px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] py-10 px-4 overflow-y-auto">
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}
