import { Search, Home, Heart } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'search' | 'home' | 'heart';
  action?: React.ReactNode;
}

const icons = {
  search: Search,
  home: Home,
  heart: Heart,
};

export default function EmptyState({
  title,
  description,
  icon = 'search',
  action,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
