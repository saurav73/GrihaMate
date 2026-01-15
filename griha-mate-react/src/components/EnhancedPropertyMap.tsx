import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, X, Search, Filter, Layers, Locate, ZoomIn, ZoomOut, Building2, Bed, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { PropertyDto } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Fix for default marker icons in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Custom property marker icon
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
      position: relative;
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
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  })
}

// User location icon
const createUserIcon = () => {
  const iconHtml = `
    <div style="
      background-color: #7BA4D0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    "></div>
  `
  return L.divIcon({
    html: iconHtml,
    className: 'user-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

interface PropertyMapProps {
  properties: PropertyDto[]
  userLocation?: { lat: number; lng: number } | null
  selectedProperty?: PropertyDto | null
  onPropertySelect?: (property: PropertyDto | null) => void
  showRouting?: boolean
  onMapBoundsChange?: (bounds: L.LatLngBounds) => void
}

// Component to track map bounds
function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds())
    },
    zoomend: () => {
      onBoundsChange(map.getBounds())
    },
  })
  return null
}

// Component to handle map center and routing
function MapController({ 
  center, 
  zoom, 
  route 
}: { 
  center: [number, number]; 
  zoom: number;
  route?: L.LatLng[] | null;
}) {
  const map = useMap()
  const polylineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])

  useEffect(() => {
    // Remove old route
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current)
    }

    // Draw new route
    if (route && route.length > 0) {
      polylineRef.current = L.polyline(route, {
        color: '#7BA4D0',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      // Fit bounds to show entire route
      map.fitBounds(polylineRef.current.getBounds(), { padding: [80, 80] })
    }

    return () => {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current)
      }
    }
  }, [route, map])

  return null
}

