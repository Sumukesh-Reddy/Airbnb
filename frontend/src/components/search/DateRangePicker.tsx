'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, isAfter, isBefore, addMonths, subMonths, isToday, parseISO
} from 'date-fns';

interface DateRangePickerProps {
  checkIn?: string;
  checkOut?: string;
  onSelect: (checkIn: string, checkOut: string) => void;
  onClose?: () => void;
  bookedDates?: { check_in: string; check_out: string }[];
  compact?: boolean;
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onSelect,
  onClose,
  bookedDates = [],
  compact = false,
}: DateRangePickerProps) {
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(addMonths(new Date(), 1));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const startDate = checkIn ? parseISO(checkIn) : null;
  const endDate = checkOut ? parseISO(checkOut) : null;

  const isBooked = (date: Date) => {
    return bookedDates.some((b) => {
      const ci = parseISO(b.check_in);
      const co = parseISO(b.check_out);
      return !isBefore(date, ci) && isBefore(date, co);
    });
  };

  const isPast = (date: Date) => isBefore(date, new Date()) && !isToday(date);

  const isInRange = (date: Date) => {
    if (!startDate) return false;
    const end = endDate || hoverDate;
    if (!end) return false;
    const [rangeStart, rangeEnd] = isAfter(startDate, end)
      ? [end, startDate]
      : [startDate, end];
    return isAfter(date, rangeStart) && isBefore(date, rangeEnd);
  };

  const isRangeStart = (date: Date) =>
    startDate ? isSameDay(date, startDate) : false;

  const isRangeEnd = (date: Date) => {
    const end = endDate || (hoverDate && startDate ? hoverDate : null);
    return end ? isSameDay(date, end) : false;
  };

  const handleDayClick = (date: Date) => {
    if (isPast(date) || isBooked(date)) return;

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onSelect(format(date, 'yyyy-MM-dd'), '');
    } else {
      // Complete the range
      if (isBefore(date, startDate)) {
        onSelect(format(date, 'yyyy-MM-dd'), format(startDate, 'yyyy-MM-dd'));
      } else {
        onSelect(format(startDate, 'yyyy-MM-dd'), format(date, 'yyyy-MM-dd'));
        onClose?.();
      }
    }
  };

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return (
      <div className="flex-1">
        <div className="text-center font-semibold text-gray-900 mb-4">
          {format(month, 'MMMM yyyy')}
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, month);
            const past = isPast(day);
            const booked = isBooked(day);
            const inRange = isInRange(day);
            const rangeStart = isRangeStart(day);
            const rangeEnd = isRangeEnd(day);
            const today = isToday(day);
            const disabled = past || booked || !isCurrentMonth;

            return (
              <div
                key={i}
                className={`relative flex items-center justify-center h-9
                  ${inRange ? 'bg-gray-100' : ''}
                  ${(rangeStart || rangeEnd) ? 'z-10' : ''}
                `}
              >
                <button
                  onClick={() => !disabled && handleDayClick(day)}
                  onMouseEnter={() => !disabled && setHoverDate(day)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={disabled}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-150
                    ${!isCurrentMonth ? 'invisible' : ''}
                    ${disabled && isCurrentMonth ? 'text-gray-300 cursor-not-allowed line-through' : ''}
                    ${rangeStart || rangeEnd
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : ''}
                    ${today && !rangeStart && !rangeEnd
                      ? 'border-2 border-gray-900 font-bold'
                      : ''}
                    ${!disabled && !rangeStart && !rangeEnd && isCurrentMonth
                      ? 'hover:bg-gray-100 text-gray-700'
                      : ''}
                    ${inRange && !rangeStart && !rangeEnd ? 'text-gray-700' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setLeftMonth(subMonths(leftMonth, 1));
              setRightMonth(subMonths(rightMonth, 1));
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setLeftMonth(addMonths(leftMonth, 1));
              setRightMonth(addMonths(rightMonth, 1));
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-8">
          {renderMonth(leftMonth)}
          {renderMonth(rightMonth)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            setLeftMonth(subMonths(leftMonth, 1));
            setRightMonth(subMonths(rightMonth, 1));
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex gap-12">
          {renderMonth(leftMonth)}
          {renderMonth(rightMonth)}
        </div>

        <button
          onClick={() => {
            setLeftMonth(addMonths(leftMonth, 1));
            setRightMonth(addMonths(rightMonth, 1));
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        {(checkIn || checkOut) && (
          <button
            onClick={() => {
              onSelect('', '');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 
              underline transition-colors"
          >
            Clear dates
          </button>
        )}
        {checkIn && checkOut && (
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl
              hover:bg-gray-800 transition-colors"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
}
