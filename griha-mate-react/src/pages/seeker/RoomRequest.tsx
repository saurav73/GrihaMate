import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, ArrowRight, ArrowLeft, CheckCircle2, Search, ClipboardCheck, Loader2, Bell, AlertCircle, XCircle } from "lucide-react"
import { roomRequestAPI, type RoomRequestDto } from "@/lib/api"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from "@/lib/utils"

// Fix for leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon



function MapEventsHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function RoomRequestPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [existingRequest, setExistingRequest] = useState<RoomRequestDto | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240])
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)

  const [formData, setFormData] = useState<RoomRequestDto>({
    city: "",
    district: "",
    address: "",
    maxPrice: undefined,
    minPrice: undefined,
    minBedrooms: undefined,
    maxBedrooms: undefined,
    propertyType: undefined,
    additionalRequirements: "",
    active: true,
  })

  const searchLocation = async (address: string) => {
    if (!address || address.trim().length < 3) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMarkerPosition(newPos);
        setMapCenter(newPos);
      }
    } catch (err) {
      // Silently fail for auto-search
      console.error("Location search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    setMapCenter([lat, lng]);
    
    // Reverse geocoding to auto-fill location data
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        setFormData(prev => ({
          ...prev,
          address: address.road || address.neighbourhood || address.suburb || address.village || '',
          city: address.city || address.town || address.municipality || address.county || '',
          district: address.state_district || address.region || address.county || ''
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Detect user's current location
  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await handleLocationSelect(lat, lng);
        toast.success("Location detected successfully!", { autoClose: 2000 });
      },
      (error) => {
        setLoading(false);
        let errorMessage = "Failed to detect location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        toast.error(errorMessage);
      }
    );
  };

  // Check for existing active request on page load
  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        setCheckingExisting(true)
        const requests = await roomRequestAPI.getMyRequests()
        const activeRequest = requests.find(r => r.active === true)
        if (activeRequest) {
          setExistingRequest(activeRequest)
        }
      } catch (err) {
        // Silently fail - allow user to proceed
        console.error("Failed to check existing requests:", err)
      } finally {
        setCheckingExisting(false)
      }
    }
    checkExistingRequest()
  }, [])

  // Debounced search for location input - map syncs when typing
  useEffect(() => {
    if (step === 1 && formData.address && formData.address.trim().length >= 3) {
      const address = formData.address;
      const timer = setTimeout(() => {
        searchLocation(address);
      }, 800); // Wait 800ms after user stops typing

      return () => clearTimeout(timer);
    }
  }, [formData.address, step]);

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    if (existingRequest) {
      toast.error("You already have an active request. Please deactivate your existing request first.")
      return
    }

    setLoading(true)
    try {
      await roomRequestAPI.create(formData)
      toast.success("Request submitted! We'll notify you when a match is found.")
      navigate("/dashboard/seeker")
    } catch (err: any) {
      const errorMessage = err.message || "Failed to submit request"
      if (errorMessage.includes("already have an active")) {
        toast.error(errorMessage)
        // Refresh existing request check
        const requests = await roomRequestAPI.getMyRequests()
        const activeRequest = requests.find(r => r.active === true)
        if (activeRequest) {
          setExistingRequest(activeRequest)
        }
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { title: "Location", icon: MapPin },
    { title: "Preferences", icon: DollarSign },
    { title: "Review", icon: ClipboardCheck }
  ]

  // Show loading state while checking for existing request
  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-gray-600 font-medium">Checking for existing requests...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Show message if user already has an active request
  if (existingRequest) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white max-w-2xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="size-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="size-10 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3">Active Request Found</h2>
                  <p className="text-gray-600 text-lg">
                    You already have an active room request. You can only have one active request at a time.
                  </p>
                </div>
                
                <Card className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Your Active Request</h3>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Location:</span> {existingRequest.address}, {existingRequest.city}, {existingRequest.district}</p>
                      {existingRequest.minPrice || existingRequest.maxPrice ? (
                        <p><span className="font-semibold">Budget:</span> 
                          {existingRequest.minPrice && ` Rs. ${existingRequest.minPrice}`}
                          {existingRequest.minPrice && existingRequest.maxPrice && ' - '}
                          {existingRequest.maxPrice && ` Rs. ${existingRequest.maxPrice}`}
                        </p>
                      ) : null}
                      {existingRequest.minBedrooms || existingRequest.maxBedrooms ? (
                        <p><span className="font-semibold">Bedrooms:</span> 
                          {existingRequest.minBedrooms && existingRequest.maxBedrooms 
                            ? `${existingRequest.minBedrooms} - ${existingRequest.maxBedrooms}`
                            : existingRequest.minBedrooms || existingRequest.maxBedrooms}
                        </p>
                      ) : null}
                      {existingRequest.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Created on {new Date(existingRequest.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={async () => {
                      if (!existingRequest?.id) return
                      const requestId = existingRequest.id
                      if (confirm('Are you sure you want to cancel this active request? You will be able to create a new request after canceling.')) {
                        try {
                          await roomRequestAPI.update(requestId, { active: false })
                          toast.success("Request cancelled successfully. You can now create a new request.", {
                            position: "top-right",
                            autoClose: 3000,
                          })
                          setExistingRequest(null)
                          // Reset form to allow creating new request
                        } catch (err: any) {
                          toast.error(err.message || "Failed to cancel request", {
                            position: "top-right",
                            autoClose: 3000,
                          })
                        }
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold"
                  >
                    <XCircle className="size-4 mr-2" />
                    Cancel This Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard/seeker")}
                    className="flex-1 h-12 rounded-xl font-bold"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Progress Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center relative z-10">
                <div className={cn(
                  "size-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                  step > i + 1 ? "bg-green-500 text-white" :
                    step === i + 1 ? "bg-primary text-white scale-110 shadow-primary/20 shadow-xl" :
                      "bg-white text-gray-400 border border-gray-100"
                )}>
                  {step > i + 1 ? <CheckCircle2 className="size-6" /> : <s.icon className="size-6" />}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-bold uppercase tracking-wider",
                  step === i + 1 ? "text-primary" : "text-gray-400"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-[4.5rem] hidden md:block" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -translate-y-[4.5rem] hidden md:block"
              style={{ width: `${(step - 1) / (steps.length - 1) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
                  {/* Sidebar Info */}
                  <div className="lg:col-span-2 bg-primary p-8 md:p-12 text-white flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute -top-24 -left-24 size-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 size-64 bg-primary-dark/20 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-6">
                      <div>
                        <Badge className="bg-white/20 text-white border-none mb-4 px-3 py-1">Step {step} of 3</Badge>
                        <h2 className="text-3xl md:text-4xl font-black leading-tight">
                          {step === 1 ? "Where do you want to live?" :
                            step === 2 ? "What are you looking for?" :
                              "Ready to find your match?"}
                        </h2>
                      </div>
                      <p className="text-primary-foreground/70 text-lg leading-relaxed">
                        {step === 1 ? "Select your preferred location on the map or enter details manually. We'll monitor listings in this area." :
                          step === 2 ? "Define your budget and property type so we only notify you about rooms you'll actually love." :
                            "Review your request details. Our system will automatically notify you the moment a verified room hits the market."}
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4 mt-8">
                      <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Search className="size-5" />
                        </div>
                        <div className="text-sm">
                          <p className="font-bold">Real-time alerts</p>
                          <p className="opacity-70">Notification upon listing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <div className="text-sm">
                          <p className="font-bold">Verified properties only</p>
                          <p className="opacity-70">Skip the generic listings</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="lg:col-span-3 p-8 md:p-12">
                    {/* Step 1: Location */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-lg font-bold text-gray-900">1. Select Location</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary-dark font-bold gap-2 h-8 px-2"
                                onClick={detectMyLocation}
                                disabled={loading}
                              >
                                <MapPin className="size-4" /> Detect My Location
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary-dark font-bold gap-2 h-8 px-2"
                                onClick={() => formData.address && searchLocation(formData.address)}
                                disabled={loading || !formData.address}
                              >
                                <Search className="size-4" /> Sync Map
                              </Button>
                            </div>
                          </div>
                          <div className="h-[250px] w-full rounded-3xl overflow-hidden border-2 border-primary-light/20 relative z-0">
                            <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <MapEventsHandler onLocationSelect={handleLocationSelect} />
                              {markerPosition && <Marker position={markerPosition} />}
                              <MapCenterController center={mapCenter} />
                            </MapContainer>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Location *</Label>
                          <Input
                            placeholder="e.g. New Baneshwor, Kathmandu"
                            className="h-12 rounded-xl"
                            value={formData.address || ""}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                          />
                          <p className="text-xs text-gray-500 mt-1">Type your location and the map will sync automatically</p>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Preferences */}
                    {step === 2 && (
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <Label className="text-lg font-bold text-gray-900">Property Type</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {['ROOM', 'FLAT', 'APARTMENT', 'HOUSE'].map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, propertyType: type as any })}
                                className={cn(
                                  "p-4 rounded-2xl border-2 transition-all text-left font-bold capitalize",
                                  formData.propertyType === type
                                    ? "border-primary bg-primary/5 text-primary shadow-md"
                                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                                )}
                              >
                                {type.toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-lg font-bold text-gray-900">Monthly Budget (Rs.)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase ml-2">Min Price</p>
                              <Input
                                type="number"
                                placeholder="5000"
                                className="h-12 rounded-xl"
                                value={formData.minPrice || ""}
                                onChange={e => setFormData({ ...formData, minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase ml-2">Max Price</p>
                              <Input
                                type="number"
                                placeholder="25000"
                                className="h-12 rounded-xl"
                                value={formData.maxPrice || ""}
                                onChange={e => setFormData({ ...formData, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-lg font-bold text-gray-900">Bedrooms</Label>
                          <div className="flex gap-4">
                            {[1, 2, 3, '4+'].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setFormData({ ...formData, minBedrooms: typeof num === 'number' ? num : 4 })}
                                className={cn(
                                  "size-12 rounded-xl border-2 font-bold transition-all",
                                  (num === ((formData.minBedrooms ?? 0) > 3 ? '4+' : formData.minBedrooms))
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                                )}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                          <div className="flex justify-between items-start pb-4 border-b border-gray-200/50">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Location</p>
                              <h4 className="font-bold text-gray-900">{formData.city}, {formData.district}</h4>
                              <p className="text-sm text-gray-500">{formData.address || "Area not specified"}</p>
                            </div>
                            <MapPin className="text-primary size-5" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 py-2">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Property Type</p>
                              <p className="font-bold text-gray-900">{formData.propertyType || "Any Type"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Budget</p>
                              <p className="font-bold text-primary">Rs. {formData.minPrice?.toLocaleString() || '0'} - {formData.maxPrice?.toLocaleString() || 'Any'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Special Notes / Requirements</Label>
                          <textarea
                            className="w-full min-h-[120px] rounded-[1.5rem] border-2 border-gray-100 p-4 focus:border-primary outline-none transition-all placeholder:text-gray-300"
                            placeholder="e.g. Near bus station, parking required, sunny room..."
                            value={formData.additionalRequirements || ""}
                            onChange={e => setFormData({ ...formData, additionalRequirements: e.target.value })}
                          />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <div className="size-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <Bell className="size-4 text-amber-600" />
                          </div>
                          <p className="text-xs text-amber-700 font-medium">
                            By submitting, you'll receive instant email alerts whenever a verified property matches these criteria.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-12">
                      {step > 1 && (
                        <Button
                          variant="outline"
                          onClick={prevStep}
                          disabled={loading}
                          className="h-14 px-8 rounded-2xl border-gray-200 font-bold hover:bg-gray-50"
                        >
                          <ArrowLeft className="mr-2 size-5" /> Back
                        </Button>
                      )}

                      {step < 3 ? (
                        <Button
                          onClick={nextStep}
                          disabled={!formData.city}
                          className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary-dark font-black text-white shadow-lg shadow-primary/20"
                        >
                          Continue <ArrowRight className="ml-2 size-5" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-white shadow-lg shadow-green-100"
                        >
                          {loading ? (
                            <> <Loader2 className="mr-2 size-5 animate-spin" /> Submitting... </>
                          ) : (
                            <> <ClipboardCheck className="mr-2 size-5" /> Send Request </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Information Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Verified Rooms • Secure Process • Privacy Guaranteed</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
