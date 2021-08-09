
import { UpdateWordsByIdsRequestData } from 'cafe-types/rpc/words';
import { connectToDatabase } from 'cafe-utils/mongodb';

const handler = async (
    data: UpdateWordsByIdsRequestData
) => {
    let words = data.words || [];
    let wordIdsToDelete = data.wordIdsToDelete || [];
    const now = new Date().getTime();
    words = words.map(w => {
        return {
            ...w,
            edited_at: now,
        }
    })
    const { db } = await connectToDatabase();
    const wordsBulkArr = [];
    const userProgressBulkArr = [];
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
}

export default handler;