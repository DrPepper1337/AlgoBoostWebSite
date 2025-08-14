import useViewportTilt from "./UseTilt";

export default function Tilt({
    children,
    className = "",
    perspective = 800,
    maxTilt = 10,
    style,
}) {
    const tiltRef = useViewportTilt({ maxTilt });

    return (
        <div className="tilt-wrap" style={{ perspective: `${perspective}px` }}>
            <div
                ref={tiltRef}
                className={`tilt-group ${className}`}
                style={style}
            >
                {children}
            </div>
        </div>
    );
}