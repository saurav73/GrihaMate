import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { PropertyDto } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

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
const createPropertyIcon = (propertyType: string, verified: boolean) => {
  const color = verified ? '#10b981' : '#f59e0b' // green if verified, amber if not
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">
        ${propertyType === 'APARTMENT' ? '🏢' : propertyType === 'HOUSE' ? '🏠' : propertyType === 'ROOM' ? '🛏️' : '🏘️'}
      </div>
    </div>
  `
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
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
  onPropertySelect?: (property: PropertyDto) => void
  showRouting?: boolean
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
    map.setView(center, zoom)
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
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
        lineCap: 'round',
      }).addTo(map)

      // Fit bounds to show entire route
      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] })
    }

    return () => {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current)
      }
    }
  }, [route, map])

  return null
}

export function PropertyMap({ 
  properties, 
  userLocation, 
  selectedProperty,
  onPropertySelect,
  showRouting = true 
}: PropertyMapProps) {
  const navigate = useNavigate()
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240]) // Kathmandu default
  const [mapZoom, setMapZoom] = useState(12)
  const [route, setRoute] = useState<L.LatLng[] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  // Update map center based on user location or selected property
  useEffect(() => {
    if (selectedProperty && selectedProperty.latitude && selectedProperty.longitude) {
      setMapCenter([selectedProperty.latitude, selectedProperty.longitude])
      setMapZoom(15)
    } else if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setMapZoom(13)
    }
  }, [selectedProperty, userLocation])

  // Calculate route using OSRM (Open Source Routing Machine)
  const calculateRoute = async (property: PropertyDto) => {
    if (!userLocation || !property.latitude || !property.longitude) {
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
        
        // Calculate distance and duration
        const distance = (data.routes[0].distance / 1000).toFixed(1) // km
        const duration = Math.round(data.routes[0].duration / 60) // minutes
        setRouteInfo({ distance: parseFloat(distance), duration })
      }
    } catch (error) {
      console.error('Error calculating route:', error)
    } finally {
      setLoadingRoute(false)
    }
  }

  const handlePropertyClick = (property: PropertyDto) => {
    onPropertySelect?.(property)
    if (showRouting) {
      calculateRoute(property)
    }
  }

  const clearRoute = () => {
    setRoute(null)
    setRouteInfo(null)
    onPropertySelect?.(null as any)
  }

  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0
  )

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '500px' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} route={route} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-primary-dark">📍 Your Location</p>
                <p className="text-sm text-muted-foreground">Kathmandu, Nepal</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Property markers */}
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={createPropertyIcon(property.propertyType, property.verified)}
            eventHandlers={{
              click: () => handlePropertyClick(property)
            }}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                {property.imageUrls && property.imageUrls.length > 0 && (
                  <img
                    src={property.imageUrls[0]}
                    alt={property.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base line-clamp-1">{property.title}</h3>
                  {property.verified && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="size-3" />
                  <span className="line-clamp-1">{property.address}, {property.city}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {property.propertyType}
                  </Badge>
                  <span className="font-bold text-primary-dark">
                    Rs. {property.price.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    View Details
                  </Button>
                  {showRouting && userLocation && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => calculateRoute(property)}
                      disabled={loadingRoute}
                    >
                      <Navigation className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Route info card */}
      {routeInfo && selectedProperty && (
        <Card className="absolute top-4 right-4 z-[1000] p-4 bg-white/95 backdrop-blur-md shadow-xl border-primary-lightest max-w-xs">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="size-5 text-primary-dark" />
              <h4 className="font-bold text-sm">Route to Property</h4>
            </div>
            <button
              onClick={clearRoute}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-semibold">{routeInfo.distance} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Time:</span>
              <span className="font-semibold">{routeInfo.duration} min</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {selectedProperty.title}
              </p>
              <p className="text-xs text-primary-dark font-semibold">
                Rs. {selectedProperty.price.toLocaleString()}/month
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="icon"
          className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
        >
          +
        </Button>
        <Button
          size="icon"
          className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          onClick={() => setMapZoom(prev => Math.max(prev - 1, 8))}
        >
          −
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-[1000] p-3 bg-white/95 backdrop-blur-md shadow-lg border-primary-lightest">
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Verified Property</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Unverified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-lightest0 rounded-full"></div>
            <span>Your Location</span>
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
        .custom-marker {
          background: transparent;
          border: none;
        }
        .user-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  )
}

