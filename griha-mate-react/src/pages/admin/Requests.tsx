import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { roomRequestAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail } from "lucide-react"

export default function AdminRequests() {
    const [requests, setRequests] = useState<any[]>([])

    useEffect(() => {
        roomRequestAPI.getAll().then(setRequests).catch(console.error)
    }, [])

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#0D2440]">Room Requests</h1>
                <p className="text-[#2E5E99]">Monitor all rental inquiries</p>
            </div>

            <div className="grid gap-4">
                {requests.map((request) => (
                    <Card key={request.id} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-[#0D2440]">{request.seekerName}</h3>
                                        <Badge variant={request.active ? "default" : "secondary"}>
                                            {request.active ? "Active" : "Closed"}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Mail className="size-4" />
                                            {request.seekerEmail}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="size-4" />
                                            {request.seekerPhone}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="size-4" />
                                            {request.city}, {request.district}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-900">
                                        <span className="font-semibold">Preferences: </span>
                                        {request.minPrice && `Rs. ${request.minPrice} - `}
                                        {request.maxPrice && `Rs. ${request.maxPrice}`}
                                        {request.propertyType && ` • ${request.propertyType}`}
                                        {request.additionalRequirements && (
                                            <div className="mt-2 text-gray-600 italic">
                                                "{request.additionalRequirements}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right text-xs text-gray-400">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    )
}
