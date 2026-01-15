import { Building2, ArrowLeft, Upload, MapPin, DollarSign, Home, Users, Camera, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

export default function ListPropertyPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-primary-lightest">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-lightest px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary-dark flex items-center justify-center">
              <Building2 className="text-white size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">GrihaMate</span>
          </Link>
          <Link to="/explore">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="size-4" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">List Your Property</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of verified landlords in Nepal. List your property in minutes and start receiving quality
            applications.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s <= step
                    ? "bg-primary-dark text-white"
                    : "bg-white border-2 border-primary-lightest text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="size-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 ${s < step ? "bg-primary-dark" : "bg-primary-lightest"}`}
                  style={{ display: s === 4 ? "none" : "block" }}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-primary-lightest shadow-xl bg-white rounded-3xl">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
                  <p className="text-muted-foreground">Tell us about your property</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="property-type">Property Type</Label>
                    <select
                      id="property-type"
                      className="w-full h-12 rounded-xl border border-primary-lightest px-4 bg-white"
                    >
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Room</option>
                      <option>Studio</option>
                      <option>Flat</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input id="bedrooms" type="number" placeholder="2" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" type="number" placeholder="1" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sqft)</Label>
                    <Input id="area" type="number" placeholder="850" className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Enter full address"
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property, amenities, and what makes it special..."
                    className="min-h-32 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-primary-dark hover:bg-[#1F222E] h-12 px-8 rounded-xl"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Pricing & Availability</h2>
                  <p className="text-muted-foreground">Set your rental price and terms</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthly-rent">Monthly Rent (Rs.)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input id="monthly-rent" type="number" placeholder="35000" className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="security-deposit">Security Deposit (Rs.)</Label>
                    <Input id="security-deposit" type="number" placeholder="35000" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="available-from">Available From</Label>
                    <Input id="available-from" type="date" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lease-term">Minimum Lease Term (months)</Label>
                    <Input id="lease-term" type="number" placeholder="6" className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-primary-lightest h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-primary-dark hover:bg-[#1F222E] h-12 px-8 rounded-xl"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Photos & Virtual Tour</h2>
                  <p className="text-muted-foreground">Add photos and enable 360° virtual tour</p>
                </div>

                <div className="border-2 border-dashed border-primary-lightest rounded-3xl p-12 text-center">
                  <Camera className="size-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Upload Property Photos</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add at least 5 photos. 360° tour recommended for better visibility.
                  </p>
                  <Button variant="outline" className="border-primary-lightest rounded-xl">
                    <Upload className="size-4 mr-2" /> Choose Files
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl border-2 border-dashed border-primary-lightest flex items-center justify-center bg-white"
                    >
                      <Camera className="size-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-primary-lightest h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-primary-dark hover:bg-[#1F222E] h-12 px-8 rounded-xl"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Review & Publish</h2>
                  <p className="text-muted-foreground">Review your listing before publishing</p>
                </div>

                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Property Type</span>
                    <span className="font-bold">2BHK Apartment</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-bold">Shanti Nagar, Kathmandu</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="font-bold text-lg">Rs. 35,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available From</span>
                    <span className="font-bold">Oct 15, 2025</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary-lightest rounded-2xl border border-primary-lightest">
                  <CheckCircle2 className="size-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-primary-dark mb-1">Verification Required</p>
                    <p className="text-primary">
                      Your property will be reviewed by our team within 24 hours. Once verified, it will go live!
                    </p>
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="border-primary-lightest h-12 px-8 rounded-xl"
                  >
                    Back
                  </Button>
                  <Link to="/dashboard">
                    <Button className="bg-primary-dark hover:bg-[#1F222E] h-12 px-8 rounded-xl">
                      Publish Listing
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary-lightest bg-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <Home className="size-8 text-primary-dark mx-auto mb-3" />
              <h3 className="font-bold mb-2">15k+ Listings</h3>
              <p className="text-sm text-muted-foreground">Join Nepal's largest rental platform</p>
            </CardContent>
          </Card>
          <Card className="border-primary-lightest bg-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <Users className="size-8 text-primary-dark mx-auto mb-3" />
              <h3 className="font-bold mb-2">Verified Tenants</h3>
              <p className="text-sm text-muted-foreground">Connect with pre-verified renters</p>
            </CardContent>
          </Card>
          <Card className="border-primary-lightest bg-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="size-8 text-primary-dark mx-auto mb-3" />
              <h3 className="font-bold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">We're here to help you succeed</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}




