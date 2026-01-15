import { LandlordSidebar } from "./Sidebar"

interface LandlordLayoutProps {
    children: React.ReactNode
}

export function LandlordLayout({ children }: LandlordLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <LandlordSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
