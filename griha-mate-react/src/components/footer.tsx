import { Link } from "react-router-dom"
import { Home, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t-4 border-primary bg-white mt-16 pt-16 pb-8 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-primary-dark">GrihaMate</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Nepal's most trusted platform for finding rooms, flats, and roommates. We make renting safer and easier.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-primary hover:scale-125 transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary hover:scale-125 transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary hover:scale-125 transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-bold text-primary-dark text-base">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/explore" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  Find a Room
                </Link>
              </li>
              <li>
                <Link to="/list-property" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/trust-safety" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  Trust & Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-bold text-primary-dark text-base">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/help" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-700 hover:text-primary hover:translate-x-1 transition-all duration-300 font-medium inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="mb-4 font-bold text-primary-dark text-base">Get in Touch</h4>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Kathmandu, Nepal</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span>+977 1 4XXXXXX</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <span>hello@grihamate.com</span>
            </div>
          </div>
        </div>


        <div className="mt-16 border-t-2 border-gray-200 pt-8 text-center text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <p>© {new Date().getFullYear()} GrihaMate. All rights reserved. Designed for Nepal.</p>
            <Link to="/admin/login" className="text-xs text-gray-500 hover:text-primary hover:font-semibold transition-all duration-300">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}


