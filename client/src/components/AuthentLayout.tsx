import { Outlet } from "react-router-dom";
import { AuthCard } from "./AuthCard";

export function AuthentLayout(){
    return (
        <AuthCard>
            <AuthCard.body>
                <Outlet/>
            </AuthCard.body>
            <AuthCard.below>
                hi
            </AuthCard.below>
        </AuthCard>
    )
}
