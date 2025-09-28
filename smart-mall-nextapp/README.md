# SmartMall - Next.js E-commerce Platform

This is a modern e-commerce platform built with [Next.js](https://nextjs.org) and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Firebase Environment Setup

Dự án này sử dụng **Firebase Authentication (Google Login)**.  
Để cấu hình Firebase, bạn cần tạo file **`.env.local`** ở thư mục gốc và thêm các biến môi trường sau:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBK3oM8a0b11XF0u56CxuCZJcZ6bdJrr-M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smartmall-96317.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=smartmall-96317
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smartmall-96317.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=564078017267
NEXT_PUBLIC_FIREBASE_APP_ID=1:564078017267:web:c61ff32654d44d8dc1d586
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CNSE8DZX6R


## run the development server:

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


