import React, {
  useRef,
  useEffect,
  type ReactNode,
  type PropsWithChildren,
} from "react";

interface HorizontalScrollProps extends PropsWithChildren {
  className?: string;
  scrollSpeed?: number; // Facteur multiplicateur de vitesse optionnel
}

interface ScrollState {
  isScrolling: boolean;
  startX: number;
  scrollLeft: number;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  className = "",
  scrollSpeed = 1,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollStateRef = useRef<ScrollState>({
    isScrolling: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent): void => {
      e.preventDefault();

      const speedMultiplier = (Math.abs(e.deltaY) / 100) * scrollSpeed;

      scrollContainer.scrollLeft += e.deltaY * speedMultiplier;
    };

    const handleMouseDown = (e: MouseEvent): void => {
      scrollStateRef.current = {
        isScrolling: true,
        startX: e.pageX - scrollContainer.offsetLeft,
        scrollLeft: scrollContainer.scrollLeft,
      };
    };

    const handleMouseUp = (): void => {
      scrollStateRef.current.isScrolling = false;
    };

    const handleMouseMove = (e: MouseEvent): void => {
      if (!scrollStateRef.current.isScrolling) return;

      const x = e.pageX - scrollContainer.offsetLeft;
      const distance = (x - scrollStateRef.current.startX) * scrollSpeed;
      scrollContainer.scrollLeft = scrollStateRef.current.scrollLeft - distance;
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    scrollContainer.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
      scrollContainer.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [scrollSpeed]);

  const renderChildren = (children: ReactNode): ReactNode => {
    return React.Children.map(children, (child) => (
      <div className="snap-start w-full flex-shrink-0">{child}</div>
    ));
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`
        flex
        overflow-x-auto
        scrollbar-hide
        snap-x
        snap-mandatory
        cursor-grab
        active:cursor-grabbing
        ${className}
      `}
      style={{
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {renderChildren(children)}
    </div>
  );
};

export default HorizontalScroll;
