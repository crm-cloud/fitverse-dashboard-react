import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PagePreservationOptions {
  preserveScroll?: boolean;
}

const withPagePreservation = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: PagePreservationOptions = { preserveScroll: true }
) => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithPreservation = (props: P) => {
    const location = useLocation();
    const scrollPositions = useRef<Record<string, number>>({});
    const currentPath = useRef(location.pathname);
    const contentRef = useRef<HTMLDivElement>(null);
    const { preserveScroll = true } = options;

    // Memoize the scroll position update function
    const updateScrollPosition = useCallback((path: string) => {
      if (preserveScroll && contentRef.current) {
        scrollPositions.current = {
          ...scrollPositions.current,
          [path]: window.scrollY
        };
      }
    }, [preserveScroll]);

    // Save scroll position when leaving the page
    useEffect(() => {
      const currentPathKey = currentPath.current;
      
      return () => {
        updateScrollPosition(currentPathKey);
      };
    }, [updateScrollPosition]);

    // Restore scroll position when the path changes
    useEffect(() => {
      if (preserveScroll && currentPath.current === location.pathname) {
        const savedPosition = scrollPositions.current[location.pathname];
        const scrollToPosition = savedPosition !== undefined ? savedPosition : 0;
        
        // Use requestAnimationFrame for smoother scroll restoration
        const frameId = requestAnimationFrame(() => {
          window.scrollTo(0, scrollToPosition);
        });
        
        return () => cancelAnimationFrame(frameId);
      }
      
      currentPath.current = location.pathname;
    }, [location.pathname, preserveScroll]);

    return (
      <div 
        ref={contentRef}
        key={`${location.pathname}-${location.search}`}
        className="page-preservation-wrapper"
      >
        <WrappedComponent {...(props as P)} />
      </div>
    );
  };

  ComponentWithPreservation.displayName = `withPagePreservation(${displayName})`;
  
  return React.memo(ComponentWithPreservation, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

export default withPagePreservation;
