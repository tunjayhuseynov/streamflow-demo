import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3ConnectionAdapter } from "@/providers/ConnectionAdapter";
import Navbar from "@/components/navbar";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Streamflow Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className.concat(" dark")}>
        <Web3ConnectionAdapter>
          <Navbar />
          {children}
        </Web3ConnectionAdapter>
        <ToastContainer theme="dark" />
      </body>
    </html>
  );
}
