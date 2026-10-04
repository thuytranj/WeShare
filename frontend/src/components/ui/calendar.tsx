import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('p-3 bg-white dark:bg-[#1E232B] rounded-2xl select-none', className)}
      classNames={{
        root: 'w-fit',
        months: 'relative flex flex-col gap-4',
        month: 'space-y-4',
        month_caption: 'flex items-center justify-center h-7 w-full',
        dropdowns: 'flex items-center justify-center gap-1 text-sm font-medium',
        dropdown_root: 'relative rounded-md inline-flex items-center',
        dropdown: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10',
        caption_label:
          'flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors select-none',
        nav: 'flex items-center justify-between absolute top-0 inset-x-0 w-full h-7 pointer-events-none z-10 px-1',
        button_previous: cn(
          'pointer-events-auto h-7 w-7 bg-transparent p-0 flex items-center justify-center rounded-md',
          'border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800',
          'text-slate-600 dark:text-slate-300 transition-colors opacity-70 hover:opacity-100 outline-none focus:outline-none'
        ),
        button_next: cn(
          'pointer-events-auto h-7 w-7 bg-transparent p-0 flex items-center justify-center rounded-md',
          'border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800',
          'text-slate-600 dark:text-slate-300 transition-colors opacity-70 hover:opacity-100 outline-none focus:outline-none'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex justify-between w-full mb-1',
        weekday: 'text-slate-400 dark:text-slate-500 rounded-md w-9 font-medium text-[0.8rem] text-center select-none',
        week: 'flex w-full mt-1.5 justify-between',
        day: cn(
          'h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center',
          '[&[data-selected=true]_button]:bg-[#8B70DF] [&[data-selected=true]_button]:text-white [&[data-selected=true]_button]:hover:bg-[#7C3AED] [&[data-selected=true]_button]:hover:text-white [&[data-selected=true]_button]:font-semibold [&[data-selected=true]_button]:shadow-sm',
          '[&[data-today=true]:not([data-selected=true])_button]:text-[#8B70DF] [&[data-today=true]:not([data-selected=true])_button]:font-bold [&[data-today=true]:not([data-selected=true])_button]:ring-1 [&[data-today=true]:not([data-selected=true])_button]:ring-[#8B70DF]/40',
          '[&[data-outside=true]_button]:text-slate-300 dark:[&[data-outside=true]_button]:text-slate-600 [&[data-outside=true]_button]:opacity-40'
        ),
        day_button: cn(
          'h-9 w-9 p-0 font-normal rounded-xl inline-flex items-center justify-center text-slate-700 dark:text-slate-200',
          'hover:bg-[#8B70DF]/15 hover:text-[#8B70DF] dark:hover:bg-[#8B70DF]/20 dark:hover:text-[#A78BFA] transition-all outline-none focus:outline-none select-none text-xs md:text-sm'
        ),
        disabled: 'text-slate-300 dark:text-slate-600 opacity-30 pointer-events-none',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          if (orientation === 'left') {
            return <ChevronLeft size={16} className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
          }
          if (orientation === 'right') {
            return <ChevronRight size={16} className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
          }
          return <ChevronDown size={14} className={cn('h-3.5 w-3.5 ml-1 text-slate-400', chevronClassName)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
