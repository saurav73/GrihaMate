import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { propertyRequestAPI, type PropertyRequestDto } from "@/lib/api"
import { toast } from "react-toastify"
import { PaymentModal } from "@/components/payment/PaymentModal"
import { Calendar, Home, CheckCircle2, XCircle, Clock, DollarSign, ArrowLeft, Trash2 } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<PropertyRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequestDto | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PAID'>('ALL')
  const navigate = useNavigate()

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await propertyRequestAPI.getMyRequests()
      setRequests(data)
    } catch (err: any) {
      console.error("Failed to load requests", err)
      toast.error("Failed to load requests: " + (err.message || "Unknown error"), {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      toast.error("Please login to access this page", {
        position: "top-right",
        autoClose: 3000,
      })
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'SEEKER') {
        navigate('/dashboard/landlord')
        return
      }
    } catch (e) {
      navigate('/login')
      return
    }

    fetchRequests()
  }, [navigate])

  const handlePayClick = (request: PropertyRequestDto) => {
    setSelectedRequest(request)
    setPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    if (selectedRequest) {
      setTimeout(async () => {
        await fetchRequests()
      }, 1000)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle2 className="size-5 text-green-600" />
      case 'REJECTED': return <XCircle className="size-5 text-red-600" />
      case 'PAID': return <CheckCircle2 className="size-5 text-blue-600" />
      default: return <Clock className="size-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      case 'PAID': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  }

  // Filter requests based on selected status
  const filteredRequests = statusFilter === 'ALL' 
    ? requests 
    : requests.filter(req => req.status === statusFilter)

  // Count requests by status
  const statusCounts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    ACCEPTED: requests.filter(r => r.status === 'ACCEPTED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
    PAID: requests.filter(r => r.status === 'PAID').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Loading your requests...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EDE4] via-[#F9F7F2] to-[#F2EDE4] flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard/seeker" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-primary-dark mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track all your property applications and their status</p>
        </div>

        {/* Status Filters */}
        {requests.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                statusFilter === 'ALL' 
                  ? 'bg-primary hover:bg-primary-dark text-white' 
                  : 'border-primary-light text-primary hover:bg-primary-lightest hover:!text-primary'
              )}
            >
              All
              <Badge variant="secondary" className={cn(
                "ml-2",
                statusFilter === 'ALL' ? 'bg-white/30 text-white' : 'bg-primary/10 text-primary'
              )}>
                {statusCounts.ALL}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PENDING')}
              className={cn(
                statusFilter === 'PENDING' 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:!text-yellow-700'
              )}
            >
              <Clock className="mr-2 size-4" />
              Pending
              <Badge variant="secondary" className={cn(
                "ml-2",
                statusFilter === 'PENDING' ? 'bg-white/30 text-white' : 'bg-yellow-100 text-yellow-700'
              )}>
                {statusCounts.PENDING}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('ACCEPTED')}
              className={cn(
                statusFilter === 'ACCEPTED' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-green-200 text-green-700 hover:bg-green-50 hover:!text-green-700'
              )}
            >
              <CheckCircle2 className="mr-2 size-4" />
              Accepted
              <Badge variant="secondary" className={cn(
                "ml-2",
                statusFilter === 'ACCEPTED' ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'
              )}>
                {statusCounts.ACCEPTED}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('REJECTED')}
              className={cn(
                statusFilter === 'REJECTED' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-red-200 text-red-700 hover:bg-red-50 hover:!text-red-700'
              )}
            >
              <XCircle className="mr-2 size-4" />
              Rejected
              <Badge variant="secondary" className={cn(
                "ml-2",
                statusFilter === 'REJECTED' ? 'bg-white/30 text-white' : 'bg-red-100 text-red-700'
              )}>
                {statusCounts.REJECTED}
              </Badge>
            </Button>
            {statusFilter === 'REJECTED' && statusCounts.REJECTED > 0 && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (confirm(`Are you sure you want to permanently delete all ${statusCounts.REJECTED} rejected requests?`)) {
                    try {
                      const result = await propertyRequestAPI.deleteAllRejected()
                      setRequests(requests.filter(r => r.status !== 'REJECTED'))
                      setStatusFilter('ALL')
                      toast.success(result.message || `Deleted ${statusCounts.REJECTED} rejected request${statusCounts.REJECTED > 1 ? 's' : ''}`, {
                        position: "top-right",
                        autoClose: 3000,
                      })
                      // Refresh the list to ensure we have latest data
                      await fetchRequests()
                    } catch (err: any) {
                      toast.error(err.message || "Failed to delete rejected requests", {
                        position: "top-right",
                        autoClose: 3000,
                      })
                    }
                  }
                }}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:!text-red-600"
              >
                <Trash2 className="mr-2 size-4" />
                Clear All Rejected
              </Button>
            )}
            <Button
              variant={statusFilter === 'PAID' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PAID')}
              className={cn(
                statusFilter === 'PAID' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:!text-blue-700'
              )}
            >
              <CheckCircle2 className="mr-2 size-4" />
              Paid
              <Badge variant="secondary" className={cn(
                "ml-2",
                statusFilter === 'PAID' ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-700'
              )}>
                {statusCounts.PAID}
              </Badge>
            </Button>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card className="p-12 text-center bg-white border-primary-lightest shadow-lg">
            <Home className="mx-auto size-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 mb-6">You haven't applied for any properties yet.</p>
            <Link to="/explore">
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Browse Properties
              </Button>
            </Link>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card className="p-12 text-center bg-white border-primary-lightest shadow-lg">
            <Home className="mx-auto size-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No {statusFilter === 'ALL' ? '' : statusFilter} Applications</h3>
            <p className="text-gray-500 mb-6">
              {statusFilter === 'ALL' 
                ? "You haven't applied for any properties yet."
                : `You don't have any ${statusFilter.toLowerCase()} applications at the moment.`}
            </p>
            {statusFilter !== 'ALL' && (
              <Button variant="outline" onClick={() => setStatusFilter('ALL')}>
                View All Applications
              </Button>
            )}
            {statusFilter === 'ALL' && (
              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  Browse Properties
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request, index) => (
              <Card 
                key={request.id} 
                className={cn(
                  "border-none shadow-md hover:shadow-xl transition-all bg-white overflow-hidden",
                  "animate-in fade-in slide-in-from-bottom-4 duration-500"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left Status Bar */}
                    <div className={cn(
                      "hidden md:block w-2",
                      request.status === 'PENDING' ? "bg-amber-400" :
                        request.status === 'ACCEPTED' ? "bg-green-500" :
                          request.status === 'PAID' ? "bg-blue-500" : "bg-gray-300"
                    )} />

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                      {/* Property Image & Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="size-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={request.propertyImage || "/placeholder.svg"}
                            alt={request.propertyTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-black text-primary-dark mb-1 line-clamp-1">
                                {request.propertyTitle}
                              </h3>
                            </div>
                            <Badge className={cn(
                              getStatusColor(request.status),
                              "border shrink-0 px-3 py-1 font-semibold flex items-center gap-2"
                            )}>
                              {getStatusIcon(request.status)}
                              {request.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4" />
                              <span>Applied {new Date(request.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}</span>
                            </div>
                            {request.propertyPrice && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="size-4" />
                                <span className="font-semibold text-primary-dark">
                                  Rs. {request.propertyPrice.toLocaleString()}/month
                                </span>
                              </div>
                            )}
                          </div>

                          {request.message && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="text-sm text-gray-600 italic">"{request.message}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 justify-center min-w-[180px]">
                        {request.status === 'ACCEPTED' && (
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-100 h-12"
                            onClick={() => handlePayClick(request)}
                          >
                            <DollarSign className="mr-2 size-4" />
                            Pay Booking Fee
                          </Button>
                        )}
                        {request.status === 'PAID' && (
                          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-200 text-center space-y-1">
                            <CheckCircle2 className="mx-auto size-6 mb-2" />
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Status</p>
                            <p className="text-sm font-bold">Booking Confirmed</p>
                          </div>
                        )}
                        {request.status === 'REJECTED' && (
                          <div className="space-y-2">
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center space-y-1">
                              <XCircle className="mx-auto size-6 mb-2" />
                              <p className="text-xs font-black uppercase tracking-widest mb-1">Status</p>
                              <p className="text-sm font-bold">Application Rejected</p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={async () => {
                                if (confirm('Are you sure you want to permanently delete this rejected request?')) {
                                  try {
                                    await propertyRequestAPI.delete(request.id)
                                    setRequests(requests.filter(r => r.id !== request.id))
                                    toast.success('Rejected request deleted permanently', {
                                      position: "top-right",
                                      autoClose: 2000,
                                    })
                                    // Refresh the list to ensure we have latest data
                                    await fetchRequests()
                                  } catch (err: any) {
                                    toast.error(err.message || "Failed to delete request", {
                                      position: "top-right",
                                      autoClose: 3000,
                                    })
                                  }
                                }
                              }}
                              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Remove
                            </Button>
                          </div>
                        )}
                        {request.status === 'PENDING' && (
                          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl border border-yellow-200 text-center space-y-1">
                            <Clock className="mx-auto size-6 mb-2" />
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Status</p>
                            <p className="text-sm font-bold">Under Review</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedRequest && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          amount={selectedRequest.propertyPrice || 5000}
          propertyId={selectedRequest.propertyId}
          requestId={selectedRequest.id}
          propertyTitle={selectedRequest.propertyTitle}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

