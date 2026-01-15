import * as React from "react"
import { Maximize2, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Property360ViewerProps {
  imageUrl: string
  title: string
}

export function Property360Viewer({ imageUrl, title }: Property360ViewerProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  return (
    <div className="relative group aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-primary-lightest">
      {/* Simulated 360 Viewer Canvas/Image */}
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={title}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isLoaded && (
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-white text-sm font-medium">Loading 360° Experience...</span>
          </div>
        )}
        {isLoaded && (
          <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Move className="size-12 text-white/80 animate-bounce" />
            <span className="text-white text-xs font-medium uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Click & Drag to Look Around
            </span>
          </div>
        )}
      </div>

      {/* Viewer Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
          <Button size="icon" variant="ghost" className="size-8 text-white hover:bg-white/20 rounded-lg">
            <ZoomIn className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="size-8 text-white hover:bg-white/20 rounded-lg">
            <ZoomOut className="size-4" />
          </Button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <Button size="icon" variant="ghost" className="size-8 text-white hover:bg-white/20 rounded-lg">
            <RotateCcw className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="size-8 text-white hover:bg-white/20 rounded-lg">
            <Maximize2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Navigation hotspots (simulated) */}
      <div className="absolute top-1/2 left-1/3 pointer-events-none group-hover:pointer-events-auto">
        <button className="size-6 rounded-full bg-white/40 border border-white flex items-center justify-center hover:scale-125 transition-transform">
          <div className="size-2 rounded-full bg-white animate-pulse" />
        </button>
      </div>
    </div>
  )
}
