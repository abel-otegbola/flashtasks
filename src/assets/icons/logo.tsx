import { type SVGProps } from "react";

const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect x="1" y="1" width="10" height="10" rx="5" fill="currentColor"/>
        <rect x="17" y="1" width="10" height="10" rx="5" fill="currentColor"/>
        <rect x="1" y="15" width="10" height="10" rx="5" fill="currentColor"/>
        <rect x="17" y="15" width="10" height="10" rx="5" fill="currentColor"/>
        <rect x="1" y="29" width="10" height="10" rx="5" fill="currentColor"/>
        <rect x="17" y="29" width="10" height="10" rx="6" fill="#4BD551"/>
    </svg>


)
    
export default LogoIcon;