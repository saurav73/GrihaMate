import { Building2, CheckCircle2, Star, Zap, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F2EDE4] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-[#E8E3D8] text-[#2D3142] hover:bg-[#E8E3D8]">Transparent Pricing</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Simple, Fair Pricing</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Choose the plan that works for you. No hidden fees, no surprises.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-[#DED9D0] bg-white rounded-3xl shadow-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-2">Free</CardTitle>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-bold">Rs. 0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>Perfect for renters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Browse all listings",
                  "360° virtual tours",
                  "Basic search filters",
                  "Save favorites",
                  "Contact landlords",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <Link to="/explore" className="block mt-8">
                  <Button variant="outline" className="w-full border-[#DED9D0] rounded-xl h-12">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-[#2D3142] bg-white rounded-3xl shadow-xl relative">
              <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2D3142] text-white px-4 py-1">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-8 pt-4">
                <CardTitle className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  Premium <Star className="size-5 text-yellow-500 fill-yellow-500" />
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-bold">Rs. 499</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>For serious renters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Everything in Free",
                  "Priority listing visibility",
                  "Advanced search filters",
                  "AI-powered matching",
                  "Early access to new listings",
                  "Unlimited favorites",
                  "Priority customer support",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <Link to="/login" className="block mt-8">
                  <Button className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl h-12 shadow-md hover:shadow-lg">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Landlord Plan */}
            <Card className="border-[#DED9D0] bg-white rounded-3xl shadow-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  Landlord <Building2 className="size-5 text-[#2D3142]" />
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-bold">Rs. 1,999</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>For property owners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "List unlimited properties",
                  "360° virtual tour creation",
                  "Verified tenant applications",
                  "Analytics dashboard",
                  "Priority support",
                  "Marketing tools",
                  "Contract templates",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <Link to="/list-property" className="block mt-8">
                  <Button variant="outline" className="w-full border-[#DED9D0] rounded-xl h-12">
                    Start Listing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="px-6 py-16 md:px-12 bg-white rounded-[2rem] mx-4 mb-12 shadow-sm border border-[#DED9D0]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Feature Comparison</h2>
              <p className="text-lg text-muted-foreground">See what's included in each plan</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#DED9D0]">
                    <th className="text-left py-4 font-bold">Feature</th>
                    <th className="text-center py-4 font-bold">Free</th>
                    <th className="text-center py-4 font-bold">Premium</th>
                    <th className="text-center py-4 font-bold">Landlord</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DED9D0]">
                  {[
                    ["Listings Access", "✓", "✓", "✓"],
                    ["360° Tours", "✓", "✓", "✓"],
                    ["Advanced Filters", "—", "✓", "✓"],
                    ["AI Matching", "—", "✓", "—"],
                    ["Priority Support", "—", "✓", "✓"],
                    ["List Properties", "—", "—", "Unlimited"],
                    ["Analytics Dashboard", "—", "—", "✓"],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#F9F7F2] transition-colors">
                      <td className="py-4 font-medium">{row[0]}</td>
                      <td className="text-center py-4 text-muted-foreground">{row[1]}</td>
                      <td className="text-center py-4 text-muted-foreground">{row[2]}</td>
                      <td className="text-center py-4 text-muted-foreground">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Are there any hidden fees?",
                a: "No, our pricing is transparent. The monthly fee is all you pay. No setup fees or hidden charges.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit/debit cards, eSewa, Khalti, and bank transfers.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
              },
            ].map((faq, i) => (
              <Card key={i} className="border-[#DED9D0] bg-white rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12 text-center">
          <Card className="border-[#DED9D0] bg-[#F9F7F2] rounded-3xl">
            <CardContent className="p-12">
              <Zap className="size-16 mx-auto mb-6 text-[#2D3142]" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users in Nepal's most trusted rental platform.
              </p>
              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 h-12 font-bold shadow-md hover:shadow-lg">
                  Explore Listings <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}

