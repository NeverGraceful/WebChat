import { FormEvent, useRef } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { useAuth } from "./context/AuthContext";

export function LoginPage(){
const { login } = useAuth();
  const usernameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (login.isPending) return;
    const username = usernameRef.current?.value;
    if (username == null || username === "") {
      return;
    }
    login.mutate(username);
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>
      <form
        className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end"
        onSubmit={handleSubmit}
      >
        <label htmlFor="userName">Username</label>
        <Input id="userName" pattern="\S*" required ref={usernameRef} />
        <Button
          disabled={login.isPending}
          type="submit"
          className="col-span-full"
        >
          {login.isPending ? "Loading.." : "Login"}
        </Button>
      </form>
    </>
  );
}