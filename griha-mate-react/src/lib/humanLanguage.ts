// Human-like language generation using Gemini AI
import { GoogleGenerativeAI } from "@google/generative-ai"
import { config } from "./config"

const genAI = new GoogleGenerativeAI(config.geminiApiKey)

// Cache for generated messages to avoid repeated API calls
const messageCache = new Map<string, string>()

/**
 * Generate a human-like success message
 */
export async function generateSuccessMessage(action: string, context?: string): Promise<string> {
  const cacheKey = `success-${action}-${context || ''}`
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey)!
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Generate a short, friendly, and enthusiastic success message (max 10 words) for: ${action}${context ? `. Context: ${context}` : ''}. Use emojis naturally. Be conversational and warm.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const message = response.text().trim().replace(/['"]/g, '')
    
    messageCache.set(cacheKey, message)
    return message
  } catch (error) {
    console.error('Gemini API error:', error)
    return getFallbackSuccessMessage(action)
  }
}

/**
 * Generate a human-like error message
 */
export async function generateErrorMessage(error: string, context?: string): Promise<string> {
  const cacheKey = `error-${error}-${context || ''}`
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey)!
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Generate a short, empathetic, and helpful error message (max 15 words) for: ${error}${context ? `. Context: ${context}` : ''}. Be understanding and suggest what to do next. Use a supportive tone.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const message = response.text().trim().replace(/['"]/g, '')
    
    messageCache.set(cacheKey, message)
    return message
  } catch (error) {
    console.error('Gemini API error:', error)
    return getFallbackErrorMessage(error as string)
  }
}

/**
 * Generate a human-like info message
 */
export async function generateInfoMessage(info: string, context?: string): Promise<string> {
  const cacheKey = `info-${info}-${context || ''}`
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey)!
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Generate a short, informative, and friendly message (max 12 words) for: ${info}${context ? `. Context: ${context}` : ''}. Be clear and helpful. Use a conversational tone.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const message = response.text().trim().replace(/['"]/g, '')
    
    messageCache.set(cacheKey, message)
    return message
  } catch (error) {
    console.error('Gemini API error:', error)
    return getFallbackInfoMessage(info)
  }
}

/**
 * Generate a human-like warning message
 */
export async function generateWarningMessage(warning: string, context?: string): Promise<string> {
  const cacheKey = `warning-${warning}-${context || ''}`
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey)!
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Generate a short, cautionary but friendly warning message (max 12 words) for: ${warning}${context ? `. Context: ${context}` : ''}. Be helpful and guide the user. Use a caring tone.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const message = response.text().trim().replace(/['"]/g, '')
    
    messageCache.set(cacheKey, message)
    return message
  } catch (error) {
    console.error('Gemini API error:', error)
    return getFallbackWarningMessage(warning)
  }
}

/**
 * Generate a human-like greeting based on time of day
 */
export async function generateGreeting(userName?: string): Promise<string> {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Generate a warm, personalized ${timeOfDay} greeting${userName ? ` for ${userName}` : ''} (max 8 words). Be friendly and welcoming. Use appropriate emojis.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim().replace(/['"]/g, '')
  } catch (error) {
    console.error('Gemini API error:', error)
    return `Good ${timeOfDay}${userName ? `, ${userName}` : ''}! 👋`
  }
}

/**
 * Generate a human-like property description enhancement
 */
export async function enhancePropertyDescription(originalDescription: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Make this property description more engaging, vivid, and appealing (max 50 words). Keep the key details but make it sound more inviting and descriptive: "${originalDescription}"`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Gemini API error:', error)
    return originalDescription
  }
}

/**
 * Generate contextual search suggestions
 */
export async function generateSearchSuggestion(query: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Based on the search query "${query}", generate a helpful, encouraging message (max 15 words) to help the user refine their search or understand what they're looking for. Be supportive and constructive.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim().replace(/['"]/g, '')
  } catch (error) {
    console.error('Gemini API error:', error)
    return "Try adjusting your search to find more options! 🔍"
  }
}

// Fallback messages if API fails
function getFallbackSuccessMessage(action: string): string {
  const messages: Record<string, string> = {
    'login': '🎉 Welcome back! Great to see you!',
    'register': '🌟 Account created! Welcome aboard!',
    'favorite': '❤️ Saved to favorites! You can view it anytime!',
    'unfavorite': '✓ Removed from favorites!',
    'booking': '🎊 Booking confirmed! Exciting times ahead!',
    'contact': '📧 Message sent! They\'ll get back to you soon!',
    'search': '🔍 Search complete! Found what you need?',
    'profile': '✨ Profile updated! Looking good!',
    'logout': '👋 See you soon! Take care!',
  }
  return messages[action] || '✓ Done! That went well!'
}

function getFallbackErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    'network': '😕 Connection hiccup. Check your internet?',
    'auth': '🔐 Hmm, credentials don\'t match. Try again?',
    'notfound': '🤔 Couldn\'t find that. Maybe try something else?',
    'permission': '⛔ You don\'t have access to this. Need help?',
    'validation': '📝 Some info looks off. Mind double-checking?',
  }
  return messages[error] || '😅 Oops, something went wrong. Try again?'
}

function getFallbackInfoMessage(info: string): string {
  const messages: Record<string, string> = {
    'loading': '⏳ Just a moment, loading your data...',
    'empty': '📭 Nothing here yet. Start exploring!',
    'filter': '🔎 Use filters to narrow down results!',
    'nearby': '📍 Showing properties near you!',
  }
  return messages[info] || 'ℹ️ Here\'s what you need to know!'
}

function getFallbackWarningMessage(warning: string): string {
  const messages: Record<string, string> = {
    'unsaved': '⚠️ Hold on! You have unsaved changes.',
    'delete': '🚨 This can\'t be undone. Are you sure?',
    'location': '📍 Location access needed for best results.',
    'voice': '🎤 Microphone access needed for voice search.',
  }
  return messages[warning] || '⚠️ Just a heads up about this!'
}

// Pre-cache common messages on module load
export async function precacheCommonMessages() {
  const commonActions = ['login', 'register', 'favorite', 'booking', 'contact', 'search']
  const promises = commonActions.map(action => generateSuccessMessage(action))
  await Promise.allSettled(promises)
}


