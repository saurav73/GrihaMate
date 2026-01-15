import { MapPin, Star, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const listings = [
  {
    id: 1,
    title: "Modern 2BHK Apartment",
    location: "Shanti Nagar, Kathmandu",
    price: "Rs. 35,000",
    rating: 4.8,
    reviews: 12,
    image: "/modern-living-room.png",
    verified: true,
  },
  {
    id: 2,
    title: "Cozy Studio for Students",
    location: "Patan, Lalitpur",
    price: "Rs. 15,000",
    rating: 4.5,
    reviews: 8,
    image: "/cozy-bedroom.png",
    verified: true,
  },
  {
    id: 3,
    title: "Luxurious Rooftop Room",
    location: "Lazimpat, Kathmandu",
    price: "Rs. 22,000",
    rating: 4.9,
    reviews: 15,
    image: "/rooftop-view.jpg",
    verified: true,
  },
]

export function FeaturedListings() {
  return (
    <section className="px-6 py-24 md:px-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-4">Featured Listings</h2>
          <p className="text-muted-foreground">Handpicked properties verified by our team.</p>
        </div>
        <span className="text-sm font-bold text-primary-dark cursor-pointer hover:underline underline-offset-4">
          View all 1,200+ rooms
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="group border-primary-lightest overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={listing.image || "/placeholder.svg"}
                alt={listing.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary-dark border-none">
                360° Available
              </Badge>
              {listing.verified && (
                <Badge className="absolute top-4 right-4 bg-green-500 text-white border-none">Verified</Badge>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{listing.title}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{listing.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <MapPin className="size-3" />
                {listing.location}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-primary-dark">
                  {listing.price} <span className="text-sm font-normal text-muted-foreground">/ month</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="size-3" />
                  {listing.reviews} reviews
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
