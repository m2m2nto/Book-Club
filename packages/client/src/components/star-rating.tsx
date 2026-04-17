import { Star } from 'lucide-react';

import { cn } from '../lib/utils';

type StarRatingProps = {
  value: number;
  onChange?: (score: number) => void;
};

export const StarRating = ({ value, onChange }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((score) => (
        <button
          aria-label={`Rate ${score} star${score === 1 ? '' : 's'}`}
          key={score}
          className="rounded-[var(--radius-md)] p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(29,78,216,0.22)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          onClick={() => onChange?.(score)}
          type="button"
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              score <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-600',
            )}
          />
        </button>
      ))}
    </div>
  );
};
