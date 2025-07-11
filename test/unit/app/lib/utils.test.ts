import { describe, it, expect } from 'vitest';
import { cn } from '../../../../app/lib/utils';

describe('utils', () => {
  describe('cn function', () => {
    it('should combine simple class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes with clsx syntax', () => {
      const result = cn('base', { 'conditional': true, 'hidden': false });
      expect(result).toBe('base conditional');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle null and undefined values', () => {
      const result = cn('class1', null, undefined, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle falsy conditional classes', () => {
      const result = cn('base', { 'active': false, 'disabled': null, 'hidden': undefined });
      expect(result).toBe('base');
    });

    it('should merge conflicting Tailwind classes with tailwind-merge', () => {
      // tailwind-merge should resolve conflicts by keeping the last one
      const result = cn('p-4 p-6', 'p-8');
      expect(result).toBe('p-8');
    });

    it('should handle complex Tailwind class conflicts', () => {
      // Test more complex conflicts that tailwind-merge should handle
      const result = cn('text-red-500 text-blue-500', 'text-green-500');
      expect(result).toBe('text-green-500');
    });

    it('should preserve non-conflicting classes', () => {
      const result = cn('flex items-center', 'justify-between', 'text-lg');
      expect(result).toBe('flex items-center justify-between text-lg');
    });

    it('should handle mixed Tailwind and custom classes', () => {
      const result = cn('p-4', 'custom-class', 'mb-4', 'another-custom');
      expect(result).toBe('p-4 custom-class mb-4 another-custom');
    });

    it('should handle nested arrays and objects', () => {
      const result = cn(
        'base',
        ['array-class1', 'array-class2'],
        { 'obj-class1': true, 'obj-class2': false },
        'final'
      );
      expect(result).toBe('base array-class1 array-class2 obj-class1 final');
    });

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2', '   ', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle whitespace in class names', () => {
      const result = cn('  class1  ', '  class2  ');
      expect(result).toBe('class1 class2');
    });

    it('should handle complex conditional logic', () => {
      const isActive = true;
      const isDisabled = false;
      const variant = 'primary';

      const result = cn(
        'btn',
        {
          'btn-active': isActive,
          'btn-disabled': isDisabled,
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
        }
      );

      expect(result).toBe('btn btn-active btn-primary');
    });

    it('should handle function return values in conditionals', () => {
      const getVariantClass = (variant: string) => variant === 'large' ? 'btn-lg' : 'btn-sm';
      
      const result = cn('btn', getVariantClass('large'));
      expect(result).toBe('btn btn-lg');
    });

    it('should handle zero and other falsy numbers', () => {
      const result = cn('base', { 'width-0': 0, 'width-1': 1, 'width-false': false });
      expect(result).toBe('base width-1');
    });

    it('should handle string interpolation', () => {
      const size = 'lg';
      const result = cn(`btn-${size}`, 'text-white');
      expect(result).toBe('btn-lg text-white');
    });

    it('should handle responsive and state variants', () => {
      const result = cn(
        'p-4 md:p-6 lg:p-8',
        'hover:bg-blue-500 focus:bg-blue-600',
        'dark:bg-gray-800'
      );
      expect(result).toBe('p-4 md:p-6 lg:p-8 hover:bg-blue-500 focus:bg-blue-600 dark:bg-gray-800');
    });

    it('should handle conflicting responsive classes', () => {
      // tailwind-merge should handle responsive conflicts
      const result = cn('p-4 md:p-6', 'md:p-8');
      expect(result).toBe('p-4 md:p-8');
    });

    it('should handle arbitrary values', () => {
      const result = cn('p-[10px]', 'bg-[#ff0000]', 'w-[calc(100%-20px)]');
      expect(result).toBe('p-[10px] bg-[#ff0000] w-[calc(100%-20px)]');
    });

    it('should handle conflicting arbitrary values', () => {
      const result = cn('p-[10px]', 'p-[20px]');
      expect(result).toBe('p-[20px]');
    });

    it('should handle very long class lists', () => {
      const manyClasses = Array.from({ length: 50 }, (_, i) => `class-${i}`);
      const result = cn(...manyClasses);
      expect(result).toBe(manyClasses.join(' '));
    });

    it('should handle special characters in class names', () => {
      const result = cn('class_with_underscores', 'class-with-dashes', 'class.with.dots');
      expect(result).toBe('class_with_underscores class-with-dashes class.with.dots');
    });

    it('should be consistent with multiple calls', () => {
      const classes = ['btn', { 'active': true }, 'btn-primary'];
      const result1 = cn(...classes);
      const result2 = cn(...classes);
      expect(result1).toBe(result2);
    });

    it('should handle edge case with boolean true as class', () => {
      // This is an edge case that clsx handles
      const result = cn('base', true && 'conditional');
      expect(result).toBe('base conditional');
    });

    it('should handle nested ternary operators', () => {
      const state = 'loading';
      const result = cn(
        'btn',
        state === 'loading' ? 'btn-loading' : state === 'success' ? 'btn-success' : 'btn-default'
      );
      expect(result).toBe('btn btn-loading');
    });
  });

  describe('integration with real-world scenarios', () => {
    it('should handle typical button component classes', () => {
      const variant = 'primary';
      const size = 'md';
      const disabled = false;
      
      const result = cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
        },
        {
          'h-10 px-4 py-2': size === 'md',
          'h-9 px-3': size === 'sm',
          'h-11 px-8': size === 'lg',
        },
        { 'opacity-50 cursor-not-allowed': disabled }
      );

      expect(result).toContain('inline-flex');
      expect(result).toContain('bg-primary');
      expect(result).toContain('h-10');
      // Note: opacity-50 appears in disabled:opacity-50 class but disabled is false
      expect(result).toContain('disabled:opacity-50'); // This is expected
      expect(result).not.toContain('opacity-50 cursor-not-allowed'); // But not the conditional one
    });

    it('should handle card component classes with conflicts', () => {
      const result = cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        'p-6', // This might conflict with conditional padding
        { 'p-4': false, 'p-8': false } // No conflicts since these are false
      );

      expect(result).toBe('rounded-lg border bg-card text-card-foreground shadow-sm p-6');
    });

    it('should handle form input classes', () => {
      const hasError = true;
      const isFocused = false;
      
      const result = cn(
        'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        {
          'border-destructive': hasError,
          'border-input': !hasError,
          'ring-2 ring-ring': isFocused,
        }
      );

      expect(result).toContain('border-destructive');
      expect(result).not.toContain('border-input');
      expect(result).not.toContain('ring-2 ring-ring');
    });
  });
});