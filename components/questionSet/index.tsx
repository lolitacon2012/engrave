import { Question, StudySet } from "cafe-types/study";
import Button from "cafe-ui/button";
import React, { useCallback, useState } from "react";
import styles from './index.module.css';
import cn from 'classnames';
import { decodeRubyWithFallback, getRuby, getRubyMain } from 'cafe-utils/ruby';
import { useContext } from "react";
import { GlobalStoreContext } from "cafe-store/index";
import { useEffect } from "react";
import { debounce } from "lodash";
import { useRef } from "react";
import { AutoSizer, List } from "react-virtualized";
import Swal from 'sweetalert2';
interface Props {
    questionSet: StudySet,
    onExit: (r: StudySet) => void;
    onResultConfirmed: (r: StudySet, wordIdsToDelete: string[]) => void;
    onContinue: (r: StudySet) => void;
}

enum QuestionStage {
    Question = 'study_your_answer',
    Success = 'study_correct',
    Fail = 'study_incorrect',
    Skip = 'study_skipped',
    Finished = 'study_finished',
}

export default function QuestionSet(props: Props) {
    const store = useContext(GlobalStoreContext);
    const [wordIdsToDelete, setWordIdsToDelete] = useState<string[]>([]);
    const [normalizedStudySet, setNormalizedStudySet] = useState<StudySet>();
    const t = store.t;
    const [questionIndex, setQuestionIndex] = useState(0);
    const [stage, setStage] = useState<QuestionStage>(QuestionStage.Question);
    const [answerInput, setAnswerInput] = useState('');
    const wordContent = normalizedStudySet?.questions?.[questionIndex]?.word?.content;
    const questionType = normalizedStudySet?.questions?.[questionIndex].question_type;
    const isLearningNewWord = questionType === 'NEW_WORD';
    const isRepeating = questionType === 'REPEAT';
    const isLongTermReview = questionType === 'LONG_TERM_REVIEW';
    const [result, setResult] = useState(normalizedStudySet);
    const [score, setScore] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    const correctAnswer = getRuby(wordContent?.word || '') || getRubyMain(wordContent?.word || '');
    const tips = (isLearningNewWord ? t('　') : (isRepeating ? t('study_please_repeat', { answer: correctAnswer }) : t(stage, { answer: correctAnswer })));

    // shortkeys
    const onKeyDown = useCallback(debounce((e: KeyboardEvent) => {
        const key = e.key || e.keyCode;
        if (key === 13 || key === "Enter") {
            switch (stage) {
                case QuestionStage.Question: {
                    ((isLearningNewWord) || (answerInput)) && evaluateAnswer()
                    break;
                }
                case QuestionStage.Finished: {
                    result && props.onContinue(result);
                    break;
                }
                case QuestionStage.Fail:
                case QuestionStage.Success: {
                    moveToNextQuestion();
                    break;
                }
            }
        }
        // dependency should be same as keyboard listener useEffect
    }, 300), [stage, questionIndex, wordContent, answerInput, result]);

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown)
        return () => { document.removeEventListener('keydown', onKeyDown) }
    }, [stage, questionIndex, wordContent, answerInput, result])

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 1)
        const normalized: Question[] = [];
        const emptyWordsId: string[] = [];
        props.questionSet.questions.forEach(q => {
            if (!!q.word) {
                normalized.push(q);
            } else {
                emptyWordsId.push(q.word_id)
            }
        })
        setWordIdsToDelete(emptyWordsId);
        const newSet = {
            ...props.questionSet,
            questions: normalized
        };
        setNormalizedStudySet(newSet)
        setResult(newSet)
    }, [])

    const showFinalResult = () => {
        let finalScore = 0;
        result?.questions.forEach((q) => {
            q.rank_delta > 0 && (finalScore++);
        })
        setScore(Math.ceil(100 * finalScore / (result?.questions.length || 1)));
        setStage(QuestionStage.Finished);
    }

    const changeResultWordRank = (delta: number) => {
        const updatedQuestionArray = normalizedStudySet?.questions;
        updatedQuestionArray && (updatedQuestionArray[questionIndex].rank_delta = delta);
        updatedQuestionArray && result && setResult({
            ...result,
            questions: updatedQuestionArray
        });
    }

    const evaluateAnswer = (input?: string) => {
        if (isLearningNewWord) {
            changeResultWordRank(1);
            moveToNextQuestion();
            return;
        } else if ((correctAnswer === input) || (correctAnswer === answerInput)) {
            setStage(QuestionStage.Success);
            changeResultWordRank(1);
        } else {
            setStage(QuestionStage.Fail);
            changeResultWordRank(isLongTermReview ? -2 : -1);
        }
    }

    const moveToNextQuestion = () => {
        if (questionIndex < ((normalizedStudySet?.questions.length || 0) - 1)) {
            setQuestionIndex(questionIndex + 1);
            setStage(QuestionStage.Question)
            setAnswerInput('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 1)

        } else {
            result && props.onResultConfirmed(result, wordIdsToDelete);
            showFinalResult();
        }
    }
    const rowRenderer = ({ key, index, style }: { key: string, index: number, style: any }) => {
        const wordData = result?.questions[index];
        const wordContent = wordData?.word?.content;
        const incorrect = wordData && (wordData.rank_delta < 0);
        const skipped = wordData && (wordData.rank_delta === 0);
        return wordContent ? (
            <div key={key} style={style} className={styles.reviewWordRow}>
                {<div className={cn(styles.reviewResult)}>{
                    skipped ? '😑' : (incorrect ? '😅' : '😄')
                }</div>}
                {<div className={cn(styles.reviewWord, incorrect && styles.reviewWrong, skipped && styles.skipped)}>{decodeRubyWithFallback(wordContent.word)}</div>}
                {<div className={cn(styles.reviewMeaning)}><span>{wordContent.meaning}</span></div>}
            </div>) : null;
    }


    return normalizedStudySet ? <div className={cn(styles.card, (stage === QuestionStage.Fail || stage === QuestionStage.Skip) && styles.incorrect, (stage === QuestionStage.Success) && styles.correct)}>
        {wordContent && stage !== QuestionStage.Finished && <><h3 className={styles.questionTitle}>{questionIndex + 1}/{normalizedStudySet.questions.length}</h3>
            <h1 className={styles.questionBody}>{isLearningNewWord ? (decodeRubyWithFallback(wordContent.word)) : (wordContent.meaning || '')}</h1>
            <h3 className={styles.questionTips}>{tips}</h3>
            {isLearningNewWord ? <span className={styles.newWord}>{t('study_meaning')}{wordContent.meaning || ''}</span> : <input ref={inputRef} disabled={stage !== QuestionStage.Question} className={cn(styles.answerInput)} placeholder={isRepeating ? correctAnswer : ''} value={answerInput} onChange={(e) => {
                setAnswerInput(e.target.value);
                if (e.target.value === correctAnswer && isRepeating) {
                    evaluateAnswer(e.target.value);
                }
            }} />}
            <div className={styles.buttonContainer}>
                {stage === QuestionStage.Question && <Button onClick={() => {
                    moveToNextQuestion();
                }}>{t('study_skip')}</Button>}
                {stage === QuestionStage.Question && !isRepeating && <Button onClick={() => {
                    evaluateAnswer();
                }}>{t(isLearningNewWord ? 'study_i_remembered' : 'study_confirm')}</Button>}
                {!isRepeating && stage === QuestionStage.Success && <Button onClick={() => {
                    changeResultWordRank(-1);
                    moveToNextQuestion();
                }}>{t('study_guessed')}</Button>}
                {stage === QuestionStage.Fail && <Button onClick={() => {
                    changeResultWordRank(-9999);
                    moveToNextQuestion();
                }}>{t('study_restudy')}</Button>}
                {stage !== QuestionStage.Question && <Button onClick={() => {
                    moveToNextQuestion();
                }}>{t('study_next')}</Button>}
            </div></>}
        <div className={styles.result}>
            {stage === QuestionStage.Finished && <>
                <h1>{t('study_finished_title', { words_count: (result?.questions.length || 0) + '' })}</h1>
                <div style={{ flex: 1, width: '100%' }}>
                    <AutoSizer>
                        {({ height, width }) => {
                            return (
                                <List
                                    width={width}
                                    height={height}
                                    rowCount={result?.questions.length || 0}
                                    rowHeight={48}
                                    rowRenderer={rowRenderer}
                                />
                            )
                        }}
                    </AutoSizer>
                </div>
            </>}
        </div>
        <div className={styles.footerContainer}>
            <Button onClick={() => {
                Swal.fire({
                    title: t('study_exit'),
                    text: t('study_exit_warning'),
                    showCancelButton: true,
                    cancelButtonText: t("general_cancel"),
                    confirmButtonText: t("study_exit"),
                    confirmButtonColor: '#ff0000',
                    icon: 'warning',
                }).then((r) => {
                    if (r.isConfirmed) {
                        result && props.onExit(result);
                    }
                })
            }}>{t('study_exit')}</Button>
            {stage === QuestionStage.Finished && <Button onClick={() => {
                result && props.onContinue(result);
            }}>{t('study_continue')}</Button>}
        </div>

    </div> : null;
}