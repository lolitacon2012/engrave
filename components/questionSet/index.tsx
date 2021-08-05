import { StudySet } from "cafe-types/study";
import Button from "cafe-ui/button";
import React, { useState } from "react";
import styles from './index.module.css';
import cn from 'classnames';
import { decodeRubyWithFallback, getRuby, getRubyMain } from 'cafe-utils/ruby';
import { useContext } from "react";
import { GlobalStoreContext } from "cafe-store/index";
import { useEffect } from "react";

interface Props {
    questionSet?: StudySet,
    onFinish: (r: StudySet) => void;
    onCancel: (r: StudySet) => void;
}

enum QuestionStage {
    Question = 'study_your_answer',
    Success = 'study_correct',
    Fail = 'study_incorrect', Skip = 'study_skipped'
}

export default function QuestionSet(props: Props) {
    const store = useContext(GlobalStoreContext);
    const t = store.t;
    const [questionIndex, setQuestionIndex] = useState(0);
    const [stage, setStage] = useState<QuestionStage>(QuestionStage.Question);
    const [answerInput, setAnswerInput] = useState('');
    const wordContent = props.questionSet?.questions[questionIndex]?.word?.content;
    const questionResult = t(stage);
    const evaluateAnswer = () => {
        const correctAnswer = getRuby(wordContent?.word || '') || getRubyMain(wordContent?.word || '');
        console.log(correctAnswer);
        if (correctAnswer === answerInput) {
            setStage(QuestionStage.Success);
        } else {
            setStage(QuestionStage.Fail);
        }
    }

    const moveToNextQuestion = () => {
        if (questionIndex < ((props.questionSet?.questions?.length || 0) - 1)) {
            setQuestionIndex(questionIndex + 1);
            setStage(QuestionStage.Question)
            setAnswerInput('');
        } else {
            alert('done')
        }
    }

    return props.questionSet ? <div className={cn(styles.card, (stage === QuestionStage.Fail || stage === QuestionStage.Skip) && styles.incorrect, (stage === QuestionStage.Success) && styles.correct)}>
        <h3 className={styles.questionTitle}>(show word stage)</h3>
        <h1 className={styles.questionBody}>{(wordContent?.meaning || '')}</h1>
        <h3 className={styles.questionResult}>{questionResult}</h3>
        <input className={styles.answerInput} placeholder={'请输入您的答案'} value={answerInput} onChange={(e) => {
            setAnswerInput(e.target.value);
        }} />
        <div className={styles.buttonContainer}>
            {stage === QuestionStage.Question && <Button onClick={() => {
                evaluateAnswer();
            }}>Confirm</Button>}
            {stage !== QuestionStage.Question && <Button>Restudy</Button>}
            {stage !== QuestionStage.Question && <Button onClick={() => {
                moveToNextQuestion();
            }}>Next</Button>}
        </div>
        <div className={styles.flexOne}></div>
        <div className={styles.footerContainer}>
            <Button>Giveup</Button>
        </div>

    </div> : null;
}