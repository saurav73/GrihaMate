import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Home, Search, ShieldCheck, CheckCircle2, ArrowRight, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary-dark">How It Works</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, secure, and transparent - find your perfect home in just a few steps
          </p>
        </div>

        {/* For Seekers */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <Badge className="bg-primary-lightest text-primary-dark mb-4">For Seekers</Badge>
            <h2 className="text-3xl font-bold text-primary-dark">Find Your Perfect Home</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary-lightest hover:border-primary-light hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="size-16 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <User className="size-8 text-primary-dark group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-primary-dark mb-2 group-hover:text-primary transition-colors duration-300">1. Sign Up</div>
                <p className="text-muted-foreground mb-4">
                  Create your account and verify your identity with citizenship documents
                </p>
                <Link to="/register">
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Get Started <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest hover:border-primary-light hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="size-16 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <Search className="size-8 text-primary-dark group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-primary-dark mb-2 group-hover:text-primary transition-colors duration-300">2. Explore</div>
                <p className="text-muted-foreground mb-4">
                  Browse verified properties with 360° virtual tours and detailed information
                </p>
                <Link to="/explore">
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Explore Now <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest hover:border-primary-light hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="size-16 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <CheckCircle2 className="size-8 text-primary-dark group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-primary-dark mb-2 group-hover:text-primary transition-colors duration-300">3. Connect & Rent</div>
                <p className="text-muted-foreground mb-4">
                  Contact landlords, schedule visits, and secure your new home with secure payments
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* For Landlords */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <Badge className="bg-primary-lightest text-primary-dark mb-4">For Landlords</Badge>
            <h2 className="text-3xl font-bold text-primary-dark">List Your Property</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary-lightest hover:border-primary-light hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="size-16 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <ShieldCheck className="size-8 text-primary-dark group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-primary-dark mb-2 group-hover:text-primary transition-colors duration-300">1. Verify</div>
                <p className="text-muted-foreground mb-4">
                  Register as a landlord and complete KYC verification with property documents
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest hover:border-primary-light hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="size-16 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <Home className="size-8 text-primary-dark group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-primary-dark mb-2 group-hover:text-primary transition-colors duration-300">2. List Property</div>
                <p className="text-muted-foreground mb-4">
                  Add your property with photos, 360° tours, and detailed information
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest hover:border-primary-light hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="size-16 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <Users className="size-8 text-primary-dark group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-primary-dark mb-2 group-hover:text-primary transition-colors duration-300">3. Connect</div>
                <p className="text-muted-foreground mb-4">
                  Receive inquiries from verified seekers and manage applications easily
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security Features */}
        <section className="bg-white rounded-2xl p-8 border border-primary-lightest">
          <h2 className="text-3xl font-bold mb-6 text-center text-primary-dark">Security & Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="size-6 text-primary-dark mt-1" />
              <div>
                <h3 className="font-bold mb-2">Verified Users</h3>
                <p className="text-sm text-muted-foreground">
                  All users must verify their identity with government-issued documents
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ShieldCheck className="size-6 text-primary-dark mt-1" />
              <div>
                <h3 className="font-bold mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple payment options including eSewa and card payments with encryption
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ShieldCheck className="size-6 text-primary-dark mt-1" />
              <div>
                <h3 className="font-bold mb-2">Property Verification</h3>
                <p className="text-sm text-muted-foreground">
                  All properties are verified by our team before going live
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ShieldCheck className="size-6 text-primary-dark mt-1" />
              <div>
                <h3 className="font-bold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Our support team is always available to help you
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
