import { UpdateUserInfoRequestData } from 'cafe-types/rpc/user';
import { getLocaleFromAcceptLanguagesHeader } from 'cafe-utils/i18n';
import { connectToDatabase } from 'cafe-utils/mongodb';
import type { NextApiRequest } from 'next';
import { getSession } from 'next-auth/client'

const getUserInfo = async (
  _: any,
  req: NextApiRequest
) => {
  const session = await getSession({ req });
  const email = session?.user?.email || '' as string;
  const { db } = await connectToDatabase();
  const now = new Date().getTime();
  let user = null;
  if (email) {
    user = await db.collection("users")
      .findOne({ id: email })
  }
  if (!user) {
    const supportedLocales = req?.headers['accept-language'] || 'en-US,en;q=0.9';
    const locale = getLocaleFromAcceptLanguagesHeader(supportedLocales);
    user = {
      id: email,
      registerTime: now,
      locale,
      owningDeckIds: [],
      studyingDeckIds: [],
      progress: [],
    }
    await db.collection("users")
      .insertOne(user);
  }

  // flatten progress from array to object
  const originalProgress = [...(user.progress || [])];
  const newUserProgress: { [key: string]: any } = {};
  originalProgress.forEach(p => {
    newUserProgress[p.id] = p.progress;
  })
  user.progress = newUserProgress;
  return user;
}

const updateUserInfo = async (
  data: UpdateUserInfoRequestData,
  req: NextApiRequest,
) => {
  const session = await getSession({ req });
  const email = session?.user?.email || '' as string;
  const { db } = await connectToDatabase();

  // unflatten progress from object to array
  const originalProgress = { ...data.progress };
  const newUserProgress: { id: string, progress: any }[] = [];
  Object.keys(originalProgress).forEach(id => {
    newUserProgress.push({
      id, progress: originalProgress[id]
    })
  })


  await db.collection("users")
    .updateOne({ id: email },
      {
        $set: {
          ...data,
          ...(data.progress ? {progress: newUserProgress} : {})
        }
      })
}

export { getUserInfo, updateUserInfo };