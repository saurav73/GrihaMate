import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  Home,
  Navigation,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  searchNearby?: boolean
  onPropertySelect?: (property: PropertyDto | null) => void
  onRequestLocation?: () => void
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

export function MapViewSplit({ properties, userLocation, searchNearby = false, onPropertySelect, onRequestLocation }: MapViewSplitProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240])
  const [mapZoom, setMapZoom] = useState(12)
  const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null)
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null)

  // Center map on user location when available
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setMapZoom(13) // Zoom level that shows ~5km radius nicely
    }
  }, [userLocation])

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

  // Filter and calculate distance for properties
  const mapProperties = properties
    .filter((p) => {
      // Filter to only show properties within 5km if user location is available
      if (userLocation && p.latitude && p.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          p.latitude,
          p.longitude
        )
        return distance <= 5 // 5km radius
      }
      // If no user location, show all properties with valid coordinates
      return p.latitude && p.longitude
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
  });

  const navigate = useNavigate();

  const handlePropertyClick = useCallback((property: PropertyDto) => {
    setSelectedProperty(property);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
    // Navigate to property detail page
    navigate(`/property/${property.id}`);
  }, [onPropertySelect, navigate]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-primary-lightest shadow-sm group">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* User Location & Radius Circle - Only show if searchNearby is enabled */}
        {searchNearby && userLocation && (
          <>
            {/* 5km Radius Circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={5000} // 5km in meters
              pathOptions={{
                color: '#2E5E99',
                fillColor: '#2E5E99',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '10, 5'
              }}
            />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-bold text-primary-dark">📍 Your Location</p>
                  <p className="text-xs text-gray-600 mt-1">Showing properties within 5km</p>
              </div>
            </Popup>
          </Marker>
          </>
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
          {mapProperties
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
                    <div className="space-y-1 mb-2">
                      <p className="text-xs text-gray-600">
                        <MapPin className="size-3 inline mr-1" />
                        {property.address}, {property.city}
                      </p>
                      {(property as any).distance && (
                        <p className="text-xs text-blue-600 font-medium">
                          <Navigation className="size-3 inline mr-1" />
                          {Number((property as any).distance) < 1
                            ? `${(Number((property as any).distance) * 1000).toFixed(0)}m away`
                            : `${Number((property as any).distance).toFixed(1)} km away`}
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary-dark">
                      Rs. {property.price.toLocaleString()}/mo
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Radar Animation Overlay (Search near me) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" id="radar-overlay" style={{ display: 'none' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-2 border-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-transparent via-primary/20 to-transparent w-[300px] h-[300px] rounded-full animate-spin [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
      </div>

      {/* Map Info Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
        <Card className="bg-white/95 backdrop-blur-md shadow-xl border-none">
          <CardContent className="p-3 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Home className="size-4 text-primary-dark" />
              <span className="font-semibold">
                {searchNearby && userLocation
                  ? `${mapProperties.length} Found (within 5km)`
                  : `${mapProperties.length} Found`}
              </span>
            </div>
            {searchNearby && userLocation && (
              <>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Navigation className="size-4 text-blue-500" />
              <span className="cursor-pointer hover:text-blue-600" onClick={() => {
                // Trigger radar animation manually
                const radar = document.getElementById('radar-overlay');
                if (radar) {
                  radar.style.display = 'block';
                  setTimeout(() => { radar.style.display = 'none'; }, 3000);
                }
                if (onRequestLocation) {
                  onRequestLocation();
                } else {
                  toast.info("Scanning for properties nearby...");
                }
              }}>
                    {userLocation ? 'Update Location' : 'Search Nearby (5km)'}
              </span>
            </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend / Stats */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2">
        <Badge className="bg-white/90 text-gray-700 hover:bg-white shadow-md backdrop-blur-sm border-none gap-2">
          <div className="size-2 rounded-full bg-green-500"></div> Verified
        </Badge>
        <Badge className="bg-white/90 text-gray-700 hover:bg-white shadow-md backdrop-blur-sm border-none gap-2">
          <div className="size-2 rounded-full bg-amber-500"></div> Standard
        </Badge>
      </div>

      <style>{`
        .custom-marker, .user-marker, .custom-cluster {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  )
}

