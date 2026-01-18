import { ArrowRight, Mail, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { authAPI } from "@/lib/api"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      setEmailSent(true)
      toast.success("Password reset link has been sent to your email!", {
        position: "top-right",
        autoClose: 5000,
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-primary-lightest flex flex-col">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <Card className="w-full border-primary-lightest shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="space-y-1 pb-8 text-center">
                <div className="mx-auto mb-4 size-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="size-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>

                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full border-primary-lightest h-12 rounded-xl"
                  >
                    <ArrowLeft className="mr-2 size-4" /> Try Another Email
                  </Button>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="w-full text-primary-dark hover:text-primary-dark h-12 rounded-xl"
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <Card className="w-full border-primary-lightest shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="space-y-1 pb-8 text-center">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <CardContent>
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

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white h-12 rounded-xl text-base font-bold mt-4 shadow-md hover:shadow-lg transition-all"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight className="ml-2 size-4" />
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#F2EDE4] text-center">
                <Link to="/login" className="text-sm text-primary-dark font-medium hover:underline flex items-center justify-center gap-2">
                  <ArrowLeft className="size-4" />
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

