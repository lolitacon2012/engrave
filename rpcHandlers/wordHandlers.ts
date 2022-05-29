
import { WordContent } from 'cafe-types/deck';
import { UpdateWordsByIdsRequestData } from 'cafe-types/rpc/words';

import { RPCError } from 'cafe-types/rpc/error';
import { CreateWordsRequestData, CreateWordsResponseData } from 'cafe-types/rpc/words';
import { connectToDatabase } from 'cafe-utils/mongodb';
import { Db } from 'mongodb';
import type { NextApiRequest } from 'next';
import { v4 as uuid } from 'uuid';
import { getDeckByIds } from './deckHandlers';
import { getSession } from 'next-auth/react';
import { getHashedEmail } from 'cafe-utils/hash';

const MAX_WORD_FIELD_LENGTH = 128;
const MAX_CUSTOMIZED_FIELD_FIELD_LENGTH = 1000;

const wordChecker = async (deckId: string, userId: string, contents: WordContent[], db: Db): Promise<RPCError> => {
  if (!deckId) {
    return {
      error: 'error_empty_deck_id'
    }
  }

  const { data: decks } = await getDeckByIds({ ids: [deckId] });
  const deckCreator = decks?.[0].creator_id;
  if (deckCreator !== userId) {
    return {
      error: 'error_user_does_now_own_this_deck'
    }
  }

  for (let i = 0; i < contents.length; i++) {
    const currentContent = contents[i];
    if ((currentContent.meaning?.length || 0) > MAX_WORD_FIELD_LENGTH) {
      return { error: 'error_word_meaning_too_long' }
    }
    if ((currentContent.word?.length || 0) > MAX_WORD_FIELD_LENGTH) {
      return { error: 'error_word_word_too_long' }
    }
    if ((JSON.stringify(currentContent.customized_fields || {}).length) > MAX_CUSTOMIZED_FIELD_FIELD_LENGTH) {
      return { error: 'error_word_customized_field_too_large' }
    }
  }

  return { error: '' }
}

const checkWordOwnership = async (wordIds: string[], userId: string, db: Db) => {
  const allWords = await db.collection("words")
    .find({ id: { $in: wordIds } }).toArray();
    
  const isOwnWords = allWords.every((w) => w.creator_id === userId);
  return {
    error: isOwnWords ? '' : 'error_user_does_now_own_some_words'
  }
}


const createWords = async (
  data: CreateWordsRequestData,
  req: NextApiRequest,
): Promise<{ data: CreateWordsResponseData } | RPCError> => {
  try {
    const { deck_id, contents } = data;
    const newUuids = [] as string[];
    const now = new Date().getTime();
    const session = await getSession({ req });
    const hashedEmail = getHashedEmail(session?.user?.email || '');
    const newWords = contents.map(c => {
      const newId = uuid();
      newUuids.push(newId);
      return {
        id: newId,
        deck_id,
        created_at: now,
        edited_at: now,
        creator_id: hashedEmail,
        content: c
      }
    })

    const { db } = await connectToDatabase();
    const error = await wordChecker(deck_id, hashedEmail, contents, db)
    if (error.error) {
      return error;
    }
    await db.collection("words")
      .insertMany(newWords)

    await db.collection("users").updateMany({

    },
      {//@ts-ignore
        $push: {
          "progress.$[x].progress.level_0": { $each: newUuids }
        }
      },
      { arrayFilters: [{ "x.id": deck_id }] })

    return {
      data: { newIds: newUuids },
      error: ''
    };
  } catch (err: any) {
    return { error: err.toString() }
  }
}

const updateWordsByIds = async (
  data: UpdateWordsByIdsRequestData,
  req: NextApiRequest,
) => {
  try {
    const session = await getSession({ req });
    const hashedEmail = getHashedEmail(session?.user?.email || '');
    let words = data.words || [];
    let wordIdsToDelete = data.wordIdsToDelete || [];
    const now = new Date().getTime();
    words = words.map(w => {
      return {
        id: w.id,
        content: { ...w.content },
        edited_at: now,
      }
    })
    const { db } = await connectToDatabase();
    const error = await checkWordOwnership([...((data.words || []).map(w => w.id)), ...wordIdsToDelete], hashedEmail, db);
    if (error.error) {
      return error;
    }
    const wordsBulkArr = [];
    for (const i of words) {
      wordsBulkArr.push({
        updateOne: {
          "filter": { "id": i.id },
          "update": { $set: i }
        }
      })
    }
    for (const id of wordIdsToDelete) {
      wordsBulkArr.push({
        deleteOne: {
          "filter": { "id": id }
        }
      })
    }
    if (wordsBulkArr.length > 0) {
      await db.collection("words").bulkWrite(wordsBulkArr);
    }
    if (wordIdsToDelete.length > 0) {
      let pullOperation: any = {};
      for (let lv = 0; lv <= 10; lv++) {
        pullOperation["progress.$[].progress.level_" + lv] = {
          $in: [...wordIdsToDelete]
        };
      }
      await db.collection("users").updateMany({},
        {//@ts-ignore
          $pull: { ...pullOperation }
        })
    }
    return { error: '' }
  } catch (err: any) {
    return { error: err.toString() }
  }
}

export { updateWordsByIds, createWords };