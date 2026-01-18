import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowLeft,
    Crown,
    Mail,
    Phone,
    Clock,
    ShieldCheck,
    Calendar,
    User as UserIcon,
    Award,
    CheckCircle,
    XCircle,
    Building2,
    Eye
} from "lucide-react"
import { toast } from "react-toastify"

export default function PremiumUserDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [downgrading, setDowngrading] = useState(false)

    const fetchData = async () => {
        if (!id) return
        try {
            setLoading(true)
            const [userData, propData] = await Promise.all([
                adminAPI.getUserById(parseInt(id)),
                adminAPI.getLandlordProperties(parseInt(id))
            ])
            setUser(userData)
            setProperties(propData)
        } catch (err: any) {
            toast.error("Failed to load details")
            navigate("/admin/premium-users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id, navigate])

    const handleVerifyProperty = async (propId: number) => {
        try {
            setActionLoading(propId)
            await adminAPI.verifyProperty(propId)
            toast.success("Property verified successfully")
            // Update local state instead of refetching everything
            setProperties(prev => prev.map(p => p.id === propId ? { ...p, verified: true } : p))
        } catch (err: any) {
            toast.error("Failed to verify property")
        } finally {
            setActionLoading(null)
        }
    }

    const handleRejectProperty = async (propId: number) => {
        try {
            setActionLoading(propId)
            await adminAPI.rejectProperty(propId)
            toast.info("Property listing rejected")
            // Update local state
            setProperties(prev => prev.map(p => p.id === propId ? { ...p, verified: false } : p))
        } catch (err: any) {
            toast.error("Failed to reject property")
        } finally {
            setActionLoading(null)
        }
    }

    const handleDowngrade = async () => {
        if (!user || !id) return
        try {
            setDowngrading(true)
            await adminAPI.downgradeSubscription(parseInt(id))
            toast.success("User downgraded to free subscription")
            navigate("/admin/premium-users")
        } catch (err: any) {
            toast.error("Failed to downgrade subscription")
        } finally {
            setDowngrading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="h-[70vh] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!user) return null

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/premium-users")}
                        className="group flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold transition-all"
                    >
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Registry
                    </Button>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                            Verified Premium
                        </Badge>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#0D2440]">

                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-6 md:sticky md:top-8 self-start">
                        <Card className="bg-white border-none shadow-2xl shadow-amber-900/5 rounded-[40px] overflow-hidden">
                            <CardContent className="p-0">
                                <div className="h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 relative">
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                        <div className="size-32 rounded-[32px] bg-white p-2 shadow-2xl shadow-amber-900/10 border-4 border-white">
                                            {user.profileImageUrl ? (
                                                <img src={user.profileImageUrl} alt="" className="size-full rounded-3xl object-cover" />
                                            ) : (
                                                <div className="size-full rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 text-4xl font-black">
                                                    {user.fullName[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-10 px-8 text-center space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{user.fullName}</h2>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <Crown className="size-4 text-amber-500" />
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Premium Landlord</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 py-4 border-y border-slate-50">
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <Mail className="size-4" />
                                            <span className="text-xs font-medium">{user.email}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <Phone className="size-4" />
                                            <span className="text-xs font-medium">{user.phoneNumber || 'No phone number'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none font-bold text-[10px] uppercase tracking-wide">
                                            {user.verificationStatus}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Quick Stats */}
                        <Card className="bg-gradient-to-br from-[#0D2440] to-slate-800 border-none shadow-2xl rounded-[32px] overflow-hidden text-white">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <Clock className="size-5 text-amber-400" />
                                    </div>
                                    <h4 className="font-bold text-sm tracking-wide">Subscription Info</h4>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Expires On</p>
                                        <p className="text-lg font-black text-amber-400">
                                            {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-amber-400 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                                        </div>
                                        <p className="text-[9px] text-slate-400 mt-2 font-medium italic">Active subscription with high priority</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 mt-4">
                                        <Button
                                            onClick={handleDowngrade}
                                            disabled={downgrading}
                                            variant="outline"
                                            className="w-full border-red-500 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {downgrading ? 'Downgrading...' : 'Downgrade to Free'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Detailed Info & Properties */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Member Intelligence Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard
                                icon={Calendar}
                                label="Member Since"
                                value={new Date(user.createdAt).toLocaleDateString()}
                                description="Original registration date"
                            />
                            <InfoCard
                                icon={Award}
                                label="Verification"
                                value={user.verificationStatus}
                                description="Current platform trust level"
                                highlight={user.verificationStatus === 'VERIFIED'}
                            />
                        </div>

                        {/* Listed Properties Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div>
                                    <h3 className="text-2xl font-black text-[#0D2440]">Inventory Under Management</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Landlord Listings</p>
                                </div>
                                <div className="bg-amber-50 rounded-2xl px-4 py-2 flex items-center gap-2">
                                    <Building2 className="size-4 text-amber-600" />
                                    <span className="font-black text-amber-700 text-xs">{properties.length} Total</span>
                                </div>
                            </div>

                            {properties.length === 0 ? (
                                <Card className="border-2 border-dashed border-slate-100 rounded-[32px] py-20 flex flex-col items-center opacity-40">
                                    <Building2 className="size-12 mb-4 text-slate-300" />
                                    <p className="font-black uppercase tracking-widest text-xs">No Properties Found</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {properties.map((property) => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            onVerify={() => handleVerifyProperty(property.id)}
                                            onReject={() => handleRejectProperty(property.id)}
                                            isProcessing={actionLoading === property.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function InfoCard({ icon: Icon, label, value, description, highlight }: any) {
    return (
        <Card className={`border-none shadow-xl shadow-slate-900/5 rounded-[32px] overflow-hidden ${highlight ? 'bg-amber-50/50' : 'bg-white'}`}>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${highlight ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Icon className="size-4" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                        <h4 className={`text-sm font-black mt-0.5 ${highlight ? 'text-amber-700' : 'text-[#0D2440]'}`}>{value}</h4>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">{description}</p>
            </CardContent>
        </Card>
    )
}

function PropertyCard({ property, onVerify, onReject, isProcessing }: any) {
    const isVerified = property.verified;

    return (
        <Card className="bg-white border border border-slate-50 shadow-lg shadow-slate-200/50 rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-700">
            <CardContent className="p-0 flex flex-col md:flex-row h-full md:h-48">
                {/* Image Section */}
                <div className="w-full md:w-56 h-48 md:h-auto overflow-hidden relative">
                    {property.imageUrls && property.imageUrls.length > 0 ? (
                        <img src={property.imageUrls[0]} alt={property.title} className="size-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    ) : (
                        <div className="size-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <Building2 className="size-10" />
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <Badge className={`border-none px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase shadow-lg ${isVerified ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {isVerified ? 'Verified' : 'Pending Review'}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-black text-lg text-[#0D2440] leading-tight line-clamp-1">{property.title}</h4>
                            <p className="font-black text-amber-600 text-sm whitespace-nowrap ml-4">Rs. {property.price}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <ShieldCheck className="size-3" />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{property.propertyType} • {property.bedrooms} Bedrooms</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 italic">{property.address}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                        <div className="flex gap-2">
                            {!isVerified ? (
                                <Button
                                    onClick={onVerify}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest shadow-md shadow-green-900/10 flex items-center gap-2"
                                >
                                    <CheckCircle className="size-4" />
                                    {isProcessing ? 'Verifying...' : 'Approve Room'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={onReject}
                                    disabled={isProcessing}
                                    variant="outline"
                                    className="border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100 hover:text-red-800 hover:border-red-300 rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <XCircle className="size-4" />
                                    {isProcessing ? 'Revoking...' : 'Revoke Verification'}
                                </Button>
                            )}
                            {!isVerified && (
                                <Button
                                    onClick={onReject}
                                    disabled={isProcessing}
                                    variant="ghost"
                                    className="text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Reject Listing
                                </Button>
                            )}
                        </div>
                        <Button variant="ghost" className="size-10 rounded-xl p-0 text-slate-300 hover:text-amber-500 hover:bg-amber-50 flex items-center justify-center transition-all bg-slate-50/50">
                            <Eye className="size-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
