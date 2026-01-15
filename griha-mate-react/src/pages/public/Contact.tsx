import { Building2, Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert("Thank you for your message! We'll get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Get in Touch</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </section>

        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-primary-lightest bg-white rounded-3xl shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="min-h-32 rounded-xl"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark text-white h-12 rounded-xl font-bold shadow-md hover:shadow-lg"
                    >
                      <Send className="size-4 mr-2" /> Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-primary-lightest bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                      <Mail className="size-6 text-primary-dark" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Email</h3>
                      <a href="mailto:hello@grihamate.com" className="text-sm text-muted-foreground hover:text-primary">
                        hello@grihamate.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary-lightest bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                      <Phone className="size-6 text-primary-dark" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Phone</h3>
                      <a href="tel:+97714123456" className="text-sm text-muted-foreground hover:text-primary">
                        +977 1 4123 456
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary-lightest bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                      <MapPin className="size-6 text-primary-dark" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Address</h3>
                      <p className="text-sm text-muted-foreground">
                        Kathmandu, Nepal
                        <br />
                        Near Civil Mall
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary-lightest bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                      <Clock className="size-6 text-primary-dark" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Business Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Sunday - Friday
                        <br />
                        9:00 AM - 6:00 PM NPT
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="mt-12">
            <Card className="border-primary-lightest bg-white rounded-3xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Quick Help</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Help Center", href: "/help", icon: MessageCircle },
                    { title: "How it Works", href: "/how-it-works", icon: Building2 },
                    { title: "Trust & Safety", href: "/trust-safety", icon: MessageCircle },
                  ].map((item, i) => (
                    <Link key={i} to={item.href}>
                      <Card className="border-primary-lightest bg-white rounded-xl hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <item.icon className="size-8 text-primary-dark mx-auto mb-3" />
                          <h3 className="font-bold">{item.title}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}




