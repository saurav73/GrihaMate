import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI, type PropertyDto } from "@/lib/api"
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
import { Pagination } from "@/components/Pagination"
import { cn } from "@/lib/utils"

export default function AdminProperties() {
    const navigate = useNavigate()
    const [properties, setProperties] = useState<PropertyDto[]>([])
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [pendingPage, setPendingPage] = useState(1)
    const [verifiedPage, setVerifiedPage] = useState(1)
    const itemsPerPage = 6

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

    // Reset pagination when search changes
    useEffect(() => {
        setPendingPage(1)
        setVerifiedPage(1)
    }, [search])

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.landlordName.toLowerCase().includes(search.toLowerCase())
    )

    const pendingProperties = filteredProperties.filter(p => !p.verified)
    const verifiedProperties = filteredProperties.filter(p => p.verified)

    // Pagination calculations
    const pendingTotalPages = Math.ceil(pendingProperties.length / itemsPerPage)
    const pendingPaginated = pendingProperties.slice(
        (pendingPage - 1) * itemsPerPage,
        pendingPage * itemsPerPage
    )

    const verifiedTotalPages = Math.ceil(verifiedProperties.length / itemsPerPage)
    const verifiedPaginated = verifiedProperties.slice(
        (verifiedPage - 1) * itemsPerPage,
        verifiedPage * itemsPerPage
    )

    const openDetails = (property: PropertyDto) => {
        navigate(`/admin/properties/${property.id}`)
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
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingPaginated.map((property, index) => (
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
                            {pendingProperties.length > 0 && (
                                <Pagination
                                    currentPage={pendingPage}
                                    totalPages={pendingTotalPages}
                                    totalItems={pendingProperties.length}
                                    pageSize={itemsPerPage}
                                    onPageChange={setPendingPage}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="verified" className="mt-0 focus-visible:outline-none">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {verifiedPaginated.map((property, index) => (
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
                            {verifiedProperties.length > 0 && (
                                <Pagination
                                    currentPage={verifiedPage}
                                    totalPages={verifiedTotalPages}
                                    totalItems={verifiedProperties.length}
                                    pageSize={itemsPerPage}
                                    onPageChange={setVerifiedPage}
                                />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
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
