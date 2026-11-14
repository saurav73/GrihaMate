import { ArrowRight, Search, ShieldCheck, MapPin, Sparkles, Users, Play, PlusCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AISearchDialog } from "@/components/ai-search-dialog"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
}

const features = [
  {
    icon: ShieldCheck,
    title: "Identity Verification",
    description: "Every landlord and roommate undergoes a strict background check to ensure your safety.",
    cta: "Learn more",
    href: "/trust-safety",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description: "Find roommates who share your lifestyle, habits, and values with our smart matchmaking engine.",
    cta: "See how it works",
    href: "/how-it-works",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Join thousands of verified renters in Nepal. Read reviews and share your own rental stories.",
    cta: "Join community",
    href: "/explore",
  },
]

const stats = [
  { value: "15k+", label: "Verified Listings" },
  { value: "98%", label: "Tenant Satisfaction" },
  { value: "360°", label: "Virtual Tours" },
  { value: "24/7", label: "Local Support" },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore")
  }

  return (
    <div className="flex min-h-screen flex-col bg-primary-lightest text-primary-dark">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - Full Width Background */}
        <section className="relative w-full py-16 md:py-24 overflow-hidden">
          {/* Background Image with Overlay - Full Width */}
          <div className="absolute inset-0 -z-10">
            {/* Real Background Image */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/hero-background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            {/* Light white gradient overlay for text readability */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50"
            />
            {/* Subtle radial overlay for depth */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(46, 94, 153, 0.15) 0%, transparent 70%)'
              }}
            />
          </div>

          {/* Content - Centered */}
          <div className="px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <Badge
                variant="outline"
                className="mb-6 py-1 px-4 rounded-full border-primary-lightest bg-primary-lightest text-primary-dark flex items-center gap-2"
              >
                <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                New: AI-powered roommate matching is live
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.1}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-primary-dark"
              style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.5)' }}
            >
              <span className="text-primary">Verified Rooms &amp; Roommates</span> for Modern Living in Nepal
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.2}
              className="text-lg md:text-xl text-primary-dark/80 mb-8 max-w-2xl leading-relaxed"
              style={{ textShadow: '0 1px 8px rgba(255, 255, 255, 0.9)' }}
            >
              Discover your next home with 360° virtual tours, verified listings, and a community of trusted renters.
              Secure, transparent, and easy.
            </motion.p>

            <motion.form
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.3}
              onSubmit={handleSearch}
              className="w-full max-w-2xl relative mb-6"
            >
              <div className="bg-white p-2 rounded-2xl shadow-xl border border-primary-lightest hover:shadow-2xl hover:border-primary-light transition-all duration-300 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <Search className="size-5 shrink-0 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Where do you want to live?"
                    className="border-none bg-transparent focus-visible:ring-0 text-base"
                    aria-label="Search by location or keyword"
                  />
                </div>
                <div className="hidden sm:flex items-center px-4 gap-2 border-l border-primary-lightest">
                  <MapPin className="size-5 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium whitespace-nowrap">Kathmandu, NP</span>
                </div>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white rounded-xl h-12 px-6 shrink-0 shadow-md"
                >
                  <Search className="size-4 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
                <AISearchDialog />
              </div>
            </motion.form>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.4}
              className="flex flex-col sm:flex-row items-center gap-3 mb-12"
            >
              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                  Explore Rooms <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link to="/list-property">
                <Button variant="outline" className="rounded-full px-8 h-12 bg-white/80 backdrop-blur-sm border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                  <PlusCircle className="mr-2 size-4" /> List Your Property
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.5}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-primary-dark/20 pt-10 text-left"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-heading font-bold text-primary-dark tabular-nums">{stat.value}</div>
                  <div className="text-sm text-primary-dark/70">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Inspired by OpenAI/Vercel Layout */}
        <section className="px-6 py-20 md:py-24 md:px-12 bg-white rounded-[2rem] mx-4 mb-24 shadow-sm border border-primary-lightest">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6"
            >
              <div className="max-w-xl">
                <Badge className="bg-primary-lightest text-primary-dark hover:bg-primary-lightest mb-4">Core Features</Badge>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Built for trust, designed for simplicity.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We&apos;ve reimagined the rental experience from the ground up, focusing on security and transparency at
                  every step.
                </p>
              </div>
              <Link to="/how-it-works">
                <Button
                  variant="outline"
                  className="group rounded-full px-6 border-primary text-primary-dark hover:bg-primary hover:text-white hover:border-primary bg-transparent transition-all duration-300 hover:shadow-md"
                >
                  Explore all features <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                >
                  <Link to={feature.href} className="block h-full">
                    <Card className="bg-white border border-primary-lightest shadow-sm overflow-hidden group hover:shadow-lg hover:border-primary-light hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className="size-12 rounded-xl bg-primary-lightest flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:shadow-md transition-all duration-300">
                          <feature.icon className="text-primary-dark group-hover:text-white size-6 transition-colors duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-primary-dark group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                        <p className="text-muted-foreground mb-8">
                          {feature.description}
                        </p>
                        <div className="mt-auto pt-4 border-t border-primary-lightest group-hover:border-primary-light transition-colors duration-300">
                          <span className="text-sm font-semibold flex items-center gap-2 text-primary-dark group-hover:text-primary group-hover:gap-3 transition-all duration-300">
                            {feature.cta} <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 360 Tour Showcase */}
        <section className="px-6 py-24 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Link to="/explore" className="block" aria-label="View sample 360 degree tours">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-white shadow-2xl border border-primary-lightest hover:shadow-2xl hover:border-primary-light transition-all duration-300 group cursor-pointer">
                  <img
                    src="/360-virtual-tour-of-modern-apartment-living-room.jpg"
                    alt="360 degree virtual tour preview of a modern apartment living room"
                    loading="lazy"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/30 via-transparent to-transparent group-hover:from-primary-dark/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                      <Play className="size-7 text-primary-dark fill-primary-dark ml-1 group-hover:text-primary group-hover:fill-primary transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-between shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary-lightest flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                        <MapPin className="size-5 text-primary-dark group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <div className="text-sm font-bold group-hover:text-primary transition-colors duration-300">Shanti Nagar, Kathmandu</div>
                        <div className="text-xs text-muted-foreground">Modern 2BHK Apartment</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary text-white group-hover:scale-105 transition-transform duration-300">
                      Live 360°
                    </Badge>
                  </div>
                </div>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Inspect your next home from anywhere.
              </h2>
              <p className="text-lg text-primary-dark/70 mb-8 leading-relaxed">
                Save time and energy with our immersive virtual tours. Walk through every corner of the property, check
                the lighting, and see the layout before you even step foot in the neighborhood.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "High-definition 360° panoramas",
                  "Accurate floor plan measurements",
                  "Verified neighborhood walkability scores",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium">
                    <div className="size-5 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <ShieldCheck className="size-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 h-12 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">View Sample Tours</Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
