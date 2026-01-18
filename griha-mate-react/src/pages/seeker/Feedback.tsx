import { useState, useEffect } from "react"
import { Star, Send, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { feedbackAPI } from "@/lib/api"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function SeekerFeedbackPage() {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [checking, setChecking] = useState(true)
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)

    useEffect(() => {
        checkFeedbackStatus()
    }, [])

    const checkFeedbackStatus = async () => {
        try {
            setChecking(true)
            const response = await feedbackAPI.checkStatus()
            if (response.hasSubmitted) {
                setAlreadySubmitted(true)
                setSubmitted(true)
            }
        } catch (error: any) {
            // If check fails, allow user to try submitting
            console.warn("Could not check feedback status:", error)
        } finally {
            setChecking(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }
        setLoading(true)
        try {
            await feedbackAPI.submit(comment, rating)
            setSubmitted(true)
            toast.success("Thank you for your feedback!")
        } catch (error: any) {
            const errorMessage = error.message || "Failed to submit feedback"
            if (errorMessage.includes("already submitted") || errorMessage.includes("already submitted feedback")) {
                setAlreadySubmitted(true)
                setSubmitted(true)
            }
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-primary-lightest/30 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Checking feedback status...</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (submitted || alreadySubmitted) {
        return (
            <div className="min-h-screen bg-primary-lightest/30 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white text-center p-8">
                        <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="size-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-primary-dark mb-4">
                            {alreadySubmitted ? "Feedback Already Submitted" : "Feedback Received!"}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {alreadySubmitted 
                                ? "You have already submitted your feedback. Each user can only submit feedback once. Thank you for your input!"
                                : "We appreciate you taking the time to share your experience. Your feedback helps us make GrihaMate better for everyone."
                            }
                        </p>
                        <Button
                            onClick={() => window.history.back()}
                            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl h-12 font-bold"
                        >
                            Go Back
                        </Button>
                    </Card>
                </motion.div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-primary-lightest/30 flex flex-col">
            <Navbar />
            <div className="flex-1 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-primary-dark mb-4">We'd Love Your Feedback</h1>
                    <p className="text-lg text-gray-600">
                        Tell us about your experience using GrihaMate. Your voice matters!
                    </p>
                </div>

                <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="bg-primary-dark text-white p-8">
                        <CardTitle className="text-2xl">Share Your Experience</CardTitle>
                        <CardDescription className="text-primary-lightest/80">
                            How are we doing? Please rate us and leave a comment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                {/* Interactive Icon that changes with rating */}
                                <div className="flex justify-center mb-2">
                                    <motion.div
                                        key={hoverRating || rating}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-6xl"
                                    >
                                        {(() => {
                                            const activeRating = hoverRating || rating
                                            switch (activeRating) {
                                                case 5: return "😄"
                                                case 4: return "😊"
                                                case 3: return "🙂"
                                                case 2: return "😐"
                                                case 1: return "😟"
                                                default: return "😊"
                                            }
                                        })()}
                                    </motion.div>
                                </div>
                                
                                <label className="text-sm font-semibold text-gray-700 block text-center">
                                    Your Overall Rating
                                </label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-all hover:scale-110 active:scale-95 p-1"
                                        >
                                            <Star
                                                className={`size-10 ${star <= (hoverRating || rating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-center text-sm font-medium text-primary">
                                        {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good!" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="comment" className="text-sm font-semibold text-gray-700 block">
                                    How can we improve? (Optional)
                                </label>
                                <Textarea
                                    id="comment"
                                    placeholder="Tell us what you like or what could be better..."
                                    className="min-h-[150px] rounded-2xl border-primary-light focus:ring-primary focus:border-primary p-4 text-base"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="w-full bg-primary hover:bg-primary-dark text-white h-14 rounded-2xl shadow-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {loading ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="size-5" />
                                )}
                                Submit Feedback
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Your feedback will be reviewed by our team to improve our services.
                </p>
            </div>
            </div>
            <Footer />
        </div>
    )
}
