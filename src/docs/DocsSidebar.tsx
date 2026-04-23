import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DocsSidebarProps {
  activePath: string;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", path: "/docs" },
      { label: "Installation", path: "/docs/getting-started" },
    ],
  },
  {
    title: "Architecture",
    items: [
      { label: "Overview", path: "/docs/architecture" },
      { label: "Inference Engines", path: "/docs/inference-engines" },
    ],
  },
  {
    title: "Hardware",
    items: [
      { label: "Hexagon NPU", path: "/docs/hexagon-npu" },
      { label: "ARM64 Optimization", path: "/docs/native-layer" },
    ],
  },
  {
    title: "Integration",
    items: [
      { label: "AIDL Service", path: "/docs/aidl-service" },
      { label: "Model Formats", path: "/docs/model-formats" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "API Reference", path: "/docs/api-reference" },
      { label: "Build from Source", path: "/docs/build-from-source" },
    ],
  },
];

export default function DocsSidebar({ activePath, onNavigate }: DocsSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => {
      initial[s.title] = s.items.some((item) => item.path === activePath);
    });
    // Default open first section if nothing matched
    if (!Object.values(initial).some(Boolean)) {
      initial[sections[0].title] = true;
    }
    return initial;
  });

  const toggle = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <nav className="py-4 px-3 h-full overflow-y-auto">
      {sections.map((section) => (
        <div key={section.title} className="mb-1">
          <button
            onClick={() => toggle(section.title)}
            className="flex items-center gap-1.5 w-full px-2 py-2 text-sm font-headline font-semibold text-[var(--on-surface-variant)] hover:text-white transition-colors rounded-md"
          >
            <motion.span
              animate={{ rotate: expanded[section.title] ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="inline-flex"
            >
              <ChevronRight size={14} />
            </motion.span>
            {section.title}
          </button>

          <AnimatePresence initial={false}>
            {expanded[section.title] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ul className="ml-4 border-l border-[var(--outline-variant)] pl-0">
                  {section.items.map((item) => {
                    const isActive = activePath === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={onNavigate}
                          className={`block pl-4 py-1.5 text-sm transition-colors ${
                            isActive
                              ? "text-[var(--primary)] border-l-2 border-[var(--primary)] -ml-px font-medium"
                              : "text-[var(--on-surface-variant)] hover:text-white"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
}

export { sections };
export type { NavItem, NavSection };
