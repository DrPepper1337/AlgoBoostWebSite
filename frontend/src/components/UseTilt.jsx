import { useRef, useEffect } from "react";

export default function useViewportTilt({ maxTilt = 10 } = {}) {
    const tiltRef = useRef(null);
    const rafRef = useRef(0);
    const target = useRef({ rx: 0, ry: 0 });
    const state = useRef({ rx: 0, ry: 0 });
    const ease = 0.15;

    useEffect(() => {
        const handleMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const midX = innerWidth / 2;
            const midY = innerHeight / 2;

            // normalising the tilt to be a %
            const perX = (e.clientX - midX) / midX;
            const perY = (e.clientY - midY) / midY;

            target.current.ry = perX * maxTilt;
            target.current.rx = -perY * maxTilt;
        };

        const tick = () => {
            const el = tiltRef.current;
            if (el) {
                state.current.rx += (target.current.rx - state.current.rx) * ease;
                state.current.ry += (target.current.ry - state.current.ry) * ease;
                el.style.transform = `rotateX(${state.current.rx}deg) rotateY(${state.current.ry}deg)`;
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        document.addEventListener("mousemove", handleMove);
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            document.removeEventListener("mousemove", handleMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, [maxTilt]);

    return tiltRef;
}