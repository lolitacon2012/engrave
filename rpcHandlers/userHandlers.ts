import { UpdateUserInfoRequestData } from 'cafe-types/rpc/user';
import { getHashedEmail } from 'cafe-utils/hash';
import { getLocaleFromAcceptLanguagesHeader } from 'cafe-utils/i18n';
import { connectToDatabase } from 'cafe-utils/mongodb';
import type { NextApiRequest } from 'next';
import { getSession } from 'next-auth/client'

const getUserInfo = async (
  _: any,
  req: NextApiRequest
) => {
  try {
    const session = await getSession({ req });
    const hashedEmail = getHashedEmail(session?.user?.email || '');
    const avatar = session?.user?.image;
    const name = session?.user?.name;
    const { db } = await connectToDatabase();
    const now = new Date().getTime();
    let user = null;

    if (session?.user?.email) {
      user = await db.collection("users")
        .findOne({ id: hashedEmail })
    }
    if (!user) {
      const supportedLocales = req?.headers['accept-language'] || 'en-US,en;q=0.9';
      const locale = getLocaleFromAcceptLanguagesHeader(supportedLocales);
      user = {
        id: hashedEmail,
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
    user.avatar = avatar;
    user.name = name;
    return {
      data: user, error: ''
    };
  } catch (err) {
    return {
      error: err.toString()
    }
  }
}

const updateUserInfo = async (
  data: UpdateUserInfoRequestData,
  req: NextApiRequest,
) => {
  try {
    const session = await getSession({ req });
    const hashedEmail = getHashedEmail(session?.user?.email || '');
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
      .updateOne({ id: hashedEmail },
        {
          $set: {
            ...data,
            ...(data.progress ? { progress: newUserProgress } : {})
          }
        })
    return { error: '' }
  } catch (err) {
    return { error: err.toString() }
  }
}

export { getUserInfo, updateUserInfo };
