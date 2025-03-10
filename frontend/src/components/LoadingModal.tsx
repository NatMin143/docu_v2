"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoadingSpinner } from "./loading-spinner"

interface LoadingModalProps {
  isOpen: boolean
  message?: string
}

export function LoadingModal({ isOpen, message = "Loading..." }: LoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px] flex flex-col items-center justify-center gap-4 p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="absolute right-4 top-4 hidden">
          {/* This hides the close button by making its container hidden */}
        </div>
        <LoadingSpinner size="lg" />
        <p className="text-center text-sm text-muted-foreground">{message}</p>
      </DialogContent>
    </Dialog>
  )
}

