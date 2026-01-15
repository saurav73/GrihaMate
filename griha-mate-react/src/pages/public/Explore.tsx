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
import { parseVoiceQuery, summarizeParsedQuery } from "@/lib/nlpParser"

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

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar - Desktop */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Header - Sticky */}
            <div className="flex flex-col gap-4 mb-6 sticky top-0 bg-primary-lightest/95 backdrop-blur z-20 pb-4 pt-2">
              <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-1.5 rounded-xl shadow-sm border border-primary-lightest">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location, title..."
                    className="pl-9 h-9 bg-primary-lightest border-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchProperties()}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <AISearchDialog onSearch={handleVoiceSearch} />

                  {/* Mobile Filter Toggle */}
                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden h-9">
                        <SlidersHorizontal className="size-3.5 mr-2" /> Filters
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

                  {/* View Toggles */}
                  <div className="flex bg-primary-lightest rounded-lg p-1 border border-primary-lightest h-9 items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`rounded-md h-7 px-2 lg:px-3 text-xs ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="size-3.5 mr-1.5" /> <span className="hidden lg:inline">Grid</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`rounded-md h-7 px-2 lg:px-3 text-xs ${viewMode === 'split' ? 'bg-white shadow-sm text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setViewMode('split')}
                    >
                      <MapIcon className="size-3.5 mr-1.5" /> <span className="hidden lg:inline">Map</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex gap-6 h-[calc(100vh-280px)]">
              {/* Properties List */}
              <div className={`flex-1 overflow-y-auto pr-2 ${viewMode === 'grid' ? 'w-full' : ''}`}>
                {loading ? (
                  viewMode === 'split' ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-200 rounded-2xl h-48 animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
                      ))}
                    </div>
                  )
                ) : properties.length > 0 ? (
                  viewMode === 'split' ? (
                    <div className="space-y-4">
                      {properties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          variant="list"
                          userLocation={userLocation}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                      {properties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          variant="grid"
                          userLocation={userLocation}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-primary-lightest">
                    <div className="size-16 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4">
                      <Search className="size-8 text-primary-dark" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2">No properties found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We couldn't find any properties matching your criteria. Try adjusting your filters or search query.
                    </p>
                    <Button variant="link" onClick={handleResetFilters} className="mt-4 text-primary">
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Map (Only visible in split mode) */}
              {viewMode === 'split' && (
                <div className="hidden lg:block w-[380px] h-full rounded-2xl overflow-hidden border border-primary-lightest sticky top-0 shadow-sm shrink-0">
                  <MapViewSplit
                    properties={properties}
                    userLocation={userLocation}
                    onPropertySelect={() => { }}
                    onRequestLocation={getUserLocation}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
