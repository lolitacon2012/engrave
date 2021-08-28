import { JAPANESE_VERB_KATSUYOU } from "cafe-constants/index";
import { GlobalStoreContext } from "cafe-store/index";
import Button from "cafe-ui/button";
import Container from "cafe-ui/pageContainer";
import { Switch } from "cafe-ui/switch";
import getConjugationSet, { getAllConjugationOfAWord } from "cafe-utils/japaneseVerbConjugation";
import { decodeRubyWithFallback } from "cafe-utils/ruby";
import classNames from "classnames";
import useAuthGuard from "hooks/useAuthGuard";
import debounce from "lodash/debounce";
import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect } from "react";
import { useState } from "react";
import { IoArrowBack, IoArrowForward, IoDice } from "react-icons/io5";
import styles from './japanese_verb_katsuyou.module.css';
const ALL_CONJUGATIONS = getConjugationSet();



export default function Katsuyou() {
    useAuthGuard();
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const t = store.t;
    const hasAuthenticated = (store.authenticatingInProgress === false);
    //JAPANESE_VERB_KATSUYOU.RT is always on; katsuyous length must > 2
    const [katsuyous, setKatsuyous] = useState<Partial<{ [key in JAPANESE_VERB_KATSUYOU]: boolean }>>({ [JAPANESE_VERB_KATSUYOU.RT]: true, [JAPANESE_VERB_KATSUYOU.TE]: true, [JAPANESE_VERB_KATSUYOU.RY]: true });
    const setKatsuyousLocalStorage = (newKatsuyou: Partial<{ [key in JAPANESE_VERB_KATSUYOU]: boolean }>) => {
        setKatsuyous(newKatsuyou);
        localStorage.setItem('tools_katsuyou_filter', JSON.stringify(newKatsuyou));
    }
    const [showAnswer, setShowAnser] = useState(false);
    const [questionSet, setQuestionSet] = useState<any[]>([]);
    const [question, setQuestion] = useState<any>();
    const [questionIndex, setQuestionIndex] = useState(0);
    const [questionRowHidden, setQuestionRowHidden] = useState(false);
    const changeQuestion = useCallback(debounce(() => {
        setQuestionRowHidden(false);
        const qs = generateQuestion(katsuyous);
        setQuestionSet(qs);
        setQuestionIndex(0);
        setQuestion(qs[0]);
    }, 500), [katsuyous]);
    useEffect(() => {
        if (localStorage.getItem('tools_katsuyou_filter')) {
            try {
                const parsed = JSON.parse(localStorage.getItem('tools_katsuyou_filter') || 'null');
                parsed && setKatsuyous(parsed)
                const qs = generateQuestion(parsed);
                setQuestionSet(qs);
                setQuestionIndex(0);
                setQuestion(qs[0]);
            } catch (err) {
                localStorage.removeItem('tools_katsuyou_filter')
            }
        } else {
            const qs = generateQuestion(katsuyous);
            setQuestionSet(qs);
            setQuestionIndex(0);
            setQuestion(qs[0]);
        }
    }, [])
    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading);
    }, [store.isLocaleLoading || store.isUserLoading])

    const generateQuestion = (_katsuyous: any) => {
        return ALL_CONJUGATIONS.sort(() => Math.random() > 0.5 ? 1 : -1).map(w => {
            if (!w) {
                return undefined;
            }
            // @ts-ignore
            const possibleQuestionTypes = Object.keys(w).filter(k => !!_katsuyous[k] && k !== 'category' && k !== 'originalWord' && (w.category === 1 ? (k !== JAPANESE_VERB_KATSUYOU.TE && k !== JAPANESE_VERB_KATSUYOU.KK) : true));
            const questionType = possibleQuestionTypes[Math.floor(Math.random() * possibleQuestionTypes.length)] as JAPANESE_VERB_KATSUYOU;
            // @ts-ignore
            const possibleAnswerTypes = Object.keys(w).filter(k => !!_katsuyous[k] && k !== 'category' && k !== 'originalWord' && k !== questionType);
            const answerType = possibleAnswerTypes[Math.floor(Math.random() * possibleAnswerTypes.length)] as JAPANESE_VERB_KATSUYOU;
            const questionWord = w[questionType];
            const answerWord = w[answerType];
            return {
                questionType, answerType, questionWord, answerWord, category: w.category, originalWord: w.originalWord
            }
        })
    }

    //@ts-ignore
    const enabledKatsuyous = Object.keys(katsuyous).filter((k: JAPANESE_VERB_KATSUYOU) => !!katsuyous[k]).length;
    const renderTogglableSwitches = () => {
        const kys = [JAPANESE_VERB_KATSUYOU.RY, JAPANESE_VERB_KATSUYOU.TE, JAPANESE_VERB_KATSUYOU.KK, JAPANESE_VERB_KATSUYOU.HT,
        JAPANESE_VERB_KATSUYOU.ML, JAPANESE_VERB_KATSUYOU.HTML, JAPANESE_VERB_KATSUYOU.KN, JAPANESE_VERB_KATSUYOU.KT, JAPANESE_VERB_KATSUYOU.IK, JAPANESE_VERB_KATSUYOU.UM, JAPANESE_VERB_KATSUYOU.SE];
        return kys.map((ky, index) => {
            return <Switch key={`jpkty-switch-${index}`} className={styles.switch} disabled={enabledKatsuyous <= 2 && katsuyous[ky]} label={t('tools_japanese_katsuyou_' + ky)} value={!!katsuyous[ky]} onChange={(v) => setKatsuyousLocalStorage({ ...katsuyous, [ky]: v })} />
        })
    }
    const wordMainText = question ? decodeRubyWithFallback(question.originalWord).mainOnlyText : undefined;
    const wordConjugatedPart = question ? ((question.category === 1 || question.category === 2) ? wordMainText?.slice(-1) : 'する') : undefined;
    const currentConjugationRule = question ? ((question.category !== 0) ? getAllConjugationOfAWord({
        word: '~' + wordConjugatedPart, category: question.category
    }) : undefined) : undefined;
    return <Container><div className={styles.titleRow}>
        <h1>{t('tools_katsuyou_exercise')}</h1>
    </div>
        <div className={styles.controllerRow}>
            {<Button type={'PRIMARY'} onClick={() => {
                router.back();
            }} iconRenderer={() => <IoArrowBack />}>{t('general_back')}</Button>}
            <div style={{ width: '100%' }} />
            {<Switch className={styles.switch} disabled label={t('tools_japanese_katsuyou_RT')} value={true} />}
            {renderTogglableSwitches()}
        </div>
        {question && <><div className={classNames(styles.questionRow, "withNormalShadow", questionRowHidden && styles.questionRowHidden)}>
            <div className={styles.questionContainer}>
                {decodeRubyWithFallback(question.questionWord).element}
                <div className={classNames(styles.questionHint, styles.questionHintCategory)}>
                    {t('tools_button_show_verb_category')}
                    <div className={(styles.questionHintFront)}>{
                        question.category !== 0 ? t('tools_button_verb_category_tips', { category: question.category }) : t('tools_button_verb_category_tips_special')
                    }</div>
                </div>
                {question.answerType !== JAPANESE_VERB_KATSUYOU.RT && question.questionType !== JAPANESE_VERB_KATSUYOU.RT && <div className={classNames(styles.questionHint, styles.questionHintOriginal)}>
                    {t('tools_button_show_verb_original')}
                    <div className={(styles.questionHintFront)}>{decodeRubyWithFallback(question.originalWord).element}</div>
                </div>}
                {<div className={classNames(styles.questionHint, styles.questionHintCurrentKatsuyou)}>
                    {t('tools_button_show_verb_current_form')}
                    <div className={(styles.questionHintFront)}>{t('tools_japanese_katsuyou_' + question.questionType)}</div>
                </div>}
                {<div className={classNames(styles.questionHint, styles.questionHintConjugationRule)}>
                    {t('tools_button_show_verb_conjugation_rule')}
                    <div className={(styles.questionHintFront)}>{
                        //@ts-ignore
                        question.category !== 0 ? `${currentConjugationRule[question.questionType]}　⇒　${currentConjugationRule[question.answerType]}`
                            : t('tools_button_verb_category_tips_special')}</div>
                </div>}

            </div>
            <div className={styles.arrow} >
                <IoArrowForward ></IoArrowForward>
                <span>{t('tools_japanese_katsuyou_' + question.answerType)}</span>
                <IoArrowForward ></IoArrowForward>
            </div>
            <div onClick={() => { setShowAnser(!showAnswer) }} className={classNames(styles.answerContainer, showAnswer && styles.showAnswer)}>
                <div className={styles.flipCardInner}>
                    <div className={styles.flipCardFront}>
                        ?
                    </div>

                    <div className={styles.flipCardBack}>
                        {decodeRubyWithFallback(question.answerWord).element}
                    </div>
                </div>
            </div>
        </div>
            <div className={styles.questionButtonRow}>
                {<Button type={'PRIMARY'} onClick={() => {
                    setQuestionRowHidden(true);
                    setShowAnser(false);
                    changeQuestion();
                }} iconRenderer={() => <IoDice />}>{t('tools_button_change_a_set')}</Button>}
            </div>
        </>}
    </Container>
}