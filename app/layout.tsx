import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Q Door — דלתות פרימיום בהתאמה אישית',
  description: 'דלתות פרימיום בהתאמה אישית. עיצוב, איכות ואמינות — בכל דלת.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
