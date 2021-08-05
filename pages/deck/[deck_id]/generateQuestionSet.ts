import { Deck, Word } from "cafe-types/deck";
import { StudyProgress, StudySet } from "cafe-types/study";

const sampleSize = ([...arr], n = 1) => {
    let m = arr.length;
    while (m) {
        const i = Math.floor(Math.random() * m--);
        [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr.slice(0, n);
};

export const generateQuestionSet = (deck: Partial<Deck>, progress: Partial<StudyProgress>, size: number): StudySet => {
    const questionSet: {
        word: Word, rank_delta: number,
    }[] = [];
    const wordIdToWord = new Map();
    deck.words?.forEach(w => {
        wordIdToWord.set(w.id, w);
    })

    const numberOfQuestions = size || 24;
    const newWords = progress.level_0 || [];
    const toRepeat = [...progress.level_1 || [], ...progress.level_2 || []];
    const toReview = [...progress.level_3 || [], ...progress.level_4 || [], ...progress.level_5 || []];
    const toRandomReview = [...progress.level_6 || [], ...progress.level_7 || [], ...progress.level_8 || []];
    const toFinalReview = progress.level_9 || [];

    // review lesson
    if (toFinalReview.length > size) {
        toFinalReview.forEach(w => {
            questionSet.push({
                word: wordIdToWord.get(w),
                rank_delta: 0,
            })
        });
        return {
            questions: questionSet
        }
    }

    //1. add in all "to Repeat". To Repeat does not count towards to total words...
    toRepeat.forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
        })
    });

    //2. in the rest of space, fill in 20% new words.
    newWords.slice(0, Math.ceil(numberOfQuestions * 0.2)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
        })
    });

    //3. fill in 60% to Review
    toReview.slice(0, Math.ceil(numberOfQuestions * 0.6)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
        })
    });

    //4. fill in toRandomReview, 20%.
    sampleSize(toRandomReview, Math.min(Math.ceil(numberOfQuestions * 0.2), toRandomReview.length)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
        })
    });

    //5. shuffle question order;
    const shuffled = questionSet.sort(() => Math.random() > 0.5 ? 1 : -1);

    return {
        questions: shuffled
    }
}