import { LinkProps, Link as NewLink } from "react-router-dom";

export function Link({ children, className, ...rest}: LinkProps){
    return<NewLink {...rest} className="text-blue-500 underline underline-offset-2 ${className}">{children}</NewLink>
}