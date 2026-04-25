import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import StarryBackground from './components/StarryBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-space' 
});

export const metadata: Metadata = {
  title: 'SpacyApps — Space Age Digital Studio',
  description: 'Building the future from orbit.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <StarryBackground />
        {children}
      </body>
    </html>
  );
}
