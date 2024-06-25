import { useRef } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

export function LoginPage(){
    const usernameRef = useRef<HTMLInputElement>(null)
    return (
        <>
            <h1 className="text-3xl font-bold mb-8 text-center"> Login</h1>
            <form className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end">
                <label htmlFor="userName">Username</label>
                <Input id="userName" pattern="\S*" required ref={usernameRef}/>
                <Button type="submit" className="col-span-full">Login</Button>
            </form>
        </>
    )
}