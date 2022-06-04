import { Question, StudyProgress, StudySet } from "cafe-types/study";
import Button from "cafe-ui/button";
import React, { useCallback, useState } from "react";
import styles from './index.module.css';
import cn from 'classnames';
import { decodeRubyWithFallback } from 'cafe-utils/ruby';
import { useContext } from "react";
import { GlobalStoreContext } from "cafe-store/index";
import { useEffect } from "react";
import { debounce } from "lodash";
import { useRef } from "react";
import { AutoSizer, List } from "react-virtualized";
import modal from "cafe-ui/modal";
import isConsideredAsCorrect from "cafe-utils/compareAnswer";
import Router, { useRouter } from "next/router";
const MAIN_QUESTION_STAGE_ID = 'MAIN_QUESTION_STAGE';
interface Props {
    questionSet: StudySet,
    onExit: (r: StudySet) => void;
    onResultConfirmed: (r: StudySet, wordIdsToDelete: string[]) => void;
    onContinue: (r: StudySet) => void;
    progress: StudyProgress;
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
    const isReviewing = questionType === 'REVIEW';
    const isLongTermReview = questionType === 'LONG_TERM_REVIEW';
    const [result, setResult] = useState(normalizedStudySet);
    const [isAnimating, setIsAnimating] = useState(true);
    const [score, setScore] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const rubyOnly = !!props.progress.use_ruby_only;
    const decodedWord = decodeRubyWithFallback(wordContent?.word || '');
    const correctAnswers = rubyOnly ? [decodedWord.rubyOnlyText] : (decodedWord.mainOnlyText !== decodedWord.rubyOnlyText ? [decodedWord.mainOnlyText, decodedWord.rubyOnlyText] : [decodedWord.mainOnlyText]);
    const tips = (isLearningNewWord ? '' : (isRepeating ? t('study_please_repeat') : t(stage)));
    const answer = (rubyOnly ? <span>{decodedWord.rubyOnlyText}</span> : decodedWord.element);
    const shouldShowAnser = isRepeating || (!isLearningNewWord && (stage !== QuestionStage.Question));
    // shortkeys
    const onKeyPress = useCallback(debounce((e: KeyboardEvent) => {
        if (isAnimating) {
            return;
        }
        const key = e.key || e.keyCode;
        if (key === 13 || key === "Enter") {
            switch (stage) {
                case QuestionStage.Question: {

                    ((isLearningNewWord) || (answerInput)) && evaluateAnswer()
                    break;
                }
                // case QuestionStage.Finished: {
                //     result && props.onContinue(result);
                //     break;
                // }
                case QuestionStage.Fail:
                case QuestionStage.Success: {
                    moveToNextQuestion();
                    break;
                }
            }
        }
        // dependency should be same as keyboard listener useEffect
    }, 300), [stage, questionIndex, wordContent, answerInput, result, isAnimating]);

    useEffect(() => {
        document.addEventListener('keypress', onKeyPress)
        return () => { document.removeEventListener('keypress', onKeyPress) }
    }, [stage, questionIndex, wordContent, answerInput, result, isAnimating])

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
            setIsAnimating(false);
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

    const onExitBeforeFinish = (onConfirm: () => void) => modal.fire({
        translator: store.t,
        title: t('study_exit'),
        contentText: t('study_exit_warning'),
        confirmButtonText: t("study_exit"),
        type: 'DANGER',
        onConfirm,
        onCancel: (closeModal) => {
            setIsAnimating(false);
            closeModal();
        },
        didOpen: () => {
            setIsAnimating(true);
        }
    })

