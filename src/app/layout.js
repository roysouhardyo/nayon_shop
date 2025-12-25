import "./globals.css";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/components/NotificationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "নায়ন শপ | Nayon Shop - Inventory Management",
  description: "Machinery & Hardware Shop Inventory Management System",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
