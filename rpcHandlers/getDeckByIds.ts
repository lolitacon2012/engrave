import { connectToDatabase } from 'cafe-utils/mongodb';
import { GetDeckByIdsRequestData } from 'cafe-types/rpc/deck';

const getDeckByIds = async (
    data: GetDeckByIdsRequestData
) => {
    const { db } = await connectToDatabase();
    const decks = await db.collection("decks")
        .find({ id: { $in: data.ids } }).toArray();

    const decksWithWords = await Promise.all(decks.map(async (deck: any) => {
        const wordsToQuery: string[] = [];
        (deck.words || []).forEach((wid: string) => {
            wordsToQuery.push(wid);
        });
        const allWords = await db.collection("words")
            .find({ id: { $in: wordsToQuery } }).toArray();
        deck.words = allWords;
        return deck;
    }));
    return decksWithWords;
}

export default getDeckByIds;