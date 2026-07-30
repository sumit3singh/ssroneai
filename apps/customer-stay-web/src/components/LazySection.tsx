import { Suspense, lazy, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";

interface LazySectionProps {
    loader: () => Promise<{ default: ComponentType<any> }>;
    fallback?: ReactNode;
    className?: string;
}

const defaultFallback = (
    <div className="section-padding bg-background/70 animate-pulse">
        <div className="mx-auto h-24 rounded-3xl bg-muted" />
    </div>
);

const LazySection = ({ loader, fallback, className = "" }: LazySectionProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [Component, setComponent] = useState<LazyExoticComponent<ComponentType<any>> | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!rootRef.current || isVisible) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting || entry.intersectionRatio > 0) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px 0px" }
        );

        observer.observe(rootRef.current);

        return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
        if (isVisible && !Component) {
            setComponent(lazy(loader));
        }
    }, [Component, isVisible, loader]);

    return (
        <div ref={rootRef} className={className}>
            {Component ? (
                <Suspense fallback={fallback ?? defaultFallback}>
                    <Component />
                </Suspense>
            ) : (
                fallback ?? defaultFallback
            )}
        </div>
    );
};

export default LazySection;
