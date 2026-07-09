"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => void
  onResend?: () => void | Promise<void>
}

export function OTPVerificationModal({ isOpen, onClose, onVerify, onResend }: OTPVerificationModalProps) {
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerify = async () => {
    if (otpCode.length === 6) {
      setIsLoading(true)
      try {
        await onVerify(otpCode)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleResend = async () => {
    if (!onResend || isResending) return
    setIsResending(true)
    try {
      await onResend()
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card border-0 shadow-2xl p-0">
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-8 pt-2">
          <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-foreground mb-8">
            Vérification du code OTP
          </h2>

          <div className="space-y-6">
            <div>
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Entre le code OTP reçu par mail"
                maxLength={6}
                className="w-full h-12 text-center text-base border-gray-300 dark:border-border rounded-lg focus:border-blue-500 focus:ring-blue-500 dark:bg-background dark:text-foreground"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={otpCode.length !== 6 || isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Vérification..." : "Envoyer le code"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Code non reçu ?{" "}
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
                >
                  {isResending ? "Envoi..." : "Renvoyer le code"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
