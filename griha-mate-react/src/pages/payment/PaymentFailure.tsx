import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { XCircle, ChevronRight, Home, RefreshCw } from "lucide-react"

export default function PaymentFailurePage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-red-100 overflow-hidden border border-red-50 animate-in zoom-in-95 duration-500">
                <div className="h-2 bg-red-500"></div>

                <div className="p-10 text-center">
                    <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-red-50 mb-6 scale-in duration-700">
                        <XCircle className="size-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#0D2440] mb-3">Payment Failed</h1>
                    <p className="text-gray-500 mb-10 leading-relaxed">
                        We couldn't process your payment. This could be due to a technical error or insufficient funds. Don't worry, no money was deducted if you see this message.
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={() => window.history.back()}
                            className="w-full bg-[#0D2440] hover:bg-[#1c3860] text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all"
                        >
                            <RefreshCw className="size-5 group-hover:rotate-180 transition-all duration-500" />
                            Try Again
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/dashboard/seeker')}
                            className="w-full h-12 rounded-2xl border-[#A9CBF0] text-gray-600 font-semibold flex items-center justify-center gap-2"
                        >
                            <Home className="size-4" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>

                <div className="bg-[#F8FAFC] py-4 px-6 border-t border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <span className="size-2 rounded-full bg-red-400"></span>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            Transaction Cancelled or Failed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
