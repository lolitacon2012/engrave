import { Deck, Word } from "cafe-types/deck";
import { StudyProgress, StudySet } from "cafe-types/study";
import { v4 as uuid } from 'uuid';
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
        word?: Word, rank_delta: number, question_type: 'NEW_WORD' | 'REPEAT' | 'REVIEW' | 'LONG_TERM_REVIEW', word_id: string
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
    const finished = progress.level_10 || [];

    // review lesson
    if ((toFinalReview.length > size) || (((newWords.length + toRepeat.length + toReview.length + toRandomReview.length) === 0) && !!toFinalReview.length)) {
        toFinalReview.forEach(w => {
            questionSet.push({
                word: wordIdToWord.get(w),
                rank_delta: 0,
                question_type: 'REVIEW',
                word_id: w,
            })
        });
        return {
            questions: questionSet,
            temp_id: uuid(),
        }
    }

    //1. add in all "to Repeat". To Repeat does not count towards to total words...
    toRepeat.forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'REPEAT',
            word_id: w,
        })
    });

    //2. in the rest of space, fill in 20% new words.
    newWords.slice(0, Math.ceil(numberOfQuestions * 0.2)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'NEW_WORD',
            word_id: w,
        })
    });

    //3. fill in 50% to Review
    toReview.slice(0, Math.ceil(numberOfQuestions * 0.5)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'REVIEW',
            word_id: w,
        })
    });

    //4. fill in toRandomReview, 20%.
    sampleSize(toRandomReview, Math.min(Math.ceil(numberOfQuestions * 0.2), toRandomReview.length)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'REVIEW',
            word_id: w,
        })
    });

    //5. ramdomly fill in final stage words for final space.
    sampleSize(finished, Math.max(0, size - questionSet.length)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'LONG_TERM_REVIEW',
            word_id: w,
        })
    });

    //5. shuffle question order;
    const shuffled = questionSet.sort(() => Math.random() > 0.5 ? 1 : -1);
    return {
        questions: shuffled,
        temp_id: uuid(),
    }
}