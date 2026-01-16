import { ArrowRight, ShieldCheck, Mail, Lock, Shield } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { authAPI } from "@/lib/api"
import { sendLoginNotification } from "@/lib/emailService"
import { generateSuccessMessage, generateErrorMessage } from "@/lib/humanLanguage"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await authAPI.login(email, password)

            // Check if user is actually an admin
            if (response.user.role !== 'ADMIN') {
                toast.error('Access denied. Admin credentials required.', {
                    position: "top-right",
                    autoClose: 5000,
                })
                setLoading(false)
                return
            }

            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))

            // Send login notification email (non-blocking)
            sendLoginNotification(response.user.email, response.user.fullName, new Date())
                .catch(err => console.warn('Failed to send login notification:', err))

            // Generate welcome message
            const welcomeMsg = await generateSuccessMessage('login', `Admin ${response.user.fullName.split(' ')[0]}`)
            toast.success(welcomeMsg, {
                position: "top-right",
                autoClose: 3000,
            })

            navigate('/admin')
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please check your credentials.'

            if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Bad credentials')) {
                const msg = await generateErrorMessage('invalid credentials', 'admin login attempt')
                toast.error(msg, {
                    position: "top-right",
                    autoClose: 5000,
                })
            } else {
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 5000,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-primary-lightest flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md space-y-6">
                    <Card className="w-full border-primary-lightest shadow-2xl rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="space-y-1 pb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-primary rounded-full">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                            <CardDescription>Secure access for administrators only</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@grihamate.com"
                                            className="pl-10 border-primary-lightest h-12 rounded-xl"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-10 border-primary-lightest h-12 rounded-xl"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-dark text-white h-12 rounded-xl text-base font-bold mt-4 shadow-md hover:shadow-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In as Admin'} <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-[#F2EDE4]">
                                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="size-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Test Account Helper</span>
                                    </div>
                                    <p className="text-[11px] text-blue-600/80 mb-3 leading-relaxed">
                                        For testing, use the admin credentials below to access the management portal.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEmail("admin@grihamate.com")
                                            setPassword("admin123")
                                        }}
                                        className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50 h-9 text-xs font-bold rounded-xl"
                                    >
                                        Autofill Credentials
                                    </Button>
                                </div>

                                <p className="text-sm text-muted-foreground mt-6 text-center">
                                    Not an admin?{" "}
                                    <Link to="/login" className="text-primary-dark font-bold hover:underline">
                                        Regular Login
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShieldCheck className="size-4 text-green-600" />
                            <span>Secure 256-bit SSL encrypted connection</span>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
