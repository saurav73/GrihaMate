import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { paymentAPI } from "@/lib/api"
import { toast } from "react-toastify"
import { CreditCard, Wallet } from "lucide-react"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    amount: number
    propertyId: number
    propertyTitle: string
    onSuccess: () => void
    type?: 'booking' | 'subscription'
}

export function PaymentModal({ isOpen, onClose, amount, propertyId, propertyTitle, onSuccess, type = 'booking' }: PaymentModalProps) {
    const [loading, setLoading] = useState(false)
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    })

    // eSewa Payment
    const handleEsewaPayment = async () => {
        try {
            setLoading(true)
            const data = await paymentAPI.initiateEsewa(amount, propertyId)

            // eSewa requires a form submission
            // We'll create a hidden form and submit it
            const form = document.createElement("form")
            form.setAttribute("method", "POST")
            form.setAttribute("action", data.action)
            form.setAttribute("target", "_blank") // Open in new tab

            for (const key in data) {
                if (key !== 'action') {
                    const hiddenField = document.createElement("input")
                    hiddenField.setAttribute("type", "hidden")
                    hiddenField.setAttribute("name", key)
                    hiddenField.setAttribute("value", data[key])
                    form.appendChild(hiddenField)
                }
            }

            document.body.appendChild(form)
            form.submit()
            document.body.removeChild(form)

            onClose()
            toast.info("Redirecting to eSewa...")
        } catch (err: any) {
            console.error("eSewa Error", err)
            toast.error("Failed to initiate eSewa payment")
        } finally {
            setLoading(false)
        }
    }

    // Card Payment (Mock/Sprite)
    const handleCardPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setLoading(true)
            const initData = await paymentAPI.initiateSprite(amount, propertyId)
            const data = await paymentAPI.processSprite(initData.transactionId, cardDetails)

            if (data.status === 'success') {
                toast.success("Payment successful!")
                onSuccess()
                onClose()
            } else {
                toast.error("Payment failed: " + data.message)
            }
        } catch (err: any) {
            console.error("Card Payment Error", err)
            toast.error("Payment failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white text-[#0D2440]">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>
                        Pay <strong>Rs. {amount.toLocaleString()}</strong> {type === 'subscription' ? 'to upgrade to Premium' : `to secure ${propertyTitle}`}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="esewa" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                        <TabsTrigger value="esewa" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                            <Wallet className="mr-2 size-4" /> eSewa
                        </TabsTrigger>
                        <TabsTrigger value="card" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            <CreditCard className="mr-2 size-4" /> Card
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="esewa" className="space-y-4 py-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 mb-4">
                                You will be redirected to eSewa to complete your payment securely.
                            </p>
                            <div className="flex justify-between items-center bg-white p-3 rounded border border-green-100 mb-4">
                                <span className="text-gray-500">Total Amount</span>
                                <span className="font-bold text-green-700">Rs. {amount.toLocaleString()}</span>
                            </div>
                            <Button
                                className="w-full bg-[#41A124] hover:bg-[#327a1b] text-white"
                                onClick={handleEsewaPayment}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Pay with eSewa'}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="card" className="space-y-4 py-4">
                        <form onSubmit={handleCardPayment} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cardholder">Cardholder Name</Label>
                                <Input
                                    id="cardholder"
                                    placeholder="John Doe"
                                    value={cardDetails.cardholderName}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <Input
                                    id="cardNumber"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardDetails.cardNumber}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                                    required
                                    minLength={13}
                                    maxLength={19}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <Input
                                        id="expiry"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiryDate}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                        id="cvv"
                                        placeholder="123"
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                        required
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-[#2E5E99] hover:bg-[#1f426d] text-white" disabled={loading}>
                                {loading ? 'Processing...' : `Pay Rs. ${amount.toLocaleString()}`}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
