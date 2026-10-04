import * as React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (dateString: string, date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';
  startMonth?: Date;
  endMonth?: Date;
  fromYear?: number;
  toYear?: number;
  disabledDates?: (date: Date) => boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  id,
  captionLayout = 'dropdown',
  startMonth,
  endMonth,
  fromYear = 1920,
  toYear,
  disabledDates,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const currentYear = new Date().getFullYear();
  const calculatedStartMonth = startMonth ?? (fromYear ? new Date(fromYear, 0) : new Date(1920, 0));
  const calculatedEndMonth = endMonth ?? (toYear ? new Date(toYear, 11) : new Date(currentYear, 11));

  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return isValid(value) ? value : undefined;
    const trimmed = typeof value === 'string' ? value.split('T')[0] : '';
    if (!trimmed) return undefined;
    const parsed = parseISO(trimmed);
    if (isValid(parsed)) return parsed;
    const d = new Date(trimmed);
    return isValid(d) ? d : undefined;
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.('', undefined);
    } else {
      const formatted = format(selectedDate, 'yyyy-MM-dd');
      onChange?.(formatted, selectedDate);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn(
          'w-full flex h-10 items-center justify-start text-left font-normal transition-all outline-none cursor-pointer',
          'neu-inset rounded-2xl px-4 py-2.5 text-xs md:text-sm font-medium',
          'border-none shadow-[inset_3px_3px_6px_#D1D9E6,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.02)]',
          !parsedDate
            ? 'text-slate-400 dark:text-slate-500'
            : 'text-slate-800 dark:text-white',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
      >
        <CalendarIcon className="w-4 h-4 mr-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
        {parsedDate ? (
          <span>{format(parsedDate, 'PPP')}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-50 bg-white dark:bg-[#1E232B] rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 outline-none"
        align="start"
      >
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={handleSelect}
          captionLayout={captionLayout}
          startMonth={calculatedStartMonth}
          endMonth={calculatedEndMonth}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}
