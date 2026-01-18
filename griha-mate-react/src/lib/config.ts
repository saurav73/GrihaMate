// Configuration file for API keys and environment variables

// Multiple Gemini API Keys for fallback mechanism
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_1 || 'AIzaSyD45xBVg_QAFjIq-frCmm_N89I5fbNdSvo',
  import.meta.env.VITE_GEMINI_API_KEY_2 || 'AIzaSyBBeW4H4WXkZQ21z6QmU6LH0oBKiRPCXUg',
  import.meta.env.VITE_GEMINI_API_KEY_3 || 'AIzaSyCHCd2Dpq_S0Yx3szfYNwnvXnNuQBPx3uI',
  import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDc3AA-6tVOuDFO8QPAXmAZc0M27nDZwPc', // Legacy fallback
].filter(key => key && key.trim().length > 0)

export const config = {
  // Gemini AI API Keys (array for fallback)
  geminiApiKeys: GEMINI_API_KEYS,
  // Primary key (first in array)
  geminiApiKey: GEMINI_API_KEYS[0] || '',
  
  // Backend API URL
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
}

export default config


