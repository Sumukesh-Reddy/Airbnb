'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [pickerMode, setPickerMode] = useState<'dates' | 'flexible'>('dates');
  const [flexDays, setFlexDays] = useState<number>(0);

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
      onSelect(format(date, 'yyyy-MM-dd'), '');
    } else {
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
      <div className="flex-1 min-w-[260px]">
        {/* Month Name */}
        <div className="text-center font-bold text-gray-900 text-sm mb-4">
          {format(month, 'MMMM yyyy')}
        </div>

        {/* Day Column Headers (S M T W T F S) */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days 7-Column Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, month);
            const past = isPast(day);
            const booked = isBooked(day);
            const inRange = isInRange(day);
            const rangeStart = isRangeStart(day);
            const rangeEnd = isRangeEnd(day);
            const disabled = past || booked || !isCurrentMonth;

            return (
              <div
                key={i}
                className={`relative flex items-center justify-center h-10 w-10 mx-auto
                  ${inRange && isCurrentMonth ? 'bg-gray-100' : ''}
                `}
              >
                <button
                  onClick={() => !disabled && handleDayClick(day)}
                  onMouseEnter={() => !disabled && setHoverDate(day)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={disabled}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-150
                    ${!isCurrentMonth ? 'invisible pointer-events-none' : ''}
                    ${disabled && isCurrentMonth ? 'text-gray-300 cursor-not-allowed pointer-events-none' : ''}
                    ${rangeStart || rangeEnd
                      ? 'bg-gray-900 text-white shadow-md'
                      : ''}
                    ${!disabled && !rangeStart && !rangeEnd && isCurrentMonth
                      ? 'hover:bg-gray-100 text-gray-800'
                      : ''}
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

  return (
    <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 ${compact ? 'p-4' : 'p-6 max-w-2xl w-full'}`}>
      {/* Top Toggle Pill: [ Dates | Flexible ] (Screenshot 2) */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-full flex items-center gap-1 text-xs font-semibold text-gray-700">
          <button
            onClick={() => setPickerMode('dates')}
            className={`px-6 py-2 rounded-full transition-all ${
              pickerMode === 'dates' ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dates
          </button>
          <button
            onClick={() => setPickerMode('flexible')}
            className={`px-6 py-2 rounded-full transition-all ${
              pickerMode === 'flexible' ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Flexible
          </button>
        </div>
      </div>

      {/* Dual Month Calendar Display */}
      <div className="relative">
        {/* Navigation Arrows */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-1">
          <button
            onClick={() => {
              setLeftMonth(subMonths(leftMonth, 1));
              setRightMonth(subMonths(rightMonth, 1));
            }}
            className="pointer-events-auto p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => {
              setLeftMonth(addMonths(leftMonth, 1));
              setRightMonth(addMonths(rightMonth, 1));
            }}
            className="pointer-events-auto p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          {renderMonth(leftMonth)}
          {!compact && renderMonth(rightMonth)}
        </div>
      </div>

      {/* Bottom Flexible Range Pills (Screenshot 2) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-gray-100 mt-6">
        {[
          { label: 'Exact dates', val: 0 },
          { label: '± 1 day', val: 1 },
          { label: '± 2 days', val: 2 },
          { label: '± 3 days', val: 3 },
          { label: '± 7 days', val: 7 },
          { label: '± 14 days', val: 14 },
        ].map((flexOption) => (
          <button
            key={flexOption.label}
            onClick={() => setFlexDays(flexOption.val)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              flexDays === flexOption.val
                ? 'border-2 border-gray-900 bg-white text-gray-900 shadow-sm'
                : 'border border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
            }`}
          >
            {flexOption.label}
          </button>
        ))}
      </div>
    </div>
  );
}
