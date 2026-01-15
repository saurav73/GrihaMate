import * as React from "react"
import {
  AudioOutlined,
  AudioMutedOutlined,
  CloseOutlined
} from "@ant-design/icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "react-toastify"

interface VoiceSearchDialogProps {
  onSearch?: (query: string) => void
}

export function AISearchDialog({ onSearch }: VoiceSearchDialogProps) {
  const [isListening, setIsListening] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [transcript, setTranscript] = React.useState("")
  const [permissionDenied, setPermissionDenied] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [speechFailed, setSpeechFailed] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)
  const latestQueryRef = React.useRef<string>("")

  // Check if browser supports Speech Recognition
  const isSpeechRecognitionSupported = React.useMemo(() => {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }, [])

  React.useEffect(() => {
    if (!isSpeechRecognitionSupported) return

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      latestQueryRef.current = "" // Clear previous query
      toast.info("🎤 Listening... Speak now", {
        position: "top-center",
        autoClose: 2000,
      })
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        const finalQuery = finalTranscript.trim()
        console.log('✅ Final transcript received:', finalQuery)
        setTranscript(finalQuery)
        setQuery(finalQuery)
        latestQueryRef.current = finalQuery
      } else {
        setTranscript(interimTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)

      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setPermissionDenied(true)
        console.warn('Microphone permission denied')
        toast.error("Microphone access denied. Please allow microphone permission in your browser settings.", {
          position: "top-center",
          autoClose: 5000,
        })
      } else if (event.error === 'no-speech') {
        console.info('No speech detected')
        toast.warning("No speech detected. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        })
      } else if (event.error === 'network') {
        setSpeechFailed(true)
        // Don't log error - we're showing a clear UI warning to the user
        console.info('Speech service unavailable - showing text input to user')
      } else if (event.error === 'audio-capture') {
        console.warn('Microphone not found')
        toast.error("Microphone not found. Please check if a microphone is connected.", {
          position: "top-center",
          autoClose: 4000,
        })
      } else if (event.error === 'aborted') {
        // User stopped listening, don't show error or log
      } else {
        console.warn('Speech recognition error:', event.error)
        toast.error(`Speech recognition error: ${event.error}. You can type your search instead.`, {
          position: "top-center",
          autoClose: 4000,
        })
      }
    }

    recognition.onend = () => {
      console.log('🔴 Speech recognition ended')
      setIsListening(false)

      // Auto-search when speech recognition ends
      setTimeout(() => {
        const currentQuery = latestQueryRef.current
        console.log('🔍 Auto-search attempting with query:', currentQuery)

        if (currentQuery && currentQuery.trim()) {
          console.log('✅ Executing search for:', currentQuery)
          onSearch?.(currentQuery.trim())
          setIsOpen(false)

          // Check if it's a nearby search
          const lowerQuery = currentQuery.toLowerCase()
          const isNearbySearch = lowerQuery.includes('nearby') ||
            lowerQuery.includes('near me') ||
            lowerQuery.includes('near my location') ||
            lowerQuery.includes('closest') ||
            lowerQuery.includes('nearest')

          if (isNearbySearch) {
            toast.success(`🎤 Voice search: Finding nearest properties...`, {
              position: "top-center",
              autoClose: 2000,
            })
          } else {
            toast.success(`🎤 Voice search: "${currentQuery.trim()}"`, {
              position: "top-center",
              autoClose: 2000,
            })
          }

          // Clear the ref after search
          latestQueryRef.current = ""
        } else {
          console.log('❌ No query found, search not executed')
        }
      }, 500)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isSpeechRecognitionSupported])

  const startListening = async () => {
    if (!isSpeechRecognitionSupported) {
      toast.error("Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.", {
        position: "top-center",
        autoClose: 5000,
      })
      return
    }

    if (permissionDenied) {
      toast.warning("Microphone access was denied. Please enable it in browser settings.", {
        position: "top-center",
        autoClose: 4000,
      })
      return
    }

    setTranscript("")
    setQuery("")

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Permission granted, now start recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } catch (error: any) {
      console.error('Error starting recognition:', error)

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true)
        toast.error("Microphone permission denied. Please allow microphone access and try again.", {
          position: "top-center",
          autoClose: 5000,
        })
      } else if (error.name === 'NotFoundError') {
        toast.error("No microphone found. Please connect a microphone and try again.", {
          position: "top-center",
          autoClose: 4000,
        })
      } else {
        toast.error("Failed to start voice search. Please try typing your search instead.", {
          position: "top-center",
          autoClose: 4000,
        })
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }


  const clearQuery = () => {
    setQuery("")
    setTranscript("")
    latestQueryRef.current = ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark text-white rounded-xl h-12 px-6 flex items-center gap-2 flex-shrink-0 shadow-md">
          Voice Search
          <AudioOutlined style={{ fontSize: '16px' }} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-primary" aria-describedby="voice-search-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary-dark">
            <AudioOutlined className="text-primary" style={{ fontSize: '20px' }} />
            Voice Search
          </DialogTitle>
          <p id="voice-search-description" className="text-sm text-gray-600 mt-2">
            🎤 Speak or type to search for properties
          </p>
        </DialogHeader>
        <div className="flex flex-col items-center py-6">
          {speechFailed && (
            <div className="mb-4 w-full p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center">
              <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Voice Search Unavailable</p>
              <p className="text-xs text-yellow-700">
                Google's speech service is blocked or unavailable in your network. Please use the text input below instead.
              </p>
            </div>
          )}

          {!isSpeechRecognitionSupported && (
            <div className="mb-4 w-full p-4 bg-blue-50 border border-blue-300 rounded-lg text-center">
              <p className="text-sm text-blue-800">
                Voice search is not supported in your browser. Please use the text input below.
              </p>
            </div>
          )}

          {permissionDenied && (
            <div className="mb-4 w-full p-4 bg-red-50 border border-red-300 rounded-lg text-center">
              <p className="text-sm text-red-800">
                Microphone access denied. Please use the text input below to search.
              </p>
            </div>
          )}

          {!speechFailed && !permissionDenied && isSpeechRecognitionSupported && (

            <div className="flex flex-col items-center">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!isSpeechRecognitionSupported || speechFailed}
                className={`size-24 rounded-full flex items-center justify-center transition-all duration-500 ${isListening
                  ? "bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110 animate-pulse"
                  : "bg-primary hover:bg-primary-dark shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
              >
                {isListening ? (
                  <AudioMutedOutlined className="text-white" style={{ fontSize: '40px' }} />
                ) : (
                  <AudioOutlined className="text-white" style={{ fontSize: '40px' }} />
                )}
              </button>

              <p className="mt-4 text-sm font-medium text-center px-4 text-gray-600">
                {isListening
                  ? "🎤 Listening... Speak now"
                  : "Optional: Tap mic for voice search"}
              </p>

              <p className="mt-1 text-xs text-gray-500 text-center italic">
                Or just type your search below
              </p>

              {(transcript || query) && (
                <div className="mt-4 w-full bg-primary-lightest p-3 rounded-lg border-2 border-primary animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">
                      {isListening ? "Transcribing..." : "Your Search"}
                    </div>
                    <button
                      onClick={clearQuery}
                      className="text-gray-600 hover:text-primary"
                    >
                      <CloseOutlined style={{ fontSize: '16px' }} />
                    </button>
                  </div>
                  <div className="text-sm font-medium text-primary-dark">{transcript || query}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            🎤 Search will execute automatically when you finish speaking
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
