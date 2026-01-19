import { useEffect, useState } from "react"
import { LandlordLayout } from "@/components/landlord/LandlordLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { propertyRequestAPI, type PropertyRequestDto } from "@/lib/api"
import { toast } from "react-toastify"
import { Check, X, MessageSquare, Calendar, User, Home, Phone, Mail, ArrowRight, ExternalLink, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function LandlordRequestsPage() {
    const [requests, setRequests] = useState<PropertyRequestDto[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<number | null>(null)

    const fetchRequests = async () => {
        try {
            const data = await propertyRequestAPI.getLandlordRequests()
            setRequests(data)
        } catch (err) {
            console.error("Failed to load requests", err)
            toast.error("Failed to load requests")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleStatusUpdate = async (id: number, status: 'ACCEPTED' | 'REJECTED') => {
        setUpdatingId(id)
        try {
            await propertyRequestAPI.updateStatus(id, status)
            toast.success(`Request ${status.toLowerCase()} successfully`)
            fetchRequests() // Refresh list
        } catch (err) {
            console.error("Failed to update status", err)
            toast.error("Failed to update request status")
        } finally {
            setUpdatingId(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-green-100 text-green-700 hover:bg-green-100'
            case 'REJECTED': return 'bg-red-100 text-red-700 hover:bg-red-100'
            case 'PAID': return 'bg-blue-100 text-blue-700 hover:bg-blue-100'
            default: return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <p>Loading requests...</p>
        </div>
    )

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0D2440]">Property Requests</h1>
                <p className="text-[#2E5E99]">Manage inquiries from potential tenants</p>
            </div>

            <div className="grid gap-6">
                {requests.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No requests received yet.</p>
                    </Card>
                ) : (
                    requests.map((request, i) => (
                        <Card key={request.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row min-h-[220px]">
                                    {/* Left Status Bar */}
                                    <div className={cn(
                                        "w-2 hidden md:block",
                                        request.status === 'PENDING' ? "bg-amber-400" :
                                            request.status === 'ACCEPTED' ? "bg-green-500" :
                                                request.status === 'PAID' ? "bg-blue-500" : "bg-gray-300"
                                    )} />

                                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-8">
                                        <div className="flex-1 space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 group cursor-pointer">
                                                    <div className="bg-primary/5 p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                                                        <Home className="size-4 text-primary" />
                                                    </div>
                                                    <span className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{request.propertyTitle}</span>
                                                </div>
                                                <Badge className={cn(getStatusColor(request.status), "border-none px-3 py-1 font-semibold tracking-wide")}>
                                                    {request.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <div className="relative group">
                                                    {request.seekerImage ? (
                                                        <img
                                                            src={request.seekerImage}
                                                            alt={request.seekerName}
                                                            className="size-16 rounded-2xl object-cover ring-2 ring-gray-50 group-hover:ring-primary/20 transition-all shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary ring-2 ring-gray-50 group-hover:ring-primary/20 transition-all shadow-sm">
                                                            <User className="size-8" />
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 border-2 border-white rounded-full" title="Active Seeker" />
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black text-[#0D2440] leading-tight">{request.seekerName}</h3>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                            <Mail className="size-3.5 text-blue-500" />
                                                            {request.seekerEmail}
                                                        </p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
                                                            <Phone className="size-3.5 text-green-500" />
                                                            {request.seekerPhone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50/50 hover:bg-gray-50 p-4 rounded-2xl border border-gray-100/50 transition-colors relative group">
                                                <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 rounded-full">
                                                    Message
                                                </div>
                                                <p className="text-sm text-gray-600 italic leading-relaxed">"{request.message}"</p>
                                                <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <Calendar className="size-3" />
                                                    Sent {new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 hover:!text-primary font-bold shadow-sm transition-all group">
                                                        View Seeker Profile
                                                        <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
                                                    <div className="bg-primary p-8 text-white text-center space-y-4">
                                                        <div className="mx-auto size-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                            {request.seekerImage ? (
                                                                <img src={request.seekerImage} alt={request.seekerName} className="size-full rounded-3xl object-cover" />
                                                            ) : (
                                                                <User className="size-12" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h2 className="text-2xl font-black">{request.seekerName}</h2>
                                                            <p className="text-primary-foreground/80 font-medium">Potential Tenant</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-8 space-y-6">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-all">
                                                                <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                                    <Mail className="size-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                                                                    <p className="font-bold text-gray-900">{request.seekerEmail}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-green-200 transition-all">
                                                                <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                                                    <Phone className="size-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
                                                                    <p className="font-bold text-gray-900">{request.seekerPhone}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                                <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                                                    <Calendar className="size-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Member Since</p>
                                                                    <p className="font-bold text-gray-900">{new Date(request.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-gray-100">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-500">Identity Status</span>
                                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Verified</Badge>
                                                            </div>
                                                        </div>

                                                        {request.status === 'PENDING' && (
                                                            <div className="flex gap-3">
                                                                <Button
                                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-md shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                                                                    disabled={updatingId === request.id}
                                                                >
                                                                    {updatingId === request.id ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 size-4 animate-spin" /> Accepting...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Check className="mr-2 size-4" /> Accept Seeker
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex-1 border-red-100 text-red-600 hover:bg-red-50 hover:!text-red-600 font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                                    disabled={updatingId === request.id}
                                                                >
                                                                    {updatingId === request.id ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 size-4 animate-spin" /> Rejecting...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <X className="mr-2 size-4" /> Reject
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {request.status === 'PENDING' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 text-white font-black shadow-lg shadow-green-100 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                        onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                                                        disabled={updatingId === request.id}
                                                    >
                                                        {updatingId === request.id ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Check className="size-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="border-red-100 text-red-500 hover:bg-red-50 hover:!text-red-600 font-black transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                        onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                        disabled={updatingId === request.id}
                                                    >
                                                        {updatingId === request.id ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <X className="size-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                            {request.status === 'ACCEPTED' && (
                                                <div className="bg-green-50 text-green-700 p-3 rounded-2xl border border-green-100 text-center space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                                                    <p className="text-xs font-bold leading-tight">Waiting for tenant to complete payment</p>
                                                </div>
                                            )}

                                            {request.status === 'PAID' && (
                                                <div className="bg-blue-50 text-blue-700 p-3 rounded-2xl border border-blue-100 text-center space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                                                    <p className="text-xs font-bold leading-tight">Payment Received • Room Booked</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
    )
}
