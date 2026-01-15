import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Clock, Users } from "lucide-react"
import { toast } from "react-toastify"
import { adminAPI } from "@/lib/api"

interface User {
  id: number
  fullName: string
  email: string
  role: 'SEEKER' | 'LANDLORD' | 'ADMIN'
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  emailVerified: boolean
  profileImageUrl?: string
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      toast.error("Please login to access admin panel", {
        position: "top-right",
        autoClose: 3000,
      })
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      if (parsedUser.role !== 'ADMIN') {
        toast.error("Access denied. Admin only.", {
          position: "top-right",
          autoClose: 3000,
        })
        navigate('/')
        return
      }
    } catch (e) {
      navigate('/login')
      return
    }

    const fetchUsers = async () => {
      try {
        const data = await adminAPI.getAllUsers()
        setUsers(data)
      } catch (err: any) {
        toast.error("Failed to load users: " + (err.message || "Unknown error"), {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [navigate])

  const handleVerify = async (userId: number) => {
    try {
      await adminAPI.verifyUser(userId)
      toast.success("User verified successfully", {
        position: "top-right",
        autoClose: 3000,
      })
      // Refresh users list
      const data = await adminAPI.getAllUsers()
      setUsers(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to verify user", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const handleReject = async (userId: number) => {
    try {
      await adminAPI.rejectUser(userId)
      toast.success("User rejected", {
        position: "top-right",
        autoClose: 3000,
      })
      // Refresh users list
      const data = await adminAPI.getAllUsers()
      setUsers(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to reject user", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  if (loading || !user) {
  return (
      <div className="min-h-screen bg-primary-lightest flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
        <Footer />
      </div>
    )
  }

  const pendingUsers = users.filter(u => u.verificationStatus === 'PENDING')
  const verifiedUsers = users.filter(u => u.verificationStatus === 'VERIFIED')
  const rejectedUsers = users.filter(u => u.verificationStatus === 'REJECTED')

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage user verifications and platform content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-primary-lightest">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="size-8 text-primary-dark" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary-lightest">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingUsers.length}</p>
                </div>
                <Clock className="size-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary-lightest">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{verifiedUsers.length}</p>
                </div>
                <CheckCircle2 className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary-lightest">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{rejectedUsers.length}</p>
                </div>
                <XCircle className="size-8 text-red-500" />
      </div>
            </CardContent>
          </Card>
      </div>

        {/* User Management */}
        <Card className="border-primary-lightest">
          <CardHeader>
            <CardTitle>User Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending ({pendingUsers.length})
            </TabsTrigger>
                <TabsTrigger value="verified">
                  Verified ({verifiedUsers.length})
            </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedUsers.length})
            </TabsTrigger>
          </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending verifications</p>
                ) : (
                  pendingUsers.map((user) => (
                    <Card key={user.id} className="border-primary-lightest">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-primary-lightest flex items-center justify-center">
                              {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={user.fullName} className="size-12 rounded-full" />
                              ) : (
                                <span className="text-primary-dark font-semibold">
                                  {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{user.role}</Badge>
                                {user.emailVerified && (
                                  <Badge variant="secondary" className="bg-green-100">Email Verified</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleVerify(user.id)}
                            >
                              <CheckCircle2 className="mr-2 size-4" />
                              Verify
                            </Button>
                          <Button
                            size="sm"
                              variant="destructive"
                              onClick={() => handleReject(user.id)}
                          >
                              <XCircle className="mr-2 size-4" />
                              Reject
                          </Button>
                        </div>
                  </div>
                </CardContent>
              </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="verified" className="space-y-4 mt-4">
                {verifiedUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No verified users</p>
                ) : (
                  verifiedUsers.map((user) => (
                    <Card key={user.id} className="border-primary-lightest">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-primary-lightest flex items-center justify-center">
                              {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={user.fullName} className="size-12 rounded-full" />
                              ) : (
                                <span className="text-primary-dark font-semibold">
                                  {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{user.role}</Badge>
                                <Badge className="bg-green-500 text-white">Verified</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                </CardContent>
              </Card>
                  ))
                )}
          </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-4">
                {rejectedUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No rejected users</p>
                ) : (
                  rejectedUsers.map((user) => (
                    <Card key={user.id} className="border-primary-lightest">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-primary-lightest flex items-center justify-center">
                              {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={user.fullName} className="size-12 rounded-full" />
                              ) : (
                                <span className="text-primary-dark font-semibold">
                                  {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </span>
                              )}
                      </div>
                      <div>
                              <p className="font-semibold">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{user.role}</Badge>
                                <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </div>
          </div>
        </div>
      </CardContent>
    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
