import { FormEvent, useRef } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { useAuth } from "./context/AuthContext";
import DebugStorage from './DebugStorage';

export function SignupPage() {
  const { signup } = useAuth();
  const usernameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (signup.isPending) return;
    const username = usernameRef.current?.value;
    const name = nameRef.current?.value;
    if (username == null || username === "" || name == null || name === "") {
      return;
    }
    signup.mutate({ id: username, name });
  }

  return (
    <>
      <DebugStorage/>
      <h1 className="text-3xl font-bold mb-8 text-center">Sign Up</h1>
      <form
        className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end"
        onSubmit={handleSubmit}
      >
        <label htmlFor="userName">Username</label>
        <Input id="userName" pattern="\S*" required ref={usernameRef} />
        <label htmlFor="userName">Name</label>
        <Input id="userName" pattern="\S*" required ref={nameRef} />
        <Button
          disabled={signup.isPending}
          type="submit"
          className="col-span-full"
        >
          {signup.isPending ? "Loading.." : "Sign Up"}
        </Button>
      </form>
    </>
  );
}
