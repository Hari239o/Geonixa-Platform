import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
 ({ className, type, ...props }, ref) => {
 return (
 <input
 type={type}
 className={cn(
 "flex h-12 w-full rounded-lg border border-border bg-[#F9FAFB] px-3 py-2 text-sm text-text-dark ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red focus-visible:border-primary-red disabled:cursor-not-allowed disabled:opacity-50 transition-all",
 className
 )}
 ref={ref}
 {...props}
 />
 )
 }
)
Input.displayName = "Input"

export { Input }
