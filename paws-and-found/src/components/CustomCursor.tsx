import { useState, useEffect } from 'react';

interface CustomCursorProps {
  size?: number;
  color?: string;
  smoothness?: number;
}

export default function CustomCursor({ 
  size = 8, 
  color = '#3B82F6', 
  smoothness = 0.15 
}: CustomCursorProps) {  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isOverInput, setIsOverInput] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isOverClickable, setIsOverClickable] = useState(false);  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
        // Check if hovering over input elements (excluding checkboxes and radio buttons)
      const target = e.target as Element;
      const isTextInput = target && (
        (target.tagName === 'INPUT' && 
         !['checkbox', 'radio', 'submit', 'button'].includes((target as HTMLInputElement).type)) ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).contentEditable === 'true' ||
        target.closest('textarea')
      );
      setIsOverInput(!!isTextInput);

      // Check if hovering over clickable elements (including checkboxes and radio buttons)
      const isClickable = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'LABEL' ||
        (target.tagName === 'INPUT' && 
         ['checkbox', 'radio', 'submit', 'button'].includes((target as HTMLInputElement).type)) ||
        (target as HTMLElement).role === 'button' ||
        (target as HTMLElement).onclick !== null ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[onclick]') ||
        target.closest('label') ||
        window.getComputedStyle(target).cursor === 'pointer'
      );
      setIsOverClickable(!!isClickable && !isTextInput);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);    // Hide default cursor everywhere
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        cursor: none !important;
      }
      
      @keyframes cursor-pulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(1.1);
          opacity: 0.8;
        }
      }
    `;
    document.head.appendChild(style);return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.head.removeChild(style);
    };}, [isVisible]);

  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setPosition(prev => {
        const dx = targetPosition.x - prev.x;
        const dy = targetPosition.y - prev.y;
        
        // Only update if there's a meaningful difference to avoid unnecessary renders
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          return prev;
        }
        
        return {
          x: prev.x + dx * smoothness,
          y: prev.y + dy * smoothness
        };
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [targetPosition, smoothness]);

  if (!isVisible) return null;  return (
    <div
      className="custom-cursor"      style={{
        position: 'fixed',
        left: position.x - (isOverInput ? size/6 : (isClicking ? (size * 1.1) / 2 : (isOverClickable ? (size * 1.4) / 2 : size / 2))),
        top: position.y - (isOverInput ? size : (isClicking ? (size * 1.1) / 2 : (isOverClickable ? (size * 1.4) / 2 : size / 2))),
        width: isOverInput ? size/3 : (isClicking ? size * 1.1 : (isOverClickable ? size * 1.4 : size)),
        height: isOverInput ? size * 2 : (isClicking ? size * 1.1 : (isOverClickable ? size * 1.4 : size)),        backgroundColor: color,
        borderRadius: isOverInput ? '25pt' : '50%',
        pointerEvents: 'none',
        zIndex: 10000,
        mixBlendMode: 'difference',
        transition: 'opacity 0.2s ease-in-out, width 0.15s ease-out, height 0.15s ease-out, border-radius 0.2s ease-in-out',
        opacity: isVisible ? 1 : 0,
        boxShadow: isOverInput 
          ? `0 0 ${size}px ${color}40` 
          : `0 0 ${isClicking ? size * 2.1 : (isOverClickable ? size * 2.5 : size * 2)}px ${color}40`,
        animation: isOverClickable && !isClicking ? 'cursor-pulse 1.5s ease-in-out infinite' : 'none',
      }}
    />
  );
}
