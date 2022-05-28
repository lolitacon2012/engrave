import { DEFAULT_STUDY_SET_SIZE } from "cafe-constants/index";
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

export const generateQuestionSet = (deck: Partial<Deck>, progress: Partial<StudyProgress>, originalSize: number): StudySet => {
    const questionSet: {
        word?: Word, rank_delta: number, question_type: 'NEW_WORD' | 'REPEAT' | 'REVIEW' | 'LONG_TERM_REVIEW', word_id: string
    }[] = [];
    const wordIdToWord = new Map();
    deck.words?.forEach(w => {
        wordIdToWord.set(w.id, w);
    })
    const size = originalSize || DEFAULT_STUDY_SET_SIZE;
    let numberOfQuestionsToFill = size;
    // to learn
    const newWords = progress.level_0 || [];
    // to repeat
    const toRepeat = [...progress.level_1 || [], ...progress.level_2 || []];
    // to review
    const toReview = [...progress.level_3 || [], ...progress.level_4 || [], ...progress.level_5 || []];
    // for further review
    const toRandomReview = [...progress.level_6 || [], ...progress.level_7 || []];
    // almost there
    const toFinalReview = [...progress.level_8 || [], ...progress.level_9 || []];
    const finished = progress.level_10 || [];

    // review lesson
    if ((toFinalReview.length > numberOfQuestionsToFill) || (((newWords.length + toRepeat.length + toReview.length + toRandomReview.length) === 0) && !!toFinalReview.length)) {
        sampleSize(toFinalReview, numberOfQuestionsToFill).forEach(w => {
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

    //1. add in all "to Repeat".
    toRepeat.forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'REPEAT',
            word_id: w,
        })
    });

    numberOfQuestionsToFill -= questionSet.length;

    // if too many words are in review state or study stage, do not learn new words.
    const noNewWordToLearn = (toRandomReview.length + toReview.length + toFinalReview.length) >= (numberOfQuestionsToFill * 1.25);

    //2. in the rest of space, fill in 25% new words
    !noNewWordToLearn && !progress.use_random_order && newWords.slice(0, Math.floor(numberOfQuestionsToFill * 0.25)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'NEW_WORD',
            word_id: w,
        })
    });

    //2.5 if random order, fill in randomly instead of picking from front
    !noNewWordToLearn && progress.use_random_order && sampleSize(newWords, Math.floor(numberOfQuestionsToFill * 0.25)).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'NEW_WORD',
            word_id: w,
        })
    });

    //3. fill in 60% / 85% to Review
    toReview.slice(0, Math.floor(numberOfQuestionsToFill * (noNewWordToLearn ? 0.85 : 0.6))).forEach(w => {
        questionSet.push({
            word: wordIdToWord.get(w),
            rank_delta: 0,
            question_type: 'REVIEW',
            word_id: w,
        })
    });

    //4. fill in toRandomReview when its size is over size || DEFAULT_STUDY_SET_SIZE, 15%.
    const shouldRandomReview = toRandomReview.length >= (size);
    shouldRandomReview && sampleSize(toRandomReview, Math.min(Math.floor(numberOfQuestionsToFill * 0.15), toRandomReview.length)).forEach(w => {
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

    //6. shuffle question order;
    const shuffled = questionSet.sort(() => Math.random() > 0.5 ? 1 : -1);
    return {
        questions: shuffled,
        temp_id: uuid(),
    }
}