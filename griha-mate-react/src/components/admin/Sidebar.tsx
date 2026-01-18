import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    MapPin,
    MessageSquare,
    LogOut,
    ShieldCheck,
    Home,
    Crown
} from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Premium Members",
        href: "/admin/premium-users",
        icon: Crown,
    },
    {
        title: "Room Inventory",
        href: "/admin/properties",
        icon: Home,
    },
    {
        title: "User Feedback",
        href: "/admin/user-feedback",
        icon: MessageSquare,
    },
]

export function AdminSidebar() {
    const location = useLocation()

    return (
        <div className="flex h-full w-64 flex-col border-r border-[#E7F0FA] bg-white text-[#0D2440] shrink-0">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-105 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E5E99] text-white group-hover:bg-[#0D2440] group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-900/10">
                        <Home className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#0D2440] group-hover:text-[#2E5E99] transition-colors duration-300">GrihaMate</span>
                </Link>
            </div>
            <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                            location.pathname === item.href
                                ? "bg-[#2E5E99] text-white shadow-md shadow-blue-200"
                                : "text-[#0D2440]/70 hover:bg-[#E7F0FA] hover:text-[#2E5E99]"
                        )}
                    >
                        <item.icon className="size-5" />
                        {item.title}
                    </Link>
                ))}
            </div>
            <div className="p-4 border-t border-[#E7F0FA]">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="size-5" />
                    Logout
                </button>
            </div>
        </div>
    )
}
