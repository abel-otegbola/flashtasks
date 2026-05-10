import { type SVGProps } from "react";

const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
<rect x="11" y="1" width="4" height="4" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
<rect x="11" y="11" width="4" height="4" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
<rect x="1" y="11" width="4" height="4" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
<rect width="6" height="6" rx="3" fill="var(--color-primary)"/>
</svg>


)
    
export default LogoIcon;