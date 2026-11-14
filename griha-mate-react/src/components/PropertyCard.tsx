/** Property listing card used across search and favorites views. */
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Heart, Bed, Bath, Maximize } from "lucide-react"
import { Link } from "react-router-dom"
import type { PropertyDto } from "@/lib/api"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PropertyCardProps {
    property: PropertyDto
    variant?: 'grid' | 'list'
    userLocation?: { lat: number; lng: number } | null
}

function FavoriteButton({
    isFavorite,
    onToggle,
    className,
}: {
    isFavorite: boolean
    onToggle: (e: React.MouseEvent) => void
    className?: string
}) {
    return (
        <Button
            size="icon"
            variant="ghost"
            aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
            aria-pressed={isFavorite}
            className={cn(
                "absolute bg-white/90 hover:bg-white rounded-full shadow-sm z-20 transition-all duration-300 hover:scale-110 hover:shadow-md",
                className,
            )}
            onClick={onToggle}
        >
            <motion.span
                key={String(isFavorite)}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="flex items-center justify-center"
            >
                <Heart
                    className={cn(
                        "size-4 transition-colors duration-200",
                        isFavorite ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500",
                    )}
                />
            </motion.span>
        </Button>
    )
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
                <Card className="group border border-primary-lightest hover:border-primary-light shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden bg-white rounded-[2rem] p-3 hover:-translate-y-0.5">
                    <div className="flex flex-col sm:flex-row h-full gap-4 items-center">
                        {/* Image Section - Rounded and separated */}
                        <div className="relative w-full sm:w-48 md:w-56 h-44 sm:h-40 shrink-0 rounded-2xl overflow-hidden bg-primary-lightest">
                            <img
                                src={property.imageUrls?.[0] || "/placeholder.svg"}
                                alt={property.title}
                                loading="lazy"
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
                            {property.verified && (
                                <Badge className="absolute top-2 left-2 bg-green-500 text-white border-none text-[10px] px-2 py-0.5 font-medium shadow-sm rounded-full">
                                    ✓ Verified
                                </Badge>
                            )}
                            {distance && (
                                <Badge className="absolute bottom-2 left-2 bg-black/70 text-white border-none text-[10px] flex items-center gap-1 px-2 py-1 backdrop-blur-sm">
                                    <MapPin className="size-3" /> {distance}
                                </Badge>
                            )}
                            <FavoriteButton
                                isFavorite={isFavorite}
                                onToggle={toggleFavorite}
                                className="top-2 right-2 size-7"
                            />
                        </div>

                        {/* Content Section */}
                        <CardContent className="flex-1 p-0 flex flex-col h-full justify-center w-full">
                            <div className="flex justify-between items-start gap-3 mb-1">
                                <h3 className="font-bold text-lg text-primary-dark group-hover:text-primary transition-colors line-clamp-1">
                                    {property.title}
                                </h3>
                                <span className="text-xs font-heading text-muted-foreground uppercase tracking-wider mt-1 shrink-0">
                                    {property.propertyType}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-sm text-primary/80 mb-2">
                                <MapPin className="size-3.5 shrink-0 fill-current" />
                                <span className="line-clamp-1">{property.address}, {property.city}</span>
                            </div>

                            {/* Icons Row */}
                            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 font-medium">
                                <div className="flex items-center gap-1.5" title={`${property.bedrooms} bedrooms`}>
                                    <Bed className="size-4 text-primary" />
                                    <span>{property.bedrooms} Beds</span>
                                </div>
                                <div className="flex items-center gap-1.5" title={`${property.bathrooms} bathrooms`}>
                                    <Bath className="size-4 text-primary" />
                                    <span>{property.bathrooms} Baths</span>
                                </div>
                                <div className="flex items-center gap-1.5" title={`${property.area} square feet`}>
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
                                    <div className="text-xs text-gray-500">/month</div>
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

    // Grid variant
    return (
        <div className="relative h-full">
            <Link to={`/property/${property.id}`} className="block h-full">
                <Card className="group border border-primary-lightest overflow-hidden hover:shadow-xl hover:border-primary-light transition-all duration-300 relative h-full flex flex-col cursor-pointer hover:-translate-y-1">
                    <div className="relative aspect-[4/3] overflow-hidden bg-primary-lightest">
                        <img
                            src={property.imageUrls?.[0] || "/placeholder.svg"}
                            alt={property.title}
                            loading="lazy"
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                        {property.virtualTourUrl && (
                            <Badge className="absolute top-3 left-3 bg-white/90 text-primary-dark border-none text-[10px] uppercase font-bold tracking-wider shadow-sm">
                                360° Tour
                            </Badge>
                        )}
                        {property.verified && (
                            <Badge className="absolute top-3 right-3 bg-green-500 text-white border-none shadow-sm">
                                Verified
                            </Badge>
                        )}
                        {distance && (
                            <Badge className="absolute bottom-3 left-3 bg-black/70 text-white border-none text-[10px] flex items-center gap-1 px-2 py-1 backdrop-blur-sm">
                                <MapPin className="size-3" /> {distance}
                            </Badge>
                        )}
                        <FavoriteButton
                            isFavorite={isFavorite}
                            onToggle={toggleFavorite}
                            className="bottom-3 right-3 size-9"
                        />
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-bold line-clamp-2 flex-1 text-primary-dark group-hover:text-primary transition-colors">{property.title}</h3>
                            <Badge variant="secondary" className="bg-primary-lightest text-primary-dark text-[10px] ml-2 shrink-0">
                                {property.propertyType}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <MapPin className="size-3 shrink-0" />
                            <span className="line-clamp-1">{property.city}, {property.district}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 font-medium">
                            <div className="flex items-center gap-1.5" title={`${property.bedrooms} bedrooms`}>
                                <Bed className="size-4 text-primary" />
                                <span>{property.bedrooms} Beds</span>
                            </div>
                            <div className="flex items-center gap-1.5" title={`${property.bathrooms} bathrooms`}>
                                <Bath className="size-4 text-primary" />
                                <span>{property.bathrooms} Baths</span>
                            </div>
                            <div className="flex items-center gap-1.5" title={`${property.area} square feet`}>
                                <Maximize className="size-4 text-primary" />
                                <span>{property.area} sq.ft</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1.5 border-t border-primary-lightest pt-3 mt-auto">
                            <div className="font-heading font-bold text-xl text-primary">Rs. {property.price.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground font-medium">/ month</div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    )
}
