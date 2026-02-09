/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */
/**
 * Horizontal divider with centered text label.
 * Used to separate form sections (e.g. "Or continue with").
 *
 * @param props - Component props
 * @param props.text - Text to display centered on the divider
 * @returns Styled divider with overlaid text
 */
export function DividerWithText({ text }: { text: string }) {
  return (
    <div className='relative my-6'>
      <div className='absolute inset-0 flex items-center'>
        <div className='w-full border-t border-slate-200' />
      </div>
      <div className='relative flex justify-center text-sm'>
        <span className='bg-white px-4 text-slate-500 select-none'>{text}</span>
      </div>
    </div>
  );
}
