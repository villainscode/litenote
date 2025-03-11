import type { Metadata } from "next";
import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Script from 'next/script';

config.autoAddCss = false;

const notoSans = Noto_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "Lite Note",
  description: "VS Code style note taking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <Script src="/editor.js" />
      </head>
      <body className={`${notoSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
} 