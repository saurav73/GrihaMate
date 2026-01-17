import { MapPin, DollarSign, Camera, Video, CheckCircle2, AlertTriangle, Crown, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { authAPI, propertiesAPI, imageAPI, subscriptionAPI } from "@/lib/api" // Added API imports
import { toast } from "react-toastify" // Added toast
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCurrentLocationDetails } from "@/lib/location" // Added location utility
import { PaymentModal } from "@/components/payment/PaymentModal"

export default function ListPropertyPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true) // Start with loading true
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [userStatus, setUserStatus] = useState<'FREE' | 'PREMIUM'>('FREE')
  const [propertyCount, setPropertyCount] = useState(0)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const [profile, properties] = await Promise.all([
          authAPI.getProfile(),
          propertiesAPI.getMyProperties()
        ])

        setUser(profile)
        setUserStatus(profile.subscriptionStatus || 'FREE')
        setPropertyCount(properties.length)

        if (profile.subscriptionStatus !== 'PREMIUM' && properties.length >= 2) {
          setIsLimitReached(true)
        }
      } catch (error) {
        console.error("Failed to check limits:", error)
      } finally {
        setCheckingLimit(false)
        setLoading(false)
      }
    }
    checkLimit()
  }, [])

  const handleUpgrade = async () => {
    setPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsLimitReached(false)
    setUserStatus('PREMIUM')
    toast.success("Welcome to Premium! Your account has been upgraded.")
  }

  // Form State
  const [formData, setFormData] = useState({
    propertyType: "Apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
    address: "",
    city: "Kathmandu", // Default city
    district: "Kathmandu",
    province: "Bagmati",
    description: "",
    price: "",
    availableFrom: "",
    leaseTerm: "",
    images: [] as File[],
    imageUrls: [] as string[],
    video: null as File | null,
    videoUrl: "",
    virtualTourUrl: "",
    features: [] as string[],
    latitude: 27.7172, // Default Kathmandu
    longitude: 85.3240
  })

  // Location Picker Component
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setFormData(prev => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        }))
        map.flyTo(e.latlng, map.getZoom())
      },
    })

    return formData.latitude && formData.longitude ? (
      <Marker
        position={[formData.latitude, formData.longitude]}
        icon={L.divIcon({
          html: `<div style="
              background-color: #0D2440;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>`,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        })}
      />
    ) : null
  }

  const detectLocation = async () => {
    try {
      toast.info("Detecting your location...", { autoClose: 2000 })
      const location = await getCurrentLocationDetails()

      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || prev.address,
        city: location.city || prev.city,
        district: location.district || prev.district,
        province: location.province || prev.province
      }))

      if (mapInstance) {
        mapInstance.flyTo([location.latitude, location.longitude], 15)
      }
      toast.success("Location and address detected!")
    } catch (error: any) {
      console.warn("Location detection failed:", error.message)
      toast.error(error.message || "Could not detect location. Please pin it manually.")
    }
  }

  // Common amenities
  const AMENITIES = [
    "WiFi", "Kitchen", "Parking", "Water Supply",
    "Electricity Backup", "Waste Disposal", "CCTV",
    "Hot Water", "Balcony", "Garden"
  ]

  const handleChange = (e: any) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const exists = prev.features.includes(feature)
      if (exists) {
        return { ...prev, features: prev.features.filter(f => f !== feature) }
      } else {
        return { ...prev, features: [...prev.features, feature] }
      }
    })
  }

  const handleImageUpload = (e: any) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[]
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }))
    }
  }

  const handleVideoUpload = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, video: e.target.files[0] }))
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      // 1. Upload Images
      const uploadedUrls: string[] = []
      for (const file of formData.images) {
        const res = await imageAPI.uploadImage(file)
        uploadedUrls.push(res.url)
      }

      // 2. Upload Video (if exists)
      let uploadedVideoUrl = formData.virtualTourUrl
      if (formData.video) {
        toast.info("Uploading video tour...", { autoClose: 2000 })
        const res = await imageAPI.uploadImage(formData.video)
        uploadedVideoUrl = res.url
      }

      // 3. Prepare Property DTO
      const propertyData: any = { // Using any to bypass partial type strictness for now
        title: `${formData.bedrooms} BHK ${formData.propertyType} in ${formData.address}`,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        province: formData.province,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseFloat(formData.area),
        propertyType: formData.propertyType.toUpperCase(),
        status: "AVAILABLE",
        imageUrls: uploadedUrls,
        virtualTourUrl: uploadedVideoUrl,
        features: formData.features,
        latitude: formData.latitude,
        longitude: formData.longitude
      }

      // 4. Call API
      await propertiesAPI.create(propertyData)

      toast.success("Property submitted for verification!")
      navigate("/dashboard/landlord")

    } catch (err: any) {
      console.error(err)
      if (err.message.includes("Free plan limit reached")) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Limit Reached!</span>
            <span>You have reached the limit of 2 properties on the Free plan. Please upgrade to Premium.</span>
          </div>,
          { autoClose: 8000 }
        )
      } else {
        toast.error(err.message || "Failed to list property")
      }
    } finally {
      setLoading(false)
    }
  }

  if (checkingLimit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D2440]"></div>
        <p className="text-gray-500 font-medium">Checking your account limits...</p>
      </div>
    )
  }

  if (isLimitReached) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#F8FAFC] border-2 border-[#A9CBF0] rounded-[2rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400"></div>

          <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-orange-50 border-2 border-orange-100 mb-8 relative">
            <Lock className="size-10 text-orange-500" />
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">LOCKED</div>
          </div>

          <h1 className="text-4xl font-extrabold text-[#0D2440] mb-4 tracking-tight">Free Limit Reached!</h1>
          <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
            You've listed <strong>{propertyCount} properties</strong> on our Free plan.
            Upgrade to <span className="text-[#2E5E99] font-bold">Premium (Valid for 3 months)</span> to unlock unlimited listings and priority support.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
            <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="size-5 text-green-500" />
                <span className="font-bold text-[#0D2440]">Unlimited Listings</span>
              </div>
              <p className="text-sm text-gray-500">List as many properties as you want, no restrictions.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="size-5 text-amber-500" />
                <span className="font-bold text-[#0D2440]">Premium Badge</span>
              </div>
              <p className="text-sm text-gray-500">Stand out with a verified premium landlord badge.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleUpgrade}
              className="w-full sm:w-auto bg-[#0D2440] hover:bg-[#1C3860] text-white h-14 px-10 rounded-2xl shadow-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Crown className="size-5" />
              Upgrade to Premium
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/landlord/manage-properties')}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl border-[#A9CBF0] text-gray-600 font-semibold"
            >
              Back to My Properties
            </Button>
          </div>

          <p className="mt-8 text-xs text-gray-400">Join 500+ premium landlords on GrihaMate</p>
        </div>

        {user && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            amount={499}
            propertyId={user.id}
            requestId={user.id}
            propertyTitle="Premium Subscription"
            onSuccess={handlePaymentSuccess}
            type="subscription"
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <main className="max-w-5xl mx-auto py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 mb-12 relative text-center">
          {userStatus === 'FREE' && (
            <div className="md:absolute top-0 right-0 animate-in fade-in slide-in-from-right-4 duration-1000">
              <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                <div className="size-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Free Plan: {propertyCount}/2 Used
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUpgrade}
                  className="h-7 px-2 text-[10px] font-bold text-[#2E5E99] hover:bg-blue-100 rounded-lg ml-2"
                >
                  UPGRADE
                </Button>
              </div>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2440]">List Your Property</h1>
            <p className="text-lg text-[#2E5E99] max-w-2xl mx-auto">
              Join thousands of verified landlords in Nepal. List your property in minutes.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${s <= step
                  ? "bg-[#0D2440] text-white"
                  : "bg-white border-2 border-[#A9CBF0] text-gray-400"
                  }`}
              >
                {s < step ? <CheckCircle2 className="size-5" /> : s}
              </div>
              {s < 6 && (
                <div
                  className={`w-12 h-1 ${s < step ? "bg-[#0D2440]" : "bg-[#A9CBF0]"}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-[#A9CBF0] shadow-xl bg-white rounded-3xl">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Property Basics</h2>
                  <p className="text-gray-500">First, let's get the core details of your property.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <select
                      id="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-[#A9CBF0] px-4 bg-white focus:ring-2 focus:ring-[#2E5E99] focus:outline-none transition-all"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Room">Room</option>
                      <option value="Flat">Flat</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input id="bedrooms" type="number" placeholder="2" className="h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.bedrooms} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" type="number" placeholder="1" className="h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.bathrooms} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sqft)</Label>
                    <Input id="area" type="number" placeholder="850" className="h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.area} onChange={handleChange} />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.bedrooms || !formData.area}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Next: Location
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Location & Map</h2>
                    <p className="text-gray-500">Pin your property on the map for seekers to find easily.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => detectLocation()}
                    className="border-[#2E5E99] text-[#2E5E99] hover:bg-blue-50 hover:text-[#0D2440] rounded-xl transition-all"
                  >
                    <MapPin className="size-4 mr-2" /> Detect My Location
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address / Landmark</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="address"
                      placeholder="e.g. Near Kalanki Temple, House No. 12"
                      className="pl-10 h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pin Accuracy (Click on map to adjust)</Label>
                  <div className="h-[400px] rounded-3xl overflow-hidden border-2 border-[#A9CBF0] relative shadow-inner">
                    <MapContainer
                      center={[formData.latitude || 27.7172, formData.longitude || 85.3240]}
                      zoom={15}
                      scrollWheelZoom={false}
                      ref={setMapInstance}
                      style={{ height: '100%', width: '100%' }}
                      className="z-0"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker />
                    </MapContainer>
                    <div className="absolute bottom-4 left-4 bg-[#0D2440]/90 text-white px-4 py-2 rounded-xl text-xs z-[1000] shadow-lg backdrop-blur-sm">
                      Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-[#A9CBF0] text-[#2E5E99] h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.address}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Next: Region Details
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Geographic Details</h2>
                  <p className="text-gray-500">Provide specific location details for filtering.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="e.g. Kathmandu" className="h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.city} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" placeholder="e.g. Kathmandu" className="h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.district} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <select
                      id="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-[#A9CBF0] px-4 bg-white focus:ring-2 focus:ring-[#2E5E99] focus:outline-none transition-all"
                    >
                      <option value="Koshi">Koshi</option>
                      <option value="Madhesh">Madhesh</option>
                      <option value="Bagmati">Bagmati</option>
                      <option value="Gandaki">Gandaki</option>
                      <option value="Lumbini">Lumbini</option>
                      <option value="Karnali">Karnali</option>
                      <option value="Sudurpashchim">Sudurpashchim</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-[#A9CBF0] text-[#2E5E99] h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!formData.city || !formData.district}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Next: Amenities
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Features & Amenities</h2>
                  <p className="text-gray-500">Select what makes your property special.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {AMENITIES.map((feature) => (
                    <div
                      key={feature}
                      onClick={() => handleFeatureToggle(feature)}
                      className={`
                        cursor-pointer px-4 py-3 rounded-xl border transition-all flex items-center justify-between
                        ${formData.features.includes(feature)
                          ? "bg-[#0D2440] border-[#0D2440] text-white"
                          : "bg-white border-[#A9CBF0] text-gray-600 hover:border-[#0D2440]"}
                      `}
                    >
                      <span className="text-sm font-medium">{feature}</span>
                      {formData.features.includes(feature) && <CheckCircle2 className="size-4" />}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property (e.g. quiet neighborhood, near supermarket, etc...)"
                    className="min-h-40 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="border-[#A9CBF0] text-[#2E5E99] h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    disabled={!formData.description}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Next: Pricing
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Pricing & Availability</h2>
                  <p className="text-gray-500">Set your rental price and terms.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly Rent (Rs.)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input id="price" type="number" placeholder="35000" className="pl-10 h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.price} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableFrom">Available From</Label>
                    <Input id="availableFrom" type="date" className="h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.availableFrom} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaseTerm">Minimum Lease (months)</Label>
                    <Input id="leaseTerm" type="number" placeholder="6" className="h-12 rounded-xl border-[#A9CBF0] focus:ring-[#2E5E99]" value={formData.leaseTerm} onChange={handleChange} />
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="border-[#A9CBF0] text-[#2E5E99] h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(6)}
                    disabled={!formData.price || !formData.availableFrom}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Next: Photos & Review
                  </Button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Photos & Virtual Tour</h2>
                  <p className="text-gray-500">Add visuals and review your listing.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-[#A9CBF0] rounded-3xl p-10 text-center relative hover:bg-blue-50 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                      />
                      <Camera className="size-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-bold text-[#0D2440]">Upload Photos</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {formData.images.length} files selected
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoUpload">Virtual Tour Video</Label>
                      <div className="border-2 border-dashed border-[#A9CBF0] rounded-2xl p-6 text-center relative hover:bg-blue-50 transition-colors">
                        <input
                          type="file"
                          onChange={handleVideoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="video/*"
                        />
                        <Video className="size-6 text-gray-400 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-[#0D2440]">
                          {formData.video ? formData.video.name : "Upload Video Tour"}
                        </h4>
                        <p className="text-[10px] text-gray-500">MP4, WebM or Ogg (Max 50MB)</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="virtualTourUrl">OR Virtual Tour URL (YouTube/Vimeo)</Label>
                      <Input id="virtualTourUrl" placeholder="https://..." className="h-12 rounded-xl border-[#A9CBF0]" value={formData.virtualTourUrl} onChange={handleChange} />
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.slice(0, 6).map((img, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#A9CBF0] bg-gray-50 relative">
                            <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#F8FAFC] rounded-3xl p-6 border border-[#A9CBF0] space-y-4">
                      <h3 className="font-bold text-[#0D2440] flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-green-500" /> Summary
                      </h3>
                      <div className="space-y-2 text-sm text-[#0D2440]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Property</span>
                          <span className="font-medium">{formData.bedrooms} BHK {formData.propertyType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Address</span>
                          <span className="font-medium truncate max-w-[150px]">{formData.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rent</span>
                          <span className="font-bold text-[#2E5E99]">Rs. {formData.price}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                          <span className="text-gray-500">Platform Fee</span>
                          <span className="font-medium text-green-600">FREE</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-200">
                      <AlertTriangle className="size-5 text-orange-500 mt-0.5" />
                      <p className="text-xs text-orange-700 leading-relaxed">
                        By publishing, you agree to our Terms of Service. Your listing will be reviewed by our team before going live.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(5)}
                    disabled={loading}
                    className="border-[#A9CBF0] text-[#2E5E99] h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={loading || formData.images.length === 0}
                    className="flex-1 bg-[#0D2440] hover:bg-[#1C3860] text-white h-12 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? "Publishing Listing..." : "Complete & Publish Listing"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {user && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          amount={499} // Premium price
          propertyId={user.id} // For subscription, use user ID as propertyId/requestId
          requestId={user.id}
          propertyTitle="Premium Subscription"
          onSuccess={handlePaymentSuccess}
          type="subscription"
        />
      )}
    </div>
  )
}
