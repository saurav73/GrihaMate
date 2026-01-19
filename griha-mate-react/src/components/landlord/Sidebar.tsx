import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Home,
    PlusCircle,
    User,
    LogOut,
    MessageSquare
} from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard/landlord",
        icon: LayoutDashboard,
    },
    {
        title: "My Properties",
        href: "/dashboard/landlord/manage-properties",
        icon: Home,
    },
    {
        title: "Add Property",
        href: "/dashboard/landlord/list-property",
        icon: PlusCircle,
    },
    {
        title: "Requests",
        href: "/dashboard/landlord/requests",
        icon: MessageSquare,
    },
    {
        title: "Profile",
        href: "/dashboard/landlord/profile",
        icon: User,
    },
]

export function LandlordSidebar() {
    const location = useLocation()

    return (
        <div className="flex h-full w-64 flex-col border-r border-[#E7F0FA] bg-white text-[#0D2440]">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-3 transition-all duration-300 hover:opacity-90 hover:scale-105 group">
                    <img 
                        src="/logo.png" 
                        alt="GrihaMate Logo" 
                        className="h-14 w-14 object-contain transition-all duration-300 group-hover:scale-110"
                    />
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#2E5E99] via-[#1E4A7E] to-[#2E5E99] bg-clip-text text-transparent group-hover:from-[#3D6BA8] group-hover:via-[#2E5E99] group-hover:to-[#3D6BA8] transition-all duration-300">GrihaMate</span>
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
