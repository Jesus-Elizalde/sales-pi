import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/products", label: "Products" },
  { to: "/batches", label: "Batches" },
  { to: "/inventory", label: "Inventory" },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-2 mt-8">
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={`rounded px-3 py-2 text-sm font-medium transition-colors
            ${location.pathname.startsWith(link.to)
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-blue-100"}
          `}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}