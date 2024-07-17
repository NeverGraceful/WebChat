import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...rest }, ref) => {
    return (
      <input
        className={`py-1 px-2 border border-gray-400 focus:border-blue-500 outline-none rounded w-full ${className}`}
        {...rest}
        ref={ref}
      />
    );
  }
);

Input.displayName = 'Input';
