import "@/styles/globals.css";
import { type Metadata } from "next";
import { Geologica } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Luma",
  description: "Luma",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geologica = Geologica({
  subsets: ["latin"],
  variable: "--font-geologica",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={geologica.variable}>
          <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
          >
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster richColors expand={true} duration={4000} />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
