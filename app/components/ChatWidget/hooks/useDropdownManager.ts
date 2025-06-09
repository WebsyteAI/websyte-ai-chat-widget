import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseDropdownManagerReturn {
  isOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  toggleDropdown: () => void;
  openDropdown: () => void;
  closeDropdown: () => void;
}

export function useDropdownManager(): UseDropdownManagerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current) {
        const target = event.target as Element;
        if (!dropdownRef.current.contains(target)) {
          console.log('Clicking outside dropdown, closing');
          closeDropdown();
        }
      }
    };

    // Use click instead of mousedown to allow onClick handlers to fire first
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  return {
    isOpen,
    dropdownRef,
    toggleDropdown,
    openDropdown,
    closeDropdown,
  };
}