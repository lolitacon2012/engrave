
import { CreateWordsRequestData, CreateWordsResponseData } from 'cafe-types/rpc/words';
import { connectToDatabase } from 'cafe-utils/mongodb';
import type { NextApiRequest } from 'next';
import { v4 as uuid } from 'uuid';

const handler = async (
  data: CreateWordsRequestData,
): Promise<CreateWordsResponseData> => {
  const {deck_id, contents} = data;
  const newUuids = [] as string[];
  const now = new Date().getTime();
  const newWords = contents.map(c => {
    const newId = uuid();
    newUuids.push(newId);
    return {
      id: newId,
      deck_id,
      created_at: now,
      edited_at: now,
      content: c
    }
  })

  const { db } = await connectToDatabase();
  await db.collection("words")
      .insertMany(newWords)
  return {
    newIds: newUuids
  };
}

export default handler;