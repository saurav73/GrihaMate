import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI, PropertyDto } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Home,
    ShieldCheck,
    ShieldAlert,
    Eye,
    ExternalLink,
    MapPin,
    DollarSign,
    Maximize2,
    Bed,
    Bath,
    User,
    Calendar,
    CheckCircle2,
    XCircle,
    Building2,
    FileText
} from "lucide-react"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function AdminProperties() {
    const [properties, setProperties] = useState<PropertyDto[]>([])
    const [search, setSearch] = useState("")
    const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchProperties = async () => {
        try {
            setIsLoading(true)
            const data = await adminAPI.getAllProperties()
            setProperties(data)
        } catch (err) {
            toast.error("Failed to load properties")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProperties()
    }, [])

    const handleVerify = async (propertyId: number) => {
        try {
            await adminAPI.verifyProperty(propertyId)
            toast.success("Property verified successfully")
            fetchProperties()
            setIsDetailOpen(false)
        } catch (err) {
            toast.error("Failed to verify property")
        }
    }

    const handleReject = async (propertyId: number) => {
        try {
            await adminAPI.rejectProperty(propertyId)
            toast.success("Property rejected")
            fetchProperties()
            setIsDetailOpen(false)
        } catch (err) {
            toast.error("Failed to reject property")
        }
    }

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.landlordName.toLowerCase().includes(search.toLowerCase())
    )

    const pendingProperties = filteredProperties.filter(p => !p.verified)
    const verifiedProperties = filteredProperties.filter(p => p.verified)

    const openDetails = (property: PropertyDto) => {
        setSelectedProperty(property)
        setIsDetailOpen(true)
    }

    return (
        <AdminLayout>
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Room Inventory</h1>
                        <p className="text-slate-800 font-bold text-xs uppercase tracking-wide opacity-80">Oversee and validate property listings across the ecosystem</p>
                    </div>
                    <div className="relative w-full md:w-[400px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-[#2E5E99] transition-colors" />
                        <Input
                            placeholder="Search rooms, addresses, landlords..."
                            className="pl-12 h-14 bg-white/50 border-[#E7F0FA] rounded-2xl focus:ring-4 focus:ring-[#2E5E99]/5 transition-all text-sm font-medium shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="bg-blue-50/30 p-2 rounded-[32px] h-20 mb-12 flex gap-2 ring-1 ring-blue-100/50 backdrop-blur-sm">
                        <TabsTrigger
                            value="pending"
                            className="flex-1 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-900/10 data-[state=active]:text-[#2E5E99] text-slate-600 font-black uppercase tracking-widest text-[11px] transition-all duration-500 h-full flex items-center justify-center gap-3"
                        >
                            <ShieldAlert className="size-4" />
                            Pending Review
                            <Badge variant="secondary" className="bg-orange-100 text-orange-600 border-none rounded-full px-3 font-black">{pendingProperties.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="verified"
                            className="flex-1 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-900/10 data-[state=active]:text-[#2E5E99] text-slate-600 font-black uppercase tracking-widest text-[11px] transition-all duration-500 h-full flex items-center justify-center gap-3"
                        >
                            <ShieldCheck className="size-4" />
                            Verified Listings
                            <Badge variant="secondary" className="bg-blue-100 text-[#2E5E99] border-none rounded-full px-3 font-black">{verifiedProperties.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingProperties.map((property, index) => (
                                <PropertyReviewCard
                                    key={property.id}
                                    property={property}
                                    onClick={() => openDetails(property)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                            {pendingProperties.length === 0 && !isLoading && (
                                <div className="col-span-full py-40 flex flex-col items-center opacity-20">
                                    <Building2 className="size-20 mb-4" />
                                    <p className="font-black uppercase tracking-[0.3em]">No Pending Properties</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="verified" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {verifiedProperties.map((property, index) => (
                                <PropertyReviewCard
                                    key={property.id}
                                    property={property}
                                    onClick={() => openDetails(property)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                            {verifiedProperties.length === 0 && !isLoading && (
                                <div className="col-span-full py-40 flex flex-col items-center opacity-20">
                                    <Home className="size-20 mb-4" />
                                    <p className="font-black uppercase tracking-[0.3em]">No Verified Properties</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <PropertyDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    property={selectedProperty}
                    onVerify={handleVerify}
                    onReject={handleReject}
                />
            </div>
        </AdminLayout>
    )
}

            function PropertyReviewCard({property, onClick, style}: {property: PropertyDto, onClick: () => void, style?: any }) {
    return (
            <Card
                className="group overflow-hidden border-none bg-white shadow-md shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-500 rounded-[32px] cursor-pointer"
                onClick={onClick}
                style={style}
            >
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'}
                        alt={property.title}
                        className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    <div className="absolute top-4 left-4">
                        <Badge className={cn(
                            "rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-none shadow-lg",
                            property.verified ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                        )}>
                            {property.verified ? 'Verified' : 'Review Required'}
                        </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <MapPin className="size-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{property.city}</span>
                        </div>
                        <h3 className="text-lg font-black leading-tight line-clamp-1">{property.title}</h3>
                    </div>
                </div>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2E5E99]">
                                <User className="size-5" />
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Landlord</p>
                                <p className="text-xs font-black text-slate-900">{property.landlordName}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Valuation</p>
                            <p className="text-sm font-black text-[#2E5E99]">NPR {property.price.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 group-hover:border-blue-50 transition-colors">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <Bed className="size-3.5" />
                                <span className="text-xs font-bold">{property.bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <Bath className="size-3.5" />
                                <span className="text-xs font-bold">{property.bathrooms}</span>
                            </div>
                        </div>
                        <Button variant="ghost" className="size-8 rounded-full p-0 text-slate-400 group-hover:text-[#2E5E99] group-hover:bg-blue-50 transition-all">
                            <Eye className="size-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            )
}

            function PropertyDetailModal({isOpen, onClose, property, onVerify, onReject}: any) {
    if (!property) return null

            return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl p-0 overflow-hidden border-none rounded-[40px] shadow-3xl bg-white">
                    <div className="flex flex-col lg:flex-row h-full max-h-[92vh]">
                        {/* Sidebar / Info Pane */}
                        <div className="lg:w-[350px] bg-gradient-to-b from-[#F1F7FE] to-white p-8 flex flex-col border-r border-blue-50/50 overflow-y-auto custom-scrollbar shrink-0">
                            <div className="mb-8">
                                <Badge className="bg-[#2E5E99]/10 text-[#2E5E99] border-none rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-4">
                                    Asset Intelligence
                                </Badge>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{property.title}</h2>
                                <p className="text-slate-500 text-xs font-bold flex items-center gap-2 mt-2">
                                    <MapPin className="size-3.5" />
                                    {property.address}, {property.city}
                                </p>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="p-6 bg-white/50 backdrop-blur-sm rounded-[28px] border border-blue-50 shadow-sm">
                                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-4 border-b border-blue-50/50 pb-3 opacity-70">Valuation & Metrics</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Rate</p>
                                            <p className="text-sm font-black text-[#2E5E99]">NPR {property.price.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Footprint</p>
                                            <p className="text-sm font-black text-slate-900">{property.area} sq.ft</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Bedrooms</p>
                                            <p className="text-sm font-black text-slate-900">{property.bedrooms}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Bathrooms</p>
                                            <p className="text-sm font-black text-slate-900">{property.bathrooms}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-[#0D2440] text-white rounded-[28px] shadow-2xl shadow-blue-900/20">
                                    <h5 className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] mb-4">Ownership Context</h5>
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                            <User className="size-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Landlord</p>
                                            <p className="text-sm font-black text-white">{property.landlordName}</p>
                                            <p className="text-[11px] font-bold text-white/40">{property.landlordEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/50 backdrop-blur-sm rounded-[28px] border border-blue-50">
                                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-4">Registry Timeline</h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Submitted</span>
                                            <span className="text-[11px] font-black text-slate-900">{new Date(property.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Last Update</span>
                                            <span className="text-[11px] font-black text-slate-900">{new Date(property.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="w-full h-12 rounded-xl text-slate-600 hover:text-[#0D2440] font-black uppercase tracking-widest text-[10px] hover:bg-gray-50/50 transition-all"
                                >
                                    Close Inspection
                                </Button>
                            </div>
                        </div>

                        {/* Content / Document Pane */}
                        <div className="flex-1 p-10 flex flex-col h-full bg-white overflow-y-auto min-w-0">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Visual Reconnaissance</h2>
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Full resolution image catalog</p>
                                </div>
                                <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <Building2 className="size-7 text-[#2E5E99]" />
                                </div>
                            </div>

                            <div className="space-y-10 flex-1">
                                {/* Description Field */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                                        <span className="shrink-0">Description Brief</span>
                                        <div className="h-px w-full bg-gray-50" />
                                    </h5>
                                    <p className="text-sm leading-relaxed text-slate-700 font-medium">
                                        {property.description}
                                    </p>
                                </div>

                                {/* Features Component */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                                        <span className="shrink-0">Feature Matrix</span>
                                        <div className="h-px w-full bg-gray-50" />
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {property.features?.map((feature: string, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="bg-slate-50 text-slate-900 border-none rounded-lg px-3 py-1 text-[10px] font-bold">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Image Grid */}
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                                        <span className="shrink-0">Image Repository</span>
                                        <div className="h-px w-full bg-gray-50" />
                                    </h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        {property.imageUrls?.map((url: string, idx: number) => (
                                            <div key={idx} className="group relative rounded-3xl overflow-hidden aspect-[16/10] bg-slate-50 ring-1 ring-slate-100">
                                                <img src={url} alt={`Property ${idx}`} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-white flex items-center justify-center text-[#2E5E99] hover:scale-110 transition-transform">
                                                        <ExternalLink className="size-5" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {!property.verified && (
                                <div className="mt-10 p-6 bg-[#F8FAFC] rounded-[32px] flex gap-4 border border-blue-50/50">
                                    <Button
                                        className="flex-1 h-16 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-900/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95"
                                        onClick={() => onVerify(property.id)}
                                    >
                                        <CheckCircle2 className="mr-3 size-5" />
                                        Verify Listing
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 h-16 shadow-xl shadow-red-900/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95"
                                        onClick={() => onReject(property.id)}
                                    >
                                        <XCircle className="mr-3 size-5" />
                                        Reject Listing
                                    </Button>
                                </div>
                            )}

                            {property.verified && (
                                <div className="mt-10 p-6 bg-green-50 rounded-[32px] flex items-center justify-center border border-green-100">
                                    <div className="flex items-center gap-3 text-green-700">
                                        <ShieldCheck className="size-6" />
                                        <span className="font-black uppercase tracking-widest text-xs">Property Fully Verified</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            )
}
