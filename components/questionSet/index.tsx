import { StudySet } from "cafe-types/study";
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

interface Props {
    questionSet: StudySet,
    onExit: (r: StudySet) => void;
    onResultConfirmed: (r: StudySet) => void;
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
    const t = store.t;
    const [questionIndex, setQuestionIndex] = useState(0);
    const [stage, setStage] = useState<QuestionStage>(QuestionStage.Question);
    const [answerInput, setAnswerInput] = useState('');
    const wordContent = props.questionSet.questions[questionIndex].word.content;
    const questionType = props.questionSet.questions[questionIndex].question_type;
    const isLearningNewWord = questionType === 'NEW_WORD';
    const isRepeating = questionType === 'REPEAT';
    const isLongTermReview = questionType === 'LONG_TERM_REVIEW';
    const [result, setResult] = useState(props.questionSet);
    const [score, setScore] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    const correctAnswer = getRuby(wordContent.word || '') || getRubyMain(wordContent.word || '');
    const tips = (isLearningNewWord ? t('　') : ( isRepeating ? t('study_please_repeat', { answer: correctAnswer }) : t(stage, { answer: correctAnswer })));

    // shortkeys
    const onKeyDown = useCallback(debounce((e: KeyboardEvent) => {
        const key = e.key || e.keyCode;
        if (key === 13 || key === "Enter") {
            switch (stage) {
                case QuestionStage.Question: {
                    answerInput && evaluateAnswer()
                    break;
                }
                case QuestionStage.Finished: {
                    props.onContinue(result);
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
    }, 100), [stage, questionIndex, wordContent, answerInput, result]);

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown)
        return () => { document.removeEventListener('keydown', onKeyDown) }
    }, [stage, questionIndex, wordContent, answerInput, result])

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 1)
    }, [])

    const showFinalResult = () => {
        let finalScore = 0;
        result.questions.forEach((q) => {
            q.rank_delta > 0 && (finalScore++);
        })
        setScore(Math.ceil(100 * finalScore / result.questions.length));
        setStage(QuestionStage.Finished);
    }

    const changeResultWordRank = (delta: number) => {
        const updatedQuestionArray = props.questionSet.questions;
        updatedQuestionArray && (updatedQuestionArray[questionIndex].rank_delta = delta);
        setResult({
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
        if (questionIndex < ((props.questionSet.questions.length || 0) - 1)) {
            setQuestionIndex(questionIndex + 1);
            setStage(QuestionStage.Question)
            setAnswerInput('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 1)

        } else {
            props.onResultConfirmed(result);
            showFinalResult();
        }
    }
    const rowRenderer = ({ key, index, style }: { key: string, index: number, style: any }) => {
        const wordData = result.questions[index];
        const wordContent = wordData.word.content;
        const incorrect = wordData.rank_delta < 0;
        const skipped = wordData.rank_delta === 0;
        return (
            <div key={key} style={style} className={styles.reviewWordRow}>
                {<div className={cn(styles.reviewResult)}>{
                    skipped ? '😑' : (incorrect ? '😅' : '😄')
                }</div>}
                {<div className={cn(styles.reviewWord, incorrect && styles.reviewWrong, skipped && styles.skipped)}>{decodeRubyWithFallback(wordContent.word)}</div>}
                {<div className={cn(styles.reviewMeaning)}><span>{wordContent.meaning}</span></div>}
            </div>)
    }


    return props.questionSet ? <div className={cn(styles.card, (stage === QuestionStage.Fail || stage === QuestionStage.Skip) && styles.incorrect, (stage === QuestionStage.Success) && styles.correct)}>
        {stage !== QuestionStage.Finished && <><h3 className={styles.questionTitle}>{questionIndex + 1}/{props.questionSet.questions.length}</h3>
            <h1 className={styles.questionBody}>{isLearningNewWord ? (decodeRubyWithFallback(wordContent.word)) : (wordContent.meaning || '')}</h1>
            <h3 className={styles.questionTips}>{tips}</h3>
            {isLearningNewWord ? <span className={styles.newWord}>{t('study_meaning')}{wordContent.meaning || ''}</span> : <input ref={inputRef} disabled={stage !== QuestionStage.Question} className={cn(styles.answerInput)} placeholder={isRepeating ? correctAnswer : ''} value={answerInput} onChange={(e) => {
                setAnswerInput(e.target.value);
                if(e.target.value === correctAnswer && isRepeating){
                    evaluateAnswer(e.target.value);
                }
            }} />}
            <div className={styles.buttonContainer}>
                {stage === QuestionStage.Question && <Button onClick={() => {
                    moveToNextQuestion();
                }}>{t('study_skip')}</Button>}
                {stage === QuestionStage.Question && <Button onClick={() => {
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
                <h1>{t('study_finished_title', { words_count: result.questions.length + '' })}</h1>
                <div style={{ flex: 1, width: '100%' }}>
                    <AutoSizer>
                        {({ height, width }) => {
                            return (
                                <List
                                    width={width}
                                    height={height}
                                    rowCount={result.questions.length}
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
                props.onExit(result);
            }}>{t('study_exit')}</Button>
            {stage === QuestionStage.Finished && <Button onClick={() => {
                props.onContinue(result);
            }}>{t('study_continue')}</Button>}
        </div>

    </div> : null;
}