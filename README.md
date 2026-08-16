This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Переменные окружения

| Переменная | Обязательна | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | да | Строка подключения к Postgres (Neon/Supabase) |
| `JWT_SECRET` | **да, в production** | Ключ подписи сессионных cookie и билетов теста. Минимум 32 символа. Без него приложение в production не стартует (fail-closed), иначе сессии можно подделать. |
| `ADMIN_EMAIL` | нет | Резервный админ-доступ по email. Основной способ — роль `ADMIN` в базе. Используется только на сервере. |
| `NEXT_PUBLIC_APP_URL` | нет | Публичный адрес приложения |

Сгенерировать секрет: `openssl rand -base64 48`.

При деплое на Vercel эти переменные задаются в Project → Settings → Environment Variables.
Смена `JWT_SECRET` инвалидирует все активные сессии — пользователям потребуется войти заново.

## Модель доступа

- Все проверки прав живут в [`src/lib/access.ts`](src/lib/access.ts) и читают пользователя из БД, а не из cookie (роль и подписка в токене могут устареть до 2 часов).
- Вопросы выдаются через [`src/app/actions/tests.ts`](src/app/actions/tests.ts): правильные ответы клиенту не отправляются, а результат считается на сервере по подписанному «билету» теста.
- Экшены в `src/app/actions/admin.ts`, работающие с ответами и пользователями, требуют роли администратора.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
