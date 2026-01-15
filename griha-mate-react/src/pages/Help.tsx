import { HelpCircle, Search, MessageCircle, FileText, ShieldCheck, CreditCard, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"

export default function HelpPage() {
  const categories = [
    {
      icon: Home,
      title: "Finding a Room",
      description: "Learn how to search, filter, and apply for properties",
      count: 12,
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Questions about payments, deposits, and refunds",
      count: 8,
    },
    {
      icon: ShieldCheck,
      title: "Safety & Verification",
      description: "How we keep you safe and verify users",
      count: 10,
    },
    {
      icon: FileText,
      title: "Account & Settings",
      description: "Manage your account, profile, and preferences",
      count: 6,
    },
  ]

  const faqs = [
    {
      q: "How do I verify my account?",
      a: "To verify your account, go to your profile settings and click 'Verify Identity'. You'll need to upload a government-issued ID and a recent photo. Verification typically takes 24-48 hours.",
    },
    {
      q: "How do I schedule a property viewing?",
      a: "Click on any property listing, then click 'Schedule a Visit'. Choose your preferred date and time. The landlord will receive a notification and can confirm or suggest an alternative time.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit/debit cards, eSewa, Khalti, and bank transfers. All payments are processed securely through our payment partners.",
    },
    {
      q: "How do I report a suspicious listing?",
      a: "Click the 'Report' button on any listing page. Our team reviews all reports within 24 hours and takes appropriate action. You can also contact us directly at safety@grihamate.com.",
    },
    {
      q: "Can I cancel my booking?",
      a: "Yes, you can cancel your booking within 24 hours of confirmation for a full refund. After 24 hours, cancellation policies vary by property. Check the listing details for specific terms.",
    },
    {
      q: "How do I update my property listing?",
      a: "Go to your dashboard, click on 'My Listings', select the property you want to edit, and click 'Edit'. Make your changes and click 'Save'. Changes are reviewed before going live.",
    },
  ]

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <HelpCircle className="size-20 text-primary-dark mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Help Center</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Find answers to common questions or contact our support team
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-12 h-14 rounded-2xl text-base border-primary-lightest bg-white"
            />
          </div>
        </section>

        {/* Categories */}
        <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <Card key={i} className="border-primary-lightest bg-white rounded-2xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="size-12 rounded-xl bg-white flex items-center justify-center mb-4">
                    <category.icon className="size-6 text-primary-dark" />
                  </div>
                  <h3 className="font-bold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <p className="text-xs text-muted-foreground">{category.count} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-16 md:px-12 bg-white rounded-[2rem] mx-4 mb-12 shadow-sm border border-primary-lightest">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Quick answers to common questions</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="border-primary-lightest bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-3 flex items-start gap-3">
                      <HelpCircle className="size-5 text-primary-dark mt-0.5 flex-shrink-0" />
                      {faq.q}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-8">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12">
          <Card className="border-primary-lightest bg-primary-dark text-white rounded-3xl overflow-hidden">
            <CardContent className="p-12 text-center">
              <MessageCircle className="size-16 mx-auto mb-6 text-white" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Our support team is here to help. Get in touch and we'll respond within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button className="bg-white text-primary-dark hover:bg-white/90 rounded-full px-8 h-12 font-bold">
                    Contact Support
                  </Button>
                </Link>
                <Link to="/trust-safety">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 rounded-full px-8 h-12 font-bold"
                  >
                    Safety Center
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




