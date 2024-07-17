import { ReactNode } from "react"

interface CardProps {
    children: ReactNode
}


export function AuthCard({ children }: CardProps) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full">{children}</div>
        </div>
    )
}

AuthCard.body = function({children}: CardProps) {
    return <div className="shadow bg-white p-6 rounded-lg">{children}</div>
}

AuthCard.below = function({children}: CardProps) {
    return <div className="mt-2 justify-center flex gap-3">{children}</div>
}