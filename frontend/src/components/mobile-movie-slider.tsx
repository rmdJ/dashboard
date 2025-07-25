import { useState, useRef, useCallback } from "react";
import { Film } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  popularity: number;
}

interface MobileMovieSliderProps {
  movies: Movie[];
  onMovieClick: (movieId: number) => void;
}

export const MobileMovieSlider = ({ movies, onMovieClick }: MobileMovieSliderProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const sortedMovies = movies.sort((a, b) => b.popularity - a.popularity);

  // Calculer la largeur d'un item (80% de la largeur du container + gap)
  const getItemWidth = useCallback(() => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return containerWidth * 0.8 + 16; // 80% + gap de 16px
  }, []);

  // Fonction pour animer l'inertie avec plus de fluidité
  const animateInertia = useCallback(() => {
    if (Math.abs(velocity) < 0.1) return;
    
    if (containerRef.current) {
      const newScrollLeft = containerRef.current.scrollLeft + velocity;
      containerRef.current.scrollLeft = newScrollLeft;
      setVelocity(velocity * 0.98); // Friction plus douce
      animationRef.current = requestAnimationFrame(animateInertia);
    }
  }, [velocity]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartScrollLeft(containerRef.current?.scrollLeft || 0);
    setVelocity(0);
    setLastMoveTime(Date.now());
    setLastMoveX(e.touches[0].clientX);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    const now = Date.now();
    const timeDiff = now - lastMoveTime;
    
    // Calculer la vélocité
    if (timeDiff > 0) {
      const currentVelocity = (lastMoveX - currentX) / timeDiff * 16; // Normaliser à 60fps
      setVelocity(currentVelocity);
    }
    
    containerRef.current.scrollLeft = startScrollLeft + diff;
    setLastMoveTime(now);
    setLastMoveX(currentX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Démarrer l'animation d'inertie si la vélocité est suffisante
    if (Math.abs(velocity) > 1) {
      animateInertia();
    }
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollLeft(containerRef.current?.scrollLeft || 0);
    setVelocity(0);
    setLastMoveTime(Date.now());
    setLastMoveX(e.clientX);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    const now = Date.now();
    const timeDiff = now - lastMoveTime;
    
    if (timeDiff > 0) {
      const currentVelocity = (lastMoveX - currentX) / timeDiff * 16;
      setVelocity(currentVelocity);
    }
    
    containerRef.current.scrollLeft = startScrollLeft + diff;
    setLastMoveTime(now);
    setLastMoveX(currentX);
  };

  const handleMouseEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(velocity) > 1) {
      animateInertia();
    }
  };

  const handleScroll = () => {
    if (containerRef.current && !isDragging) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };

  // Calculer l'index du film actuel basé sur la position de scroll
  const getCurrentIndex = () => {
    const itemWidth = getItemWidth();
    if (itemWidth === 0) return 0;
    return Math.round(scrollPosition / itemWidth);
  };

  if (sortedMovies.length === 0) return null;

  return (
    <div className="md:hidden">
      {/* Slider container */}
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ 
          scrollBehavior: 'auto', // Toujours auto pour éviter les conflits
          scrollSnapType: 'none' // Désactiver le snap natif
        }}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseStart}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseEnd}
        onMouseLeave={handleMouseEnd}
      >
        {sortedMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="flex-shrink-0"
            style={{ 
              width: '80%'
            }}
          >
            <div
              className="flex flex-col items-center cursor-pointer group h-full"
              onClick={() => onMovieClick(movie.id)}
            >
              {/* Title above */}
              <div className="h-16 flex items-center mb-4 px-2 w-full">
                <h3 className="font-semibold text-center text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 w-full">
                  {movie.title}
                </h3>
              </div>

              {/* Movie poster */}
              <div className="relative w-full max-w-xs mx-auto">
                {movie.poster_path ? (
                  <div className="aspect-[2/3] rounded-2xl shadow-2xl overflow-hidden">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-2xl shadow-2xl flex items-center justify-center">
                    <Film className="h-20 w-20 text-gray-400 dark:text-gray-500" />
                  </div>
                )}

                {/* Gradient overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {sortedMovies.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === getCurrentIndex() 
                ? 'bg-primary w-6' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {getCurrentIndex() + 1} / {sortedMovies.length}
      </div>
    </div>
  );
};