import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'bg-emerald-500 text-white',
        'px-8 py-2 leading-6',
        'rounded-full',
        'font-semibold tracking-wide',
        'cursor-pointer',
        'inline-flex items-center justify-center',
        'relative shadow-lg shadow-emerald-200',
        'gap-2',
        //hover
        'transition-colors',
        'hover:text-accent-foreground hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-300',
        //focus
        'ring-emerald-400 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'focus:scale-[0.98]',
        //disabled
        'disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:shadow-none',

        className,
      )}
      {...rest}
    />
  );
}
//inline-flex items-center justify-center gap-2 whitespace-nowrap   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-background shadow-sm  h-10 px-8 py-6 text-lg rounded-full border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50
