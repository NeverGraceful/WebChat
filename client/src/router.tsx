import { createBrowserRouter } from "react-router-dom";
import {AuthentLayout} from "./components/AuthentLayout";
import {LoginPage} from "./components/LoginPage";
import {SignupPage} from "./components/SignupPage";

export const router  = createBrowserRouter([
    {
        element: <AuthentLayout />,
        children: [
            { path: "login", element: <LoginPage /> },
            { path: "signup", element: <SignupPage /> }
        ]
    }
])