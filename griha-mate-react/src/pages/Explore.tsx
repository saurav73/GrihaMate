import { Search, MapPin, SlidersHorizontal, Grid, MapIcon, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AISearchDialog } from "@/components/ai-search-dialog"
import { EnhancedPropertyMap } from "@/components/EnhancedPropertyMap"
import { MapViewSplit } from "@/components/MapViewSplit"
import { Pagination } from "@/components/Pagination"
import { propertiesAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { mockProperties } from "@/lib/mockData"
import { generateSuccessMessage, generateInfoMessage, generateErrorMessage } from "@/lib/humanLanguage"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

// Extended property type with distance
type PropertyWithDistance = PropertyDto & { distance?: number }

export default function ExplorePage() {
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithDistance[]>([])
  const [paginatedProperties, setPaginatedProperties] = useState<PropertyWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [, setSelectedLocation] = useState("Kathmandu, NP")
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const navigate = useNavigate()

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied:", error)
        }
      )
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          // Use mock data if not logged in
          console.log("Using mock data for demo purposes")
          setProperties(mockProperties)
          setFilteredProperties(mockProperties)
          setLoading(false)
          return
        }

        try {
          const data = await propertiesAPI.getAll()
          // If API returns data, use it; otherwise fallback to mock data
          if (data && data.length > 0) {
            setProperties(data)
            setFilteredProperties(data)
          } else {
            setProperties(mockProperties)
            setFilteredProperties(mockProperties)
          }
        } catch (apiError) {
          // Fallback to mock data on API error
          console.log("API error, using mock data:", apiError)
          setProperties(mockProperties)
          setFilteredProperties(mockProperties)
        }
      } catch (err: any) {
        console.error("Error in fetchProperties:", err)
        // Always fallback to mock data
        setProperties(mockProperties)
        setFilteredProperties(mockProperties)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [navigate])

  // Filter properties based on search and location
  useEffect(() => {
    let filtered = [...properties]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(p => p.city === selectedCity)
    }

    // Sort by distance if location is available and property has coordinates
    if (userLocation) {
      filtered = filtered.map(p => {
        if (p.latitude && p.longitude) {
          return {
            ...p,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              p.latitude,
              p.longitude
            )
          }
        }
        return p
      }).sort((a: PropertyWithDistance, b: PropertyWithDistance) => {
        // Properties with distance first, then others
        if (a.distance && b.distance) return a.distance - b.distance
        if (a.distance) return -1
        if (b.distance) return 1
        return 0
      })
    }

    setFilteredProperties(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [properties, searchQuery, selectedCity, userLocation])

  // Update paginated properties when filtered list or page changes
  useEffect(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginated = filteredProperties.slice(start, end)
    setPaginatedProperties(paginated)
  }, [filteredProperties, currentPage, pageSize])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredProperties.length / pageSize)

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const toggleFavorite = async (e: React.MouseEvent, propertyId: number) => {
    e.preventDefault() // Prevent navigation when clicking favorite button
    e.stopPropagation()
    
    const isFavorite = favorites.includes(propertyId)
    let updatedFavorites: number[]
    
    if (isFavorite) {
      updatedFavorites = favorites.filter((id) => id !== propertyId)
      const msg = await generateSuccessMessage("unfavorite", "property removed")
      toast.success(msg, {
        position: "top-center",
        autoClose: 2000,
      })
    } else {
      updatedFavorites = [...favorites, propertyId]
      const msg = await generateSuccessMessage("favorite", "property saved")
      toast.success(msg, {
        position: "top-center",
        autoClose: 2000,
      })
    }
    
    setFavorites(updatedFavorites)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
  }

  const cities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)))

  // Handle voice search with location awareness
  const handleVoiceSearch = async (voiceQuery: string) => {
    setSearchQuery(voiceQuery)
    
    const lowerQuery = voiceQuery.toLowerCase()
    
    // Check if user wants nearby/near me results
    const isNearbySearch = lowerQuery.includes('nearby') || 
                          lowerQuery.includes('near me') || 
                          lowerQuery.includes('near my location') ||
                          lowerQuery.includes('closest') ||
                          lowerQuery.includes('nearest')
    
    if (isNearbySearch) {
      // Switch to map view for location-based search
      setViewMode('map')
      
      // Get user location if not already available
      if (!userLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              })
              const msg = await generateInfoMessage("nearby search", "showing properties on map")
              toast.success(msg, {
                position: "top-center",
                autoClose: 3000,
              })
            },
            async (error) => {
              console.error("Location error:", error)
              const msg = await generateErrorMessage("location access denied", "enable location to find nearby")
              toast.error(msg, {
                position: "top-center",
                autoClose: 4000,
              })
            }
          )
        }
      } else {
        const msg = await generateInfoMessage("nearby search", "showing properties on map")
        toast.success(msg, {
          position: "top-center",
          autoClose: 3000,
        })
      }
    } else {
      // Parse voice query for city mentions
      const foundCity = cities.find(city => 
        lowerQuery.includes(city.toLowerCase())
      )
      
      if (foundCity) {
        setSelectedCity(foundCity)
        setSelectedLocation(`${foundCity}, NP`)
      }
      
      const msg = await generateSuccessMessage("search", `voice query: ${voiceQuery}`)
      toast.success(msg, {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-lightest flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Properties in Nepal</h1>
              <p className="text-muted-foreground text-sm">Showing verified properties available for rent</p>
            </div>
            <div className="flex bg-white rounded-xl p-1 border border-primary-lightest">
              <Button 
                size="sm" 
                variant="ghost" 
                className={`rounded-lg ${viewMode === 'grid' ? 'bg-primary-lightest' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="size-4 mr-2" /> Grid
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className={`rounded-lg ${viewMode === 'map' ? 'bg-primary-lightest' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="size-4 mr-2" /> Map
              </Button>
            </div>
          </div>
          
          {/* Search and Filters - Hidden in Map View */}
          {viewMode !== 'map' && (
          <>
          {/* Enhanced Search Bar */}
          <div className="mb-6">
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-primary-lightest p-2 w-full max-w-4xl mx-auto">
              {/* Search Icon */}
              <Search className="size-5 text-muted-foreground ml-3 flex-shrink-0" />
              
              {/* Search Input */}
              <Input
                placeholder="Where do you want to live?"
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Separator */}
              <div className="w-px h-8 bg-primary-lightest mx-2" />
              
              {/* Location Selector */}
              <div className="flex items-center gap-2 px-3 flex-shrink-0 relative">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {selectedCity || "Kathmandu"}, NP
                </span>
                <select
                  value={selectedCity || ""}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    const city = e.target.value || "Kathmandu"
                    setSelectedLocation(`${city}, NP`)
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  <option value="">Kathmandu</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              {/* Voice Search Button */}
              <AISearchDialog onSearch={handleVoiceSearch} />
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mb-6">
            {["Apartment", "House", "Room", "Studio", "Flat"].map((f) => (
              <Button
                key={f}
                variant="outline"
                size="sm"
                className="rounded-full border-primary-lightest bg-white whitespace-nowrap"
              >
                {f}
              </Button>
            ))}
            <div className="w-px h-6 bg-primary-lightest mx-2" />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary-lightest bg-white flex items-center gap-2"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </Button>
          </div>
          </>
          )}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {properties.length === 0 
                ? "No properties available at the moment."
                : "No properties match your search criteria."}
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="w-full h-[calc(100vh-180px)] min-h-[600px] -mx-4 md:-mx-6">
            <MapViewSplit
              properties={filteredProperties}
              userLocation={userLocation}
              onPropertySelect={setSelectedProperty}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProperties.map((property) => (
              <div key={property.id} className="relative h-full">
                <Link to={`/property/${property.id}`} className="block h-full">
                  <Card className="group border-primary-lightest overflow-hidden hover:shadow-lg transition-all relative h-full flex flex-col">
                    {property.verified && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-green-500 text-white border-none">
                          Verified
                        </Badge>
                      </div>
                    )}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={property.imageUrls?.[0] || "/placeholder.svg"}
                        alt={property.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      {property.virtualTourUrl && (
                        <Badge className="absolute top-3 left-3 bg-white/90 text-primary-dark border-none text-[10px] uppercase font-bold tracking-wider">
                          360° Tour
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white z-20"
                        onClick={(e) => toggleFavorite(e, property.id)}
                      >
                        <Heart
                          className={`size-5 ${
                            favorites.includes(property.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </Button>
                    </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold line-clamp-2 flex-1">{property.title}</h3>
                      <Badge variant="secondary" className="bg-primary-lightest text-primary-dark text-[10px] ml-2 shrink-0">
                        {property.propertyType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="size-3" /> {property.city}, {property.district}
                    </div>
                    <div className="flex items-center justify-between border-t border-primary-lightest pt-3 mt-auto">
                      <div className="font-bold">Rs. {property.price.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">/ month</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && viewMode === 'grid' && filteredProperties.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProperties.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[12, 24, 36, 48]}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
