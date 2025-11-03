// src/components/ui/Button.jsx
import { cn } from 'tailwind-merge';

export const Button = ({ children, className, variant = 'primary', ...props }) => {
  const base = 'px-6 py-3 rounded-xl font-semibold transition-all';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    ghost: 'text-blue-600 hover:underline',
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};