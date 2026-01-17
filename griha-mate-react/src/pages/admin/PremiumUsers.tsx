import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Mail, ExternalLink, Crown } from "lucide-react"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function PremiumUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchPremiumUsers = async () => {
        try {
            setLoading(true)
            const data = await adminAPI.getPremiumUsers()
            setUsers(data)
        } catch (err: any) {
            toast.error("Failed to load premium users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPremiumUsers()
    }, [])

    const filteredUsers = users.filter(u =>
    (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <AdminLayout>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-amber-200">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Premium Landlords</h1>
                            <Crown className="size-6 text-amber-500 animate-pulse" />
                        </div>
                        <p className="text-amber-800 font-bold text-xs uppercase tracking-wide opacity-80">Managing verified high-value members of the ecosystem</p>
                    </div>
                    <div className="relative w-full md:w-[400px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                            placeholder="Find premium landlord..."
                            className="pl-12 h-14 bg-white/50 border-amber-100 rounded-2xl focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                            <p className="mt-4 text-amber-600 font-bold uppercase tracking-widest text-xs">Accessing Premium Registry...</p>
                        </div>
                    ) : (
                        <>
                            {filteredUsers.map((user, index) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onOpenDetails={() => navigate(`/admin/premium-users/${user.id}`)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="py-40 flex flex-col items-center opacity-20">
                                    <Crown className="size-20 mb-4" />
                                    <p className="font-black uppercase tracking-[0.3em]">No Premium Users Found</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

function UserCard({ user, onOpenDetails, style }: any) {
    return (
        <Card className="bg-white shadow-xl shadow-amber-900/5 hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-700 rounded-2xl group overflow-hidden border border-amber-50 animate-in fade-in slide-in-from-bottom-2" style={style}>
            <CardContent className="p-6 flex flex-col lg:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="relative shrink-0">
                        <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-amber-700 font-black text-xl group-hover:scale-110 transition-transform duration-700 shadow-inner overflow-hidden border-2 border-white">
                            {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="" className="size-full object-cover" />
                            ) : (
                                user.fullName[0].toUpperCase()
                            )}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                            <Crown className="size-3" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-slate-900 text-xl group-hover:text-amber-600 transition-colors truncate">{user.fullName}</h4>
                            <Badge className="bg-amber-100 text-amber-700 border-none rounded-full px-3 py-0.5 text-[8px] uppercase font-black tracking-widest shadow-sm">Premium</Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                <Mail className="size-3" /> {user.email}
                            </p>
                            <p className="text-xs text-amber-600 font-black flex items-center gap-2">
                                <Clock className="size-3" /> Expires: {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                    <Button
                        variant="ghost"
                        className="rounded-xl h-11 px-6 bg-amber-50 hover:bg-amber-500 hover:text-white transition-all duration-500 text-amber-700 font-black uppercase tracking-widest text-[9px] shadow-sm group/btn active:scale-95 border border-amber-100"
                        onClick={onOpenDetails}
                    >
                        Review Member
                        <ExternalLink className="ml-2 size-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

