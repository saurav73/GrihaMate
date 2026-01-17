import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    MapPin,
    Settings,
    LogOut,
    ShieldCheck,
    Home
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
        title: "Room Inventory",
        href: "/admin/properties",
        icon: Home,
    },
    {
        title: "Room Requests",
        href: "/admin/requests",
        icon: MapPin,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]

export function AdminSidebar() {
    const location = useLocation()

    return (
        <div className="flex h-full w-64 flex-col border-r border-[#E7F0FA] bg-white text-[#0D2440]">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-[#2E5E99]">
                    <ShieldCheck className="size-6" />
                    <span>GrihaMate</span>
                </Link>
            </div>
            <div className="flex-1 px-4 py-2 space-y-2">
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
