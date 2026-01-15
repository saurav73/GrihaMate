// Configuration file for API keys and environment variables

export const config = {
  // Gemini AI API Key
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDc3AA-6tVOuDFO8QPAXmAZc0M27nDZwPc',
  
  // Backend API URL
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
}

export default config


