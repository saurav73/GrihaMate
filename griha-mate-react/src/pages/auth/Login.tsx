import { ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { authAPI } from "@/lib/api"
import { sendLoginNotification } from "@/lib/emailService"
import { generateSuccessMessage, generateErrorMessage } from "@/lib/humanLanguage"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/explore'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(email, password)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Send login notification email (non-blocking)
      sendLoginNotification(response.user.email, response.user.fullName, new Date())
        .catch(err => console.warn('Failed to send login notification:', err))

      // Generate human-like welcome message
      const welcomeMsg = await generateSuccessMessage('login', `user ${response.user.fullName.split(' ')[0]}`)
      toast.success(welcomeMsg, {
        position: "top-right",
        autoClose: 3000,
      })

      // Redirect based on user role
      if (response.user.role === 'ADMIN') {
        navigate('/admin')
      } else if (response.user.role === 'SEEKER') {
        navigate(redirect)
      } else if (response.user.role === 'LANDLORD') {
        navigate('/dashboard/landlord')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.'

      // Show specific error messages with human-like language
      if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Bad credentials')) {
        const msg = await generateErrorMessage('invalid credentials', 'login attempt')
        toast.error(msg, {
          position: "top-right",
          autoClose: 5000,
        })
      } else if (errorMessage.includes('verify your email')) {
        const msg = await generateErrorMessage('email not verified', 'check inbox for verification')
        toast.warning(msg, {
          position: "top-right",
          autoClose: 6000,
        })
      } else if (errorMessage.includes('verification is pending')) {
        const msg = await generateErrorMessage('account verification pending', 'admin approval needed')
        toast.info(msg, {
          position: "top-right",
          autoClose: 6000,
        })
      } else if (errorMessage.includes('deactivated')) {
        toast.error('Your account has been deactivated. Please contact support.', {
          position: "top-right",
          autoClose: 5000,
        })
      } else {
        // If it's a generic "Oops" from fallback, but we have a raw message, show the raw one
        const humanMsg = await generateErrorMessage(errorMessage, 'login attempt')
        if (humanMsg.includes('Oops') && errorMessage !== 'Login failed') {
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 6000,
          })
        } else {
          toast.error(humanMsg, {
            position: "top-right",
            autoClose: 5000,
          })
        }
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
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="seeker" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-primary-lightest p-1 rounded-xl">
                  <TabsTrigger
                    value="seeker"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-primary-dark font-medium"
                  >
                    Seeker
                  </TabsTrigger>
                  <TabsTrigger
                    value="landlord"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-primary-dark font-medium"
                  >
                    Landlord
                  </TabsTrigger>
                </TabsList>

                <form
                  className="space-y-4"
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 border-primary-lightest h-12 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-primary-dark hover:underline font-medium">
                        Forgot password?
                      </Link>
                    </div>
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
                    className="w-full bg-primary hover:bg-primary-dark text-white h-12 rounded-xl text-base font-bold mt-4 shadow-md hover:shadow-lg transition-all"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 size-4" />
                  </Button>
                </form>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-[#F2EDE4] text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="text-primary-dark font-bold hover:underline">
                    Create one for free
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
