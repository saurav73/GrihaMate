import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { propertiesAPI, paymentAPI, propertyRequestAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { generateSuccessMessage } from "@/lib/humanLanguage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Bed, Bath, Square, Phone, CreditCard, Wallet, Share2, Heart, Maximize2, Navigation as NavigationIcon, ExternalLink, CheckCircle2, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { toast } from "react-toastify"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Helper Component to fit map bounds
function MapBoundsController({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [bounds, map])
  return null
}

// Calculate distance helper
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function PropertyDetailPage({ isDashboard = false }: { isDashboard?: boolean }) {
  const params = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<PropertyDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [, setPaymentMethod] = useState<'esewa' | 'card' | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showVirtualTour, setShowVirtualTour] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])
  const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number } | null>(null)
  const [requestStatus, setRequestStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PAID' | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.warn(error)
      )
    }
  }, [])

  useEffect(() => {
    if (userLocation && property?.latitude && property?.longitude) {
      // Fetch OSRM Route
      fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${property.longitude},${property.latitude}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            // OSRM returns [lon, lat], Leaflet needs [lat, lon]
            const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number])
            setRouteCoordinates(coords)
            setRouteInfo({ distance: data.routes[0].distance, duration: data.routes[0].duration })
          }
        })
        .catch(err => console.error("Routing error", err))
    }
  }, [userLocation, property])
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  })
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          toast.info("Please login to view property details", {
            position: "top-right",
            autoClose: 3000,
          })
          navigate('/login?redirect=/property/' + params.id)
          return
        }

        const data = await propertiesAPI.getById(Number(params.id))
        setProperty(data)

        // Check if current user is the owner
        const userData = localStorage.getItem('user')
        let userIsOwner = false
        if (userData) {
          try {
            const user = JSON.parse(userData)
            userIsOwner = user.role === 'LANDLORD' && user.id === data.landlordId
            setIsOwner(userIsOwner)
          } catch (e) {
            setIsOwner(false)
          }
        }

        // Check request status (only for non-owners)
        if (!userIsOwner) {
          try {
            const request = await propertyRequestAPI.checkStatus(data.id)
            if (request) {
              setRequestStatus(request.status)
            }
          } catch (err: any) {
            // Silently handle error - user may not have a request yet
            // This prevents error notifications for expected scenarios
            if (!err.message?.includes("Query did not return")) {
              console.error("Failed to check request status", err)
            }
          }
        }

        // Check if property is in favorites
        const savedFavorites = localStorage.getItem("favorites")
        const favoriteIds: number[] = savedFavorites ? JSON.parse(savedFavorites) : []
        setIsFavorite(favoriteIds.includes(data.id))
      } catch (err: any) {
        toast.error(err.message || "Failed to load property", {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProperty()
    }
  }, [params.id, navigate])

  const toggleFavorite = () => {
    if (!property) return

    const savedFavorites = localStorage.getItem("favorites")
    const favoriteIds: number[] = savedFavorites ? JSON.parse(savedFavorites) : []

    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favoriteIds.filter((id) => id !== property.id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      setIsFavorite(false)
      // Generate AI message without blocking
      generateSuccessMessage("unfavorite", property.title).then(msg => {
        toast.success(msg, {
          position: "top-center",
          autoClose: 2000,
        })
      }).catch(() => {
        toast.success("Removed from favorites", {
          position: "top-center",
          autoClose: 2000,
        })
      })
    } else {
      // Add to favorites
      favoriteIds.push(property.id)
      localStorage.setItem("favorites", JSON.stringify(favoriteIds))
      setIsFavorite(true)
      // Generate AI message without blocking
      generateSuccessMessage("favorite", property.title).then(msg => {
        toast.success(msg, {
          position: "top-center",
          autoClose: 2000,
        })
      }).catch(() => {
        toast.success("Added to favorites", {
          position: "top-center",
          autoClose: 2000,
        })
      })
    }
  }

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")

  const handleRequestClick = () => {
    if (!localStorage.getItem('token')) {
      toast.info("Please login to request this property", { position: "top-right" })
      navigate('/login?redirect=/property/' + params.id)
      return
    }
    // Pre-fill message
    setRequestMessage(`I am interested in your property: ${property?.title}. Please let me know if it's available.`)
    setIsRequestModalOpen(true)
  }

  const submitRequest = async () => {
    if (!property || requestLoading) return
    setRequestLoading(true)
    try {
      await propertiesAPI.requestProperty(property.id, requestMessage)

      // Also send the email notification as before, effectively double-notifying or we can rely on backend.
      // Since backend now sends email, we can skip frontend email trigger or keep it as backup?
      // Backend PropertyRequestService sends email. So we don't need to send it from frontend.

      toast.success("Request sent successfully! Landlord will contact you.", {
        position: "top-right",
        autoClose: 5000,
      })
      setRequestStatus('PENDING')
      setIsRequestModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to send request", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setRequestLoading(false)
    }
  }

  const handlePayment = async (method: 'esewa' | 'card') => {
    if (!property) return
    setPaymentMethod(method)

    try {
      if (method === 'esewa') {
        const result = await paymentAPI.initiateEsewa(property.price, property.id)
        // Create and submit form to eSewa
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = result.action

        Object.keys(result).forEach(key => {
          if (key !== 'action') {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = result[key]
            form.appendChild(input)
          }
        })

        document.body.appendChild(form)
        form.submit()
      } else {
        setShowPayment(true)
        await paymentAPI.initiateSprite(property.price, property.id)
        toast.info("Payment form ready", {
          position: "top-right",
          autoClose: 2000,
        })
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-lightest flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading property...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-primary-lightest flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Property not found</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDashboard ? 'bg-transparent pb-12' : 'bg-primary-lightest flex flex-col'}`}>
      {!isDashboard && <Navbar />}
      <main className={`flex-1 ${isDashboard ? 'max-w-full' : 'max-w-7xl mx-auto px-4 md:px-6 py-8 w-full'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setIsImageLightboxOpen(true)}>
                <img
                  src={property.imageUrls?.[selectedImageIndex] || property.imageUrls?.[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                {property.verified && (
                  <Badge className="absolute top-4 left-4 bg-green-500 text-white z-10">
                    Verified Property
                  </Badge>
                )}
                {property.imageUrls && property.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImageIndex((prev) => (prev - 1 + property.imageUrls.length) % property.imageUrls.length)
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="size-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImageIndex((prev) => (prev + 1) % property.imageUrls.length)
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="size-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {property.imageUrls.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImageIndex(idx)
                          }}
                          className={`size-2 rounded-full transition-all ${
                            idx === selectedImageIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              {property.imageUrls && property.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.imageUrls.slice(0, 4).map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        idx === selectedImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <img 
                        src={url} 
                        alt={`${property.title} ${idx + 1}`} 
                        className="object-cover w-full h-full hover:scale-110 transition-transform duration-300" 
                      />
                      {idx === selectedImageIndex && (
                        <div className="absolute inset-0 bg-primary/10" />
                      )}
                    </div>
                  ))}
                  {property.imageUrls.length > 4 && (
                    <div
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all bg-gray-100 flex items-center justify-center"
                      onClick={() => setIsImageLightboxOpen(true)}
                    >
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">+{property.imageUrls.length - 4}</p>
                        <p className="text-xs text-gray-500">More</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Image Lightbox Modal */}
            {isImageLightboxOpen && property.imageUrls && (
              <Dialog open={isImageLightboxOpen} onOpenChange={setIsImageLightboxOpen}>
                <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
                  <div className="relative w-full h-full flex items-center">
                    <button
                      onClick={() => setIsImageLightboxOpen(false)}
                      className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                      aria-label="Close"
                    >
                      <X className="size-6" />
                    </button>
                    {property.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev - 1 + property.imageUrls.length) % property.imageUrls.length)}
                          className="absolute left-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="size-8" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev + 1) % property.imageUrls.length)}
                          className="absolute right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight className="size-8" />
                        </button>
                      </>
                    )}
                    <img
                      src={property.imageUrls[selectedImageIndex] || "/placeholder.svg"}
                      alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain mx-auto"
                    />
                    {property.imageUrls.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                        {property.imageUrls.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`size-2 rounded-full transition-all ${
                              idx === selectedImageIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Property Details */}
            <Card className="border-primary-lightest">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{property.address}, {property.city}, {property.district}, {property.province}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Bed className="size-5 text-muted-foreground" />
                    <span className="font-medium">{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="size-5 text-muted-foreground" />
                    <span className="font-medium">{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="size-5 text-muted-foreground" />
                    <span className="font-medium">{property.area} sq ft</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-2">Description</h2>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>

                {property.features && property.features.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">Amenities & Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <CheckCircle2 className="size-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 360° Virtual Tour */}
            {property.virtualTourUrl && (
              <Card className="border-none shadow-xl overflow-hidden rounded-[32px]">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="bg-[#1C3B6F] p-8 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                            <Maximize2 className="size-6 rotate-45" />
                            360° Virtual Tour
                          </h2>
                          <p className="text-blue-100/80 text-lg">
                            Explore every corner from anywhere
                          </p>
                        </div>
                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm px-4 py-1.5 rounded-full backdrop-blur-md">
                          Live 360°
                        </Badge>
                      </div>
                    </div>
                    <div className="aspect-[21/9] bg-slate-900 relative">
                      {showVirtualTour ? (
                        <iframe
                          src={property.virtualTourUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="360° Virtual Tour"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1C3B6F]/95 to-[#0D2440]/95">
                          <div className="text-center space-y-6">
                            <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 animate-pulse">
                              <Maximize2 className="size-10 text-white rotate-45" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-white text-2xl font-bold">
                                Immersive 360° Experience
                              </h3>
                              <p className="text-blue-100/70">
                                Walk through the property virtually
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className="bg-white text-[#1C3B6F] hover:bg-blue-50 rounded-full px-8 h-12 font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
                              onClick={() => setShowVirtualTour(true)}
                            >
                              <Share2 className="mr-2 size-5" />
                              Launch Virtual Tour
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5 bg-white border-t border-slate-100">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-6 text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-[#1C3B6F]" />
                            High-definition panoramas
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-[#1C3B6F]" />
                            Interactive navigation
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-[#1C3B6F]" />
                            Room-to-room walkthrough
                          </div>
                        </div>
                        {showVirtualTour && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#1C3B6F] font-bold hover:bg-blue-50 rounded-full"
                            onClick={() => window.open(property.virtualTourUrl, '_blank')}
                          >
                            <ExternalLink className="size-4 mr-2" />
                            Open in new tab
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map with Route */}
            {property.latitude && property.longitude && (
              <Card className="border-primary-lightest overflow-hidden relative z-0">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          <MapPin className="size-6" />
                          Location & Route
                        </h2>
                        <p className="text-blue-100">
                          {property.address}, {property.city}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <NavigationIcon className="size-4 mr-1" />
                          Get Directions
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="h-[400px] md:h-[500px] bg-gray-100 relative z-0">
                    <MapContainer
                      center={[property.latitude, property.longitude]}
                      zoom={13}
                      className="h-full w-full"
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* Property Marker */}
                      <Marker
                        position={[property.latitude, property.longitude]}
                        icon={L.divIcon({
                          className: 'bg-transparent',
                          html: `<div class="bg-primary text-white p-2 rounded-full shadow-xl border-2 border-white transform hover:scale-110 transition-transform">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                 </div>`,
                          iconSize: [40, 40],
                          iconAnchor: [20, 40]
                        })}
                      >
                        <Popup>{property.title}</Popup>
                      </Marker>

                      {/* User Location & Route */}
                      {userLocation && (
                        <>
                          <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={L.divIcon({
                              className: 'bg-transparent',
                              html: `<div class="bg-blue-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white ring-2 ring-blue-200">
                                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                                     </div>`,
                              iconSize: [32, 32],
                              iconAnchor: [16, 16]
                            })}
                          >
                            <Popup>You are here</Popup>
                          </Marker>

                          {routeCoordinates.length > 0 ? (
                            <Polyline
                              positions={routeCoordinates}
                              color="#8b5cf6"
                              weight={5}
                              opacity={0.8}
                              dashArray="10, 10"
                            />
                          ) : (
                            <Polyline
                              positions={[
                                [userLocation.lat, userLocation.lng],
                                [property.latitude, property.longitude]
                              ]}
                              color="#8b5cf6"
                              weight={4}
                              opacity={0.5}
                              dashArray="5, 5"
                            />
                          )}

                          <MapBoundsController bounds={L.latLngBounds([
                            [userLocation.lat, userLocation.lng],
                            [property.latitude, property.longitude]
                          ])} />
                        </>
                      )}
                    </MapContainer>

                    {/* Route Info Overlay */}
                    {userLocation && (
                      <div className="absolute top-4 right-4 z-[500] animate-in fade-in slide-in-from-top-4 duration-500">
                        <Card className="shadow-2xl border-none bg-white/95 backdrop-blur">
                          <CardContent className="p-4 flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Distance</p>
                              <p className="text-xl font-bold text-gray-900">
                                {routeInfo ? (routeInfo.distance / 1000).toFixed(1) : calculateDistance(userLocation.lat, userLocation.lng, property.latitude, property.longitude).toFixed(1)}
                                <span className="text-sm font-normal text-gray-500 ml-1">km</span>
                              </p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="text-center">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Est. Time</p>
                              <p className="text-xl font-bold text-blue-600">
                                {routeInfo ? Math.round(routeInfo.duration / 60) : Math.round(calculateDistance(userLocation.lat, userLocation.lng, property.latitude, property.longitude) * 3)}
                                <span className="text-sm font-normal text-gray-500 ml-1">min</span>
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="border-primary-light shadow-lg sticky top-24 overflow-hidden">
              <div className="bg-primary p-4 text-white">
                <div className="text-3xl font-bold">Rs. {property.price.toLocaleString()}</div>
                <div className="text-white/80 text-sm">per month</div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="hidden">
                  <div className="text-4xl font-bold text-primary-dark">Rs. {property.price.toLocaleString()}</div>
                  <div className="text-muted-foreground">per month</div>
                </div>

                <div className="space-y-3">
                  {!isOwner && (
                    <Button
                      className={`w-full ${requestStatus === 'PENDING' ? 'bg-orange-700 hover:bg-orange-800' : 'bg-primary hover:bg-primary-dark'} text-white shadow-md hover:shadow-lg transition-all`}
                      size="lg"
                      onClick={handleRequestClick}
                      disabled={requestStatus === 'PENDING' || requestStatus === 'ACCEPTED' || requestStatus === 'PAID' || requestLoading}
                    >
                      {requestLoading ? (
                        <>
                          <Loader2 className="mr-2 size-5 animate-spin" />
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 size-5" />
                          {requestStatus === 'PENDING' ? 'Request Sent (Pending)' :
                            requestStatus === 'ACCEPTED' || requestStatus === 'PAID' ? 'Request Approved' :
                              'Request to Book / Contact'}
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className={`w-full ${isFavorite
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                      : "border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 hover:!text-red-500"
                      }`}
                    onClick={toggleFavorite}
                  >
                    <Heart className={`mr-2 size-4 ${isFavorite ? "fill-white" : ""}`} />
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </Button>

                  {!isOwner && (
                    <div className="pt-3 border-t border-primary-lightest space-y-2 relative">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Payment Options</p>

                      <div className="space-y-2 relative">
                        <Button
                          variant="outline"
                          className="w-full border-primary-light text-primary hover:bg-primary-lightest"
                          onClick={() => handlePayment('esewa')}
                        >
                          <Wallet className="mr-2 size-4" />
                          Pay with eSewa
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-primary-light text-primary hover:bg-primary-lightest"
                          onClick={() => handlePayment('card')}
                        >
                          <CreditCard className="mr-2 size-4" />
                          Pay with Card
                        </Button>

                        {(requestStatus !== 'ACCEPTED' && requestStatus !== 'PAID') && (
                          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center p-4 text-center border border-dashed border-amber-300 shadow-inner group">
                            <div className="space-y-1 transform group-hover:scale-105 transition-transform">
                              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-100/50 px-2 py-0.5 rounded-full inline-block mb-1">Feature Locked</p>
                              <p className="text-[11px] font-bold text-[#0D2440] leading-tight max-w-[180px]">
                                Send request and get approved to unlock the payment feature
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-primary-lightest">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary-lightest">{property.propertyType}</Badge>
                      <Badge variant="secondary" className="bg-primary-lightest">{property.status}</Badge>
                    </div>
                    <p className="text-xs">Listed by: {property.landlordName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Request Dialog */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen} >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Landlord</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi, I am interested in this property..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
              <Button onClick={submitRequest} disabled={requestLoading}>
                {requestLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sprite Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment} >
        <DialogContent className="sm:max-w-md" aria-describedby="payment-dialog-description">
          <DialogHeader>
            <DialogTitle>Card Payment</DialogTitle>
          </DialogHeader>
          <p id="payment-dialog-description" className="sr-only">Enter your card details to complete the payment</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\s/g, '') })}
                maxLength={16}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4)
                    }
                    setCardDetails({ ...cardDetails, expiryDate: value })
                  }}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPayment(false)
                  setCardDetails({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg"
                onClick={async () => {
                  if (!property) return
                  setProcessingPayment(true)
                  try {
                    const result = await paymentAPI.initiateSprite(property.price, property.id)
                    await paymentAPI.processSprite(result.transactionId, cardDetails)
                    toast.success("Payment processed successfully!", {
                      position: "top-right",
                      autoClose: 5000,
                    })
                    setShowPayment(false)
                    setCardDetails({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' })
                  } catch (err: any) {
                    toast.error(err.message || "Payment failed", {
                      position: "top-right",
                      autoClose: 5000,
                    })
                  } finally {
                    setProcessingPayment(false)
                  }
                }}
                disabled={processingPayment || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName}
              >
                {processingPayment ? "Processing..." : "Pay Rs. " + property.price.toLocaleString()}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Test Mode: Use any card number starting with 4, 5, or 3
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {!isDashboard && <Footer />}
    </div>
  )
}
