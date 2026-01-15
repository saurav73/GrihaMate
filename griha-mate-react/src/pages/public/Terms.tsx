import { FileText, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using GrihaMate, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
    },
    {
      title: "2. Use License",
      content: `Permission is granted to temporarily download one copy of the materials on GrihaMate's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials
- Use the materials for any commercial purpose or for any public display
- Attempt to reverse engineer any software contained on GrihaMate's website
- Remove any copyright or other proprietary notations from the materials`,
    },
    {
      title: "3. User Accounts",
      content: `To access certain features of GrihaMate, you must register for an account. You agree to:
- Provide accurate, current, and complete information during registration
- Maintain and update your information to keep it accurate
- Maintain the security of your password and identification
- Accept all responsibility for activities that occur under your account
- Notify us immediately of any unauthorized use of your account`,
    },
    {
      title: "4. Property Listings",
      content: `Landlords are responsible for the accuracy of their property listings. GrihaMate reserves the right to:
- Verify all property information
- Remove listings that violate our policies
- Require additional documentation for verification
- Suspend or terminate accounts that post false information`,
    },
    {
      title: "5. Payments and Fees",
      content: `All payments are processed through secure third-party payment processors. GrihaMate charges service fees as disclosed at the time of transaction. Refunds are subject to our refund policy and applicable laws.`,
    },
    {
      title: "6. Prohibited Activities",
      content: `You agree not to:
- Post false, misleading, or fraudulent information
- Harass, abuse, or harm other users
- Violate any applicable laws or regulations
- Use automated systems to access the service
- Interfere with the security or functionality of the platform`,
    },
    {
      title: "7. Limitation of Liability",
      content: `GrihaMate acts as a platform connecting renters and landlords. We are not a party to rental agreements and are not responsible for:
- The accuracy of property listings
- The conduct of users
- Rental agreements or disputes between users
- Property conditions or safety`,
    },
    {
      title: "8. Modifications",
      content: `GrihaMate reserves the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the service after changes constitutes acceptance of the new terms.`,
    },
    {
      title: "9. Contact Information",
      content: `For questions about these Terms of Service, please contact us at legal@grihamate.com or through our contact page.`,
    },
  ]

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <FileText className="size-20 text-primary-dark mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Terms of Service</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </section>

        {/* Terms Content */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <Card key={i} className="border-primary-lightest bg-white rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Agreement Section */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12">
          <Card className="border-primary-lightest bg-white rounded-3xl">
            <CardContent className="p-8 text-center">
              <ShieldCheck className="size-16 text-primary-dark mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By using GrihaMate, you acknowledge that you have read, understood, and agree to be bound by these
                Terms of Service. If you do not agree with any part of these terms, you must not use our service.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}




