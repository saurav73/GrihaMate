// Gemini AI Service for Natural Language Search Processing
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from './config'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey)

export interface SearchParameters {
  location?: string
  city?: string
  propertyType?: 'ROOM' | 'FLAT' | 'APARTMENT' | 'HOUSE'
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  verified?: boolean
  query?: string
  keywords?: string[]
}

/**
 * Process natural language query using Gemini AI
 * Extracts structured search parameters from user's voice/text input
 */
export async function processSearchQuery(userQuery: string): Promise<SearchParameters> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are a real estate search assistant for GrihaMate, a property rental platform in Nepal.

Analyze this search query and extract structured search parameters:
Query: "${userQuery}"

Extract the following information if mentioned:
1. Location/City (common Nepal cities: Kathmandu, Pokhara, Lalitpur, Bhaktapur, Biratnagar)
2. Property Type (ROOM, FLAT, APARTMENT, HOUSE)
3. Price Range (in Nepali Rupees)
4. Number of Bedrooms (if mentioned)
5. Verified Properties Only (if user wants verified/trusted/safe properties)
6. Keywords (any other important search terms)

Respond ONLY with a valid JSON object, no markdown formatting, no explanation:
{
  "location": "string or null",
  "city": "string or null",
  "propertyType": "ROOM|FLAT|APARTMENT|HOUSE or null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "bedrooms": number or null,
  "verified": boolean or null,
  "query": "simplified search query",
  "keywords": ["array", "of", "keywords"]
}

Examples:
- "Show me 2BHK apartments in Kathmandu under 30000" → {"city":"Kathmandu","propertyType":"APARTMENT","bedrooms":2,"maxPrice":30000,"query":"2BHK apartments Kathmandu","keywords":["2BHK","apartments","affordable"]}
- "Find rooms near me" → {"propertyType":"ROOM","query":"rooms nearby","keywords":["rooms","nearby"]}
- "Verified flats in Pokhara" → {"city":"Pokhara","propertyType":"FLAT","verified":true,"query":"verified flats Pokhara","keywords":["verified","flats","Pokhara"]}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response (remove markdown code blocks if present)
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '')
    }

    // Parse the JSON response
    const searchParams: SearchParameters = JSON.parse(cleanedText)

    // Add the original query as fallback
    searchParams.query = searchParams.query || userQuery

    console.log('🤖 Gemini AI processed query:', { original: userQuery, extracted: searchParams })

    return searchParams
  } catch (error) {
    console.error('Error processing query with Gemini AI:', error)
    
    // Fallback: return basic search parameters
    return {
      query: userQuery,
      keywords: userQuery.toLowerCase().split(' ').filter(w => w.length > 2),
    }
  }
}

/**
 * Generate property recommendations based on user preferences
 */
export async function generateRecommendations(userPreferences: SearchParameters): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are a helpful real estate assistant for GrihaMate in Nepal.

Based on these user preferences:
${JSON.stringify(userPreferences, null, 2)}

Generate a friendly, concise recommendation message (2-3 sentences) that:
1. Acknowledges their search criteria
2. Suggests what they might find
3. Provides helpful tips for their search

Keep it conversational and specific to Nepal's rental market.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return "I'll help you find the perfect property in Nepal! Use the filters to refine your search."
  }
}

/**
 * Smart property description generator (for landlords)
 */
export async function generatePropertyDescription(propertyData: {
  propertyType: string
  bedrooms: number
  bathrooms: number
  area: number
  city: string
  amenities?: string[]
}): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Generate an attractive, professional property listing description for GrihaMate.

Property Details:
- Type: ${propertyData.propertyType}
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Area: ${propertyData.area} sq ft
- Location: ${propertyData.city}, Nepal
${propertyData.amenities ? `- Amenities: ${propertyData.amenities.join(', ')}` : ''}

Create a compelling description (3-4 sentences) that:
1. Highlights the property's best features
2. Mentions the location's benefits
3. Appeals to potential tenants
4. Sounds professional but friendly

Write in a way that works for Nepal's rental market.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating description:', error)
    return `Beautiful ${propertyData.propertyType.toLowerCase()} with ${propertyData.bedrooms} bedrooms in ${propertyData.city}. Well-maintained property with modern amenities.`
  }
}

/**
 * Chat with AI assistant about properties
 */
export async function chatWithAI(userMessage: string, context?: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are a helpful real estate assistant for GrihaMate, a property rental platform in Nepal.

User: ${userMessage}

${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide a helpful, friendly response about finding properties, renting in Nepal, or using GrihaMate.
Keep your response concise (2-3 sentences) and actionable.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error chatting with AI:', error)
    return "I'm here to help! Please try asking about properties, locations, or rental tips in Nepal."
  }
}

export default {
  processSearchQuery,
  generateRecommendations,
  generatePropertyDescription,
  chatWithAI,
}


