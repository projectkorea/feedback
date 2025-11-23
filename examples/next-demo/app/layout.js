import './globals.css';

export const metadata = {
  title: 'Feedback SDK - Next.js Demo',
  description: 'Next.js App Router demo with multi-platform notification system'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
