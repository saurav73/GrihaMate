import { Link } from "react-router-dom"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-9xl font-bold text-primary-dark mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
                <Home className="size-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline" className="gap-2">
                <Search className="size-4" />
                Explore Properties
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


