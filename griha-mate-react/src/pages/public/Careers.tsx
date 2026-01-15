import { Briefcase, Users, Heart, Zap, ArrowRight, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Kathmandu, Nepal",
      type: "Full-time",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Kathmandu, Nepal",
      type: "Full-time",
    },
    {
      title: "Customer Success Manager",
      department: "Operations",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Kathmandu, Nepal",
      type: "Full-time",
    },
  ]

  const benefits = [
    { icon: Heart, title: "Health Insurance", description: "Comprehensive health coverage for you and your family" },
    { icon: Zap, title: "Flexible Hours", description: "Work when you're most productive" },
    { icon: Users, title: "Team Culture", description: "Collaborative and supportive work environment" },
    { icon: Briefcase, title: "Growth Opportunities", description: "Learn and grow with mentorship programs" },
  ]

  return (
    <div className="min-h-screen bg-[#F2EDE4] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
          <Briefcase className="size-20 text-[#2D3142] mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Join Our Team</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Help us build the future of rental housing in Nepal. We're looking for passionate people who want to make a
            difference.
          </p>
        </section>

        {/* Why Join Section */}
        <section className="px-6 py-16 md:px-12 bg-white rounded-[2rem] mx-4 mb-12 shadow-sm border border-[#DED9D0]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Work at GrihaMate?</h2>
              <p className="text-lg text-muted-foreground">We're building something meaningful</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <Card key={i} className="border-[#DED9D0] bg-[#F9F7F2] rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <div className="size-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <benefit.icon className="size-8 text-[#2D3142]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Open Positions</h2>
            <p className="text-lg text-muted-foreground">We're always looking for talented people</p>
          </div>

          <div className="space-y-4">
            {openings.map((job, i) => (
              <Card key={i} className="border-[#DED9D0] bg-white rounded-2xl hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-4" /> {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-4" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" /> {job.type}
                        </span>
                      </div>
                    </div>
                    <Button className="bg-primary hover:bg-primary-dark text-white rounded-xl px-6 shadow-md hover:shadow-lg">
                      Apply Now <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Don't see a role that fits? We'd still love to hear from you.</p>
            <Link to="/contact">
              <Button variant="outline" className="border-[#DED9D0] rounded-xl px-6">
                Send Us Your Resume
              </Button>
            </Link>
          </div>
        </section>

        {/* Culture Section */}
        <section className="px-6 py-16 md:px-12 bg-white rounded-[2rem] mx-4 mb-12 shadow-sm border border-[#DED9D0]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Culture</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              At GrihaMate, we believe in building a diverse, inclusive team that's passionate about solving real
              problems. We value transparency, collaboration, and continuous learning. If you're excited about making
              renting easier and safer for everyone in Nepal, we'd love to have you on our team.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-[#E8E3D8] text-[#2D3142] px-4 py-2">Diverse Team</Badge>
              <Badge className="bg-[#E8E3D8] text-[#2D3142] px-4 py-2">Remote Friendly</Badge>
              <Badge className="bg-[#E8E3D8] text-[#2D3142] px-4 py-2">Growth Mindset</Badge>
              <Badge className="bg-[#E8E3D8] text-[#2D3142] px-4 py-2">Work-Life Balance</Badge>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

