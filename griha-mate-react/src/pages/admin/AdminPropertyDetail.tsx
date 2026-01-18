import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI, type PropertyDto } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowLeft,
    MapPin,
    Bed,
    Bath,
    Square,
    Calendar,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Building2,
    User,
    Mail,
    Phone,
    DollarSign,
    ExternalLink,
    Image as ImageIcon,
    Maximize2,
    Share2
} from "lucide-react"
import { toast } from "react-toastify"
import { cn } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminPropertyDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [property, setProperty] = useState<PropertyDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [showVirtualTour, setShowVirtualTour] = useState(false)
    const [showVerifyDialog, setShowVerifyDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)

    const fetchProperty = async () => {
        if (!id) return
        try {
            setLoading(true)
            const properties = await adminAPI.getAllProperties()
            const foundProperty = properties.find(p => p.id === parseInt(id))
            if (!foundProperty) {
                toast.error("Property not found")
                navigate("/admin/properties")
                return
            }
            setProperty(foundProperty)
        } catch (err: any) {
            toast.error("Failed to load property details")
            navigate("/admin/properties")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProperty()
    }, [id, navigate])

    const handleVerify = async () => {
        setShowVerifyDialog(false)
        if (!property) return
        try {
            await adminAPI.verifyProperty(property.id)
            toast.success("Property verified successfully")
            fetchProperty()
        } catch (err) {
            toast.error("Failed to verify property")
        }
    }

    const handleReject = async () => {
        setShowRejectDialog(false)
        if (!property) return
        try {
            await adminAPI.rejectProperty(property.id)
            toast.success("Property rejected")
            fetchProperty()
        } catch (err) {
            toast.error("Failed to reject property")
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!property) return null

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/properties")}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Inventory
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero Image */}
                        <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
                            <div className="relative h-64 bg-gray-100">
                                <img
                                    src={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className={cn(
                                        "rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest border-none shadow-lg",
                                        property.verified ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                                    )}>
                                        {property.verified ? 'Verified' : 'Review Required'}
                                    </Badge>
                                </div>
                            </div>
                        </Card>

                        {/* Property Details */}
                        <Card className="border-none shadow-lg rounded-3xl">
                            <CardContent className="p-8">
                                <h1 className="text-3xl font-black text-slate-900 mb-4">{property.title}</h1>
                                <div className="flex items-center gap-2 text-slate-600 mb-6">
                                    <MapPin className="size-4" />
                                    <span className="text-sm">{property.address}, {property.city}, {property.district}</span>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">Description</h3>
                                    <p className="text-slate-700 leading-relaxed">{property.description}</p>
                                </div>

                                {/* Features */}
                                {property.features && property.features.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">Features</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {property.features.map((feature, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-900 border-none rounded-lg px-4 py-1.5 text-sm font-bold">
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 360° Virtual Tour */}
                                {property.virtualTourUrl && (
                                    <div className="mb-6">
                                        <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
                                            <CardContent className="p-0">
                                                <div className="relative">
                                                    <div className="bg-[#1C3B6F] p-6 text-white">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-xl font-bold mb-1 flex items-center gap-3">
                                                                    <Maximize2 className="size-5 rotate-45" />
                                                                    360° Virtual Tour
                                                                </h3>
                                                                <p className="text-blue-100/80 text-sm">
                                                                    Explore every corner from anywhere
                                                                </p>
                                                            </div>
                                                            <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-3 py-1 rounded-full backdrop-blur-md">
                                                                Live 360°
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="aspect-[21/9] bg-slate-900 relative">
                                                        {showVirtualTour ? (
                                                            <iframe
                                                                src={property.virtualTourUrl}
                                                                className="w-full h-full"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                                title="360° Virtual Tour"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1C3B6F]/95 to-[#0D2440]/95">
                                                                <div className="text-center space-y-4">
                                                                    <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 animate-pulse">
                                                                        <Maximize2 className="size-8 text-white rotate-45" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <h3 className="text-white text-xl font-bold">
                                                                            Immersive 360° Experience
                                                                        </h3>
                                                                        <p className="text-blue-100/70 text-sm">
                                                                            Walk through the property virtually
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        size="lg"
                                                                        className="bg-white text-[#1C3B6F] hover:bg-blue-50 rounded-full px-6 h-10 font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
                                                                        onClick={() => setShowVirtualTour(true)}
                                                                    >
                                                                        <Share2 className="mr-2 size-4" />
                                                                        Launch Virtual Tour
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 bg-white border-t border-slate-100">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-4 text-slate-500 font-medium">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="size-1.5 rounded-full bg-[#1C3B6F]" />
                                                                    High-definition panoramas
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="size-1.5 rounded-full bg-[#1C3B6F]" />
                                                                    Interactive navigation
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="size-1.5 rounded-full bg-[#1C3B6F]" />
                                                                    Room-to-room walkthrough
                                                                </div>
                                                            </div>
                                                            {showVirtualTour && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-[#1C3B6F] font-bold hover:bg-blue-50 rounded-full text-xs"
                                                                    onClick={() => window.open(property.virtualTourUrl, '_blank')}
                                                                >
                                                                    <ExternalLink className="mr-1 size-3" />
                                                                    Open in new tab
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Image Gallery */}
                                {property.imageUrls && property.imageUrls.length > 1 && (
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">Image Gallery</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {property.imageUrls.slice(1).map((url, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                                                    <img src={url} alt={`Property ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="size-10 rounded-xl bg-white flex items-center justify-center text-primary hover:scale-110 transition-transform">
                                                            <ExternalLink className="size-5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card className="border-none shadow-lg rounded-3xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-4">Property Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-white flex items-center justify-center">
                                                <DollarSign className="size-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Monthly Rent</p>
                                                <p className="text-xl font-black text-slate-900">Rs. {property.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bed className="size-4 text-slate-600" />
                                                <span className="text-xs text-slate-600 font-bold uppercase">Bedrooms</span>
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">{property.bedrooms}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bath className="size-4 text-slate-600" />
                                                <span className="text-xs text-slate-600 font-bold uppercase">Bathrooms</span>
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">{property.bathrooms}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Square className="size-4 text-slate-600" />
                                            <span className="text-xs text-slate-600 font-bold uppercase">Area</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{property.area} sq.ft</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-900 border-none">{property.propertyType}</Badge>
                                            <Badge variant="secondary" className={cn(
                                                "border-none",
                                                property.status === 'AVAILABLE' ? "bg-green-100 text-green-900" :
                                                property.status === 'RENTED' ? "bg-orange-100 text-orange-900" :
                                                "bg-gray-100 text-gray-900"
                                            )}>
                                                {property.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Landlord Info */}
                        <Card className="border-none shadow-lg rounded-3xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-4">Landlord Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                                        <div className="size-12 rounded-xl bg-white flex items-center justify-center">
                                            <User className="size-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Name</p>
                                            <p className="text-sm font-black text-slate-900">{property.landlordName}</p>
                                        </div>
                                    </div>
                                    {property.landlordEmail && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Mail className="size-4" />
                                            <span className="text-sm">{property.landlordEmail}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="border-none shadow-lg rounded-3xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-4">Timeline</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-slate-600" />
                                            <span className="text-xs text-slate-600 font-bold uppercase">Listed</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{new Date(property.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-slate-600" />
                                            <span className="text-xs text-slate-600 font-bold uppercase">Last Updated</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{new Date(property.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        {!property.verified && (
                            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-blue-50 to-white">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-black text-slate-900 mb-4">Actions</h3>
                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => setShowVerifyDialog(true)}
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg"
                                        >
                                            <CheckCircle2 className="size-5 mr-2" />
                                            Verify Property
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => setShowRejectDialog(true)}
                                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg"
                                        >
                                            <XCircle className="size-5 mr-2" />
                                            Reject Property
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {property.verified && (
                            <Card className="border-none shadow-lg rounded-3xl bg-green-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 text-green-700">
                                        <ShieldCheck className="size-6" />
                                        <span className="font-black uppercase tracking-widest text-sm">Property Verified</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Verify Confirmation Dialog */}
            <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Verify Property</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to verify <strong>{property?.title}</strong>? This will mark the property as verified and make it visible to all users on the platform.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleVerify}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Verify Property
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Property</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject <strong>{property?.title}</strong>? This will unverify the property listing and the landlord will need to resubmit it for verification.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Reject Property
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}

