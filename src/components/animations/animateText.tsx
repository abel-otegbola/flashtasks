import { ReactNode, ReactElement, useEffect, useRef, useState } from "react"
import { useIsVisible } from "../../helpers/isVisible";

interface AnimateProps {
    speed?: number,
    children: ReactNode,
    className?: string,
}

type ContentItem = {
    type: 'char' | 'element';
    content: string | ReactElement;
};

export default function AnimateText({ speed, children, className }: AnimateProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useIsVisible(ref); // Check if the parent container is visible
    const [content, setContent] = useState<ContentItem[]>([]);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        // Convert children to an array of items (chars and elements)
        const items: ContentItem[] = [];
        
        const processNode = (node: ReactNode) => {
            if (typeof node === 'string') {
                // Split string into individual characters
                node.split('').forEach(char => {
                    items.push({ type: 'char', content: char });
                });
            } else if (Array.isArray(node)) {
                // Process each child in the array
                node.forEach(processNode);
            } else if (node && typeof node === 'object') {
                // It's a React element, add it as-is
                items.push({ type: 'element', content: node as ReactElement });
            }
        };

        processNode(children);
        setContent(items);
    }, [children])

    useEffect(() => {
        if (isVisible && !hasAnimated) {
            setHasAnimated(true); // Lock the animation state
        }
    }, [isVisible, hasAnimated]);

    return (
        <span ref={ref} className={className}>
            {content.map((item, index) => (
                <span
                    key={index}
                    className={`opacity-0 translate-y-4 transition duration-700 ease-in-out ${
                        hasAnimated  ? "opacity-100 translate-y-0 text-shadow-none" : "text-shadow-lg/50"
                    }`}
                    style={{ transitionDelay: `${(speed || 35) * index}ms` }}
                >
                    {item.content}
                </span>
            ))}
        </span>
    )
}