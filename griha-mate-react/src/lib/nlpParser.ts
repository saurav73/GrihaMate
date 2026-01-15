// Simple NLP Parser for Voice Search Queries
// Extracts location, property type, price range, bedrooms from natural language

export interface ParsedQuery {
    city?: string
    propertyType?: string
    minPrice?: string
    maxPrice?: string
    minBedrooms?: string
    nearby?: boolean
    useUserLocation?: boolean
    originalQuery: string
}

// City/Location keywords
const CITIES = ['kathmandu', 'pokhara', 'lalitpur', 'bhaktapur', 'patan', 'biratnagar', 'birgunj']

// Property type keywords
const PROPERTY_TYPES: Record<string, string> = {
    'room': 'ROOM',
    'rooms': 'ROOM',
    'apartment': 'APARTMENT',
    'apartments': 'APARTMENT',
    'flat': 'FLAT',
    'flats': 'FLAT',
    'house': 'HOUSE',
    'houses': 'HOUSE',
}

// Nearby/proximity keywords
const NEARBY_KEYWORDS = ['nearby', 'near', 'close', 'closest', 'nearest', 'around', 'near me', 'near my location']

/**
 * Extract city/location from query
 */
function extractCity(query: string): string | undefined {
    const lowerQuery = query.toLowerCase()

    for (const city of CITIES) {
        if (lowerQuery.includes(city)) {
            // Return capitalized
            return city.charAt(0).toUpperCase() + city.slice(1)
        }
    }

    return undefined
}

/**
 * Extract property type from query
 */
function extractPropertyType(query: string): string | undefined {
    const lowerQuery = query.toLowerCase()

    for (const [keyword, type] of Object.entries(PROPERTY_TYPES)) {
        if (lowerQuery.includes(keyword)) {
            return type
        }
    }

    return undefined
}

/**
 * Extract price information from query
 * Handles: "under 30000", "below 25k", "less than 40k", "between 20-40", "20 to 40 thousand"
 */
function extractPrice(query: string): { minPrice?: string; maxPrice?: string } {
    const lowerQuery = query.toLowerCase()

    // Convert "k" to thousands
    let processedQuery = lowerQuery
        .replace(/(\d+)k/g, (_, num) => String(parseInt(num) * 1000))
        .replace(/(\d+)\s*thousand/g, (_, num) => String(parseInt(num) * 1000))

    // Pattern: "under X", "below X", "less than X"
    const underMatch = processedQuery.match(/(?:under|below|less than)\s*(\d+)/i)
    if (underMatch) {
        return { maxPrice: underMatch[1] }
    }

    // Pattern: "above X", "more than X", "over X"
    const aboveMatch = processedQuery.match(/(?:above|more than|over)\s*(\d+)/i)
    if (aboveMatch) {
        return { minPrice: aboveMatch[1] }
    }

    // Pattern: "between X and Y", "X to Y", "X-Y"
    const rangeMatch = processedQuery.match(/(?:between\s*)?(\d+)(?:\s*(?:to|-|and)\s*)(\d+)/i)
    if (rangeMatch) {
        return {
            minPrice: rangeMatch[1],
            maxPrice: rangeMatch[2]
        }
    }

    return {}
}

/**
 * Extract bedroom count from query
 * Handles: "2 bedroom", "3BHK", "three bed", "2BR"
 */
function extractBedrooms(query: string): string | undefined {
    const lowerQuery = query.toLowerCase()

    // Pattern: "2 bedroom", "3 bed", "2BR"
    const bedroomMatch = lowerQuery.match(/(\d+)\s*(?:bedroom|bed|br|bhk)/i)
    if (bedroomMatch) {
        return bedroomMatch[1]
    }

    // Word numbers
    const wordNumbers: Record<string, string> = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5'
    }

    for (const [word, num] of Object.entries(wordNumbers)) {
        if (lowerQuery.includes(`${word} bed`)) {
            return num
        }
    }

    return undefined
}

/**
 * Detect if query is asking for nearby/proximity search
 */
function isNearbySearch(query: string): boolean {
    const lowerQuery = query.toLowerCase()
    return NEARBY_KEYWORDS.some(keyword => lowerQuery.includes(keyword))
}

/**
 * Main NLP parser function
 * Parses natural language voice query and extracts structured filter criteria
 */
export function parseVoiceQuery(query: string): ParsedQuery {
    if (!query || query.trim() === '') {
        return { originalQuery: query }
    }

    const result: ParsedQuery = {
        originalQuery: query
    }

    // Extract city
    const city = extractCity(query)
    if (city) {
        result.city = city
    }

    // Extract property type
    const propertyType = extractPropertyType(query)
    if (propertyType) {
        result.propertyType = propertyType
    }

    // Extract price
    const { minPrice, maxPrice } = extractPrice(query)
    if (minPrice) result.minPrice = minPrice
    if (maxPrice) result.maxPrice = maxPrice

    // Extract bedrooms
    const bedrooms = extractBedrooms(query)
    if (bedrooms) {
        result.minBedrooms = bedrooms
    }

    // Check for nearby intent
    const nearby = isNearbySearch(query)
    if (nearby) {
        result.nearby = true
        // If "near me" specifically mentioned, request user location
        if (query.toLowerCase().includes('near me') || query.toLowerCase().includes('my location')) {
            result.useUserLocation = true
        }
    }

    return result
}

/**
 * Generate a human-readable summary of what was parsed
 */
export function summarizeParsedQuery(parsed: ParsedQuery): string {
    const parts: string[] = []

    if (parsed.propertyType) {
        parts.push(parsed.propertyType.toLowerCase())
    }

    if (parsed.minBedrooms) {
        parts.push(`${parsed.minBedrooms} bedroom`)
    }

    if (parsed.nearby) {
        parts.push('nearby')
    }

    if (parsed.city) {
        parts.push(`in ${parsed.city}`)
    }

    if (parsed.maxPrice) {
        parts.push(`under Rs. ${parseInt(parsed.maxPrice).toLocaleString()}`)
    } else if (parsed.minPrice) {
        parts.push(`above Rs. ${parseInt(parsed.minPrice).toLocaleString()}`)
    }

    return parts.length > 0 ? parts.join(' ') : 'all properties'
}
