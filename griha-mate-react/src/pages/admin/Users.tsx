import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { adminAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Search } from "lucide-react"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [search, setSearch] = useState("")

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
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#0D2440]">User Management</h1>
                    <p className="text-[#2E5E99]">Verify and manage platform users</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-white border-none shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                    {user.fullName[0]}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[#0D2440]">{user.fullName}</h4>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Badge variant={user.role === 'LANDLORD' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>

                                {user.verificationStatus === 'VERIFIED' ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Verified</Badge>
                                ) : user.verificationStatus === 'REJECTED' ? (
                                    <Badge variant="destructive">Rejected</Badge>
                                ) : (
                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Pending</Badge>
                                )}

                                <div className="flex gap-2 ml-4">
                                    {user.verificationStatus === 'PENDING' && (
                                        <>
                                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" onClick={() => handleVerify(user.id)}>
                                                <CheckCircle2 className="size-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleReject(user.id)}>
                                                <XCircle className="size-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    )
}
