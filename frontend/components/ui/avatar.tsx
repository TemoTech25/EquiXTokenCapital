import { cn } from '@/lib/utils';

type AvatarProps = {
  name: string;
  className?: string;
};

export function Avatar({ name, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-xs font-semibold text-slate-700',
        className
      )}
    >
      {initials}
    </div>
  );
}
