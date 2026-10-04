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
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

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
          'w-full flex items-center justify-start text-left font-normal transition-all outline-none cursor-pointer',
          'neu-inset rounded-2xl h-10 px-4 py-2.5 text-xs md:text-sm',
          'border-none shadow-[inset_3px_3px_6px_#D1D9E6,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.02)]',
          !parsedDate
            ? 'text-slate-400 dark:text-slate-500'
            : 'text-slate-800 dark:text-white font-medium',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
      >
        <CalendarIcon className="w-4 h-4 mr-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
        {parsedDate ? format(parsedDate, 'PPP') : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-50 bg-white dark:bg-[#1E232B] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10"
        align="start"
      >
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
