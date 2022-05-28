
import { CreateDeckRequestData, UpdateDeckRequestData } from 'cafe-types/rpc/deck';

import { GetDeckByIdsRequestData } from 'cafe-types/rpc/deck';
import { Deck, Word } from 'cafe-types/deck';
import { connectToDatabase } from 'cafe-utils/mongodb';
import type { NextApiRequest } from 'next';
import { getSession } from 'next-auth/react'
import { v4 as uuid } from 'uuid';
import { Db } from 'mongodb';
import { RPCError } from 'cafe-types/rpc/error';
import { getHashedEmail } from 'cafe-utils/hash';
import { NEW_PROGRESS_TEMPLATE } from 'cafe-constants/index';
import { StudyProgress } from 'cafe-types/study';

const MAX_WORD_SIZE = 1000;

const deckChecker = async (deck: Partial<Deck>, userId: string, db: Db): Promise<RPCError> => {
  if (!deck.id) {
    return {
      error: 'error_empty_deck_id'
    }
  }


  const { data: decks } = await getDeckByIds({ ids: [deck.id] });
  const deckCreator = decks && decks[0]?.creator_id;
  if (decks?.[0] && deckCreator !== userId) {
    return {
      error: 'error_user_does_now_own_this_deck'
    }
  }

  if (deck.name !== undefined && !deck.name?.length) {
    return {
      error: 'error_deck_name_empty'
    }
  }

  if (deck.name !== undefined && deck.name?.length > 256) {
    return {
      error: 'error_deck_name_size_too_large'
    }
  }

  if (deck.color !== undefined && (!deck.color?.length || deck.color?.length > 7)) {
    return {
      error: 'error_deck_color_error'
    }
  }

  const avatar = deck.avatar || '';
  const base64Length = avatar.length - (avatar.indexOf(',') + 1);
  const padding = (avatar.charAt(avatar.length - 2) === '=') ? 2 : ((avatar.charAt(avatar.length - 1) === '=') ? 1 : 0);
  const fileSize = base64Length * 0.75 - padding;

  if (fileSize > 800000) {
    return {
      error: 'error_deck_avatar_size_too_large'
    }
  }

  if (deck.words && (deck.words?.length > MAX_WORD_SIZE)) {
    return {
      error: 'error_word_list_length_too_large'
    }
  }

  return { error: '' }
}

const createDeck = async (
  data: CreateDeckRequestData,
  req: NextApiRequest
) => {
  try {
    const session = await getSession({ req });
    const hashedEmail = getHashedEmail(session?.user?.email || '');
    const avatar = session?.user?.image || '';
    const name = session?.user?.name || '';
    let newDeck = data.deck;
    const newDeckId = uuid();
    const now = new Date().getTime();
    newDeck.id = newDeckId;
    newDeck.created_at = now;
    newDeck.creator_id = hashedEmail;
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
      word.deck_id = newDeckId;
      word.creator_id = hashedEmail;
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
    const NEW_PROGRESS: StudyProgress = {
      deck_id: newDeckId,
      started_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      ...NEW_PROGRESS_TEMPLATE,
      level_0: newDeckWordsIds,
    }
    const { db } = await connectToDatabase();
    let error = await deckChecker(newDeck, hashedEmail, db);
    if (!error.error) {

      await Promise.all([db.collection("decks")
        .insertOne(newDeck), db.collection("users").updateOne({ id: hashedEmail },
          {
            $push: {
              owningDeckIds: newDeck.id, progress: {
                id: newDeckId,
                progress: NEW_PROGRESS
              }
            },
          }), db.collection("words")
            .insertMany(newWords)])

    } else {
      return error;
    }
    return {
      ...error,
      data: newDeck,
    };
  } catch (err: any) {
    return { error: err.toString() }
  }
}

const updateDeckById = async (
  data: UpdateDeckRequestData,
  req: NextApiRequest
) => {
  try {
    const { id, wordIds, name, avatar, color } = data;
    const session = await getSession({ req });
    const now = new Date().getTime();
    const { db } = await connectToDatabase();
    const hashedEmail = getHashedEmail(session?.user?.email || '');
    const error = await deckChecker({
      id, name, avatar, color
    }, hashedEmail, db);
    if (error.error) {
      return error;
    }
    if ((wordIds?.length || 0) > MAX_WORD_SIZE) {
      return {
        error: 'error_word_list_length_too_large'
      }
    }


    await db.collection("decks").updateOne(
      { "id": id },
      {
        $set: {
          "edited_at": now,
          ...(wordIds && wordIds.length > 0 && { "words": wordIds }),
          ...name && { name },
          ...avatar && { avatar },
          ...color && { color },
        }
      }
    )

    return { error: '' }
  } catch (err: any) {
    return { error: err.toString() }
  }
}


const getDeckByIds = async (
  data: GetDeckByIdsRequestData
) => {
  try {
    if (!data.ids || !data.ids.length) {
      return {
        data: [],
        error: ''
      }
    }
    const { db } = await connectToDatabase();
    const decks = await db.collection("decks")
      .find({ id: { $in: data.ids } }).toArray();

    const decksWithWords = await Promise.all(decks.map(async (deck: any) => {
      const wordsToQuery: string[] = [];
      const weightMap: { [key: string]: number } = {};
      (deck.words || []).forEach((wid: string, index: number) => {
        wordsToQuery.push(wid);
        weightMap[wid] = index;
      });

      const allWords = await db.collection("words")
        .find({ id: { $in: wordsToQuery } }).toArray();

      deck.words = allWords.sort((a, b) => {
        return weightMap[a.id] - weightMap[b.id];
      });
      return deck;
    }));
    return {
      data: decksWithWords,
      error: '',
    };
  } catch (err: any) {
    return { error: err.toString() }
  }
}



const getDeckByInvideCode = async (
  data: { code: string }
) => {
  try {
    if (!data.code) {
      return {
        error: ''
      }
    }
    const { db } = await connectToDatabase();
    const now = new Date().getTime();
    const inviteCodeData = await db.collection<{ deck_id: string, code: string, expire: number }>("inviteCodes")
      .findOne({ code: data.code }) as { deck_id: string, code: string, expire: number } | undefined;
    if (!inviteCodeData || (((inviteCodeData?.expire) || 0) < now) || (!inviteCodeData?.deck_id)) {
      return {
        error: '',
      };
    } else {
      const deckId = inviteCodeData?.deck_id || '';
      const result = await getDeckByIds({ ids: [deckId] });
      if (result?.error) {
        return {
          error: result?.error
        }
      }
      const data = result.data;
      if (data && data.length && data[0]) {
        return {
          data: data[0], error: ''
        }
      }
    }
    return {
      error: '',
    };
  } catch (err: any) {
    return { error: err.toString() }
  }
}

export { createDeck, updateDeckById, getDeckByIds, getDeckByInvideCode };