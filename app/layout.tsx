import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Cipher Lab — interactive classical cryptography",
  description: "Encrypt, decrypt and see step by step how classical ciphers work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-xs text-soft">
            These classical ciphers are designed for learning and historical study. They are not secure for protecting modern sensitive information.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
