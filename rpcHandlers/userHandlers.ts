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
      owningSetIds: [],
      studyingSetIds: [],
      progress: [],
    }
    await db.collection("users")
      .insertOne(user);
  }
  return user;
}

const updateUserInfo = async (
  data: UpdateUserInfoRequestData,
  req: NextApiRequest,
) => {
  const session = await getSession({ req });
  const email = session?.user?.email || '' as string;
  const { db } = await connectToDatabase();

  await db.collection("users")
    .updateOne({ id: email },
      {
        $set: {
          ...data
        }
      })
}

export { getUserInfo, updateUserInfo };