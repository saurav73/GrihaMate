import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, DollarSign, Home, MessageSquare } from "lucide-react"
import { roomRequestAPI, type RoomRequestDto } from "@/lib/api"
import { toast } from "react-toastify"

export default function RoomRequestPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await roomRequestAPI.create(formData)
      toast.success("Room request submitted successfully! You'll be notified when matching rooms become available.", {
        position: "top-right",
        autoClose: 5000,
      })
      navigate("/dashboard/seeker")
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 max-w-3xl">
        <Card className="border-primary-lightest shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary-dark">
              Can't Find the Perfect Room?
            </CardTitle>
            <CardDescription className="text-base">
              Leave a request and we'll notify you when a matching room becomes available in your desired location.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-dark flex items-center gap-2">
                  <MapPin className="size-5 text-primary" />
                  Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base font-medium">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Kathmandu"
                      className="h-12 border-primary-lightest"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-base font-medium">
                      District <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g., Kathmandu"
                      className="h-12 border-primary-lightest"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base font-medium">
                    Preferred Area/Address (Optional)
                  </Label>
                  <Input
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., Thamel, Durbar Marg"
                    className="h-12 border-primary-lightest"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-dark flex items-center gap-2">
                  <DollarSign className="size-5 text-primary" />
                  Budget
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice" className="text-base font-medium">
                      Minimum Price (Rs.)
                    </Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={formData.minPrice || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        minPrice: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="e.g., 10000"
                      className="h-12 border-primary-lightest"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice" className="text-base font-medium">
                      Maximum Price (Rs.)
                    </Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={formData.maxPrice || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        maxPrice: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="e.g., 25000"
                      className="h-12 border-primary-lightest"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-dark flex items-center gap-2">
                  <Home className="size-5 text-primary" />
                  Property Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minBedrooms" className="text-base font-medium">
                      Minimum Bedrooms
                    </Label>
                    <Input
                      id="minBedrooms"
                      type="number"
                      min="1"
                      value={formData.minBedrooms || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        minBedrooms: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="e.g., 1"
                      className="h-12 border-primary-lightest"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxBedrooms" className="text-base font-medium">
                      Maximum Bedrooms
                    </Label>
                    <Input
                      id="maxBedrooms"
                      type="number"
                      min="1"
                      value={formData.maxBedrooms || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        maxBedrooms: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="e.g., 2"
                      className="h-12 border-primary-lightest"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="propertyType" className="text-base font-medium">
                    Property Type
                  </Label>
                  <select
                    id="propertyType"
                    value={formData.propertyType || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      propertyType: e.target.value ? e.target.value as any : undefined 
                    })}
                    className="w-full h-12 rounded-md border border-primary-lightest px-4 bg-white"
                  >
                    <option value="">Any Type</option>
                    <option value="ROOM">Room</option>
                    <option value="FLAT">Flat</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                  </select>
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-2">
                <Label htmlFor="additionalRequirements" className="text-base font-medium flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" />
                  Additional Requirements (Optional)
                </Label>
                <textarea
                  id="additionalRequirements"
                  value={formData.additionalRequirements || ""}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  placeholder="Any specific requirements like parking, nearby facilities, etc."
                  className="w-full min-h-[100px] rounded-md border border-primary-lightest px-4 py-3 bg-white resize-y"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

