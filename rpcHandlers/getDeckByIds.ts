import { connectToDatabase } from 'cafe-utils/mongodb';
import { GetDeckByIdsRequest } from 'cafe-types/rpc/deck';
import { getSession } from 'next-auth/client';
import { NextApiRequest } from 'next';

const getDeckByIds = async (
    data: GetDeckByIdsRequest,
    req: NextApiRequest
) => {
    const { db } = await connectToDatabase();
    // if (data.id === 'testing_deck') {
    //     const session = await getSession({ req });
    //     const email = session?.user?.email || '';
    //     await db.collection("decks")
    //         .updateOne({ id: data.id }, {$set: {
    //             id: 'testing_deck',
    //             creator_id: email,
    //             created_at: new Date().getTime(),
    //             edited_at: new Date().getTime(),
    //             words: [
    //                 {
    //                     id: 'testing_deck_0001',
    //                     creator_id: email,
    //                     set_id: 'testing_deck',
    //                     content: {
    //                         word: 'olma',
    //                         meaning: 'apple',
    //                         customized_fields: []
    //                     }
    //                 },
    //                 {
    //                     id: 'testing_deck_0002',
    //                     creator_id: email,
    //                     set_id: 'testing_deck',
    //                     content: {
    //                         word: 'nok',
    //                         meaning: 'pear',
    //                         customized_fields: []
    //                     }
    //                 },
    //                 {
    //                     id: 'testing_deck_0003',
    //                     creator_id: email,
    //                     set_id: 'testing_deck',
    //                     content: {
    //                         word: 'uzum',
    //                         meaning: 'grape',
    //                         customized_fields: []
    //                     }
    //                 }
    //             ]
    //         }}, { upsert: true });
    // }
    const decks = await db.collection("decks")
        .find({id:{$in:data.ids}}).toArray();
    return decks;
}

export default getDeckByIds;