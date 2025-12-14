import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";

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
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </NextIntlClientProvider>
  );
}
