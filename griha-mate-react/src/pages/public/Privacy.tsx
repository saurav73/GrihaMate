import { ShieldCheck, Lock, Eye, FileCheck, Mail, Database } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: `We collect information that you provide directly to us, including:
- Account information (name, email, phone number)
- Property listing information (for landlords)
- Payment information (processed securely through third-party providers)
- Communication records
- Usage data and analytics`,
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: `We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze trends and usage
- Detect, prevent, and address technical issues`,
    },
    {
      icon: Lock,
      title: "Data Security",
      content: `We implement appropriate technical and organizational measures to protect your personal information:
- Encryption of data in transit and at rest
- Regular security assessments
- Access controls and authentication
- Secure payment processing
- Regular backups and disaster recovery plans`,
    },
    {
      icon: FileCheck,
      title: "Your Rights",
      content: `You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Data portability
- Withdraw consent at any time`,
    },
    {
      icon: Mail,
      title: "Cookies and Tracking",
      content: `We use cookies and similar tracking technologies to:
- Remember your preferences
- Analyze site traffic and usage
- Improve user experience
- Provide personalized content

You can control cookies through your browser settings.`,
    },
    {
      icon: ShieldCheck,
      title: "Third-Party Services",
      content: `We may use third-party services that collect information:
- Payment processors (for secure transactions)
- Analytics providers (to understand usage)
- Cloud storage providers (for data hosting)
- Communication services (for messaging)

These services have their own privacy policies.`,
    },
  ]

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <ShieldCheck className="size-20 text-primary-dark mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Privacy Policy</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </section>

        {/* Privacy Content */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <Card key={i} className="border-primary-lightest bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="size-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                      <section.icon className="size-6 text-primary-dark" />
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line pl-16">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12">
          <Card className="border-primary-lightest bg-white rounded-3xl">
            <CardContent className="p-8 text-center">
              <Lock className="size-16 text-primary-dark mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                If you have questions about this Privacy Policy or our data practices, please contact us at
                privacy@grihamate.com or through our contact page.
              </p>
              <p className="text-sm text-muted-foreground">
                We are committed to protecting your privacy and will respond to your inquiries promptly.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}




