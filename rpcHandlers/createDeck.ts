
import { CreateDeckRequestData } from 'cafe-types/rpc/deck';
import { Word } from 'cafe-types/set';
import { connectToDatabase } from 'cafe-utils/mongodb';
import type { NextApiRequest } from 'next';
import { getSession } from 'next-auth/client'
import { v4 as uuid } from 'uuid';

const handler = async (
  data: CreateDeckRequestData,
  req: NextApiRequest
) => {
  const session = await getSession({ req });
  const email = session?.user?.email || '' as string;
  const avatar = session?.user?.image || '' as string;
  const name = session?.user?.name || '' as string;
  let newDeck = data.deck;
  const newDeckId = uuid();
  const now = new Date().getTime();
  newDeck.id = newDeckId;
  newDeck.created_at = now;
  newDeck.creator_id = email;
  newDeck.creator_avatar = avatar;
  newDeck.creator_name = name;
  newDeck.edited_at = now;
  const newWords: Word[] = [];
  const receivedNewDeckWords = data.words;
  const newDeckWordsIds: string[] = [];
  (receivedNewDeckWords || []).forEach((w) => {
    let word = w;
    word.created_at = now;
    const newWordId = uuid();
    word.id = newWordId
    word.set_id = newDeckId;
    word.content = {
      word: word.content?.word || '',
      meaning: word.content?.meaning || '',
      customized_fields: word.content?.customized_fields || [],
    }
    newWords.push(word);
    newDeckWordsIds.push(newWordId);
  });
  // @ts-ignore
  newDeck.words = newDeckWordsIds;
  const { db } = await connectToDatabase();
  await Promise.all([db.collection("decks")
    .insertOne(newDeck), db.collection("users").updateOne({ id: email },
      {
        $push: { owningSetIds: newDeck.id },
      }), db.collection("words")
      .insertMany(newWords)])
  return newDeck;
}

export default handler;