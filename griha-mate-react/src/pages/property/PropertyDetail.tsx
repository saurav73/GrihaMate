import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { propertiesAPI, paymentAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { generateSuccessMessage } from "@/lib/humanLanguage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Bed, Bath, Square, Phone, CreditCard, Wallet, Share2, Heart, Maximize2, Navigation as NavigationIcon, ExternalLink, CheckCircle2 } from "lucide-react"
import { toast } from "react-toastify"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function PropertyDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<PropertyDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [, setPaymentMethod] = useState<'esewa' | 'card' | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showVirtualTour, setShowVirtualTour] = useState(false)
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
    if (!property) return
    try {
      await propertiesAPI.requestProperty(property.id, requestMessage)

      // Also send the email notification as before, effectively double-notifying or we can rely on backend.
      // Since backend now sends email, we can skip frontend email trigger or keep it as backup?
      // Backend PropertyRequestService sends email. So we don't need to send it from frontend.

      toast.success("Request sent successfully! Landlord will contact you.", {
        position: "top-right",
        autoClose: 5000,
      })
      setIsRequestModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to send request", {
        position: "top-right",
        autoClose: 5000,
      })
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
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={property.imageUrls?.[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
                {property.verified && (
                  <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                    Verified Property
                  </Badge>
                )}
              </div>
              {property.imageUrls && property.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.imageUrls.slice(1, 5).map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={url} alt={`${property.title} ${idx + 2}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>

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
              <Card className="border-primary-lightest overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary to-primary p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Maximize2 className="size-6" />
                            360° Virtual Tour
                          </h2>
                          <p className="text-blue-100">
                            Explore every corner from anywhere
                          </p>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                          Live 360°
                        </Badge>
                      </div>
                    </div>
                    <div className="aspect-video bg-gray-900 relative">
                      {showVirtualTour ? (
                        <iframe
                          src={property.virtualTourUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="360° Virtual Tour"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/90 to-primary/90">
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <Maximize2 className="size-10 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white text-xl font-bold mb-2">
                                Immersive 360° Experience
                              </h3>
                              <p className="text-blue-100 text-sm mb-4">
                                Walk through the property virtually
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className="bg-white text-primary-dark hover:bg-primary-lightest"
                              onClick={() => setShowVirtualTour(true)}
                            >
                              <Share2 className="mr-2 size-5" />
                              Launch Virtual Tour
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-primary-lightest border-t border-blue-100">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            ✓ High-definition 360° panoramas
                          </div>
                          <div className="flex items-center gap-1">
                            ✓ Interactive navigation
                          </div>
                          <div className="flex items-center gap-1">
                            ✓ Room-to-room walkthrough
                          </div>
                        </div>
                        {showVirtualTour && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(property.virtualTourUrl, '_blank')}
                          >
                            <ExternalLink className="size-4 mr-1" />
                            Open in new tab
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            {property.latitude && property.longitude && (
              <Card className="border-primary-lightest overflow-hidden relative z-0">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary to-primary p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          <MapPin className="size-6" />
                          Property Location
                        </h2>
                        <p className="text-blue-100">
                          {property.address}, {property.city}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
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
                  <div className="h-[400px] relative z-0">
                    <MapContainer
                      center={[property.latitude, property.longitude]}
                      zoom={15}
                      className="h-full w-full z-0"
                      zoomControl={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[property.latitude, property.longitude]}
                        icon={L.divIcon({
                          html: `<div style="
                            background-color: #2E5E99;
                            width: 40px;
                            height: 40px;
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            border: 3px solid white;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-center: center;
                          ">
                            <div style="transform: rotate(45deg); color: white; font-size: 20px;">🏠</div>
                          </div>`,
                          className: 'custom-marker',
                          iconSize: [40, 40],
                          iconAnchor: [20, 40],
                        })}
                      >
                        <Popup>
                          <div className="text-center p-2">
                            <h3 className="font-bold text-base mb-1">{property.title}</h3>
                            <p className="text-sm text-gray-600">{property.address}</p>
                            <p className="text-sm text-gray-600">{property.city}, {property.district}</p>
                            <p className="text-lg font-bold text-primary-dark mt-2">
                              Rs. {property.price.toLocaleString()}/month
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Address</p>
                        <p className="font-semibold text-gray-900">{property.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Area</p>
                        <p className="font-semibold text-gray-900">
                          {property.city}, {property.district}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Province</p>
                        <p className="font-semibold text-gray-900">{property.province}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Coordinates</p>
                        <p className="font-semibold text-gray-900 text-xs">
                          {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="border-primary-light shadow-lg sticky top-24 overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-primary-dark p-4 text-white">
                <div className="text-3xl font-bold">Rs. {property.price.toLocaleString()}</div>
                <div className="text-primary-lightest text-sm">per month</div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="hidden">
                  <div className="text-4xl font-bold text-primary-dark">Rs. {property.price.toLocaleString()}</div>
                  <div className="text-muted-foreground">per month</div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg transition-all"
                    size="lg"
                    onClick={handleRequestClick}
                  >
                    <Phone className="mr-2 size-5" />
                    Request to Book / Contact
                  </Button>
                  <Button
                    variant="outline"
                    className={`w-full ${isFavorite
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                      : "border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500"
                      }`}
                    onClick={toggleFavorite}
                  >
                    <Heart className={`mr-2 size-4 ${isFavorite ? "fill-white" : ""}`} />
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </Button>

                  <div className="pt-3 border-t border-primary-lightest space-y-2">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Payment Options</p>
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
                  </div>
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
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
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
              <Button onClick={submitRequest}>Send Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sprite Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
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

      <Footer />
    </div>
  )
}
