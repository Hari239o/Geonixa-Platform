"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function OnboardingContent() {
 const searchParams = useSearchParams()
 const type = searchParams.get('type') || 'unknown'

 return (
 <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white p-8">
 <h1 className="text-4xl font-bold text-text-dark mb-4">Onboarding</h1>
 <p className="text-lg text-text-light mb-8">
 You are joining as a: <strong className="text-primary-red uppercase">{type}</strong>
 </p>
 <p className="text-sm text-gray-400">
 (The design for this screen hasn&apos;t been provided yet. Please upload the Figma screenshot for the Onboarding flow!)
 </p>
 </div>
 )
}

export default function OnboardingPage() {
 return (
 <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
 <OnboardingContent />
 </Suspense>
 )
}