export function EnhancedPropertyMap({ 
  properties, 
  userLocation, 
  selectedProperty,
  onPropertySelect,
  showRouting = true,
  onMapBoundsChange 
}: PropertyMapProps) {
  const navigate = useNavigate()
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240])
  const [mapZoom, setMapZoom] = useState(12)
  const [route, setRoute] = useState<L.LatLng[] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number]>([100000])
  const [showSearchArea, setShowSearchArea] = useState(false)
  const [mapStyle, setMapStyle] = useState('default')
  const mapRef = useRef<L.Map | null>(null)

  // Update map center based on user location or selected property
  useEffect(() => {
    if (selectedProperty && selectedProperty.latitude && selectedProperty.longitude) {
      setMapCenter([selectedProperty.latitude, selectedProperty.longitude])
      setMapZoom(16)
    } else if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setMapZoom(13)
    }
  }, [selectedProperty, userLocation])

  // Calculate route using OSRM
  const calculateRoute = async (property: PropertyDto) => {
    if (!userLocation || !property.latitude || !property.longitude) {
      toast.error('Location information not available', { position: 'top-center' })
      return
    }

    setLoadingRoute(true)
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${property.longitude},${property.latitude}?overview=full&geometries=geojson`
      )
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates
        const routePoints = coordinates.map((coord: [number, number]) => 
          L.latLng(coord[1], coord[0])
        )
        setRoute(routePoints)
        
        const distance = (data.routes[0].distance / 1000).toFixed(1)
        const duration = Math.round(data.routes[0].duration / 60)
        setRouteInfo({ distance: parseFloat(distance), duration })
        
        toast.success('Route calculated successfully!', { 
          position: 'top-center',
          autoClose: 2000 
        })
      }
    } catch (error) {
      console.error('Error calculating route:', error)
      toast.error('Failed to calculate route', { position: 'top-center' })
    } finally {
      setLoadingRoute(false)
    }
  }

  const handlePropertyClick = (property: PropertyDto) => {
    onPropertySelect?.(property)
    if (showRouting && userLocation) {
      calculateRoute(property)
    }
  }

  const clearRoute = () => {
    setRoute(null)
    setRouteInfo(null)
    onPropertySelect?.(null)
  }

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setMapZoom(14)
      toast.info('Centered on your location', { 
        position: 'top-center',
        autoClose: 1500 
      })
    } else {
      toast.error('Location not available', { position: 'top-center' })
    }
  }

  const handleSearchThisArea = () => {
    setShowSearchArea(false)
    toast.info('Searching properties in this area...', {
      position: 'top-center',
      autoClose: 2000
    })
  }

  // Filter properties
  const filteredProperties = properties.filter(p => {
    if (!p.latitude || !p.longitude) return false
    if (propertyTypeFilter !== 'all' && p.propertyType !== propertyTypeFilter) return false
    if (p.price > priceRange[0]) return false
    return true
  })

  // Get tile layer URL based on map style
  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      case 'light':
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  }

  const getTileLayerAttribution = () => {
    switch (mapStyle) {
      case 'satellite':
        return '&copy; Esri'
      case 'dark':
      case 'light':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '600px' }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution={getTileLayerAttribution()}
          url={getTileLayerUrl()}
        />
        
        <MapController center={mapCenter} zoom={mapZoom} route={route} />
        <MapBoundsTracker 
          onBoundsChange={(bounds) => {
            setShowSearchArea(true)
            onMapBoundsChange?.(bounds)
          }}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-center p-1">
                <p className="font-bold text-primary-dark text-sm">📍 Your Location</p>
                <p className="text-xs text-muted-foreground">Current Position</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Property markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount()
            let size = 'small'
            if (count > 10) size = 'large'
            else if (count > 5) size = 'medium'

            return L.divIcon({
              html: `<div class="cluster-icon cluster-${size}">
                      <span>${count}</span>
                     </div>`,
              className: 'custom-cluster',
              iconSize: L.point(40, 40),
            })
          }}
        >
          {filteredProperties.map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude!, property.longitude!]}
              icon={createPropertyIcon(
                property.propertyType, 
                property.verified,
                selectedProperty?.id === property.id
              )}
              eventHandlers={{
                click: () => handlePropertyClick(property)
              }}
            >
              <Popup maxWidth={320} className="property-popup">
                <div className="p-3">
                  {property.imageUrls && property.imageUrls.length > 0 && (
                    <div className="relative mb-3">
                      <img
                        src={property.imageUrls[0]}
                        alt={property.title}
                        className="w-full h-36 object-cover rounded-xl"
                      />
                      {property.verified && (
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white border-none text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="font-bold text-base line-clamp-2 text-gray-900">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3 flex-shrink-0" />
                      <span className="line-clamp-1">{property.address}, {property.city}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="size-3" />
                        <span>{property.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        <span>{property.propertyType}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary-dark">
                          Rs. {property.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-primary hover:bg-primary-dark text-white"
                          onClick={() => navigate(`/property/${property.id}`)}
                        >
                          View Details
                        </Button>
                        {showRouting && userLocation && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary text-primary-dark hover:bg-primary-lightest"
                            onClick={(e) => {
                              e.stopPropagation()
                              calculateRoute(property)
                            }}
                            disabled={loadingRoute}
                          >
                            <Navigation className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Top Control Bar */}
      <Card className="absolute top-4 left-4 right-4 z-[1000] p-3 bg-white/95 backdrop-blur-md shadow-xl border-primary-lightest">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Property Type Filter */}
          <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="APARTMENT">Apartment</SelectItem>
              <SelectItem value="HOUSE">House</SelectItem>
              <SelectItem value="ROOM">Room</SelectItem>
              <SelectItem value="FLAT">Flat</SelectItem>
            </SelectContent>
          </Select>

          {/* Map Style Selector */}
          <Select value={mapStyle} onValueChange={setMapStyle}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <Layers className="size-4 mr-2" />
              <SelectValue placeholder="Map Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Toggle */}
          <Button
            size="sm"
            variant={showFilters ? "default" : "outline"}
            className={showFilters ? "bg-primary text-white" : ""}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="size-4 mr-1" />
            Filters
          </Button>

          {/* Properties Count */}
          <Badge variant="secondary" className="ml-auto">
            <Info className="size-3 mr-1" />
            {filteredProperties.length} Properties
          </Badge>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-primary-lightest space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max Price: Rs. {priceRange[0].toLocaleString()}/month
              </label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number])}
                max={100000}
                min={5000}
                step={5000}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Search This Area Button */}
      {showSearchArea && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-[1000]">
          <Button
            className="bg-primary hover:bg-primary-dark text-white shadow-xl animate-in slide-in-from-top-4"
            onClick={handleSearchThisArea}
          >
            <Search className="size-4 mr-2" />
            Search This Area
          </Button>
        </div>
      )}

      {/* Route Info Card */}
      {routeInfo && selectedProperty && (
        <Card className="absolute top-32 right-4 z-[1000] p-4 bg-white/95 backdrop-blur-md shadow-xl border-primary-lightest max-w-xs animate-in slide-in-from-right-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="size-5 text-primary-dark" />
              <h4 className="font-bold text-sm">Route Information</h4>
            </div>
            <button
              onClick={clearRoute}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-lightest rounded-lg p-2">
                <p className="text-xs text-primary mb-1">Distance</p>
                <p className="text-lg font-bold text-primary-dark">{routeInfo.distance} km</p>
              </div>
              <div className="bg-primary-lightest rounded-lg p-2">
                <p className="text-xs text-primary mb-1">Est. Time</p>
                <p className="text-lg font-bold text-primary-dark">{routeInfo.duration} min</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-muted-foreground mb-1">Destination</p>
              <p className="font-semibold text-gray-900 line-clamp-1">{selectedProperty.title}</p>
              <p className="text-sm text-primary-dark font-semibold mt-1">
                Rs. {selectedProperty.price.toLocaleString()}/month
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Right Side Controls */}
      <div className="absolute top-4 right-4 z-[999] flex flex-col gap-2">
        {/* Locate Me Button */}
        <Button
          size="icon"
          className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          onClick={centerOnUser}
          title="Center on my location"
        >
          <Locate className="size-5" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-20 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="icon"
          className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
          title="Zoom in"
        >
          <ZoomIn className="size-5" />
        </Button>
        <Button
          size="icon"
          className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          onClick={() => setMapZoom(prev => Math.max(prev - 1, 8))}
          title="Zoom out"
        >
          <ZoomOut className="size-5" />
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-[1000] p-3 bg-white/95 backdrop-blur-md shadow-lg border-primary-lightest">
        <h5 className="font-semibold text-xs text-gray-700 mb-2">Legend</h5>
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full shadow"></div>
            <span className="text-gray-600">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full shadow"></div>
            <span className="text-gray-600">Unverified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-lightest0 rounded-full shadow animate-pulse"></div>
            <span className="text-gray-600">Your Location</span>
          </div>
        </div>
      </Card>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        .custom-marker, .user-marker {
          background: transparent;
          border: none;
        }
        .custom-cluster {
          background: transparent;
          border: none;
        }
        .cluster-icon {
          background: linear-gradient(135deg, #7BA4D0, #2E5E99);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-center;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          width: 100%;
          height: 100%;
        }
        .cluster-small {
          width: 35px !important;
          height: 35px !important;
          font-size: 12px;
        }
        .cluster-medium {
          width: 40px !important;
          height: 40px !important;
          font-size: 14px;
        }
        .cluster-large {
          width: 50px !important;
          height: 50px !important;
          font-size: 16px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

