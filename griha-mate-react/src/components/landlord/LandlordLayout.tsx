import { Outlet } from "react-router-dom"
import { LandlordSidebar } from "./Sidebar"

interface LandlordLayoutProps {
    children?: React.ReactNode
}

export function LandlordLayout({ children }: LandlordLayoutProps) {
    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <div className="flex-shrink-0">
                <LandlordSidebar />
            </div>
            <main className="flex-1 overflow-y-auto relative">
                <div className="container mx-auto p-8">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    )
}
