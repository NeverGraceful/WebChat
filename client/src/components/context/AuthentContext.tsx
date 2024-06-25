import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { createContext, ReactNode, useContext } from "react"
import { useNavigate } from "react-router-dom"

interface AuthContext {

}

const Context = createContext<AuthContext | null>(null)

export function useAuth(){
    return useContext(Context) as AuthContext
}

interface AuthentProviderProps {
    children: ReactNode
}

interface User {
    id: string
    name: string
    image?: string
}

export function authentProvider({children}: AuthentProviderProps){
    const nav = useNavigate()
    const signup = useMutation({
        mutationFn: (user: User) => {
            return axios.post('${import.meta.env.VITE_SERVER_URL}/signup', user)
        },
        onSuccess(){
            nav("/login")
        }
    })
    return <Context.Provider value={{signup}}>
        {children}
    </Context.Provider>
}