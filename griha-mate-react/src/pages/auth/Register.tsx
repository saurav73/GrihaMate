import {
  Building2,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  MapPin,
  IdCard,
  Home,
  X,
  Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { authAPI, imageAPI } from "@/lib/api"
import type { RegisterRequest } from "@/lib/api"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getCurrentLocationDetails } from "@/lib/location"

type UserType = "seeker" | "landlord" | null

interface FormData {
  userType: UserType
  name: string
  email: string
  emailVerified: boolean
  emailOtp: string
  phone: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
  // Profile image
  profileImage?: File | null
  profileImageUrl?: string
  // Seeker specific
  citizenshipNumber?: string
  citizenshipFront?: File | null
  citizenshipBack?: File | null
  citizenshipFrontUrl?: string
  citizenshipBackUrl?: string
  // Landlord specific
  kycDocument?: File | null
  propertyDocument?: File | null
  propertyAddress?: string
  kycDocumentUrl?: string
  propertyDocumentUrl?: string
}

// Dynamic steps based on user type
const getSteps = (userType: UserType) => {
  const baseSteps = [
    { id: 1, title: "Account Type", icon: User },
    { id: 2, title: "Your Name", icon: User },
    { id: 3, title: "Profile Photo", icon: User },
    { id: 4, title: "Email", icon: Mail },
    { id: 5, title: "Verify Email", icon: CheckCircle2 },
    { id: 6, title: "Phone", icon: Phone },
    { id: 7, title: "Password", icon: Lock },
  ]

  if (!userType) {
    // Return base steps when no user type is selected yet
    return baseSteps
  }

  if (userType === "seeker") {
    return [
      ...baseSteps,
      { id: 8, title: "Citizenship Verification", icon: IdCard },
      { id: 9, title: "Terms", icon: CheckCircle2 },
    ]
  } else {
    return [
      ...baseSteps,
      { id: 8, title: "KYC Verification", icon: ShieldCheck },
      { id: 9, title: "Property Verification", icon: Home },
      { id: 10, title: "Terms", icon: CheckCircle2 },
    ]
  }
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    userType: null,
    name: "",
    email: "",
    emailVerified: false,
    emailOtp: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    profileImage: null,
    citizenshipNumber: "",
    citizenshipFront: null,
    citizenshipBack: null,
    kycDocument: null,
    propertyDocument: null,
    propertyAddress: "",
  })
  const [locationLoading, setLocationLoading] = useState(false)

  const steps = getSteps(formData.userType)
  const totalSteps = steps.length

  const handleNext = () => {
    // Validation before moving to next step
    if (currentStep === 1) {
      if (!formData.userType) {
        return
      }
      // UserType selected, proceed to next step
      setCurrentStep(2)
      return
    }
    if (currentStep === 2 && !formData.name.trim()) {
      toast.error("Please enter your full name", { position: "top-right", autoClose: 3000 })
      return
    }
    if (currentStep === 3 && !formData.profileImage) {
      toast.warning("Please upload your profile photo", { position: "top-right", autoClose: 3000 })
      return
    }
    if (currentStep === 4 && !formData.email.trim()) {
      toast.error("Please enter your email address", { position: "top-right", autoClose: 3000 })
      return
    }
    if (currentStep === 4 && formData.email.trim()) {
      // Send OTP when moving to verification step
      handleSendOtp()
      setCurrentStep(5)
      return
    }
    if (currentStep === 5 && !formData.emailVerified) {
      toast.error("Please verify your email before proceeding", { position: "top-right", autoClose: 3000 })
      return
    }
    if (currentStep === 6 && !formData.phone.trim()) {
      toast.error("Please enter your phone number", { position: "top-right", autoClose: 3000 })
      return
    }
    if (currentStep === 7 && (formData.password.length < 8 || formData.password !== formData.confirmPassword)) {
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long", { position: "top-right", autoClose: 3000 })
      } else {
        toast.error("Passwords do not match", { position: "top-right", autoClose: 3000 })
      }
      return
    }
    if (formData.userType === "seeker" && currentStep === 8) {
      if (!formData.citizenshipNumber || !formData.citizenshipFront || !formData.citizenshipBack) {
        toast.error("Please provide all citizenship documents", { position: "top-right", autoClose: 3000 })
        return
      }
    }
    if (formData.userType === "landlord" && currentStep === 8) {
      if (!formData.kycDocument) {
        toast.error("Please upload your KYC document", { position: "top-right", autoClose: 3000 })
        return
      }
    }
    if (formData.userType === "landlord" && currentStep === 9) {
      if (!formData.propertyDocument || !formData.propertyAddress) {
        toast.error("Please provide property address and document", { position: "top-right", autoClose: 3000 })
        return
      }
    }
    if ((formData.userType === "seeker" && currentStep === 9) || (formData.userType === "landlord" && currentStep === 10)) {
      if (!formData.agreeToTerms) {
        toast.warning("Please agree to the terms and conditions", { position: "top-right", autoClose: 3000 })
        return
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (field: keyof FormData, file: File | null) => {
    setFormData({ ...formData, [field]: file })
  }

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email address first", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setLoading(true)
    try {
      await authAPI.sendOtp(formData.email, formData.name || "User")
      toast.success("Verification code sent to your email!", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (formData.emailOtp.length !== 6) {
      toast.error("Please enter the 6-digit verification code", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setLoading(true)
    try {
      const result = await authAPI.verifyOtp(formData.email, formData.emailOtp)
      if (result.verified) {
        setFormData({ ...formData, emailVerified: true })
        toast.success("Email verified successfully!", {
          position: "top-right",
          autoClose: 2000,
        })
        // Auto-advance to next step after verification
        setTimeout(() => {
          setCurrentStep(6)
        }, 1000)
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code", {
        position: "top-right",
        autoClose: 5000,
      })
      setFormData({ ...formData, emailOtp: "" })
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = async () => {
    setLocationLoading(true)
    try {
      const locationData = await getCurrentLocationDetails()
      setFormData({
        ...formData,
        propertyAddress: locationData.address
      })
      toast.success("Location address auto-filled!")
    } catch (err: any) {
      toast.error(err.message || "Failed to get location")
    } finally {
      setLocationLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Final validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match! Please try again.", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }
    if (!formData.agreeToTerms) {
      toast.warning("Please agree to the terms and conditions to continue.", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setLoading(true)

    try {
      // Upload profile image first
      let profileImageUrl = formData.profileImageUrl
      if (formData.profileImage) {
        try {
          // Check file size (max 5MB)
          if (formData.profileImage.size > 5 * 1024 * 1024) {
            toast.error("Profile photo is too large. Maximum size is 5MB.", {
              position: "top-right",
              autoClose: 5000,
            })
            setLoading(false)
            return
          }

          // Check file type
          if (!formData.profileImage.type.startsWith('image/')) {
            toast.error("Please upload a valid image file.", {
              position: "top-right",
              autoClose: 5000,
            })
            setLoading(false)
            return
          }

          const result = await imageAPI.uploadImage(formData.profileImage)
          profileImageUrl = result.url
          toast.success("Profile photo uploaded successfully", {
            position: "top-right",
            autoClose: 2000,
          })
        } catch (err: any) {
          const errorMessage = err.message || "Failed to upload profile photo"
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
          })
          setLoading(false)
          return // Don't throw, just return to allow user to retry
        }
      }

      // Upload documents if needed
      let citizenshipFrontUrl = formData.citizenshipFrontUrl
      let citizenshipBackUrl = formData.citizenshipBackUrl
      let kycDocumentUrl = formData.kycDocumentUrl
      let propertyDocumentUrl = formData.propertyDocumentUrl

      if (formData.userType === "seeker") {
        if (formData.citizenshipFront) {
          try {
            const result = await imageAPI.uploadCitizenship(formData.citizenshipFront, "front")
            citizenshipFrontUrl = result.url
            toast.success("Citizenship front document uploaded successfully", {
              position: "top-right",
              autoClose: 3000,
            })
          } catch (err: any) {
            toast.error("Failed to upload citizenship front document: " + err.message, {
              position: "top-right",
              autoClose: 5000,
            })
            throw err
          }
        }
        if (formData.citizenshipBack) {
          try {
            const result = await imageAPI.uploadCitizenship(formData.citizenshipBack, "back")
            citizenshipBackUrl = result.url
            toast.success("Citizenship back document uploaded successfully", {
              position: "top-right",
              autoClose: 3000,
            })
          } catch (err: any) {
            toast.error("Failed to upload citizenship back document: " + err.message, {
              position: "top-right",
              autoClose: 5000,
            })
            throw err
          }
        }
      }

      if (formData.userType === "landlord") {
        if (formData.kycDocument) {
          try {
            const result = await imageAPI.uploadKyc(formData.kycDocument)
            kycDocumentUrl = result.url
            toast.success("KYC document uploaded successfully", {
              position: "top-right",
              autoClose: 3000,
            })
          } catch (err: any) {
            toast.error("Failed to upload KYC document: " + err.message, {
              position: "top-right",
              autoClose: 5000,
            })
            throw err
          }
        }
        if (formData.propertyDocument) {
          try {
            const result = await imageAPI.uploadDocument(formData.propertyDocument)
            propertyDocumentUrl = result.url
            toast.success("Property document uploaded successfully", {
              position: "top-right",
              autoClose: 3000,
            })
          } catch (err: any) {
            toast.error("Failed to upload property document: " + err.message, {
              position: "top-right",
              autoClose: 5000,
            })
            throw err
          }
        }
      }

      // Prepare registration data
      const registerData: RegisterRequest = {
        userType: formData.userType!.toUpperCase() as 'SEEKER' | 'LANDLORD',
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        profileImageUrl,
        citizenshipNumber: formData.citizenshipNumber,
        citizenshipFrontUrl,
        citizenshipBackUrl,
        kycDocumentType: formData.userType === "landlord" ? "CITIZENSHIP" : undefined,
        kycDocumentUrl,
        propertyAddress: formData.propertyAddress,
        propertyDocumentUrl,
      }

      // Register user
      await authAPI.register(registerData)

      // Show success message
      toast.success("Registration successful!", {
        position: "top-right",
        autoClose: 6000,
      })

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed. Please try again."

      // Show specific error messages
      if (errorMessage.includes("Email already exists")) {
        toast.error("This email is already registered. Please use a different email or try logging in.", {
          position: "top-right",
          autoClose: 6000,
        })
      } else if (errorMessage.includes("Citizenship number already registered")) {
        toast.error("This citizenship number is already registered. Please contact support if this is an error.", {
          position: "top-right",
          autoClose: 6000,
        })
      } else if (errorMessage.includes("Failed to send")) {
        toast.warning("Registration successful, but we couldn't send the verification email. Please try logging in or contact support.", {
          position: "top-right",
          autoClose: 6000,
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">What brings you to GrihaMate?</h2>
              <p className="text-muted-foreground">Choose your account type to get started</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, userType: "seeker" })
                }}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${formData.userType === "seeker"
                  ? "border-primary bg-primary-lightest shadow-lg scale-105"
                  : "border-primary-light bg-white hover:border-primary hover:shadow-md hover:bg-primary-lightest/50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${formData.userType === "seeker" ? "bg-primary text-white" : "bg-primary-lightest border-2 border-primary-light"
                    }`}>
                    <User className={`size-6 ${formData.userType === "seeker" ? "text-white" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 transition-colors ${formData.userType === "seeker" ? "text-primary-dark" : "text-primary-dark"
                      }`}>I'm Looking for a Room</h3>
                    <p className="text-sm text-muted-foreground">Find verified rooms and roommates</p>
                  </div>
                  {formData.userType === "seeker" && <CheckCircle2 className="size-6 text-primary" />}
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, userType: "landlord" })
                }}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${formData.userType === "landlord"
                  ? "border-primary bg-primary-lightest shadow-lg scale-105"
                  : "border-primary-light bg-white hover:border-primary hover:shadow-md hover:bg-primary-lightest/50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${formData.userType === "landlord" ? "bg-primary text-white" : "bg-primary-lightest border-2 border-primary-light"
                    }`}>
                    <Building2 className={`size-6 ${formData.userType === "landlord" ? "text-white" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 transition-colors ${formData.userType === "landlord" ? "text-primary-dark" : "text-primary-dark"
                      }`}>I'm a Landlord</h3>
                    <p className="text-sm text-muted-foreground">List your property and find tenants</p>
                  </div>
                  {formData.userType === "landlord" && <CheckCircle2 className="size-6 text-primary" />}
                </div>
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">What's your name?</h2>
              <p className="text-muted-foreground">We'll use this to personalize your experience</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && formData.name.trim()) {
                      handleNext()
                    }
                  }}
                  className="pl-12 border-primary-lightest h-14 rounded-xl text-base"
                  required
                  autoFocus
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Add Your Profile Photo</h2>
              <p className="text-muted-foreground">Upload a clear photo of yourself</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              {formData.profileImage ? (
                <div className="relative mb-4">
                  <img
                    src={URL.createObjectURL(formData.profileImage)}
                    alt="Profile preview"
                    className="size-32 rounded-full object-cover border-4 border-[#2D3142]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileUpload("profileImage", null)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full size-8 p-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="size-32 rounded-full bg-primary-lightest flex items-center justify-center mb-4 border-4 border-dashed border-primary-lightest">
                  <User className="size-16 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-2 w-full">
                <Label htmlFor="profileImage" className="text-base">Profile Photo</Label>
                <div className="border-2 border-dashed border-primary-lightest rounded-xl p-6 text-center hover:border-[#2D3142] transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("profileImage", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="profileImage" className="cursor-pointer">
                    <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Click to upload profile photo</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Max 5MB)</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">What's your email?</h2>
              <p className="text-muted-foreground">We'll use this to send you important updates</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && formData.email.trim()) {
                      handleNext()
                    }
                  }}
                  className="pl-12 border-primary-lightest h-14 rounded-xl text-base"
                  required
                  autoFocus
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a 6-digit code to <strong>{formData.email}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-base">
                  Verification Code
                </Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.emailOtp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setFormData({ ...formData, emailOtp: value })
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && formData.emailOtp.length === 6) {
                        handleVerifyOtp()
                      }
                    }}
                    className="pl-12 border-primary-lightest h-14 rounded-xl text-base text-center text-2xl tracking-widest"
                    required
                    autoFocus
                    maxLength={6}
                  />
                </div>
              </div>
              {formData.emailVerified ? (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="size-4" />
                  <span>Email verified successfully!</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Resend Code
                  </Button>
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={formData.emailOtp.length !== 6 || loading || formData.emailVerified}
                    className="bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">What's your phone number?</h2>
              <p className="text-muted-foreground">For verification and important notifications</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && formData.phone.trim()) {
                      handleNext()
                    }
                  }}
                  className="pl-12 border-primary-lightest h-14 rounded-xl text-base"
                  required
                  autoFocus
                />
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Create a secure password</h2>
              <p className="text-muted-foreground">At least 8 characters for security</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 border-primary-lightest h-14 rounded-xl text-base"
                    required
                    minLength={8}
                    autoFocus
                  />
                </div>
                {formData.password.length > 0 && formData.password.length < 8 && (
                  <p className="text-sm text-red-600">Password must be at least 8 characters</p>
                )}
                {formData.password.length >= 8 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="size-4" />
                    <span>Password is strong</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && formData.password === formData.confirmPassword && formData.confirmPassword) {
                        handleNext()
                      }
                    }}
                    className="pl-12 border-primary-lightest h-14 rounded-xl text-base"
                    required
                  />
                </div>
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="size-4" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 8:
        if (formData.userType === "seeker") {
          // Citizenship Verification for Seekers
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <IdCard className="size-12 text-primary-dark mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Citizenship Verification</h2>
                <p className="text-muted-foreground">Upload your Nepal Citizenship document for verification</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="citizenshipNumber" className="text-base">
                    Citizenship Number
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <Input
                      id="citizenshipNumber"
                      placeholder="Enter your citizenship number"
                      value={formData.citizenshipNumber || ""}
                      onChange={(e) => setFormData({ ...formData, citizenshipNumber: e.target.value })}
                      className="pl-12 border-primary-lightest h-14 rounded-xl text-base"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Citizenship Front Side</Label>
                  <div className="border-2 border-dashed border-primary-lightest rounded-xl p-6 text-center hover:border-[#2D3142] transition-colors">
                    <input
                      type="file"
                      id="citizenshipFront"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("citizenshipFront", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="citizenshipFront" className="cursor-pointer">
                      {formData.citizenshipFront ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="size-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-semibold">{formData.citizenshipFront.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(formData.citizenshipFront.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFileUpload("citizenshipFront", null)
                            }}
                            className="rounded-full"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="size-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to upload front side</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Citizenship Back Side</Label>
                  <div className="border-2 border-dashed border-primary-lightest rounded-xl p-6 text-center hover:border-[#2D3142] transition-colors">
                    <input
                      type="file"
                      id="citizenshipBack"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("citizenshipBack", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="citizenshipBack" className="cursor-pointer">
                      {formData.citizenshipBack ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="size-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-semibold">{formData.citizenshipBack.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(formData.citizenshipBack.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFileUpload("citizenshipBack", null)
                            }}
                            className="rounded-full"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="size-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to upload back side</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-primary-lightest border border-primary-lightest rounded-xl p-4">
                  <p className="text-sm text-primary">
                    <ShieldCheck className="size-4 inline mr-2" />
                    Your documents are encrypted and securely stored. Verification typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          )
        } else {
          // KYC Verification for Landlords
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <ShieldCheck className="size-12 text-primary-dark mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">KYC Verification</h2>
                <p className="text-muted-foreground">Upload your KYC documents for identity verification</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-base">KYC Document</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your citizenship, passport, or business registration document
                  </p>
                  <div className="border-2 border-dashed border-primary-lightest rounded-xl p-6 text-center hover:border-[#2D3142] transition-colors">
                    <input
                      type="file"
                      id="kycDocument"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("kycDocument", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="kycDocument" className="cursor-pointer">
                      {formData.kycDocument ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="size-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-semibold">{formData.kycDocument.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(formData.kycDocument.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFileUpload("kycDocument", null)
                            }}
                            className="rounded-full"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="size-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to upload KYC document</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-primary-lightest border border-primary-lightest rounded-xl p-4">
                  <p className="text-sm text-primary">
                    <ShieldCheck className="size-4 inline mr-2" />
                    Accepted documents: Citizenship, Passport, Business Registration, or Company PAN Certificate
                  </p>
                </div>
              </div>
            </div>
          )
        }

      case 9:
        if (formData.userType === "landlord") {
          // Property Verification for Landlords
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <Home className="size-12 text-primary-dark mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Property Verification</h2>
                <p className="text-muted-foreground">Verify your property ownership with documents</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress" className="text-base">
                    Property Address
                  </Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground transition-all group-focus-within:text-primary group-focus-within:scale-110" />
                    <Input
                      id="propertyAddress"
                      placeholder="Enter full property address"
                      value={formData.propertyAddress || ""}
                      onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                      className="pl-12 pr-40 border-primary-lightest h-14 rounded-2xl text-base shadow-sm focus:shadow-md focus:ring-primary/20 transition-all"
                      required
                      autoFocus
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locationLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all duration-300 font-semibold text-sm disabled:opacity-50 group/btn shadow-sm hover:shadow-md"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>Locating...</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="size-4 group-hover/btn:animate-bounce" />
                            <span>Locate Me</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Property Ownership Document</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload property registration, land ownership certificate, or house ownership document
                  </p>
                  <div className="border-2 border-dashed border-primary-lightest rounded-xl p-6 text-center hover:border-[#2D3142] transition-colors">
                    <input
                      type="file"
                      id="propertyDocument"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("propertyDocument", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="propertyDocument" className="cursor-pointer">
                      {formData.propertyDocument ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="size-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-semibold">{formData.propertyDocument.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(formData.propertyDocument.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFileUpload("propertyDocument", null)
                            }}
                            className="rounded-full"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="size-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to upload property document</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-primary-lightest border border-primary-lightest rounded-xl p-4">
                  <p className="text-sm text-primary">
                    <ShieldCheck className="size-4 inline mr-2" />
                    Your property will be verified by our team. This process typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          )
        }
        // Terms step for seekers falls through to here
        return renderTermsStep()

      case 10:
        // Terms step for landlords (step 10)
        return renderTermsStep()

      default:
        return null
    }
  }

  const renderTermsStep = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
          <p className="text-muted-foreground">Review your information and accept our terms</p>
        </div>

        {/* Review Summary */}
        <div className="bg-white rounded-2xl p-6 space-y-4 mb-6">
          <h3 className="font-bold mb-4">Review Your Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type:</span>
              <span className="font-semibold capitalize">{formData.userType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-semibold">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-semibold">{formData.phone}</span>
            </div>
            {formData.userType === "seeker" && formData.citizenshipNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Citizenship:</span>
                <span className="font-semibold">{formData.citizenshipNumber}</span>
              </div>
            )}
            {formData.userType === "landlord" && formData.propertyAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-semibold text-right max-w-[60%] truncate">{formData.propertyAddress}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-primary-lightest">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer flex-1">
            I agree to the{" "}
            <Link to="/terms" target="_blank" className="text-primary-dark font-bold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" className="text-primary-dark font-bold hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
      </div>
    )
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.userType
      case 2:
        return formData.name.trim().length > 0
      case 3:
        return !!formData.profileImage
      case 4:
        return formData.email.trim().length > 0
      case 5:
        return formData.emailVerified
      case 6:
        return formData.phone.trim().length > 0
      case 7:
        return formData.password.length >= 8 && formData.password === formData.confirmPassword
      case 8:
        if (formData.userType === "seeker") {
          return !!formData.citizenshipNumber && !!formData.citizenshipFront && !!formData.citizenshipBack
        } else {
          return !!formData.kycDocument
        }
      case 9:
        if (formData.userType === "landlord") {
          return !!formData.propertyDocument && !!formData.propertyAddress
        } else {
          return formData.agreeToTerms
        }
      case 10:
        return formData.agreeToTerms
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Progress Bar - Above Card */}
          <div className="w-full bg-white rounded-2xl p-4 shadow-md border border-primary-lightest">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-primary-dark">
                {formData.userType ? `Step ${currentStep} of ${totalSteps}` : "Step 1 of 10"}
              </span>
              <span className="text-sm font-semibold text-primary">
                {formData.userType ? `${Math.round((currentStep / totalSteps) * 100)}%` : "10%"}
              </span>
            </div>
            <div className="w-full h-3 bg-primary-lightest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{
                  width: formData.userType
                    ? `${(currentStep / totalSteps) * 100}%`
                    : "10%" // Show minimal progress when no selection
                }}
              />
            </div>
          </div>

          <Card className="w-full border-primary-lightest shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="space-y-1 pb-6 text-center pt-6">
              <CardTitle className="text-xl md:text-2xl font-bold">Create your account</CardTitle>
              <CardDescription className="text-sm md:text-base">
                {steps[currentStep - 1]?.title || "Join thousands of verified users"}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[#F2EDE4]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid() || loading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : currentStep === totalSteps ? (
                    <>
                      <Sparkles className="size-4" />
                      Create Account
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-green-600" />
              <span>Secure 256-bit SSL encrypted connection</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-dark font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
