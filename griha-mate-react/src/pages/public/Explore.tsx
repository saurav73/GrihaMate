import { Search, SlidersHorizontal, Grid, MapIcon } from "lucide-react"
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

  const fetchProperties = async () => {
    setLoading(true)
    try {
      // Build API params
      const apiParams: any = {}
      if (filters.city) apiParams.city = filters.city
      if (filters.propertyType) apiParams.propertyType = filters.propertyType
      if (filters.minPrice) apiParams.minPrice = filters.minPrice
      if (filters.maxPrice) apiParams.maxPrice = filters.maxPrice
      if (filters.minBedrooms) apiParams.minBedrooms = filters.minBedrooms

      // Call Search API
      const data = await propertiesAPI.search(apiParams)

      // Client-side filtering for text search (if API doesn't support generic text search yet)
      let finalData = data || []
      if (searchQuery) {
        finalData = finalData.filter(p =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase())
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
    fetchProperties()
    setShowMobileFilters(false)
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

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })

          // Optionally sort by distance here if not handled by API
          // For now, MapViewSplit handles the distance calculation for display
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }

  const handleVoiceSearch = (query: string) => {
    // Use NLP parser
    const parsed = parseVoiceQuery(query)

    console.log('Voice Search - Parsed:', parsed)

    // Apply parsed filters
    const newFilters = { ...filters }
    if (parsed.city) newFilters.city = parsed.city
    if (parsed.propertyType) newFilters.propertyType = parsed.propertyType
    if (parsed.minPrice) newFilters.minPrice = parsed.minPrice
    if (parsed.maxPrice) newFilters.maxPrice = parsed.maxPrice
    if (parsed.minBedrooms) newFilters.minBedrooms = parsed.minBedrooms

    setFilters(newFilters)
    setSearchQuery(query)

    // Trigger search after a brief delay to ensure state updates
    setTimeout(() => {
      fetchProperties()
    }, 100)

    // If nearby intent, get location
    if (parsed.nearby) {
      getUserLocation()
    }

    // Show what was understood
    const summary = summarizeParsedQuery(parsed)
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

  // Sort and Paginate
  const sortedProperties = [...properties].sort((a, b) => {
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

                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden h-11 rounded-full px-5 border-gray-200 hover:bg-gray-50">
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
                    onRequestLocation={() => {
                      if (navigator.geolocation) {
                        toast.info("Updating location...")
                        navigator.geolocation.getCurrentPosition(
                          (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                          () => toast.error("Could not access location")
                        )
                      }
                    }}
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
