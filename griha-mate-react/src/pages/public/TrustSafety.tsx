import { ShieldCheck, Lock, Users, CheckCircle2, AlertTriangle, FileCheck, Camera, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <div className="size-20 rounded-3xl bg-primary-dark flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="size-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Trust & Safety</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Your security is our top priority. We've built multiple layers of protection to ensure safe and secure
            rental experiences.
          </p>
        </section>

        {/* Verification Process */}
        <section className="px-6 py-16 md:px-12 bg-white rounded-[2rem] mx-4 mb-12 shadow-sm border border-primary-lightest">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Identity Verification</h2>
              <p className="text-lg text-muted-foreground">Every user goes through our verification process</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: FileCheck,
                  title: "Document Verification",
                  description: "Government-issued ID, proof of address, and background checks for all users.",
                },
                {
                  icon: Camera,
                  title: "Photo Verification",
                  description: "Real-time photo matching to ensure the person matches their documents.",
                },
                {
                  icon: CheckCircle2,
                  title: "Ongoing Monitoring",
                  description: "Continuous monitoring and verification to maintain platform safety.",
                },
              ].map((item, i) => (
                <Card key={i} className="border-primary-lightest bg-white rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <div className="size-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <item.icon className="size-8 text-primary-dark" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Features */}
        <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Safety Features</h2>
            <p className="text-lg text-muted-foreground">Built-in protections for your peace of mind</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Lock,
                title: "Secure Payments",
                description:
                  "All transactions are processed through secure payment gateways. Your money is protected until you move in.",
                color: "bg-green-50 border-green-200",
                iconColor: "text-green-600",
              },
              {
                icon: Users,
                title: "Verified Community",
                description:
                  "Connect only with verified landlords and tenants. Every profile is checked before approval.",
                color: "bg-primary-lightest border-primary-lightest",
                iconColor: "text-primary",
              },
              {
                icon: AlertTriangle,
                title: "24/7 Support",
                description:
                  "Our safety team is available around the clock to assist with any concerns or issues.",
                color: "bg-orange-50 border-orange-200",
                iconColor: "text-orange-600",
              },
              {
                icon: MapPin,
                title: "Location Verification",
                description:
                  "Property locations are verified by our team. We visit and verify every listing before it goes live.",
                color: "bg-purple-50 border-purple-200",
                iconColor: "text-purple-600",
              },
            ].map((feature, i) => (
              <Card key={i} className={`border-2 ${feature.color} rounded-2xl`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`size-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 ${feature.iconColor}`}>
                      <feature.icon className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Safety Tips */}
        <section className="px-6 py-16 md:px-12 bg-white rounded-[2rem] mx-4 mb-12 shadow-sm border border-primary-lightest">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Safety Tips</h2>
              <p className="text-lg text-muted-foreground">Stay safe while searching for your next home</p>
            </div>

            <div className="space-y-4">
              {[
                "Always meet in person before signing any agreement",
                "Never send money before viewing the property",
                "Verify landlord identity through our platform",
                "Use our secure messaging system for all communications",
                "Report any suspicious activity immediately",
                "Read reviews and check landlord verification status",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl">
                  <CheckCircle2 className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12 text-center">
          <Card className="border-primary-lightest bg-primary-dark text-white rounded-3xl overflow-hidden">
            <CardContent className="p-12">
              <ShieldCheck className="size-16 mx-auto mb-6 text-white" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of verified users in Nepal's most trusted rental platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/explore">
                  <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 h-12 font-bold shadow-lg hover:shadow-xl transition-all">
                    Find a Room
                  </Button>
                </Link>
                <Link to="/list-property">
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-dark rounded-full px-8 h-12 font-bold transition-all"
                  >
                    List Property
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}




