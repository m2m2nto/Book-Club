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
          key={score}
          className="rounded-md p-1"
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
