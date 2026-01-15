import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart, MapPin, Bed, Bath, Square, Trash2, ExternalLink } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/Pagination"
import { propertiesAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { mockProperties } from "@/lib/mockData"
import { toast } from "react-toastify"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<PropertyDto[]>([])
  const [paginatedFavorites, setPaginatedFavorites] = useState<PropertyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Please login to view favorites", {
        position: "top-center",
      })
      navigate("/login?redirect=/favorites")
      return
    }

    fetchFavorites()
  }, [navigate])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      // Get favorites from localStorage for now (can be replaced with API call)
      const savedFavorites = localStorage.getItem("favorites")
      const favoriteIds: number[] = savedFavorites ? JSON.parse(savedFavorites) : []

      if (favoriteIds.length === 0) {
        setFavorites([])
        setLoading(false)
        return
      }

      // Fetch all properties and filter favorites
      try {
        const response = await propertiesAPI.getAll()
        const favoriteProperties = response.filter((property) =>
          favoriteIds.includes(property.id)
        )
        setFavorites(favoriteProperties)
      } catch (apiError) {
        // Fallback to mock data
        console.log("API error, using mock data for favorites")
        const favoriteProperties = mockProperties.filter((property) =>
          favoriteIds.includes(property.id)
        )
        setFavorites(favoriteProperties)
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
      toast.error("Failed to load favorites")
    } finally {
      setLoading(false)
    }
  }

  // Update paginated favorites when list or page changes
  useEffect(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = favorites.slice(start, end)
    setPaginatedFavorites(paginated)
  }, [favorites, currentPage, pageSize])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(favorites.length / pageSize)

  const removeFavorite = (propertyId: number) => {
    const savedFavorites = localStorage.getItem("favorites")
    const favoriteIds: number[] = savedFavorites ? JSON.parse(savedFavorites) : []
    const updatedFavorites = favoriteIds.filter((id) => id !== propertyId)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    setFavorites(favorites.filter((p) => p.id !== propertyId))
    toast.success("Removed from favorites", {
      position: "top-center",
      autoClose: 2000,
    })
  }

  const clearAllFavorites = () => {
    if (confirm("Are you sure you want to remove all favorites?")) {
      localStorage.setItem("favorites", JSON.stringify([]))
      setFavorites([])
      toast.success("All favorites cleared", {
        position: "top-center",
        autoClose: 2000,
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F3]">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="py-12 bg-gradient-to-br from-[#2E5E99] to-[#2E5E99]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                My Favorites
              </h1>
              <p className="text-xl text-white/90">
                Properties you've saved for later
              </p>
            </div>
          </div>
        </section>

        {/* Favorites Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  No Favorites Yet
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Start exploring properties and save your favorites to view them here
                </p>
                <Link to="/explore">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark">
                    Explore Properties
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {favorites.length} {favorites.length === 1 ? "Property" : "Properties"} Saved
                  </h2>
                  <Button
                    variant="outline"
                    onClick={clearAllFavorites}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedFavorites.map((property) => (
                    <Card
                      key={property.id}
                      className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white h-full flex flex-col"
                    >
                      <div className="relative">
                        <img
                          src={property.imageUrls?.[0] || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                        {property.verified && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                            Verified
                          </div>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                          onClick={() => removeFavorite(property.id)}
                        >
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </Button>
                      </div>

                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="mb-2">
                          <span className="inline-block bg-primary-lightest text-primary-dark text-xs font-semibold px-2 py-1 rounded">
                            {property.propertyType}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
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

                        <div className="flex items-center justify-between pt-4 border-t mt-auto">
                          <div>
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="text-xl font-bold text-primary-dark">
                              Rs. {property.price.toLocaleString()}
                              <span className="text-sm font-normal text-gray-500">
                                /month
                              </span>
                            </p>
                          </div>
                          <Link to={`/property/${property.id}`}>
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary-dark"
                            >
                              View Details
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {favorites.length > pageSize && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={favorites.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[12, 24, 36]}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        {favorites.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to Schedule a Visit?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Contact property owners directly or explore more options
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/explore">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary-dark hover:bg-primary-lightest"
                    >
                      Explore More Properties
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" className="bg-primary hover:bg-primary-dark">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

