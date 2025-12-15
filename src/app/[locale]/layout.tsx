import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!["ru", "uz"].includes(locale)) {
    notFound();
  }
  let messages: any;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (e) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-10 flex-1 w-full">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}

