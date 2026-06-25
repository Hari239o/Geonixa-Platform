"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"

export type SignupData = {
  category: "creator" | "brand" | "agency" | null
  brandName: string
  email: string
  countryCode: string
  phone: string
  otp: string
  teamSize: string
  location: string
  businessCategory: string
  username?: string
  password?: string
}

const defaultData: SignupData = {
  category: null,
  brandName: "",
  email: "",
  countryCode: "+91",
  phone: "",
  otp: "",
  teamSize: "1-10",
  location: "",
  businessCategory: "",
  username: "",
  password: ""
}

type SignupContextType = {
  data: SignupData
  updateData: (newData: Partial<SignupData>) => void
  resetData: () => void
}

const SignupContext = createContext<SignupContextType | undefined>(undefined)

export function SignupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SignupData>(defaultData)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setTimeout(() => {
      setMounted(true)
      try {
        const stored = localStorage.getItem("kalinq_signup_data")
        if (stored) {
          setData(JSON.parse(stored))
        }
      } catch {
        console.error("Failed to load signup data from localStorage")
      }
    }, 0)
  }, [])


  // Save to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("kalinq_signup_data", JSON.stringify(data))
    }
  }, [data, mounted])

  const updateData = (newData: Partial<SignupData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const resetData = () => {
    setData(defaultData)
    localStorage.removeItem("kalinq_signup_data")
  }

  return (
    <SignupContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </SignupContext.Provider>
  )
}

export function useSignup() {
  const context = useContext(SignupContext)
  if (context === undefined) {
    throw new Error("useSignup must be used within a SignupProvider")
  }
  return context
}
