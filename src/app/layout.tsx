import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider} from '@/contexts/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from '@/contexts/NotificationContext';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FleetMaster - Smart Fleet Management',
  description: 'Streamline your fleet operations with FleetMaster',
};

export default function RootLayout({
  
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <NotificationProvider>
        <AuthProvider>
          <Navbar />
            {children}
          
            <Footer/>
          <Toaster />
        </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}