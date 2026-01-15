import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  Navigation,
  SlidersHorizontal,
  X,
  Heart,
  Bed,
  Bath,
  Square,
  ChevronLeft,
  ChevronRight,
  Home,
  DollarSign,
  Maximize2,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { PropertyDto } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Custom marker icons
const createPropertyIcon = (propertyType: string, verified: boolean, isSelected: boolean = false) => {
  const color = isSelected ? '#7BA4D0' : (verified ? '#10b981' : '#f59e0b')
  const size = isSelected ? 44 : 36
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.${isSelected ? '5' : '3'});
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: ${isSelected ? '20px' : '16px'};
        font-weight: bold;
      ">
        ${propertyType === 'APARTMENT' ? '🏢' : propertyType === 'HOUSE' ? '🏠' : propertyType === 'ROOM' ? '🛏️' : '🏘️'}
      </div>
    </div>
  `
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative;">
        <div style="
          background-color: #2E5E99;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 10px rgba(46, 94, 153, 0.6);
          position: relative;
          z-index: 1000;
        "></div>
        <div style="
          background-color: rgba(46, 94, 153, 0.2);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-ring 2s infinite;
        "></div>
      </div>
    `,
    className: 'user-marker',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  })
}

interface MapViewSplitProps {
  properties: PropertyDto[]
  userLocation?: { lat: number; lng: number } | null
  onPropertySelect?: (property: PropertyDto | null) => void
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

export function MapViewSplit({ properties, userLocation, onPropertySelect }: MapViewSplitProps) {
  const navigate = useNavigate()
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240])
  const [mapZoom, setMapZoom] = useState(12)
  const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null)
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [showListings, setShowListings] = useState(true)

  // Filter states
  const [priceRange, setPriceRange] = useState<[number]>([100000])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [minBedrooms, setMinBedrooms] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [virtualTourOnly, setVirtualTourOnly] = useState(false)

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter and sort properties
  const filteredProperties = properties
    .filter((p) => {
      if (p.price > priceRange[0]) return false
      if (selectedTypes.length > 0 && !selectedTypes.includes(p.propertyType)) return false
      if (selectedCities.length > 0 && !selectedCities.includes(p.city)) return false
      if (p.bedrooms < minBedrooms) return false
      if (verifiedOnly && !p.verified) return false
      if (virtualTourOnly && !p.virtualTourUrl) return false
      return true
    })
    .map((p) => {
      // Calculate distance if user location is available
      if (userLocation && p.latitude && p.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          p.latitude,
          p.longitude
        )
        return { ...p, distance }
      }
      return p
    })
    .sort((a, b) => {
      // Sort by distance if available (nearest first)
      if ('distance' in a && 'distance' in b) {
        return (a.distance as number) - (b.distance as number)
      }
      return 0
    })

  // Get unique cities and types
  const cities = Array.from(new Set(properties.map((p) => p.city)))
  const propertyTypes = Array.from(new Set(properties.map((p) => p.propertyType)))

  const handlePropertyClick = useCallback((property: PropertyDto) => {
    setSelectedProperty(property)
    setMapCenter([property.latitude!, property.longitude!])
    setMapZoom(15)
    onPropertySelect?.(property)
  }, [onPropertySelect])

  const toggleFavorite = (e: React.MouseEvent, propertyId: number) => {
    e.preventDefault()
    e.stopPropagation()

    const isFavorite = favorites.includes(propertyId)
    const updatedFavorites = isFavorite
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId]

    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites', {
      position: 'top-center',
      autoClose: 2000,
    })
  }

  const togglePropertyType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }

  const clearFilters = () => {
    setPriceRange([100000])
    setSelectedTypes([])
    setSelectedCities([])
    setMinBedrooms(0)
    setVerifiedOnly(false)
    setVirtualTourOnly(false)
  }

  const activeFiltersCount =
    (selectedTypes.length > 0 ? 1 : 0) +
    (selectedCities.length > 0 ? 1 : 0) +
    (minBedrooms > 0 ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (virtualTourOnly ? 1 : 0) +
    (priceRange[0] < 100000 ? 1 : 0)

  return (
    <div className="flex h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Left Sidebar - Filters */}
      <div
        className={`${
          showFilters ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col shrink-0 relative z-30 shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary to-primary shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-white" />
            <h3 className="font-bold text-white">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge className="bg-white text-primary-dark">{activeFiltersCount}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 space-y-6">
            {/* Price Range */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Price Range (Max)
              </Label>
              <div className="space-y-2">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number])}
                  max={100000}
                  min={5000}
                  step={5000}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rs. 5,000</span>
                  <span className="font-semibold text-primary-dark">
                    Rs. {priceRange[0].toLocaleString()}
                  </span>
                  <span className="text-gray-600">Rs. 100,000</span>
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Property Type
              </Label>
              <div className="space-y-2">
                {propertyTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => togglePropertyType(type)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                    >
                      {type === 'APARTMENT' && '🏢'}
                      {type === 'HOUSE' && '🏠'}
                      {type === 'ROOM' && '🛏️'}
                      {type === 'FLAT' && '🏘️'}
                      {type}
                      <span className="text-xs text-gray-500">
                        ({properties.filter((p) => p.propertyType === type).length})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Cities */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Location
              </Label>
              <div className="space-y-2">
                {cities.map((city) => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${city}`}
                      checked={selectedCities.includes(city)}
                      onCheckedChange={() => toggleCity(city)}
                    />
                    <label
                      htmlFor={`city-${city}`}
                      className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                    >
                      <MapPin className="size-3" />
                      {city}
                      <span className="text-xs text-gray-500">
                        ({properties.filter((p) => p.city === city).length})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Minimum Bedrooms
              </Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((beds) => (
                  <Button
                    key={beds}
                    variant={minBedrooms === beds ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMinBedrooms(beds)}
                    className={
                      minBedrooms === beds
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary-lightest'
                    }
                  >
                    {beds === 0 ? 'Any' : beds}
                  </Button>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Additional
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={verifiedOnly}
                    onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                  />
                  <label htmlFor="verified" className="text-sm text-gray-700 cursor-pointer">
                    Verified properties only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="virtual-tour"
                    checked={virtualTourOnly}
                    onCheckedChange={(checked) => setVirtualTourOnly(checked as boolean)}
                  />
                  <label
                    htmlFor="virtual-tour"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Has 360° virtual tour
                  </label>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={clearFilters}
              >
                <X className="size-4 mr-2" />
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="text-sm text-center">
            <span className="font-semibold text-primary-dark">{filteredProperties.length}</span>
            <span className="text-gray-600"> properties found</span>
          </div>
        </div>
      </div>

      {/* Toggle Filter Button */}
      {!showFilters && (
        <Button
          className="absolute left-4 top-4 z-50 bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          size="icon"
          onClick={() => setShowFilters(true)}
        >
          <ChevronRight className="size-5" />
        </Button>
      )}

      {/* Center - Map */}
      <div className="flex-1 relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* User Location */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
              <Popup>
                <div className="text-center p-1">
                  <p className="font-bold text-primary-dark">📍 Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Property Markers */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            iconCreateFunction={(cluster: any) => {
              const count = cluster.getChildCount()
              return L.divIcon({
                html: `<div style="
                  background: linear-gradient(135deg, #7BA4D0, #2E5E99);
                  color: white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  border: 3px solid white;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                ">${count}</div>`,
                className: 'custom-cluster',
                iconSize: L.point(40, 40),
              })
            }}
          >
            {filteredProperties
              .filter((p) => p.latitude && p.longitude)
              .map((property) => (
                <Marker
                  key={property.id}
                  position={[property.latitude!, property.longitude!]}
                  icon={createPropertyIcon(
                    property.propertyType,
                    property.verified,
                    selectedProperty?.id === property.id || hoveredProperty === property.id
                  )}
                  eventHandlers={{
                    click: () => handlePropertyClick(property),
                    mouseover: () => setHoveredProperty(property.id),
                    mouseout: () => setHoveredProperty(null),
                  }}
                >
                  <Popup maxWidth={300}>
                    <div className="p-2">
                      <img
                        src={property.imageUrls?.[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <h4 className="font-bold text-sm mb-1">{property.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        <MapPin className="size-3 inline mr-1" />
                        {property.address}, {property.city}
                      </p>
                      <p className="text-lg font-bold text-primary-dark">
                        Rs. {property.price.toLocaleString()}/mo
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Map Info Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <Card className="bg-white/95 backdrop-blur-md shadow-xl">
            <CardContent className="p-3 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Home className="size-4 text-primary-dark" />
                <span className="font-semibold">{filteredProperties.length} Properties</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="size-4 text-green-500" />
                <span>{filteredProperties.filter((p) => p.verified).length} Verified</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Maximize2 className="size-4 text-purple-500" />
                <span>
                  {filteredProperties.filter((p) => p.virtualTourUrl).length} Virtual Tours
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar - Property Listings */}
      <div
        className={`${
          showListings ? 'w-96' : 'w-0'
        } transition-all duration-300 overflow-hidden bg-white border-l border-gray-200 flex flex-col shrink-0 relative z-30 shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark shrink-0">
          <h3 className="font-bold text-white">Available Properties</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowListings(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Nearby Search Banner */}
        {userLocation && filteredProperties.length > 0 && filteredProperties[0].distance !== undefined && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 p-3 shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="size-4 text-primary animate-pulse" />
              <span className="font-semibold text-primary-dark">
                Showing {filteredProperties.length} nearest properties
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              📍 Sorted by distance from your location
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 space-y-4">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="size-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No properties found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedProperty?.id === property.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : ''
                  }`}
                  onClick={() => handlePropertyClick(property)}
                  onMouseEnter={() => setHoveredProperty(property.id)}
                  onMouseLeave={() => setHoveredProperty(null)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={property.imageUrls?.[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-40 object-cover"
                      />
                      {property.verified && (
                        <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                      {property.virtualTourUrl && (
                        <Badge className="absolute top-2 right-2 bg-purple-500 text-white text-xs">
                          360° Tour
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white"
                        onClick={(e) => toggleFavorite(e, property.id)}
                      >
                        <Heart
                          className={`size-4 ${
                            favorites.includes(property.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-600'
                          }`}
                        />
                      </Button>
                    </div>

                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm line-clamp-1">{property.title}</h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {property.propertyType}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 flex items-start gap-1">
                          <MapPin className="size-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{property.city}</span>
                        </p>
                        {'distance' in property && property.distance !== undefined && (
                          <p className="text-xs font-semibold text-primary flex items-center gap-1">
                            <Navigation className="size-3" />
                            {property.distance < 1
                              ? `${(property.distance * 1000).toFixed(0)}m away`
                              : `${property.distance.toFixed(1)}km away`}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Bed className="size-3" /> {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="size-3" /> {property.bathrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Square className="size-3" /> {property.area} sq.ft
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-lg font-bold text-primary-dark">
                            Rs. {property.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">per month</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-dark text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/property/${property.id}`)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Toggle Listings Button */}
      {!showListings && (
        <Button
          className="absolute right-4 top-4 z-50 bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          size="icon"
          onClick={() => setShowListings(true)}
        >
          <ChevronLeft className="size-5" />
        </Button>
      )}

      {/* CSS for animations and scrollbar styling */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        .custom-marker, .user-marker, .custom-cluster {
          background: transparent;
          border: none;
        }
        
        /* Custom Scrollbar Styles */
        .flex-1.overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .flex-1.overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        
        .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Firefox */
        .flex-1.overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f1f1;
        }
      `}</style>
    </div>
  )
}

