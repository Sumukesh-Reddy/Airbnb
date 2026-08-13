import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ToastContainer } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Staybnb – Vacation rentals, cabins, beach houses & more',
    template: '%s | Staybnb',
  },
  description: 'Find and book unique accommodations across India. Beach houses in Goa, mountain cabins in Manali, heritage havelis in Rajasthan, and more.',
  keywords: ['vacation rentals', 'India travel', 'holiday homes', 'Goa', 'Manali', 'Udaipur'],
  openGraph: {
    title: 'Staybnb – Vacation rentals across India',
    description: 'Find and book unique accommodations across India.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
