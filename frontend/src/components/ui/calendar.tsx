import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 bg-white dark:bg-[#1E232B] rounded-2xl select-none', className)}
      classNames={{
        root: 'w-fit',
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-3',
        month_caption: 'flex justify-center pt-1 relative items-center mb-3 h-7',
        caption_label: 'text-sm font-semibold text-slate-800 dark:text-slate-100 select-none',
        nav: 'space-x-1 flex items-center',
        button_previous: cn(
          'absolute left-1 h-7 w-7 bg-transparent p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          'flex items-center justify-center rounded-lg border border-slate-200/60 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors outline-none focus:outline-none'
        ),
        button_next: cn(
          'absolute right-1 h-7 w-7 bg-transparent p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          'flex items-center justify-center rounded-lg border border-slate-200/60 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors outline-none focus:outline-none'
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
            return <ChevronLeft className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
          }
          return <ChevronRight className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
