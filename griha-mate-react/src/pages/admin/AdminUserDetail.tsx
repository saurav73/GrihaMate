import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowLeft,
    Mail,
    Phone,
    ShieldCheck as ShieldCheckIcon,
    CheckCircle2,
    ShieldAlert,
    FileText,
    ExternalLink,
    User,
    Calendar,
    Clock,
    Loader2
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

export default function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [showVerifyDialog, setShowVerifyDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [showResetDialog, setShowResetDialog] = useState(false)

    const fetchUser = async () => {
        if (!id) return
        try {
            setLoading(true)
            const userData = await adminAPI.getUserById(parseInt(id))
            setUser(userData)
        } catch (err: any) {
            toast.error("Failed to load user details")
            navigate("/admin/users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [id, navigate])

    const handleVerify = async () => {
        setShowVerifyDialog(false)
        if (!user) return
        try {
            setVerifying(true)
            await adminAPI.verifyUser(user.id)
            toast.success("User verified successfully")
            await fetchUser()
        } catch (err) {
            toast.error("Failed to verify user")
        } finally {
            setVerifying(false)
        }
    }

    const handleReject = async () => {
        setShowRejectDialog(false)
        if (!user) return
        try {
            setRejecting(true)
            await adminAPI.rejectUser(user.id)
            toast.success("User rejected")
            await fetchUser()
        } catch (err) {
            toast.error("Failed to reject user")
        } finally {
            setRejecting(false)
        }
    }

    const handleResetVerification = async () => {
        setShowResetDialog(false)
        if (!user) return
        try {
            setResetting(true)
            await adminAPI.resetUserVerificationStatus(user.id)
            toast.success("User verification status reset to pending")
            await fetchUser()
        } catch (err) {
            toast.error("Failed to reset verification status")
        } finally {
            setResetting(false)
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

    if (!user) return null

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/users")}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Users
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - User Profile */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <Card className="border-none shadow-lg rounded-3xl">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center">
                                    <div className="size-24 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl mb-4 border-4 border-white overflow-hidden">
                                        {user.profileImageUrl ? (
                                            <img src={user.profileImageUrl} alt="" className="size-full object-cover" />
                                        ) : (
                                            <div className="size-full flex items-center justify-center text-4xl font-black text-slate-700">
                                                {user.fullName[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-black text-slate-900 mb-2">{user.fullName}</h2>
                                    <Badge className={cn(
                                        "mb-6 rounded-full px-5 py-1.5 text-xs font-black tracking-widest uppercase border-none shadow-sm",
                                        user.role === 'LANDLORD' ? "bg-[#2E5E99] text-white" : "bg-orange-500 text-white"
                                    )}>
                                        {user.role}
                                    </Badge>

                                    {/* Verification Status */}
                                    <div className="w-full mb-4">
                                        {user.verificationStatus === 'VERIFIED' ? (
                                            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                                                <CheckCircle2 className="size-5 text-green-600" />
                                                <span className="text-sm font-black text-green-700 uppercase tracking-wider">Verified</span>
                                            </div>
                                        ) : user.verificationStatus === 'REJECTED' ? (
                                            <div className="flex items-center justify-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                                                <ShieldAlert className="size-5 text-red-600" />
                                                <span className="text-sm font-black text-red-700 uppercase tracking-wider">Rejected</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                <Clock className="size-5 text-orange-600" />
                                                <span className="text-sm font-black text-orange-700 uppercase tracking-wider">Pending Review</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Information */}
                                    <div className="w-full space-y-3">
                                        <div className="p-4 bg-blue-50 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="size-10 rounded-xl bg-white flex items-center justify-center">
                                                    <Mail className="size-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Email</p>
                                                    <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {user.phoneNumber && (
                                            <div className="p-4 bg-blue-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-white flex items-center justify-center">
                                                        <Phone className="size-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Phone</p>
                                                        <p className="text-sm font-black text-slate-900">{user.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user.citizenshipNumber && (
                                            <div className="p-4 bg-slate-900 text-white rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                        <ShieldCheckIcon className="size-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Citizenship ID</p>
                                                        <p className="text-base font-black font-mono tracking-wider">{user.citizenshipNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Info */}
                        <Card className="border-none shadow-lg rounded-3xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-4">Account Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-slate-600" />
                                            <span className="text-xs text-slate-600 font-bold uppercase">Joined</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {user.subscriptionStatus === 'PREMIUM' && (
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                            <div className="flex items-center gap-2">
                                                <User className="size-4 text-amber-600" />
                                                <span className="text-xs text-amber-700 font-bold uppercase">Status</span>
                                            </div>
                                            <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-none">Premium</Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        {user.verificationStatus === 'PENDING' && (
                            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-blue-50 to-white">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-black text-slate-900 mb-4">Actions</h3>
                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => setShowVerifyDialog(true)}
                                            disabled={verifying || rejecting || resetting}
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {verifying ? (
                                                <>
                                                    <Loader2 className="size-5 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="size-5 mr-2" />
                                                    Authorize User
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => setShowRejectDialog(true)}
                                            disabled={verifying || rejecting || resetting}
                                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {rejecting ? (
                                                <>
                                                    <Loader2 className="size-5 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldAlert className="size-5 mr-2" />
                                                    Decline User
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reset to Pending Button - Show for Verified or Rejected users */}
                        {(user.verificationStatus === 'VERIFIED' || user.verificationStatus === 'REJECTED') && (
                            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-orange-50 to-white">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-black text-slate-900 mb-4">Reset Verification</h3>
                                    <Button
                                        onClick={() => setShowResetDialog(true)}
                                        disabled={verifying || rejecting || resetting}
                                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resetting ? (
                                            <>
                                                <Loader2 className="size-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="size-5 mr-2" />
                                                Reset to Pending
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Verification Documents */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-lg rounded-3xl">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-2">Verification Assets</h2>
                                        <p className="text-slate-600 text-sm font-bold uppercase tracking-widest">Authenticated System Registry Documents</p>
                                    </div>
                                    <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <ShieldCheckIcon className="size-7 text-[#2E5E99]" />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {user.role === 'LANDLORD' ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px flex-1 bg-gray-100" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest shrink-0">KYC CORE SUBMISSION</h3>
                                                <div className="h-px flex-1 bg-gray-100" />
                                            </div>
                                            {user.kycDocumentUrl ? (
                                                <DocumentCard title={`${user.kycDocumentType || 'Business'} ID`} url={user.kycDocumentUrl} />
                                            ) : (
                                                <EmptyDocumentState />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-8">
                                            {user.citizenshipFrontUrl ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-px flex-1 bg-gray-100" />
                                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest shrink-0 opacity-60">GOVERNMENT ID • FRONT</h3>
                                                        <div className="h-px flex-1 bg-gray-100" />
                                                    </div>
                                                    <DocumentCard title="Citizenship Front" url={user.citizenshipFrontUrl} />
                                                </div>
                                            ) : null}
                                            {user.citizenshipBackUrl ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-px flex-1 bg-gray-100" />
                                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest shrink-0">GOVERNMENT ID • BACK</h3>
                                                        <div className="h-px flex-1 bg-gray-100" />
                                                    </div>
                                                    <DocumentCard title="Citizenship Back" url={user.citizenshipBackUrl} />
                                                </div>
                                            ) : null}
                                            {!user.citizenshipFrontUrl && !user.citizenshipBackUrl && (
                                                <EmptyDocumentState />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Verify Confirmation Dialog */}
            <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Authorize User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to authorize <strong>{user?.fullName}</strong>? This will verify their account and grant them full access to the platform.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleVerify}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Authorize User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Decline User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to decline <strong>{user?.fullName}</strong>? This will reject their verification request and they will need to resubmit their documents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Decline User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset to Pending Confirmation Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Verification Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reset <strong>{user?.fullName}</strong>'s verification status to PENDING? This will change their status from {user?.verificationStatus} back to pending review.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetVerification}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            Reset to Pending
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}

function DocumentCard({ title, url }: { title: string; url?: string }) {
    if (!url) return null

    return (
        <div className="group relative rounded-3xl overflow-hidden bg-[#F8FAFC] shadow-inner ring-1 ring-black/5 hover:ring-[#2E5E99]/20 transition-all duration-500 cursor-pointer">
            <div className="aspect-[16/10] flex items-center justify-center p-6 bg-gray-900/5">
                <img
                    src={url}
                    alt={title}
                    className="max-h-full max-w-full object-contain group-hover:scale-[1.02] transition-transform duration-700 ease-out shadow-2xl rounded-xl"
                />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full flex items-center justify-between">
                    <div>
                        <p className="text-white text-xs font-black uppercase tracking-widest mb-1">{title}</p>
                        <p className="text-white/60 text-xs font-bold">Full resolution verification asset</p>
                    </div>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-10 rounded-xl bg-white flex items-center justify-center text-[#2E5E99] hover:bg-[#2E5E99] hover:text-white transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="size-4" />
                    </a>
                </div>
            </div>
        </div>
    )
}

function EmptyDocumentState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
            <FileText className="size-16 text-gray-300 mb-4" />
            <p className="font-black uppercase tracking-widest text-sm text-gray-400">Awaiting Cloud Assets</p>
            <p className="text-xs font-bold mt-1 text-gray-300">Document Repository Is Empty</p>
        </div>
    )
}

