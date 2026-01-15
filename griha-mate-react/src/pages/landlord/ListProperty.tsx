import { Building2, ArrowLeft, MapPin, DollarSign, Camera, CheckCircle2, AlertTriangle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom" // Added useNavigate
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { propertiesAPI, imageAPI } from "@/lib/api" // Added API imports
import { toast } from "react-toastify" // Added toast
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function ListPropertyPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate() // Hook for navigation

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
    securityDeposit: "", // Note: API might not accept this field yet, checking PropertyDto
    availableFrom: "",
    leaseTerm: "",
    images: [] as File[],
    imageUrls: [] as string[],
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

    // Auto-detect location on first load of the map component
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setFormData(prev => ({
              ...prev,
              latitude,
              longitude
            }))
            map.flyTo([latitude, longitude], 13)
            toast.success("Location detected!")
          },
          (error) => {
            console.warn("Location detection failed:", error.message)
            // Fallback to Kathmandu is already set in default state
          }
        )
      }
    }, [map])

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

  const handlePublish = async () => {
    setLoading(true)
    try {
      // 1. Upload Images
      const uploadedUrls: string[] = []
      for (const file of formData.images) {
        const res = await imageAPI.uploadImage(file)
        uploadedUrls.push(res.url)
      }

      // 2. Prepare Property DTO
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
        virtualTourUrl: formData.virtualTourUrl,
        features: formData.features,
        latitude: formData.latitude,
        longitude: formData.longitude
      }

      // 3. Call API
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

  return (
    <div className="min-h-screen bg-primary-lightest">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-lightest px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary-dark flex items-center justify-center">
              <Building2 className="text-white size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0D2440]">GrihaMate</span>
          </Link>
          <Link to="/dashboard/landlord">
            <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white">
              <ArrowLeft className="size-4" /> Cancel
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2440]">List Your Property</h1>
          <p className="text-lg text-[#2E5E99] max-w-2xl mx-auto">
            Join thousands of verified landlords in Nepal. List your property in minutes.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${s <= step
                  ? "bg-[#0D2440] text-white"
                  : "bg-white border-2 border-[#A9CBF0] text-gray-400"
                  }`}
              >
                {s < step ? <CheckCircle2 className="size-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 ${s < step ? "bg-[#0D2440]" : "bg-[#A9CBF0]"}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-[#A9CBF0] shadow-xl bg-white rounded-3xl">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Basic Information</h2>
                  <p className="text-gray-500">Tell us about your property</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="property-type">Property Type</Label>
                    <select
                      id="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-[#A9CBF0] px-4 bg-white"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Room">Room</option>
                      <option value="Flat">Flat</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input id="bedrooms" type="number" placeholder="2" className="h-12 rounded-xl border-[#A9CBF0]" value={formData.bedrooms} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" type="number" placeholder="1" className="h-12 rounded-xl border-[#A9CBF0]" value={formData.bathrooms} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sqft)</Label>
                    <Input id="area" type="number" placeholder="850" className="h-12 rounded-xl border-[#A9CBF0]" value={formData.area} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="address"
                      placeholder="Enter full address"
                      className="pl-10 h-12 rounded-xl border-[#A9CBF0]"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pin Location on Map</Label>
                  <div className="h-[300px] rounded-xl overflow-hidden border border-[#A9CBF0] relative z-0">
                    <MapContainer
                      center={[formData.latitude || 27.7172, formData.longitude || 85.3240]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                      className="z-0"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker />
                    </MapContainer>
                    <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded text-xs z-[1000] shadow-sm">
                      Lat: {formData.latitude.toFixed(5)}, Lng: {formData.longitude.toFixed(5)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Kathmandu" className="h-12 rounded-xl border-[#A9CBF0]" value={formData.city} onChange={handleChange} />
                </div>

                <div className="space-y-3">
                  <Label>Amenities & Features</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property..."
                    className="min-h-32 rounded-xl border-[#A9CBF0]"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.address || !formData.bedrooms}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Pricing & Availability</h2>
                  <p className="text-gray-500">Set your rental price and terms</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly Rent (Rs.)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input id="price" type="number" placeholder="35000" className="pl-10 h-12 rounded-xl border-[#A9CBF0]" value={formData.price} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityDeposit">Security Deposit (Rs.)</Label>
                    <Input id="securityDeposit" type="number" placeholder="35000" className="h-12 rounded-xl border-[#A9CBF0]" value={formData.securityDeposit} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableFrom">Available From</Label>
                    <Input id="availableFrom" type="date" className="h-12 rounded-xl border-[#A9CBF0]" value={formData.availableFrom} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaseTerm">Minimum Lease Term (months)</Label>
                    <Input id="leaseTerm" type="number" placeholder="6" className="h-12 rounded-xl border-[#A9CBF0]" value={formData.leaseTerm} onChange={handleChange} />
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
                    disabled={!formData.price}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Photos & Virtual Tour</h2>
                  <p className="text-gray-500">Add photos and enable 360° virtual tour</p>
                </div>

                <div className="border-2 border-dashed border-[#A9CBF0] rounded-3xl p-12 text-center relative hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  <Camera className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold mb-2 text-[#0D2440]">Upload Property Photos</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Click to browse or drag and drop. {formData.images.length} files selected.
                  </p>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-[#A9CBF0]">
                        <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="virtualTourUrl">360° Virtual Tour URL (Optional)</Label>
                  <Input id="virtualTourUrl" placeholder="https://..." className="h-12 rounded-xl border-[#A9CBF0]" value={formData.virtualTourUrl} onChange={handleChange} />
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
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#0D2440]">Review & Publish</h2>
                  <p className="text-gray-500">Review your listing before publishing</p>
                </div>

                <div className="bg-white rounded-2xl p-6 space-y-4 border border-[#A9CBF0]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Property Type</span>
                    <span className="font-bold text-[#0D2440]">{formData.bedrooms} BHK {formData.propertyType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-bold text-[#0D2440]">{formData.address}, {formData.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Monthly Rent</span>
                    <span className="font-bold text-lg text-[#2E5E99]">Rs. {formData.price}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-200">
                  <AlertTriangle className="size-5 text-orange-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-orange-700 mb-1">Limit Check</p>
                    <p className="text-orange-600">
                      Free accounts are limited to 2 listings. If you have already hit your limit, this submission will fail.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    disabled={loading}
                    className="border-[#A9CBF0] text-[#2E5E99] h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={loading}
                    className="bg-[#2E5E99] hover:bg-[#1C3860] text-white h-12 px-8 rounded-xl shadow-md flex items-center gap-2"
                  >
                    {loading ? "Publishing..." : "Publish Listing"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
