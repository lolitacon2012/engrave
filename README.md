This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Requirement

This project runs on MongoDB. You need to create a MongoDB instance.

Table name: Please refer to utils/mongodb.ts
Required collections: "decks", "users", "words" and "inviteCodes"

## Environment var

MONGODB_URI=mongodb+srv://(your mongo db uri here)
GOOGLE_CLIENT_ID=blablabla
GOOGLE_CLIENT_SECRET=blablabla
NEXTAUTH_URL=http://localhost:3000

REMEMBER: you need to change NEXTAUTH_URL when deploying to production!
