import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Search, Users, Clock, Mail, Phone } from "lucide-react"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FileText, ExternalLink, ShieldAlert, ShieldCheck as ShieldCheckIcon } from "lucide-react"

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

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

    const handleVerify = async (userId: number) => {
        try {
            await adminAPI.verifyUser(userId)
            toast.success("User verified")
            fetchUsers()
        } catch (err) {
            toast.error("Failed to verify user")
        }
    }

    const handleReject = async (userId: number) => {
        try {
            await adminAPI.rejectUser(userId)
            toast.success("User rejected")
            fetchUsers()
        } catch (err) {
            toast.error("Failed to reject user")
        }
    }

    const filteredUsers = users.filter(u =>
    (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
    )

    const landlords = filteredUsers.filter(u => u.role === 'LANDLORD')
    const seekers = filteredUsers.filter(u => u.role === 'SEEKER')

    const openDetails = (user: any) => {
        setSelectedUser(user)
        setIsDetailOpen(true)
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

                <UserDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    user={selectedUser}
                    onVerify={handleVerify}
                    onReject={handleReject}
                />
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

            function UserDetailModal({isOpen, onClose, user, onVerify, onReject}: any) {
    if (!user) return null

            return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl p-0 overflow-hidden border-none rounded-[40px] shadow-3xl bg-white">
                    <div className="flex flex-col lg:flex-row h-full max-h-[92vh]">
                        {/* Sidebar / Info Pane */}
                        <div className="lg:w-[320px] bg-gradient-to-b from-[#F1F7FE] to-white p-8 flex flex-col items-center border-r border-blue-50/50 overflow-y-auto custom-scrollbar shrink-0">
                            <div className="size-28 rounded-[40px] bg-white p-2 shadow-2xl shadow-blue-900/10 mb-6 border-4 border-blue-50/30">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="" className="size-full rounded-[32px] object-cover" />
                                ) : (
                                    <div className="size-full rounded-[44px] bg-[#2E5E99]/5 flex items-center justify-center text-[#2E5E99] text-5xl font-black">
                                        {user.fullName[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-black text-[#0D2440] mb-1 text-center leading-tight">{user.fullName}</h3>
                            <Badge className={cn(
                                "mb-8 rounded-full px-5 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase border-none shadow-sm",
                                user.role === 'LANDLORD' ? "bg-[#2E5E99] text-white" : "bg-orange-500 text-white"
                            )}>
                                {user.role}
                            </Badge>

                            <div className="w-full space-y-4">
                                <div className="p-6 bg-white/50 backdrop-blur-sm rounded-[28px] border border-blue-50 shadow-sm">
                                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-4 border-b border-blue-50/50 pb-3 opacity-70">Personnel Intel</h5>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="size-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#2E5E99] shrink-0">
                                                <Mail className="size-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mb-0.5">Electronic Mail</p>
                                                <p className="text-xs font-black text-[#0D2440] truncate max-w-full" title={user.email}>{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="size-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#2E5E99] shrink-0">
                                                <Phone className="size-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mb-0.5">Contact String</p>
                                                <p className="text-xs font-black text-[#0D2440]">{user.phoneNumber || 'NOT PROVIDED'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {user.citizenshipNumber && (
                                    <div className="p-6 bg-[#0D2440] text-white rounded-[28px] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <ShieldCheckIcon className="size-10" />
                                        </div>
                                        <h5 className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] mb-3">Registry Key</h5>
                                        <div>
                                            <p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-0.5">Citizen ID</p>
                                            <p className="text-xl font-black tracking-[0.15em] font-mono">{user.citizenshipNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 w-full pt-6 border-t border-blue-50/50">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="w-full h-12 rounded-xl text-slate-600 hover:text-[#0D2440] font-black uppercase tracking-widest text-[10px] hover:bg-gray-50/50 transition-all"
                                >
                                    Dismiss Profile
                                </Button>
                            </div>
                        </div>

                        {/* Content / Document Pane */}
                        <div className="flex-1 p-8 flex flex-col h-full bg-white overflow-y-auto min-w-0">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-[#0D2440] tracking-tighter">Verification Assets</h2>
                                    <p className="text-slate-800 font-black text-[9px] uppercase tracking-[0.2em] mt-1 opacity-70">Authenticated System Registry Documents</p>
                                </div>
                                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                                    <ShieldCheckIcon className="size-6 text-[#2E5E99]" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-8">
                                {user.role === 'LANDLORD' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-px flex-1 bg-gray-100" />
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] shrink-0">KYC CORE SUBMISSION</h5>
                                            <div className="h-px flex-1 bg-gray-100" />
                                        </div>
                                        <DocumentCard title={`${user.kycDocumentType || 'Business'} ID`} url={user.kycDocumentUrl} />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-8">
                                        {user.citizenshipFrontUrl && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-px flex-1 bg-gray-100" />
                                                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] shrink-0 opacity-60">GOVERNMENT ID • FRONT</h5>
                                                    <div className="h-px flex-1 bg-gray-100" />
                                                </div>
                                                <DocumentCard title="Citizenship Front" url={user.citizenshipFrontUrl} />
                                            </div>
                                        )}
                                        {user.citizenshipBackUrl && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-px flex-1 bg-gray-100" />
                                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] shrink-0">GOVERNMENT ID • BACK</h5>
                                                    <div className="h-px flex-1 bg-gray-100" />
                                                </div>
                                                <DocumentCard title="Citizenship Back" url={user.citizenshipBackUrl} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(!user.kycDocumentUrl && !user.citizenshipFrontUrl) && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-[32px] border-2 border-dashed border-gray-100 text-gray-200">
                                        <FileText className="size-12 opacity-20 mb-4" />
                                        <p className="font-black uppercase tracking-[0.3em] text-[10px]">AWAITING CLOUD ASSETS</p>
                                        <p className="text-[9px] font-bold mt-1 opacity-50">DOCUMENT REPOSITORY IS EMPTY</p>
                                    </div>
                                )}
                            </div>

                            {user.verificationStatus === 'PENDING' && (
                                <div className="mt-8 p-6 bg-[#F8FAFC] rounded-[32px] flex gap-4 border border-blue-50/50 shadow-inner">
                                    <Button
                                        className="flex-1 h-12 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-900/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
                                        onClick={() => { onVerify(user.id); onClose(); }}
                                    >
                                        <CheckCircle2 className="mr-2 size-4" />
                                        Authorize
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 h-12 shadow-xl shadow-red-900/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
                                        onClick={() => { onReject(user.id); onClose(); }}
                                    >
                                        <ShieldAlert className="mr-2 size-4" />
                                        Decline
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            )
}

            function DocumentCard({title, url}: {title: string, url?: string }) {
    if (!url) return null

            return (
            <div className="group relative rounded-[32px] overflow-hidden bg-[#F8FAFC] shadow-inner ring-1 ring-black/5 hover:ring-[#2E5E99]/20 transition-all duration-500">
                <div className="aspect-[16/10] flex items-center justify-center p-4 bg-gray-900/5">
                    <img
                        src={url}
                        alt={title}
                        className="max-h-full max-w-full object-contain group-hover:scale-[1.02] transition-transform duration-700 ease-out shadow-2xl rounded-xl"
                    />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-full flex items-center justify-between">
                        <div>
                            <p className="text-white text-[9px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
                            <h6 className="text-white/60 text-[10px] font-bold tracking-tight">Full resolution verification asset</h6>
                        </div>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-10 rounded-xl bg-white flex items-center justify-center text-[#2E5E99] hover:bg-[#2E5E99] hover:text-white transition-all duration-300"
                        >
                            <ExternalLink className="size-4" />
                        </a>
                    </div>
                </div>
            </div>
            )
}

            function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
