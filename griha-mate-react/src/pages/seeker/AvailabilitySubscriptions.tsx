import { useState, useEffect } from "react"
import { Bell, MapPin, Trash2, CheckCircle2, AlertCircle, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { availabilitySubscriptionAPI } from "@/lib/api"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"

export default function AvailabilitySubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [city, setCity] = useState("")
    const [district, setDistrict] = useState("")

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const fetchSubscriptions = async () => {
        try {
            setLoading(true)
            const data = await availabilitySubscriptionAPI.getMySubscriptions()
            setSubscriptions(data)
        } catch (error: any) {
            toast.error("Failed to load your subscriptions")
        } finally {
            setLoading(false)
        }
    }

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!city) {
            toast.error("Please enter a city")
            return
        }
        setSubmitting(true)
        try {
            await availabilitySubscriptionAPI.subscribe(city, district)
            toast.success(`Subscribed to ${city}! We'll notify you when a room becomes available.`)
            setCity("")
            setDistrict("")
            fetchSubscriptions()
        } catch (error: any) {
            toast.error(error.message || "Failed to subscribe")
        } finally {
            setSubmitting(false)
        }
    }

    const handleUnsubscribe = async (id: number) => {
        try {
            await availabilitySubscriptionAPI.unsubscribe(id)
            toast.success("Unsubscribed successfully")
            setSubscriptions(subscriptions.filter(s => s.id !== id))
        } catch (error: any) {
            toast.error("Failed to unsubscribe")
        }
    }

    return (
        <div className="min-h-screen bg-primary-lightest/30 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-3xl mb-4"
                    >
                        <Bell className="size-8 text-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-primary-dark mb-4">Availability Notifications</h1>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        Can't find a room in your preferred location? Subscribe and we'll notify you as soon as a matching, verified property is listed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white sticky top-8">
                            <CardHeader className="bg-primary-dark p-6">
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <Plus className="size-5" /> New Request
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubscribe} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-gray-700 font-semibold">City *</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                            <Input
                                                id="city"
                                                placeholder="e.g. Kathmandu"
                                                className="pl-10 h-12 rounded-xl border-primary-light"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="district" className="text-gray-700 font-semibold">District (Optional)</Label>
                                        <Input
                                            id="district"
                                            placeholder="e.g. Kathmandu"
                                            className="h-12 rounded-xl border-primary-light"
                                            value={district}
                                            onChange={(e) => setDistrict(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary hover:bg-primary-dark text-white h-12 rounded-xl font-bold mt-4 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="size-5 animate-spin" /> : <Bell className="size-4" />}
                                        Notify Me
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-primary-dark flex items-center gap-2">
                            Your Active Requests
                            <span className="text-sm font-normal text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm ml-2">
                                {subscriptions.length}
                            </span>
                        </h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] shadow-sm">
                                <Loader2 className="size-10 text-primary animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Loading requests...</p>
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-dashed border-primary-light">
                                <div className="size-16 bg-primary-lightest/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="size-8 text-primary/40" />
                                </div>
                                <h3 className="text-xl font-bold text-primary-dark mb-2">No active requests</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    You haven't set up any availability notifications yet. Use the form to start receiving alerts.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {subscriptions.map((sub) => (
                                        <motion.div
                                            key={sub.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                        >
                                            <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white group hover:shadow-lg transition-all">
                                                <CardContent className="p-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                            <MapPin className="size-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-primary-dark">{sub.preferredCity}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {sub.preferredDistrict ? sub.preferredDistrict : "All districts"} • Requested on {new Date(sub.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                                                            <CheckCircle2 className="size-3" /> ACTIVE
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleUnsubscribe(sub.id)}
                                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                                        >
                                                            <Trash2 className="size-5" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="bg-primary-dark p-6 rounded-[2rem] text-white flex items-start gap-4 shadow-xl">
                            <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                <Bell className="size-5" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">How it works?</h4>
                                <p className="text-sm text-white/70 leading-relaxed">
                                    When a landlord lists a property in your requested location and it passes our verification process, we'll automatically send you an email with the property details.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
