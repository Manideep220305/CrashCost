// Shadcn-style classname merge utility
// Usage: cn("base-class", conditional && "extra-class", "override-class")
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
