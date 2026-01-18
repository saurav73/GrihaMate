import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Bell, User, Menu, Home, Compass, PlusCircle, LogOut, Settings, LayoutDashboard, Heart, Info, HelpCircle, Star, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { generateSuccessMessage } from "@/lib/humanLanguage"
import { toast } from "react-toastify"

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (e) {
        setIsLoggedIn(false)
      }
    } else {
      setIsLoggedIn(false)
    }
  }, [location.pathname])

  const handleLogout = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
    const msg = await generateSuccessMessage("logout", `goodbye ${user?.fullName?.split(' ')[0] || 'friend'}`)
    toast.success(msg, {
      position: "top-right",
      autoClose: 2000,
    })
    navigate('/')
  }

  const navItems = isLoggedIn && user?.role === 'SEEKER' ? [
    { label: "Explore", href: "/explore", icon: Compass, requireAuth: false },
    { label: "My Requests", href: "/dashboard/seeker/my-requests", icon: LayoutDashboard, requireAuth: true },
    { label: "Search Alerts", href: "/room-request", icon: Bell, requireAuth: true },
    { label: "Feedback", href: "/dashboard/seeker/feedback", icon: MessageSquare, requireAuth: true },
    { label: "How It Works", href: "/how-it-works", icon: HelpCircle, requireAuth: false },
  ] : [
    { label: "Home", href: "/", icon: Home, requireAuth: false },
    { label: "About", href: "/about", icon: Info, requireAuth: false },
    { label: "Explore", href: "/explore", icon: Compass, requireAuth: false },
    { label: "How It Works", href: "/how-it-works", icon: HelpCircle, requireAuth: false },
    { label: "List Property", href: "/list-property", icon: PlusCircle, requireAuth: true, requireRole: "LANDLORD" },
  ]

  const userInitials = user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'GR'

  return (
    <nav className="sticky top-0 z-[9999] w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-105 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white group-hover:bg-primary-dark group-hover:scale-110 transition-all duration-300">
            <Home className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary-dark group-hover:text-primary transition-colors duration-300">GrihaMate</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex md:items-center md:gap-6 flex-1 justify-center">
          {navItems.map((item) => {
            if (item.requireAuth && !isLoggedIn) return null
            if (item.requireRole && user?.role !== item.requireRole) return null
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.href ? "text-primary font-bold" : "text-gray-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {isLoggedIn ? (
            <>
              <div className="h-6 w-px bg-border mx-2" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-3 px-2 py-1.5 h-auto rounded-full hover:bg-primary-lightest/50 transition-all border border-transparent hover:border-primary-light/30">
                    <div className="flex flex-col items-end hidden lg:flex">
                      <p className="text-sm font-bold text-primary-dark leading-none">{user?.fullName}</p>
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user?.role?.toLowerCase()}</p>
                    </div>
                    <Avatar className="h-10 w-10 ring-2 ring-primary/10 ring-offset-2 ring-offset-white">
                      <AvatarImage src={user?.profileImageUrl} alt={user?.fullName} />
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal bg-primary-lightest">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-primary-dark">{user?.fullName}</p>
                      <p className="text-xs leading-none text-gray-600">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={user?.role === 'SEEKER' ? '/dashboard/seeker' : '/dashboard/landlord'} className="flex items-center cursor-pointer hover:bg-primary-dark group transition-colors">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-primary group-hover:text-white transition-colors" />
                      <span className="text-gray-900 group-hover:text-white transition-colors">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'SEEKER' && (
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="flex items-center cursor-pointer hover:bg-primary-dark group transition-colors">
                        <Heart className="mr-2 h-4 w-4 text-red-500 group-hover:text-white transition-colors" />
                        <span className="text-gray-900 group-hover:text-white transition-colors">Favorites</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer hover:bg-primary-dark group transition-colors">
                      <Settings className="mr-2 h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                      <span className="text-gray-900 group-hover:text-white transition-colors">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer hover:bg-red-600 group transition-colors">
                    <LogOut className="mr-2 h-4 w-4 text-red-600 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className="h-6 w-px bg-border mx-2" />
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-primary-lightest hover:text-primary md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t bg-white p-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => {
              if (item.requireAuth && !isLoggedIn) return null
              if (item.requireRole && user?.role !== item.requireRole) return null
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium transition-colors",
                    location.pathname === item.href ? "text-primary font-bold" : "text-gray-700 hover:text-primary"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
            <hr />
            {isLoggedIn ? (
              <>
                <Link to={user?.role === 'SEEKER' ? '/dashboard/seeker' : '/dashboard/landlord'} className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-lg">
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-lg">
                    <Settings className="h-5 w-5" />
                    Settings
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start gap-2 text-lg text-red-600" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2 text-lg border-primary text-primary hover:bg-primary hover:text-white">
                    <User className="h-5 w-5" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full text-lg bg-primary hover:bg-primary-dark text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}


