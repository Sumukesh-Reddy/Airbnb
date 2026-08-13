import { format, differenceInDays, parseISO, isAfter, isBefore, addDays } from 'date-fns';

export function formatPrice(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const ci = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const co = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  return Math.max(0, differenceInDays(co, ci));
}

export function calculateTotal(
  pricePerNight: number,
  nights: number,
  cleaningFee: number,
  serviceFeeRate = 0.12
): {
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
} {
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round((subtotal + cleaningFee) * serviceFeeRate);
  const total = subtotal + cleaningFee + serviceFee;
  return { subtotal, cleaningFee, serviceFee, total };
}

export function isDateBooked(
  date: Date,
  bookedDates: { check_in: string; check_out: string }[]
): boolean {
  return bookedDates.some((b) => {
    const ci = parseISO(b.check_in);
    const co = parseISO(b.check_out);
    return !isBefore(date, ci) && isBefore(date, co);
  });
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    villa: 'Villa',
    cabin: 'Cabin',
    beach_house: 'Beach House',
    treehouse: 'Treehouse',
    houseboat: 'Houseboat',
    farm_stay: 'Farm Stay',
    heritage: 'Heritage',
    studio: 'Studio',
  };
  return labels[type] || type;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}
