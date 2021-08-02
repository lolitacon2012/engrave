
import { UpdateWordsByIdsRequestData } from 'cafe-types/rpc/words';
import { connectToDatabase } from 'cafe-utils/mongodb';

const handler = async (
    data: UpdateWordsByIdsRequestData
) => {
    let words = data.words || [];
    const now = new Date().getTime();
    words = words.map(w => {
        return {
            ...w,
            edited_at: now,
        }
    })
    const { db } = await connectToDatabase();
    const bulkArr = [];
    for (const i of words) {
        bulkArr.push({
            updateOne: {
                "filter": { "id": i.id },
                "update": { $set: i }
            }
        })
    }
    await db.collection("words").bulkWrite(bulkArr);
}

export default handler;