import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface CustomScrollbarProps {
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

// Original Horizontal Scrollbar (Bottom Bar)
const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ containerRef, className = '' }) => {
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startLeft, setStartLeft] = useState(0);
  
  const [canScrollVertically, setCanScrollVertically] = useState(false);
  const [canScrollHorizontally, setCanScrollHorizontally] = useState(false);
  
  const trackRef = useRef<HTMLDivElement>(null);

  const updateState = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth, scrollHeight, clientHeight } = container;
    
    // Horizontal Check
    const hasHorizontal = scrollWidth > clientWidth;
    setCanScrollHorizontally(hasHorizontal);

    if (hasHorizontal) {
      const newThumbWidth = (clientWidth / scrollWidth) * 100;
      const newThumbLeft = (scrollLeft / scrollWidth) * 100;
      setThumbWidth(newThumbWidth);
      setThumbLeft(newThumbLeft);
    } else {
      setThumbWidth(0);
    }

    // Vertical Check
    setCanScrollVertically(scrollHeight > clientHeight);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateState();
    const observer = new ResizeObserver(() => updateState());
    observer.observe(container);
    
    container.addEventListener('scroll', updateState);
    window.addEventListener('resize', updateState);

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, [containerRef]);

  // Handle Dragging Horizontal
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !trackRef.current) return;
      
      e.preventDefault();
      const trackRect = trackRef.current.getBoundingClientRect();
      const trackWidth = trackRect.width;
      
      const deltaX = e.clientX - startX;
      
      const deltaPercent = (deltaX / trackWidth) * 100;
      const newThumbLeftPercent = Math.min(Math.max(0, startLeft + deltaPercent), 100 - thumbWidth);
      
      const scrollRatio = newThumbLeftPercent / 100;
      const targetScrollLeft = scrollRatio * containerRef.current.scrollWidth;
      
      containerRef.current.scrollLeft = targetScrollLeft;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startLeft, thumbWidth, containerRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setStartLeft(thumbLeft);
    setIsDragging(true);
  };

  const handleScrollStep = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!containerRef.current) return;
    const step = 200; // Pixels to scroll per click
    
    if (direction === 'left' || direction === 'right') {
       containerRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth'
      });
    } else {
       containerRef.current.scrollBy({
        top: direction === 'up' ? -step : step,
        behavior: 'smooth'
      });
    }
  };

  if (!canScrollHorizontally && !canScrollVertically) return null;

  return (
    <div className={`h-10 bg-slate-50 border-t border-slate-200 flex items-center px-3 gap-2 select-none z-10 ${className}`}>
      {/* Horizontal Controls */}
      <div className={`flex items-center gap-2 flex-1 min-w-0 transition-opacity ${canScrollHorizontally ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <button 
            onClick={() => handleScrollStep('left')}
            className="p-1 text-slate-500 hover:bg-white hover:text-primary-600 rounded-md shadow-sm border border-transparent hover:border-slate-200 active:bg-slate-100 transition-all"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Scroll Track */}
          <div className="flex-1 h-2 bg-slate-200 rounded-full relative overflow-hidden" ref={trackRef}>
            {/* Scroll Thumb */}
            <div 
              onMouseDown={handleMouseDown}
              className="absolute top-0 bottom-0 bg-slate-400 hover:bg-primary-500 active:bg-primary-600 rounded-full cursor-grab active:cursor-grabbing transition-colors"
              style={{ 
                width: `${thumbWidth}%`, 
                left: `${thumbLeft}%`,
                transition: isDragging ? 'none' : 'left 0.1s linear'
              }}
            />
          </div>

          <button 
            onClick={() => handleScrollStep('right')}
            className="p-1 text-slate-500 hover:bg-white hover:text-primary-600 rounded-md shadow-sm border border-transparent hover:border-slate-200 active:bg-slate-100 transition-all"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-300 mx-1"></div>

      {/* Vertical Controls (Optional fine tuning, main vertical scroll is now the sidebar) */}
      <div className={`flex items-center gap-1 ${canScrollVertically ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <button 
            onClick={() => handleScrollStep('up')}
            className="p-1 text-slate-500 hover:bg-white hover:text-primary-600 rounded-md shadow-sm border border-transparent hover:border-slate-200 active:bg-slate-100 transition-all"
            title="Scroll Up"
        >
            <ChevronUp className="w-4 h-4" />
        </button>
        <button 
            onClick={() => handleScrollStep('down')}
            className="p-1 text-slate-500 hover:bg-white hover:text-primary-600 rounded-md shadow-sm border border-transparent hover:border-slate-200 active:bg-slate-100 transition-all"
            title="Scroll Down"
        >
            <ChevronDown className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

// New Vertical Scrollbar (Side Bar)
export const VerticalScrollbar: React.FC<CustomScrollbarProps> = ({ containerRef }) => {
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startTop, setStartTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);

  const updateState = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    const hasVertical = scrollHeight > clientHeight;
    setIsVisible(hasVertical);

    if (hasVertical) {
      const newThumbHeight = (clientHeight / scrollHeight) * 100;
      const newThumbTop = (scrollTop / scrollHeight) * 100;
      setThumbHeight(newThumbHeight);
      setThumbTop(newThumbTop);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateState();
    const observer = new ResizeObserver(updateState);
    observer.observe(container);
    container.addEventListener('scroll', updateState);
    window.addEventListener('resize', updateState);

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, [containerRef]);

  // Handle Dragging Vertical
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !trackRef.current) return;
      
      e.preventDefault();
      const trackRect = trackRef.current.getBoundingClientRect();
      const trackHeight = trackRect.height;
      
      const deltaY = e.clientY - startY;
      
      const deltaPercent = (deltaY / trackHeight) * 100;
      const newThumbTopPercent = Math.min(Math.max(0, startTop + deltaPercent), 100 - thumbHeight);
      
      const scrollRatio = newThumbTopPercent / 100;
      const targetScrollTop = scrollRatio * containerRef.current.scrollHeight;
      
      containerRef.current.scrollTop = targetScrollTop;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startTop, thumbHeight, containerRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartY(e.clientY);
    setStartTop(thumbTop);
    setIsDragging(true);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (isDragging || !containerRef.current || !trackRef.current) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const clickRatio = clickY / trackRect.height;
    
    containerRef.current.scrollTo({
      top: clickRatio * containerRef.current.scrollHeight - (containerRef.current.clientHeight / 2),
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      className="absolute right-0 top-0 bottom-0 w-3.5 hover:w-4 bg-transparent hover:bg-slate-50 transition-all z-40 flex justify-center py-1 group"
      ref={trackRef}
      onMouseDown={handleTrackClick}
    >
      {/* Track Line (Visible on hover) */}
      <div className="absolute top-0 bottom-0 w-px bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Thumb */}
      <div 
        onMouseDown={handleMouseDown}
        className="absolute w-2 hover:w-3 bg-slate-400 hover:bg-slate-500 active:bg-slate-600 rounded-full cursor-grab active:cursor-grabbing transition-all opacity-60 hover:opacity-100 shadow-sm"
        style={{ 
          height: `${thumbHeight}%`, 
          top: `${thumbTop}%`,
          transition: isDragging ? 'none' : 'top 0.1s linear'
        }}
      />
      
      {/* Up Arrow (Visual Indicator at top) */}
       <div className="absolute top-0 w-full flex justify-center opacity-0 group-hover:opacity-100 pointer-events-none pt-1">
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-b-slate-400"></div>
       </div>
    </div>
  );
};

export default CustomScrollbar;