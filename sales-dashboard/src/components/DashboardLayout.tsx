import { SidebarNav } from "./SidebarNav";
import { MobileSidebar } from "./MobileSidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r p-4">
        <div className="mb-8 font-bold text-lg">My Dashboard</div>
        <SidebarNav />
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden mb-4">
          <MobileSidebar />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
