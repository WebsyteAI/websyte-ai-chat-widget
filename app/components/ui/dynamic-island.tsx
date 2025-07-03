"use client"

import * as React from "react"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const DynamicIslandProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode
    setSize?: React.Dispatch<React.SetStateAction<DynamicIslandSize>>
    size?: DynamicIslandSize
    position?: "top" | "bottom" | "center"
    dynamicHeight?: number
  }
>(({ children, size = "default", setSize, position = "top", dynamicHeight, className, ...props }, ref) => {
  const [islandSize, setIslandSize] = React.useState<DynamicIslandSize>(size)

  React.useEffect(() => {
    setIslandSize(size)
  }, [size])

  const positionClasses = {
    top: "top-4",
    bottom: "bottom-4",
    center: "top-1/2 -translate-y-1/2"
  }

  return (
    <DynamicIslandContext.Provider value={{ size: islandSize, setSize: setSize || setIslandSize }}>
      <MotionConfig transition={TRANSITION}>
        <motion.div
          ref={ref}
          className={cn(
            "absolute left-1/2 z-50 flex min-h-10 -translate-x-1/2 items-center justify-center overflow-hidden rounded-2xl shadow-lg",
            "bg-gray-100 border border-gray-200",
            "dark:bg-gray-900/95 dark:border-gray-800 dark:backdrop-blur-md",
            "max-w-[90vw] sm:max-w-[600px]",
            positionClasses[position],
            SIZE_VARIANTS[islandSize]?.size,
            className
          )}
          initial={dynamicHeight ? { ...SIZE_VARIANTS[islandSize]?.motionProps.initial, height: `${dynamicHeight}px` } : SIZE_VARIANTS[islandSize]?.motionProps.initial}
          animate={dynamicHeight ? { ...SIZE_VARIANTS[islandSize]?.motionProps.animate, height: `${dynamicHeight}px` } : SIZE_VARIANTS[islandSize]?.motionProps.animate}
          exit={dynamicHeight ? { ...SIZE_VARIANTS[islandSize]?.motionProps.exit, height: `${dynamicHeight}px` } : SIZE_VARIANTS[islandSize]?.motionProps.exit}
          style={{
            maxWidth: 'min(90vw, 600px)',
            ...(dynamicHeight ? { height: `${dynamicHeight}px` } : {})
          }}
        >
          <AnimatePresence>{children}</AnimatePresence>
        </motion.div>
      </MotionConfig>
    </DynamicIslandContext.Provider>
  )
})

DynamicIslandProvider.displayName = "DynamicIslandProvider"

export const DynamicIsland = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("flex items-center justify-center w-full", className)}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    {...props}
  />
))

DynamicIsland.displayName = "DynamicIsland"

// Types
export type DynamicIslandSize = "compact" | "default" | "large" | "long" | "medium"

// Constants
const TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}

const SIZE_VARIANTS: Record<
  DynamicIslandSize,
  {
    size: string
    motionProps: {
      initial: { width: string; height: string }
      animate: { width: string; height: string }
      exit: { width: string; height: string }
    }
  }
> = {
  compact: {
    size: "h-9 px-3",
    motionProps: {
      initial: { width: "240px", height: "36px" },
      animate: { width: "240px", height: "36px" },
      exit: { width: "240px", height: "36px" },
    },
  },
  default: {
    size: "h-10 px-4",
    motionProps: {
      initial: { width: "320px", height: "40px" },
      animate: { width: "320px", height: "40px" },
      exit: { width: "320px", height: "40px" },
    },
  },
  medium: {
    size: "min-h-14 px-5",
    motionProps: {
      initial: { width: "400px", height: "56px" },
      animate: { width: "400px", height: "56px" },
      exit: { width: "400px", height: "56px" },
    },
  },
  long: {
    size: "h-12",
    motionProps: {
      initial: { width: "480px", height: "48px" },
      animate: { width: "480px", height: "48px" },
      exit: { width: "480px", height: "48px" },
    },
  },
  large: {
    size: "h-12",
    motionProps: {
      initial: { width: "600px", height: "48px" },
      animate: { width: "600px", height: "48px" },
      exit: { width: "600px", height: "48px" },
    },
  },
}

// Context
const DynamicIslandContext = React.createContext<{
  size: DynamicIslandSize
  setSize: React.Dispatch<React.SetStateAction<DynamicIslandSize>>
}>({
  size: "default",
  setSize: () => {},
})

// Hook
export const useDynamicIsland = () => {
  const context = React.useContext(DynamicIslandContext)
  if (!context) {
    throw new Error("useDynamicIsland must be used within a DynamicIslandProvider")
  }
  return context
}