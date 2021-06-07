import {ReactNode} from "react";

export default function Container({children, className, width}: { children: ReactNode, className?: string, width?: "4xl" | "7xl" | "full" }) {
    return (
        <div
            className={"mx-auto px-4 " + ({
                "4xl": "max-w-4xl",
                "7xl": "max-w-7xl",
                "full": ""
            }[width]) + (className || "")}
        >
            {children}
        </div>
    );
}