import { ArrowRight, Search, ShieldCheck, MapPin, Sparkles, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AISearchDialog } from "@/components/ai-search-dialog"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-primary-lightest text-primary-dark">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
          <Badge
            variant="outline"
            className="mb-6 py-1 px-4 rounded-full border-primary-lightest bg-primary-lightest text-primary-dark flex items-center gap-2"
          >
            <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            New: AI-powered roommate matching is live
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight">
            Verified Rooms & Roommates for Modern Living in Nepal
          </h1>
          <p className="text-lg md:text-xl text-primary-dark/70 mb-12 max-w-2xl leading-relaxed">
            Discover your next home with 360° virtual tours, verified listings, and a community of trusted renters.
            Secure, transparent, and easy.
          </p>

          <div className="w-full max-w-2xl relative mb-16">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-primary-lightest flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Search className="size-5 text-muted-foreground" />
                <Input
                  placeholder="Where do you want to live?"
                  className="border-none bg-transparent focus-visible:ring-0 text-base"
                />
              </div>
              <div className="flex items-center px-4 gap-2 sm:border-l border-primary-lightest">
                <MapPin className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium whitespace-nowrap">Kathmandu, NP</span>
              </div>
              <AISearchDialog />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-primary-lightest pt-12 text-left">
            <div>
              <div className="text-3xl font-bold">15k+</div>
              <div className="text-sm text-muted-foreground">Verified Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground">Tenant Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold">360°</div>
              <div className="text-sm text-muted-foreground">Virtual Tours</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Local Support</div>
            </div>
          </div>
        </section>

        {/* Feature Grid Inspired by OpenAI/Vercel Layout */}
        <section className="px-6 py-24 md:px-12 bg-white rounded-[2rem] mx-4 mb-24 shadow-sm border border-primary-lightest">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <Badge className="bg-primary-lightest text-primary-dark hover:bg-primary-lightest mb-4">Core Features</Badge>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Built for trust, designed for simplicity.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We've reimagined the rental experience from the ground up, focusing on security and transparency at
                  every step.
                </p>
              </div>
              <Link to="/how-it-works">
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-primary-lightest hover:bg-primary-lightest bg-transparent"
                >
                  Explore all features <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-none shadow-none overflow-hidden group">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="size-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="text-primary-dark size-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Identity Verification</h3>
                  <p className="text-muted-foreground mb-8">
                    Every landlord and roommate undergoes a strict background check to ensure your safety.
                  </p>
                  <div className="mt-auto pt-4 border-t border-primary-lightest">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      Learn more <ArrowRight className="size-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-none overflow-hidden group">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="size-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="text-primary-dark size-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI-Powered Matching</h3>
                  <p className="text-muted-foreground mb-8">
                    Find roommates who share your lifestyle, habits, and values with our smart matchmaking engine.
                  </p>
                  <div className="mt-auto pt-4 border-t border-primary-lightest">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      See how it works <ArrowRight className="size-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-none overflow-hidden group">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="size-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                    <Users className="text-primary-dark size-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Community First</h3>
                  <p className="text-muted-foreground mb-8">
                    Join thousands of verified renters in Nepal. Read reviews and share your own rental stories.
                  </p>
                  <div className="mt-auto pt-4 border-t border-primary-lightest">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      Join community <ArrowRight className="size-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 360 Tour Showcase */}
        <section className="px-6 py-24 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-white shadow-2xl border border-primary-lightest">
              <img
                src="/360-virtual-tour-of-modern-apartment-living-room.jpg"
                alt="360 Tour Preview"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="size-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Sparkles className="size-8 text-primary-dark" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary-lightest flex items-center justify-center">
                    <MapPin className="size-5 text-primary-dark" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Shanti Nagar, Kathmandu</div>
                    <div className="text-xs text-muted-foreground">Modern 2BHK Apartment</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary text-white">
                  Live 360°
                </Badge>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Inspect your next home from anywhere.
              </h2>
              <p className="text-lg text-primary-dark/70 mb-8 leading-relaxed">
                Save time and energy with our immersive virtual tours. Walk through every corner of the property, check
                the lighting, and see the layout before you even step foot in the neighborhood.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "High-definition 360° panoramas",
                  "Accurate floor plan measurements",
                  "Verified neighborhood walkability scores",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="size-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <ShieldCheck className="size-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 h-12">View Sample Tours</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


