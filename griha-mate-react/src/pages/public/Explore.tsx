import { Search, SlidersHorizontal, Grid, MapIcon, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AISearchDialog } from "@/components/ai-search-dialog"
import { MapViewSplit } from "@/components/MapViewSplit"
import { PropertyCard } from "@/components/PropertyCard"
import { FilterSidebar } from "@/components/FilterSidebar"
import { propertiesAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { parseVoiceQuery, summarizeParsedQuery } from "@/lib/nlpParser"
import { toast } from "react-toastify"

export default function ExplorePage() {
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split')
  const [searchParams] = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Filter State
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || "",
    propertyType: searchParams.get('type') || "",
    minPrice: searchParams.get('minPrice') || "",
    maxPrice: searchParams.get('maxPrice') || "",
    minBedrooms: searchParams.get('minBedrooms') || ""
  })

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "")

  const mockProperties: PropertyDto[] = [
    {
      id: 1,
      title: "Luxury Apartment in Thamel",
      description: "Beautiful apartment",
      address: "Thamel Marg",
      city: "Kathmandu",
      district: "Kathmandu",
      province: "Bagmati",
      price: 45000,
      bedrooms: 2,
      bathrooms: 1,
      area: 1200,
      propertyType: "APARTMENT",
      status: "AVAILABLE",
      imageUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
      verified: true,
      landlordId: 1,
      landlordName: "Test",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      features: ["WiFi", "Parking"]
    },
    // ... more mock data if needed for fallback
  ];

  const fetchProperties = async (customFilters?: typeof filters, customSearchQuery?: string) => {
    setLoading(true)
    try {
      // Use custom filters if provided, otherwise use state filters
      const activeFilters = customFilters || filters
      const activeQuery = customSearchQuery !== undefined ? customSearchQuery : searchQuery

      // Build API params
      const apiParams: any = {}
      if (activeFilters.city) apiParams.city = activeFilters.city
      if (activeFilters.propertyType) apiParams.propertyType = activeFilters.propertyType
      if (activeFilters.minPrice) apiParams.minPrice = activeFilters.minPrice
      if (activeFilters.maxPrice) apiParams.maxPrice = activeFilters.maxPrice
      if (activeFilters.minBedrooms) apiParams.minBedrooms = activeFilters.minBedrooms

      // Call Search API
      const data = await propertiesAPI.search(apiParams)

      // Client-side filtering for text search (if API doesn't support generic text search yet)
      let finalData = data || []
      if (activeQuery) {
        finalData = finalData.filter(p =>
          p.title.toLowerCase().includes(activeQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(activeQuery.toLowerCase())
        )
      }

      setProperties(finalData)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
      // Fallback to mock data on error (optional)
      setProperties(mockProperties)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, []) // Initial load

  const handleApplyFilters = () => {
    // Disable location-based filtering when applying filters manually
    // User is searching by city/filters, not by location
    setSearchNearby(false)
    fetchProperties()
    setShowMobileFilters(false)
  }

  const handleSearchNearby = () => {
    if (!userLocation) {
      // Get location first if not available
      getUserLocation()
      // Wait a bit for location to be set, then enable searchNearby
      setTimeout(() => {
        setSearchNearby(true)
        fetchProperties()
      }, 1000)
    } else {
      // Toggle searchNearby mode
      const newSearchNearby = !searchNearby
      setSearchNearby(newSearchNearby)
      if (newSearchNearby) {
        toast.success("Showing properties within 5km of your location", {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        toast.info("Showing all properties matching filters", {
          position: "top-right",
          autoClose: 2000,
        })
      }
      fetchProperties()
    }
  }

  const handleResetFilters = () => {
    setFilters({
      city: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      minBedrooms: ""
    })
    setSearchQuery("")
    setTimeout(fetchProperties, 0) // Fetch after state update cycle
  }

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false)
  const [searchNearby, setSearchNearby] = useState(false) // Toggle for location-based filtering

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          toast.success("Location detected! Showing properties within 5km radius", {
            position: "top-right",
            autoClose: 3000,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Could not access your location. Please enable location permissions.", {
            position: "top-right",
            autoClose: 5000,
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
      toast.error("Geolocation is not supported by your browser.", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  // Auto-get location when map view is enabled and location hasn't been requested
  // But don't auto-enable searchNearby - let user choose
  useEffect(() => {
    if (viewMode === 'split' && !userLocation && !locationPermissionRequested) {
      getUserLocation()
      setLocationPermissionRequested(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  const handleVoiceSearch = (query: string) => {
    // Use NLP parser
    const parsed = parseVoiceQuery(query)

    console.log('Voice Search - Parsed:', parsed)

    // Apply parsed filters (parser already returns correct format)
    const newFilters = { ...filters }
    if (parsed.city) newFilters.city = parsed.city
    if (parsed.propertyType) newFilters.propertyType = parsed.propertyType // Already in correct format (ROOM, FLAT, etc.)
    if (parsed.minPrice) newFilters.minPrice = parsed.minPrice
    if (parsed.maxPrice) newFilters.maxPrice = parsed.maxPrice
    if (parsed.minBedrooms) newFilters.minBedrooms = parsed.minBedrooms

    // Update state
    setFilters(newFilters)
    
    // If structured filters were parsed (city, type, price, etc.), don't use the full query as text search
    // The full query would filter out results that don't contain those exact words
    // Also, don't populate the search input field - just apply filters silently
    // Only use text search if no structured filters were parsed
    const hasStructuredFilters = parsed.city || parsed.propertyType || parsed.minPrice || parsed.maxPrice || parsed.minBedrooms
    const textQueryForSearch = hasStructuredFilters ? "" : query
    
    // Only update searchQuery if we're using text search (no structured filters)
    // This keeps the search input field clean when using voice search with structured filters
    if (!hasStructuredFilters) {
      setSearchQuery(textQueryForSearch)
    }
    // If structured filters exist, leave searchQuery unchanged (don't populate the input field)

    // Enable/disable location-based search based on voice query
    // Only enable GPS-based filtering if "near me" or "my location" is explicitly mentioned
    // If a city is mentioned, always search by city (not GPS location)
    if (parsed.useUserLocation && !parsed.city) {
      // Enable location-based search ONLY if user explicitly said "near me" AND no city was mentioned
      setSearchNearby(true)
      getUserLocation()
    } else {
      // Disable location-based search for city/filter-based searches
      // "nearby lalitpur" means "in/near lalitpur area", not "near my GPS location"
      setSearchNearby(false)
    }

    // Immediately execute search with new filters (don't wait for state update)
    // Pass empty text query if structured filters are used to avoid text filtering
    fetchProperties(newFilters, textQueryForSearch)

    // Show what was understood
    const summary = summarizeParsedQuery(parsed)
    toast.success(`🎤 Filters applied: ${summary}`, {
      position: "top-right",
      autoClose: 3000,
    })
    console.log(`Voice Search understood: ${summary}`)
  }

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Helper to calculate distance
  const getDistance = (p: PropertyDto) => {
    if (!userLocation || !p.latitude || !p.longitude) return Infinity
    const R = 6371;
    const dLat = (p.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (p.longitude - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(p.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Filter properties within 5km radius ONLY when searchNearby is enabled
  // When searchNearby is false, show all properties matching filters (city, type, price, etc.)
  const filteredProperties = (searchNearby && userLocation)
    ? properties.filter(p => {
        const distance = getDistance(p)
        return distance <= 5 // 5km radius
      })
    : properties

  // Sort and Paginate
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    // Prioritize distance if user location is known
    const distA = getDistance(a)
    const distB = getDistance(b)
    // Only sort by distance if both have locations and we are likely in 'Search Nearby' mode or just generally helpful
    // Allowing distance sort always if valid
    if (distA !== Infinity && distB !== Infinity) {
      return distA - distB
    }
    return 0
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage)
  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const displayedProperties = viewMode === 'grid' ? paginatedProperties : sortedProperties

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-6 w-full">
        {/* Main Content - Three Columns */}
        <div className="flex gap-6 items-start relative">
          {/* Desktop Filters - Sticky */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Main Window - Unified Header + Results */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Unified Search Header - Sticky Card spanning full width of content + map */}
            <div className="sticky top-24 z-30 bg-slate-50/95 backdrop-blur-sm pb-2 pt-0 transition-all duration-300">
              <Card className="flex flex-col md:flex-row gap-4 items-center p-3 md:p-4 bg-white rounded-3xl shadow-sm border border-indigo-50/50 w-full">
                {/* Search Input - Maximized Length */}
                <div className="relative flex-[4] w-full min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    placeholder="Search by location, title..."
                    className="pl-12 h-12 bg-gray-50/50 border-gray-100 rounded-full text-base shadow-none hover:bg-white hover:border-primary/30 focus:bg-white focus:border-primary transition-all w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchProperties()}
                  />
                </div>

                {/* Right Side Controls */}
                <div className="flex gap-3 w-full md:w-auto items-center justify-between md:justify-end shrink-0">
                  <AISearchDialog onSearch={handleVoiceSearch} />

                  {/* Search Around My Location Button */}
                  <Button
                    variant={searchNearby ? "default" : "outline"}
                    size="sm"
                    onClick={handleSearchNearby}
                    className={`h-11 rounded-full px-4 ${searchNearby ? 'bg-primary text-white' : 'border-gray-200 hover:bg-gray-50 hover:!text-gray-900'}`}
                    title={searchNearby ? "Showing properties within 5km. Click to disable." : "Click to show properties within 5km of your location"}
                  >
                    <Navigation className="size-4 mr-2" />
                    {searchNearby ? 'Nearby Active' : 'Search Nearby'}
                  </Button>

                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden h-11 rounded-full px-5 border-gray-200 hover:bg-gray-50 hover:!text-gray-900">
                        <SlidersHorizontal className="size-4 mr-2" /> Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-none w-full sm:w-80">
                      <FilterSidebar
                        filters={filters}
                        setFilters={setFilters}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                        showMobile={true}
                        onCloseMobile={() => setShowMobileFilters(false)}
                      />
                    </SheetContent>
                  </Sheet>

                  <div className="flex bg-gray-100/80 rounded-full p-1.5 h-11 items-center border border-gray-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`rounded-full h-8 px-4 text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="size-3.5 mr-2" /> Grid
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`rounded-full h-8 px-4 text-xs font-semibold transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                      onClick={() => setViewMode('split')}
                    >
                      <MapIcon className="size-3.5 mr-2" /> Map
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Results + Map Section */}
            <div className="flex gap-6 items-start relative">
              {/* Property Cards Column */}
              <div className="flex-1 min-w-0">

                {/* Property Cards */}
                <div className={`space-y-4 pb-12 ${viewMode === 'grid' ? 'w-full' : ''}`}>
                  {loading ? (
                    viewMode === 'split' ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="bg-gray-200 rounded-xl h-40 animate-pulse" />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />)}
                      </div>
                    )
                  ) : displayedProperties.length > 0 ? (
                    viewMode === 'split' ? (
                      <div className="space-y-4">
                        {displayedProperties.map((property) => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            variant="list"
                            userLocation={userLocation}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {displayedProperties.map((property) => (
                            <PropertyCard
                              key={property.id}
                              property={property}
                              variant="grid"
                              userLocation={userLocation}
                            />
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-center gap-2 mt-8">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                              Previous
                            </Button>
                            <span className="flex items-center px-4 text-sm font-medium text-gray-600">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-500">No properties found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Map View - Sticky */}
              {viewMode === 'split' && (
                <div className="hidden lg:block w-[450px] shrink-0 sticky top-48 h-[calc(100vh-200px)] rounded-2xl overflow-hidden shadow-md border border-gray-200">
                  <MapViewSplit
                    properties={sortedProperties}
                    userLocation={userLocation}
                    searchNearby={searchNearby}
                    onRequestLocation={handleSearchNearby}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer should be outside main flex flow if needed, but previously was at bottom */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}

