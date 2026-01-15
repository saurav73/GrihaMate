import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Users, Home, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary-dark">About GrihaMate</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nepal's most trusted platform for finding verified rooms, flats, and roommates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-primary-lightest">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-primary-dark">Our Mission</h2>
              <p className="text-muted-foreground">
                To revolutionize the rental experience in Nepal by providing a secure, transparent, and user-friendly platform 
                that connects verified landlords with trusted seekers. We believe everyone deserves a safe and comfortable home.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary-lightest">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-primary-dark">Our Vision</h2>
              <p className="text-muted-foreground">
                To become Nepal's leading rental platform, known for trust, innovation, and community. We aim to make finding 
                and renting properties as easy as booking a hotel room, with complete transparency and security.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary-dark">Why Choose GrihaMate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-primary-lightest text-center">
              <CardContent className="p-6">
                <ShieldCheck className="size-12 text-primary-dark mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
                <p className="text-sm text-muted-foreground">
                  All properties and users are verified for your safety and peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest text-center">
              <CardContent className="p-6">
                <Home className="size-12 text-primary-dark mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">360° Tours</h3>
                <p className="text-sm text-muted-foreground">
                  Explore properties virtually before visiting in person.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest text-center">
              <CardContent className="p-6">
                <Users className="size-12 text-primary-dark mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join thousands of verified renters and landlords in Nepal.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest text-center">
              <CardContent className="p-6">
                <Heart className="size-12 text-primary-dark mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Trusted</h3>
                <p className="text-sm text-muted-foreground">
                  Built with security and transparency at the core.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
