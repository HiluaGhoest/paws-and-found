import { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ImageCarouselProps {
  images: string[];
  altText: string;
  onImageClick?: (imageUrl: string) => void;
  className?: string;
}

export default function ImageCarousel({ 
  images, 
  altText, 
  onImageClick,
  className = "w-full h-screen max-h-[70vh]"
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle touch events for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    if (carouselRef.current) {
      carouselRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  // Single image - no carousel needed
  if (images.length <= 1) {
    return (
      <div className={`relative ${className} group`}>
        <img
          src={images[0]}
          alt={altText}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            console.warn('Failed to load image:', images[0]);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onImageClick) {
              onImageClick(images[0]);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef}
      className={`relative ${className} group`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      {/* Main Image */}
      <img
        src={images[currentIndex]}
        alt={`${altText} ${currentIndex + 1} of ${images.length}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          console.warn('Failed to load image:', images[currentIndex]);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onImageClick) {
            onImageClick(images[currentIndex]);
          }
        }}
      />      {/* Navigation Regions - Desktop */}
      {images.length > 1 && (
        <>
          {/* Left region - Previous image (excluding center safe zone) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-0 top-0 w-1/4 h-full z-10 cursor-pointer flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity duration-300 group-hover:bg-gradient-to-r group-hover:from-black/20 group-hover:to-transparent"
            aria-label="Previous image"
          >
            <FaChevronLeft className="w-6 h-6 text-white/80 drop-shadow-lg" />
          </div>

          {/* Right region - Next image (excluding center safe zone) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-0 top-0 w-1/4 h-full z-10 cursor-pointer flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity duration-300 group-hover:bg-gradient-to-l group-hover:from-black/20 group-hover:to-transparent"
            aria-label="Next image"
          >
            <FaChevronRight className="w-6 h-6 text-white/80 drop-shadow-lg" />
          </div>

          {/* Center Safe Zone - 50% width, centered horizontally - no click handlers */}
          <div
            className="absolute left-1/4 top-0 w-1/2 h-full z-5 pointer-events-none"
            aria-label="Safe zone for double-click to like"
          />
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Swipe Hint for Mobile (shows on first load) */}
      {images.length > 1 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm opacity-0 animate-pulse md:hidden">
            Swipe to navigate
          </div>
        </div>
      )}
    </div>
  );
}
