import { createBrowserRouter, Outlet } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { Channel } from "./Channel"
import { HomePage } from "./HomePage"
import { AuthLayout } from "./AuthLayout"
import { RootLayout } from "./RootLayout"
import { LoginPage } from "./LoginPage"
import { SignupPage } from "./SignupPage"

export const router = createBrowserRouter([
  {
    element: <ContextWrapper />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: "/channel",
            children: [{ path: "new", element: <Channel /> }],
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
        ],
      },
    ],
  },
])

function ContextWrapper() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
