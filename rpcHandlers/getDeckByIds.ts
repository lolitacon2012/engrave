import { connectToDatabase } from 'cafe-utils/mongodb';
import { GetDeckByIdsRequestData } from 'cafe-types/rpc/deck';
import { Word } from 'cafe-types/deck';

const getDeckByIds = async (
    data: GetDeckByIdsRequestData
) => {
    const { db } = await connectToDatabase();
    const decks = await db.collection("decks")
        .find({ id: { $in: data.ids } }).toArray();

    const decksWithWords = await Promise.all(decks.map(async (deck: any) => {
        const wordsToQuery: string[] = [];
        const weightMap: {[key: string]: number} = {};
        (deck.words || []).forEach((wid: string, index: number) => {
            wordsToQuery.push(wid);
            weightMap[wid] = index;
        });
        
        const allWords = await db.collection("words")
            .find({ id: { $in: wordsToQuery } }).toArray();

        deck.words = allWords.sort((a, b)=>{
            return weightMap[a.id] - weightMap[b.id];
        });
        return deck;
    }));
    return decksWithWords;
}

export default getDeckByIds;