    const router = useRouter();
    // prevent accidently leave page
    useEffect(() => {
        const handleRouteChange = (path: string) => {
            if (stage !== QuestionStage.Finished) {
                onExitBeforeFinish(() => {
                    setStage(QuestionStage.Finished);
                    setTimeout(() => {
                        router.push(path)
                    })
                })
                Router.events.emit('routeChangeError');
                throw "Cancel navigation";
            }
        }

        router.events.on('routeChangeStart', handleRouteChange)

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', handleRouteChange)
        }
    }, [stage])


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

    const evaluateAnswer = (input?: string, autoMoveOnCorrect?: boolean) => {
        if (isLearningNewWord) {
            changeResultWordRank(1);
            moveToNextQuestion();
            return;
        } else if ((correctAnswers.some(a => isConsideredAsCorrect(input || '', a))) || (correctAnswers.some(a => isConsideredAsCorrect((answerInput || ''), a)))) {
            setStage(QuestionStage.Success);
            changeResultWordRank(2);
            if (autoMoveOnCorrect) {
                setTimeout(() => {
                    moveToNextQuestion();
                }, 800)
            }
        } else {
            setStage(QuestionStage.Fail);
            changeResultWordRank(isRepeating ? 0 : (isLongTermReview ? 0 : -1));
        }
    }

    const moveToNextQuestion = () => {
        setIsAnimating(true);
        setTimeout(() => {
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
        }, 350)

        setTimeout(() => {
            setIsAnimating(false);
        }, 400)
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
                {<div className={cn(styles.reviewWord, incorrect && styles.reviewWrong, skipped && styles.skipped)}>{decodeRubyWithFallback(wordContent.word).element}</div>}
                {<div className={cn(styles.reviewMeaning)}><span>{wordContent.meaning}</span></div>}
            </div>) : null;
    }

    const renderQuestionTypeTag = () => {
        switch (questionType) {
            case 'NEW_WORD': {
                return t('study_progress_new')
            }
            case 'REPEAT': {
                return t('study_progress_repeat')
            }
            case 'REVIEW': {
                return t('study_progress_review')
            }
            case 'LONG_TERM_REVIEW': {
                return t('study_progress_random_review')
            }
        }
        return t('study_progress_unknown')
    }
    return normalizedStudySet ? <div id={MAIN_QUESTION_STAGE_ID} className={cn(styles.card, isAnimating && styles.cardHiddenBottom, 'withNormalShadow', (stage === QuestionStage.Fail || stage === QuestionStage.Skip) && styles.incorrect, (stage === QuestionStage.Success) && styles.correct)}>
        {wordContent && stage !== QuestionStage.Finished && <>
            <div className={styles.questionTitleContainer}>
                <h3>{questionIndex + 1}/{normalizedStudySet.questions.length}</h3>
                <h3>{renderQuestionTypeTag()}</h3>
            </div>
            <h1 className={styles.questionBody}>{isLearningNewWord ? (decodeRubyWithFallback(wordContent.word).element) : (wordContent.meaning || '')}</h1>
            <div className={styles.questionTips}><h3>{tips}</h3>&nbsp;<h3>{shouldShowAnser && answer}</h3></div>
            {isLearningNewWord ? <span className={styles.newWord}>{t('study_meaning')}{wordContent.meaning || ''}</span> : <input ref={inputRef} disabled={stage !== QuestionStage.Question} className={cn(styles.answerInput)} placeholder={isRepeating ? correctAnswers.join(' / ') : ''} value={answerInput} onChange={(e) => {
                setAnswerInput(e.target.value);
            }} />}
            <div className={styles.buttonContainer}>
                {stage === QuestionStage.Question && <Button type="SECONDARY" onClick={() => {
                    moveToNextQuestion();
                }}>{t('study_skip')}</Button>}
                {stage === QuestionStage.Question && <Button onClick={() => {
                    evaluateAnswer();
                }}>{t(isLearningNewWord ? 'study_i_remembered' : 'study_confirm')}</Button>}
                {stage === QuestionStage.Fail && <Button type="SECONDARY" onClick={() => {
                    changeResultWordRank(-9999);
                    moveToNextQuestion();
                }}>{t('study_I_forgot')}</Button>}
                {!isRepeating && stage === QuestionStage.Fail && <Button type="SECONDARY" onClick={() => {
                    changeResultWordRank(0);
                    moveToNextQuestion();
                }}>{t('study_accident')}</Button>}
                {isReviewing && stage === QuestionStage.Success && <Button type="SECONDARY" onClick={() => {
                    changeResultWordRank(9999);
                    moveToNextQuestion();
                }}>{t('study_I_know')}</Button>}
                {stage !== QuestionStage.Question && <Button onClick={() => {
                    moveToNextQuestion();
                }}>{t('study_next')}</Button>}
            </div></>}
        <div className={styles.result}>
            {stage === QuestionStage.Finished && <>
                <h1>{t('study_finished_title', { words_count: (result?.questions.length || 0) + '' })}</h1>
                <div style={{ flex: 1, width: '100%' }}>
                    {/* @ts-ignore AutoSizer is not fully compativle with react 18 */}
                    <AutoSizer>
                        {({ height, width }) => {
                            return (
                                /* @ts-ignore AutoSizer is not fully compativle with react 18 */
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

            {stage === QuestionStage.Finished && <Button onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                    result && props.onContinue(result);
                }, 300)
                setTimeout(() => {
                    setIsAnimating(false);
                }, 1000)
            }}>{t('study_continue')}</Button>}
            <Button type="SECONDARY" onClick={() => {
                stage !== QuestionStage.Finished ? onExitBeforeFinish(() => {
                    setStage(QuestionStage.Finished);
                    setTimeout(() => {
                        result && props.onExit(result);
                    })
                }) : (result && props.onExit(result))
            }}>{t('study_exit')}</Button>
        </div>

    </div> : null;
}