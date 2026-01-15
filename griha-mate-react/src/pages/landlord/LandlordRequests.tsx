import { useEffect, useState } from "react"
import { LandlordLayout } from "@/components/landlord/LandlordLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { propertyRequestAPI, type PropertyRequestDto } from "@/lib/api"
import { toast } from "react-toastify"
import { Check, X, MessageSquare, Calendar, User, Home } from "lucide-react"

export default function LandlordRequestsPage() {
    const [requests, setRequests] = useState<PropertyRequestDto[]>([])
    const [loading, setLoading] = useState(true)

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
        try {
            await propertyRequestAPI.updateStatus(id, status)
            toast.success(`Request ${status.toLowerCase()} successfully`)
            fetchRequests() // Refresh list
        } catch (err) {
            console.error("Failed to update status", err)
            toast.error("Failed to update request status")
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
        <LandlordLayout>
            <div className="flex items-center justify-center h-full">
                <p>Loading requests...</p>
            </div>
        </LandlordLayout>
    )

    return (
        <LandlordLayout>
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
                    requests.map((request) => (
                        <Card key={request.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6 justify-between">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 text-[#2E5E99] font-medium">
                                                <Home className="size-4" />
                                                <span>{request.propertyTitle}</span>
                                            </div>
                                            <Badge className={`${getStatusColor(request.status)} border-none`}>
                                                {request.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <User className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#0D2440]">{request.seekerName}</h3>
                                                <p className="text-sm text-gray-500">{request.seekerEmail}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                                    <Calendar className="size-3" />
                                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <p className="text-sm text-gray-600 italic">"{request.message}"</p>
                                        </div>
                                    </div>

                                    {request.status === 'PENDING' && (
                                        <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                                            >
                                                <Check className="mr-2 size-4" /> Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                            >
                                                <X className="mr-2 size-4" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </LandlordLayout>
    )
}
