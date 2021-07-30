import { connectToDatabase } from 'cafe-utils/mongodb';
import type { NextApiRequest } from 'next';
import { getSession } from 'next-auth/client'

const handler = async (
  _: any,
  req: NextApiRequest
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
      progress: [],
    }
    await db.collection("users")
      .insertOne(user);
  }
  return user;
}

export default handler;