import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Search, Users, Clock } from "lucide-react"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldAlert, ShieldCheck as ShieldCheckIcon, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminUsers() {
    const navigate = useNavigate()
    const [users, setUsers] = useState<any[]>([])
    const [search, setSearch] = useState("")

    const fetchUsers = async () => {
        try {
            const data = await adminAPI.getAllUsers()
            setUsers(data)
        } catch (err: any) {
            toast.error("Failed to load users")
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const filteredUsers = users.filter(u =>
    (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
    )

    const landlords = filteredUsers.filter(u => u.role === 'LANDLORD')
    const seekers = filteredUsers.filter(u => u.role === 'SEEKER')

    const openDetails = (user: any) => {
        navigate(`/admin/users/${user.id}`)
    }

    return (
        <AdminLayout>
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personnel Registry</h1>
                        <p className="text-slate-800 font-bold text-xs uppercase tracking-wide opacity-80">Authorize and manage the GrihaMate community ecosystem</p>
                    </div>
                    <div className="relative w-full md:w-[400px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-[#2E5E99] transition-colors" />
                        <Input
                            placeholder="Filter by name or identity..."
                            className="pl-12 h-14 bg-white/50 border-[#E7F0FA] rounded-2xl focus:ring-4 focus:ring-[#2E5E99]/5 transition-all text-sm font-medium shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="seekers" className="w-full">
                    <TabsList className="bg-blue-50/30 p-2 rounded-[32px] h-20 mb-12 flex gap-2 ring-1 ring-blue-100/50 backdrop-blur-sm">
                        <TabsTrigger
                            value="seekers"
                            className="flex-1 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-900/10 data-[state=active]:text-[#2E5E99] text-slate-600 font-black uppercase tracking-widest text-[11px] transition-all duration-500 h-full flex items-center justify-center gap-3"
                        >
                            <Users className="size-4" />
                            Room Seekers
                            <Badge variant="secondary" className="bg-blue-100 text-[#2E5E99] border-none rounded-full px-3 font-black">{seekers.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="landlords"
                            className="flex-1 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-900/10 data-[state=active]:text-[#2E5E99] text-slate-600 font-black uppercase tracking-widest text-[11px] transition-all duration-500 h-full flex items-center justify-center gap-3"
                        >
                            <ShieldCheckIcon className="size-4" />
                            Property Landlords
                            <Badge variant="secondary" className="bg-blue-100 text-[#2E5E99] border-none rounded-full px-3 font-black">{landlords.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="seekers" className="mt-0 focus-visible:outline-none">
                        <div className="grid gap-5">
                            {seekers.map((user, index) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onOpenDetails={() => openDetails(user)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                            {seekers.length === 0 && (
                                <div className="py-40 flex flex-col items-center opacity-20">
                                    <Users className="size-20 mb-4" />
                                    <p className="font-black uppercase tracking-[0.3em]">No Seekers Found</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="landlords" className="mt-0 focus-visible:outline-none">
                        <div className="grid gap-5">
                            {landlords.map((user, index) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onOpenDetails={() => openDetails(user)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                            {landlords.length === 0 && (
                                <div className="py-40 flex flex-col items-center opacity-20">
                                    <ShieldCheckIcon className="size-20 mb-4" />
                                    <p className="font-black uppercase tracking-[0.3em]">No Landlords Found</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    )
}

            function UserCard({user, onOpenDetails, style}: any) {
    return (
            <Card className="bg-white shadow-md shadow-blue-900/5 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-700 rounded-2xl group overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-2" style={style}>
                <CardContent className="p-5 flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative shrink-0">
                            <div className="size-14 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-700 font-black text-lg group-hover:rotate-6 transition-transform duration-700 shadow-inner overflow-hidden border-2 border-white">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="" className="size-full object-cover" />
                                ) : (
                                    user.fullName[0].toUpperCase()
                                )}
                            </div>
                            <div className={cn(
                                "absolute -bottom-1 -right-0.5 size-4.5 rounded-full border-2 border-white shadow-sm",
                                user.verificationStatus === 'VERIFIED' ? "bg-green-500" : user.verificationStatus === 'REJECTED' ? "bg-red-500" : "bg-orange-500"
                            )} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-0.5">
                                <h4 className="font-black text-slate-900 text-lg group-hover:text-[#2E5E99] transition-colors truncate">{user.fullName}</h4>
                                {user.subscriptionStatus === 'PREMIUM' && (
                                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-none rounded-full px-2 py-0 text-[7px] uppercase font-black tracking-widest shadow-sm">Premium</Badge>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-700 font-black flex items-center gap-2">
                                <span className="truncate">{user.email}</span>
                                <span className="size-0.5 rounded-full bg-slate-400" />
                                <span className="shrink-0 text-slate-900/60 uppercase tracking-tighter">{user.role}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-slate-800 font-black mb-1.5 opacity-60">Identity Status</p>
                            {user.verificationStatus === 'VERIFIED' ? (
                                <div className="flex items-center gap-1.5 text-green-700 font-black bg-green-50 px-3 py-1.5 rounded-lg ring-1 ring-green-100 shadow-sm">
                                    <CheckCircle2 className="size-3" />
                                    <span className="text-[9px] uppercase tracking-wider">Verified</span>
                                </div>
                            ) : user.verificationStatus === 'REJECTED' ? (
                                <div className="flex items-center gap-1.5 text-red-700 font-black bg-red-50 px-3 py-1.5 rounded-lg ring-1 ring-red-100 shadow-sm">
                                    <ShieldAlert className="size-3" />
                                    <span className="text-[9px] uppercase tracking-wider">Rejected</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-orange-700 font-black bg-orange-50 px-3 py-1.5 rounded-lg ring-1 ring-orange-100 shadow-sm">
                                    <Clock className="size-3" />
                                    <span className="text-[9px] uppercase tracking-wider">Pending</span>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            className="rounded-lg h-9 px-5 bg-slate-50 hover:bg-[#2E5E99] hover:text-white transition-all duration-500 text-slate-600 font-black uppercase tracking-widest text-[8px] shadow-sm group/btn active:scale-95 shrink-0 border border-gray-100"
                            onClick={onOpenDetails}
                        >
                            View Profile
                            <ExternalLink className="ml-1.5 size-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            )
}
