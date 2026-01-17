import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI, roomRequestAPI, type RoomRequestDto, type PropertyRequestDto } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Phone, Mail, Building2, User, Calendar, DollarSign, MessageSquare } from "lucide-react"

export default function AdminRequests() {
    const [roomRequests, setRoomRequests] = useState<RoomRequestDto[]>([])
    const [propertyInquiries, setPropertyInquiries] = useState<PropertyRequestDto[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rooms, inquiries] = await Promise.all([
                    roomRequestAPI.getAll(),
                    adminAPI.getAllPropertyRequests()
                ])
                setRoomRequests(rooms)
                setPropertyInquiries(inquiries)
            } catch (e) {
                console.error("Failed to fetch requests", e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Inquiries</h1>
                        <p className="text-slate-800 font-bold text-xs uppercase tracking-wide opacity-80">Orchestrate live seeker requests and property inquiries</p>
                    </div>
                </div>

                <Tabs defaultValue="rooms" className="w-full">
                    <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-12 p-0 w-full justify-start gap-8">
                        <TabsTrigger value="rooms" className="data-[state=active]:border-b-2 data-[state=active]:border-[#2E5E99] rounded-none bg-transparent px-2 font-black text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 shadow-none">
                            Room Requests ({roomRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="property" className="data-[state=active]:border-b-2 data-[state=active]:border-[#2E5E99] rounded-none bg-transparent px-2 font-black text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 shadow-none">
                            Property Inquiries ({propertyInquiries.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="rooms" className="mt-8">
                        <div className="grid gap-6">
                            {roomRequests.map((request, index) => (
                                <RoomRequestCard key={request.id} request={request} index={index} />
                            ))}
                            {roomRequests.length === 0 && <EmptyState message="No active room requests found" />}
                        </div>
                    </TabsContent>

                    <TabsContent value="property" className="mt-8">
                        <div className="grid gap-6">
                            {propertyInquiries.map((inquiry, index) => (
                                <PropertyInquiryCard key={inquiry.id} inquiry={inquiry} index={index} />
                            ))}
                            {propertyInquiries.length === 0 && <EmptyState message="No property inquiries found" />}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    )
}

function RoomRequestCard({ request, index }: { request: RoomRequestDto, index: number }) {
    return (
        <Card className="border-none bg-white shadow-md shadow-blue-900/5 hover:shadow-lg transition-all duration-500 rounded-2xl group overflow-hidden border border-gray-100 animate-in fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 font-black text-lg border border-gray-100">
                                {request.seekerName?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-0.5">
                                    <h3 className="text-lg font-black text-slate-900 truncate">
                                        {request.seekerName}
                                    </h3>
                                    <Badge className={cn(
                                        "rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-widest border-none",
                                        request.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {request.active ? "Active" : "Closed"}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[10px] font-black">
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <Mail className="size-3 text-slate-500" />
                                        {request.seekerEmail}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <Phone className="size-3 text-slate-500" />
                                        {request.seekerPhone}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <MapPin className="size-3 text-[#2E5E99]" />
                                        {request.city}, {request.district}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest opacity-60">Pricing</p>
                                <p className="text-sm font-black text-slate-900">Rs. {request.minPrice} - {request.maxPrice}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest opacity-60">Timeline</p>
                                <p className="text-sm font-black text-slate-900">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest opacity-60">Property Type</p>
                                <p className="text-sm font-black text-slate-900">{request.propertyType}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest opacity-60">Bedrooms</p>
                                <p className="text-sm font-black text-slate-900">{request.minBedrooms} - {request.maxBedrooms}</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-48 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                        <div className="space-y-1 mb-4">
                            <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest opacity-60">Requirements</p>
                            <p className="text-[11px] font-black text-slate-700 line-clamp-3 italic leading-relaxed">
                                "{request.additionalRequirements || 'No specific preferences mentioned...'}"
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function PropertyInquiryCard({ inquiry, index }: { inquiry: PropertyRequestDto, index: number }) {
    return (
        <Card className="border-none bg-white shadow-md shadow-blue-900/5 hover:shadow-lg transition-all duration-500 rounded-2xl group overflow-hidden border border-gray-100 animate-in fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2E5E99] border border-blue-100 overflow-hidden">
                                {inquiry.propertyImage ? (
                                    <img src={inquiry.propertyImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="size-6" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-0.5">
                                    <h3 className="text-lg font-black text-slate-900 truncate">
                                        {inquiry.propertyTitle}
                                    </h3>
                                    <Badge className={cn(
                                        "rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-widest border-none",
                                        inquiry.status === 'PAID' ? "bg-green-100 text-green-700" :
                                            inquiry.status === 'ACCEPTED' ? "bg-blue-100 text-blue-700" :
                                                inquiry.status === 'REJECTED' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {inquiry.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[10px] font-black">
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <User className="size-3 text-slate-500" />
                                        {inquiry.seekerName}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <Mail className="size-3 text-slate-500" />
                                        {inquiry.seekerEmail}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#2E5E99]">
                                        <DollarSign className="size-3" />
                                        Rs. {inquiry.propertyPrice}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex gap-3">
                                <MessageSquare className="size-4 text-slate-400 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest opacity-60">Seeker Message</p>
                                    <p className="text-[11px] font-black text-slate-700 italic leading-relaxed">
                                        "{inquiry.message || 'No message provided...'}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-48 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                        <div className="space-y-1 text-center lg:text-left">
                            <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest opacity-60">Submitted On</p>
                            <p className="text-xs font-black text-slate-900">
                                <Calendar className="inline size-3 mr-1 mb-0.5 text-slate-400" />
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-sm rounded-[40px] border border-dashed border-blue-100">
            <div className="size-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-200 mb-6">
                <MapPin className="size-8" />
            </div>
            <h3 className="text-xl font-black text-[#0D2440]/30 tracking-tight uppercase tracking-[0.2em]">Silence in the city</h3>
            <p className="text-gray-400 mt-2 font-bold text-sm">{message}</p>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
