import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { paymentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, Home } from "lucide-react"
import { toast } from "react-toastify"

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [verifying, setVerifying] = useState(true)
    const [status, setStatus] = useState<'success' | 'error'>('success')

    useEffect(() => {
        const verify = async () => {
            const data = searchParams.get('data')
            const signature = searchParams.get('signature')

            if (!data) {
                setStatus('error')
                setVerifying(false)
                return
            }

            try {
                // eSewa typically only sends 'data' parameter (base64 encoded JSON)
                // If status is COMPLETE in the data, we should verify it
                let paymentStatus = 'COMPLETE'
                try {
                    const decodedData = JSON.parse(atob(data))
                    paymentStatus = decodedData.status || decodedData.transaction_code || 'COMPLETE'
                } catch (e) {
                    // If parsing fails, still try to verify with backend
                    console.log("Could not decode data, attempting backend verification")
                }

                // Verify with backend - pass empty signature if not provided
                await paymentAPI.verifyEsewa(data, signature || '')
                toast.success("Payment confirmed successfully!")
                setStatus('success')
            } catch (err: any) {
                console.error("Verification failed", err)
                toast.error(err.message || "Payment verification failed")
                setStatus('error')
            } finally {
                setVerifying(false)
            }
        }

        verify()
    }, [searchParams])

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D2440] mb-4"></div>
                <p className="text-gray-500 font-medium">Verifying your payment...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-blue-50 animate-in zoom-in-95 duration-500">
                <div className={`h-2 ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <div className="p-10 text-center">
                    {status === 'success' ? (
                        <>
                            <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-green-50 mb-6 scale-in duration-700">
                                <CheckCircle2 className="size-10 text-green-500" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-[#0D2440] mb-3">Payment Confirmed!</h1>
                            <p className="text-gray-500 mb-10 leading-relaxed">
                                Your payment has been successfully verified. Your booking is now secure, or your account has been upgraded.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-red-50 mb-6">
                                <span className="text-4xl">❌</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-[#0D2440] mb-3">Verification Failed</h1>
                            <p className="text-gray-500 mb-10 leading-relaxed">
                                We couldn't verify your payment with eSewa. If amount was deducted, please contact support.
                            </p>
                        </>
                    )}

                    <div className="space-y-4">
                        <Button
                            onClick={() => navigate('/dashboard/seeker')}
                            className="w-full bg-[#0D2440] hover:bg-[#1c3860] text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all"
                        >
                            <Home className="size-5" />
                            Go to My Dashboard
                            <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/explore')}
                            className="w-full h-12 rounded-2xl border-[#A9CBF0] text-gray-600 font-semibold"
                        >
                            Browse More Properties
                        </Button>
                    </div>
                </div>

                <div className="bg-[#F8FAFC] py-4 px-6 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        GrihaMate Secure Payment Protection
                    </p>
                </div>
            </div>
        </div>
    )
}
