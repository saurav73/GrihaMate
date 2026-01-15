import { Newspaper, Mail, FileText, Download, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"

export default function PressPage() {
  const pressReleases = [
    {
      date: "2024-12-15",
      title: "GrihaMate Launches 360° Virtual Tour Feature",
      description: "Revolutionary technology allows renters to explore properties from anywhere in Nepal.",
    },
    {
      date: "2024-11-20",
      title: "GrihaMate Reaches 15,000 Verified Listings",
      description: "Platform celebrates milestone as Nepal's largest verified rental marketplace.",
    },
    {
      date: "2024-10-10",
      title: "New AI-Powered Matching System Launched",
      description: "Advanced algorithm helps renters find perfect roommates and properties.",
    },
  ]

  const mediaKit = [
    { name: "Company Logo", format: "PNG, SVG", size: "Various sizes" },
    { name: "Brand Guidelines", format: "PDF", size: "2.5 MB" },
    { name: "Press Photos", format: "JPG", size: "High resolution" },
    { name: "Company Fact Sheet", format: "PDF", size: "150 KB" },
  ]

  return (
    <div className="min-h-screen bg-[#F2EDE4] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <Newspaper className="size-20 text-[#2D3142] mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Press & Media</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Latest news, press releases, and media resources about GrihaMate
          </p>
        </section>

        {/* Press Releases */}
        <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Press Releases</h2>
            <p className="text-lg text-muted-foreground">Latest updates and announcements</p>
          </div>

          <div className="space-y-6">
            {pressReleases.map((release, i) => (
              <Card key={i} className="border-[#DED9D0] bg-white rounded-2xl hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(release.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{release.title}</h3>
                      <p className="text-muted-foreground">{release.description}</p>
                    </div>
                    <Button variant="outline" className="border-[#DED9D0] rounded-xl flex-shrink-0">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Media Kit */}
        <section className="px-6 py-16 md:px-12 bg-white rounded-[2rem] mx-4 mb-12 shadow-sm border border-[#DED9D0]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Media Kit</h2>
              <p className="text-lg text-muted-foreground">Download assets and resources for media use</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {mediaKit.map((item, i) => (
                <Card key={i} className="border-[#DED9D0] bg-[#F9F7F2] rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-white flex items-center justify-center">
                          <FileText className="size-6 text-[#2D3142]" />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.format} • {item.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Download className="size-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button className="bg-[#2D3142] hover:bg-[#1F222E] rounded-xl px-8 h-12">
                <Download className="size-4 mr-2" /> Download Full Media Kit
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Press */}
        <section className="px-6 py-16 md:px-12 max-w-4xl mx-auto mb-12">
          <Card className="border-[#DED9D0] bg-[#F9F7F2] rounded-3xl">
            <CardContent className="p-12 text-center">
              <Mail className="size-16 text-[#2D3142] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Media Inquiries</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                For press inquiries, interview requests, or media partnerships, please contact our press team.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-1">Press Contact</p>
                  <a href="mailto:press@grihamate.com" className="text-[#2D3142] hover:underline">
                    press@grihamate.com
                  </a>
                </div>
                <div>
                  <p className="font-bold mb-1">General Inquiries</p>
                  <a href="mailto:hello@grihamate.com" className="text-[#2D3142] hover:underline">
                    hello@grihamate.com
                  </a>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/contact">
                  <Button variant="outline" className="border-[#DED9D0] rounded-xl px-8 h-12">
                    Contact Us
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

