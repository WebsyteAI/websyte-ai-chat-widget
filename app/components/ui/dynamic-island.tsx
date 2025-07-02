"use client"

import * as React from "react"
import { AnimatePresence, MotionConfig, motion } from "motion"
import { cn } from "@/lib/utils"

export const DynamicIslandProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode
    setSize?: React.Dispatch<React.SetStateAction<DynamicIslandSize>>
    size?: DynamicIslandSize
  }
>(({ children, size = "default", setSize, ...props }, ref) => {
  const [islandSize, setIslandSize] = React.useState<DynamicIslandSize>(size)

  React.useEffect(() => {
    setIslandSize(size)
  }, [size])

  return (
    <DynamicIslandContext.Provider value={{ size: islandSize, setSize: setSize || setIslandSize }}>
      <MotionConfig transition={TRANSITION}>
        <motion.div
          ref={ref}
          className={cn(
            "absolute left-1/2 top-4 z-50 flex min-h-10 -translate-x-1/2 items-center justify-center overflow-hidden rounded-2xl bg-black/90 px-4 py-2 shadow-lg backdrop-blur-md",
            "dark:bg-white/10",
            SIZE_VARIANTS[islandSize]?.size
          )}
          {...props}
          {...SIZE_VARIANTS[islandSize]?.motionProps}
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
    className={cn("flex items-center justify-center", className)}
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
      initial: { width: "140px", height: "36px" },
      animate: { width: "140px", height: "36px" },
      exit: { width: "140px", height: "36px" },
    },
  },
  default: {
    size: "h-10 px-4",
    motionProps: {
      initial: { width: "180px", height: "40px" },
      animate: { width: "180px", height: "40px" },
      exit: { width: "180px", height: "40px" },
    },
  },
  medium: {
    size: "min-h-14 px-5",
    motionProps: {
      initial: { width: "220px", height: "56px" },
      animate: { width: "220px", height: "56px" },
      exit: { width: "220px", height: "56px" },
    },
  },
  long: {
    size: "h-10 px-6",
    motionProps: {
      initial: { width: "280px", height: "40px" },
      animate: { width: "280px", height: "40px" },
      exit: { width: "280px", height: "40px" },
    },
  },
  large: {
    size: "min-h-24 p-5",
    motionProps: {
      initial: { width: "350px", height: "96px" },
      animate: { width: "350px", height: "96px" },
      exit: { width: "350px", height: "96px" },
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