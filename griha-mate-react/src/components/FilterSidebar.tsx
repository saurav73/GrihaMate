import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface FilterSidebarProps {
    filters: any
    setFilters: (filters: any) => void
    onApply: () => void
    onReset: () => void
    showMobile?: boolean
    onCloseMobile?: () => void
}

export function FilterSidebar({
    filters,
    setFilters,
    onApply,
    onReset,
    showMobile,
    onCloseMobile
}: FilterSidebarProps) {

    const handleChange = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }))
    }

    return (
        <div className={`
      bg-white p-6 rounded-2xl border border-primary-lightest h-fit
      ${showMobile ? 'fixed inset-0 z-50 overflow-y-auto m-0 rounded-none' : 'hidden lg:block w-72 shrink-0 sticky top-24'}
    `}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-primary-dark">Filters</h3>
                {showMobile && (
                    <Button variant="ghost" size="icon" onClick={onCloseMobile}>
                        <X className="size-5" />
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                {/* City Filter */}
                <div className="space-y-2">
                    <Label>City</Label>
                    <Select
                        value={filters.city}
                        onValueChange={(val) => handleChange('city', val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            <SelectItem value="Kathmandu">Kathmandu</SelectItem>
                            <SelectItem value="Lalitpur">Lalitpur</SelectItem>
                            <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
                            <SelectItem value="Pokhara">Pokhara</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                    <Label>Property Type</Label>
                    <div className="flex flex-wrap gap-2">
                        {["ROOM", "FLAT", "APARTMENT", "HOUSE"].map((type) => (
                            <div
                                key={type}
                                onClick={() => handleChange('propertyType', filters.propertyType === type ? "" : type)}
                                className={`
                  cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${filters.propertyType === type
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-gray-600 border-primary-lightest hover:border-primary"}
                `}
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                    <Label>Price Range (Rs.)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleChange('minPrice', e.target.value)}
                            className="h-9 text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleChange('maxPrice', e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                    <Label>Min Bedrooms</Label>
                    <Select
                        value={filters.minBedrooms?.toString() || ""}
                        onValueChange={(val) => handleChange('minBedrooms', val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Any</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-3">
                    <Button className="w-full bg-primary hover:bg-primary-dark" onClick={onApply}>
                        Apply Filters
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onReset}>
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    )
}
