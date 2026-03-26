import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Providers from '@/components/providers/SessionProvider';

export const metadata = {
  title: 'Made-to-Order Restaurant',
  description: 'ระบบรับออเดอร์ร้านอาหาร',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        {/* Background image — fixed, จางมาก ไม่บดบัง content */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/พื้นหลังร้านอาหาร.jpg')",
            opacity: 0.07,
          }}
        />
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
