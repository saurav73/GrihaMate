import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Heart, Bed, Bath, Maximize } from "lucide-react"
import { Link } from "react-router-dom"
import type { PropertyDto } from "@/lib/api"
import { useState } from "react"

interface PropertyCardProps {
    property: PropertyDto
    variant?: 'grid' | 'list'
    userLocation?: { lat: number; lng: number } | null
}

export function PropertyCard({ property, variant = 'grid', userLocation }: PropertyCardProps) {
    const [isFavorite, setIsFavorite] = useState(false)

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsFavorite(!isFavorite)
        // Local storage logic can be handled here or passed as prop
    }

    const calculateDistance = () => {
        if (!userLocation || !property.latitude || !property.longitude) return null

        const R = 6371 // Earth radius in km
        const dLat = (property.latitude - userLocation.lat) * Math.PI / 180
        const dLon = (property.longitude - userLocation.lng) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(property.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const d = R * c

        return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)} km`
    }

    const distance = calculateDistance()

    if (variant === 'list') {
        return (
            <Link to={`/property/${property.id}`}>
                {/* Card with padding, blue border, and very rounded corners */}
                <Card className="group border border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden bg-white rounded-[2rem] p-3">
                    <div className="flex flex-col sm:flex-row h-full gap-4 items-center">
                        {/* Image Section - Rounded and separated */}
                        <div className="relative w-full sm:w-48 md:w-56 h-40 sm:h-40 shrink-0 rounded-2xl overflow-hidden">
                            <img
                                src={property.imageUrls?.[0] || "/placeholder.svg"}
                                alt={property.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            {property.verified && (
                                <Badge className="absolute top-2 left-2 bg-green-500 text-white border-none text-[10px] px-2 py-0.5 font-medium shadow-sm rounded-full">
                                    ✓ Verified
                                </Badge>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 size-7 bg-white/90 hover:bg-white rounded-full shadow-sm z-20 transition-all"
                                onClick={toggleFavorite}
                            >
                                <Heart
                                    className={`size-4 transition-all ${isFavorite
                                        ? "fill-gray-500 text-gray-500"
                                        : "text-gray-500 hover:text-red-500"
                                        }`}
                                />
                            </Button>
                        </div>

                        {/* Content Section */}
                        <CardContent className="flex-1 p-0 flex flex-col h-full justify-center">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-primary-dark group-hover:text-primary transition-colors line-clamp-1">
                                    {property.title}
                                </h3>
                                <span className="text-xs font-serif text-gray-500 uppercase tracking-wider mt-1">
                                    {property.propertyType}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-sm text-primary/80 mb-2">
                                <MapPin className="size-3.5 fill-current" />
                                <span className="line-clamp-1">{property.address}, {property.city}</span>
                            </div>

                            {/* Icons Row */}
                            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Bed className="size-4 text-primary" />
                                    <span>{property.bedrooms}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Bath className="size-4 text-primary" />
                                    <span>{property.bathrooms}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Maximize className="size-4 text-primary" />
                                    <span>{property.area} sq.ft</span>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-baseline gap-1">
                                    <div className="font-bold text-xl text-primary-dark">
                                        Rs. {property.price.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">/mo</div>
                                </div>
                                <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-5 h-8 text-xs font-medium shadow-md transition-all">
                                    Details
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </Link>
        )
    }

    // Grid variant (original)
    return (
        <div className="relative h-full">
            <Link to={`/property/${property.id}`} className="block h-full">
                <Card className="group border-primary-lightest overflow-hidden hover:shadow-xl hover:border-primary-light transition-all duration-300 relative h-full flex flex-col cursor-pointer hover:-translate-y-1">
                    {property.verified && (
                        <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-green-500 text-white border-none">
                                Verified
                            </Badge>
                        </div>
                    )}
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                            src={property.imageUrls?.[0] || "/placeholder.svg"}
                            alt={property.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        {property.virtualTourUrl && (
                            <Badge className="absolute top-3 left-3 bg-white/90 text-primary-dark border-none text-[10px] uppercase font-bold tracking-wider">
                                360° Tour
                            </Badge>
                        )}
                        {distance && (
                            <Badge className="absolute bottom-3 left-3 bg-black/70 text-white border-none text-[10px] flex items-center gap-1 px-2 py-1 z-10 backdrop-blur-sm">
                                <MapPin className="size-3" /> {distance}
                            </Badge>
                        )}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white hover:scale-110 z-20 transition-all duration-300 hover:shadow-lg"
                            onClick={toggleFavorite}
                        >
                            <Heart
                                className={`size-5 transition-all duration-300 ${isFavorite
                                    ? "fill-red-500 text-red-500 hover:scale-125"
                                    : "text-gray-600 hover:text-red-500"
                                    }`}
                            />
                        </Button>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold line-clamp-2 flex-1 text-primary-dark group-hover:text-primary transition-colors">{property.title}</h3>
                            <Badge variant="secondary" className="bg-primary-lightest text-primary-dark text-[10px] ml-2 shrink-0">
                                {property.propertyType}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <MapPin className="size-3" /> {property.city}, {property.district}
                        </div>
                        <div className="flex items-center justify-between border-t border-primary-lightest pt-3 mt-auto">
                            <div className="font-bold text-lg text-primary">Rs. {property.price.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground font-medium">/ month</div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    )
}
