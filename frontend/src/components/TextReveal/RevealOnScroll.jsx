import { useRef, useEffect } from "react";

export default function RevealOnScroll({
  as: Tag = "div",
  className = "",
  threshold = 0,
  rootMargin = "0px 0px -50% 0px",
  once = true,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
            if (once) io.unobserve(el);
          } else if (!once) {
            el.classList.remove("is-revealed");
          }
        });
      },
      { threshold, rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return (
    <Tag ref={ref} className={`reveal-scope ${className}`} {...rest}>
      {children}
    </Tag>
  );
}