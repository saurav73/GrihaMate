import { AdminSidebar } from "./Sidebar"

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="container mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
