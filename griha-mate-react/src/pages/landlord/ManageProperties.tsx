import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Home, Plus, Edit, Trash2, Eye, EyeOff, MapPin,
  Bed, Bath, Square, Calendar, TrendingUp, AlertCircle, CheckCircle
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { propertiesAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { toast } from "react-toastify"

export default function ManagePropertiesPage() {
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyDto | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      toast.error("Please login to access this page", {
        position: "top-center",
      })
      navigate("/login?redirect=/manage-properties")
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== "LANDLORD") {
        toast.error("Access denied. Landlords only.", {
          position: "top-center",
        })
        navigate("/dashboard/seeker")
        return
      }
    } catch (e) {
      navigate("/login")
      return
    }

    fetchProperties()
  }, [navigate])

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredProperties(properties)
    } else {
      setFilteredProperties(properties.filter((p) => p.status === filterStatus))
    }
  }, [filterStatus, properties])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await propertiesAPI.getMyProperties()
      setProperties(data)
      setFilteredProperties(data)
    } catch (err: any) {
      toast.error("Failed to load properties: " + (err.message || "Unknown error"), {
        position: "top-center",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (property: PropertyDto) => {
    setPropertyToDelete(property)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return

    setDeleting(true)
    try {
      // TODO: Implement delete API endpoint
      // await propertiesAPI.delete(propertyToDelete.id)

      // For now, just remove from local state
      setProperties(properties.filter((p) => p.id !== propertyToDelete.id))

      toast.success("Property deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
      })
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
    } catch (err: any) {
      toast.error("Failed to delete property: " + (err.message || "Unknown error"), {
        position: "top-center",
      })
    } finally {
      setDeleting(false)
    }
  }

  const togglePropertyStatus = async (property: PropertyDto) => {
    const newStatus = property.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE"
    try {
      // Call API to update status
      // await propertiesAPI.updateStatus(property.id, newStatus)

      // Update local state
      setProperties(
        properties.map((p) =>
          p.id === property.id ? { ...p, status: newStatus } : p
        )
      )

      toast.success(
        `Property marked as ${newStatus.toLowerCase()}`,
        {
          position: "top-center",
          autoClose: 2000,
        }
      )
    } catch (err: any) {
      toast.error("Failed to update status", {
        position: "top-center",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-500 text-white">Available</Badge>
      case "RENTED":
        return <Badge className="bg-orange-500 text-white">Rented</Badge>
      case "UNAVAILABLE":
        return <Badge className="bg-gray-500 text-white">Unavailable</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const stats = {
    total: properties.length,
    available: properties.filter((p) => p.status === "AVAILABLE").length,
    rented: properties.filter((p) => p.status === "RENTED").length,
    unavailable: properties.filter((p) => p.status === "UNAVAILABLE").length,
  }

  return (
    <div className="min-h-full">
      <main className="">
        {/* Header */}
        <section className="py-12 bg-gradient-to-br from-[#2E5E99] to-[#2E5E99]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Manage Properties
                  </h1>
                  <p className="text-xl text-white/90">
                    View and manage all your listed properties
                  </p>
                </div>
                <Link to="/dashboard/landlord/list-property">
                  <Button
                    size="lg"
                    className="bg-white text-primary-dark hover:bg-gray-100"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Property
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-8 -mt-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <div className="bg-primary-lightest p-3 rounded-full">
                        <Home className="w-6 h-6 text-primary-dark" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Available</p>
                        <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Rented</p>
                        <p className="text-3xl font-bold text-primary">{stats.rented}</p>
                      </div>
                      <div className="bg-primary-lightest p-3 rounded-full">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Unavailable</p>
                        <p className="text-3xl font-bold text-gray-600">{stats.unavailable}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-full">
                        <AlertCircle className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Properties List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="font-medium text-gray-700">Filter by Status:</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Properties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RENTED">Rented</SelectItem>
                        <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600 ml-auto">
                      Showing {filteredProperties.length} of {properties.length} properties
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Properties Grid */}
              {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredProperties.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      No Properties Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {filterStatus === "all"
                        ? "Start by listing your first property"
                        : `No properties with status: ${filterStatus.toLowerCase()}`}
                    </p>
                    <Link to="/dashboard/landlord/list-property">
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="w-4 h-4 mr-2" />
                        List a Property
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProperties.map((property) => (
                    <Card
                      key={property.id}
                      className="overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={property.imageUrls?.[0] || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(property.status)}
                        </div>
                        {property.verified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-green-500 text-white">
                              ✓ Verified
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {property.propertyType}
                          </Badge>
                        </div>

                        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">
                          {property.title}
                        </h3>

                        <p className="text-sm text-gray-600 flex items-start gap-1 mb-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {property.address}, {property.city}
                          </span>
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            <span>{property.area} sq.ft</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                          <div>
                            <p className="text-xs text-gray-500">Monthly Rent</p>
                            <p className="text-xl font-bold text-primary-dark">
                              Rs. {property.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Listed</p>
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(property.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link to={`/property/${property.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePropertyStatus(property)}
                          >
                            {property.status === "AVAILABLE" ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                Mark Unavailable
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                Mark Available
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(property)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary-dark hover:bg-primary-lightest"
                            onClick={() => toast.info("Edit feature coming soon!")}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{propertyToDelete?.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

