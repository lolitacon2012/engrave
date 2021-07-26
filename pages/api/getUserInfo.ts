// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from 'cafe-utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserData } from 'cafe-types/userData';
import withAuth from './middleware/auth';
import { getSession } from 'next-auth/client'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<UserData>
) => {
  const session = await getSession({ req });
  const email = session?.user?.email || '' as string;
  const { db } = await connectToDatabase();
  let user = null;
  if (email) {
    user = await db.collection("users")
      .findOne({ id: email })
  }
  if(!user){
    user = {
      id: email,
      registerTime: new Date().getTime(),
      owningSetIds: [],
      studyingSetIds: [],
    }
    await db.collection("users")
      .insertOne(user);
  }
  res.json(user);
}

export default withAuth(handler);