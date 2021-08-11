import { useRouter } from 'next/router'
import Container from "cafe-ui/pageContainer";
import styles from "./study.module.css";
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from 'cafe-store/index';
import client from 'cafe-utils/client';
import { Deck, Word } from 'cafe-types/deck'

import Button from 'cafe-ui/button';
import DeckCard from 'cafe-components/deckCard';
import { IoAddCircle, IoTrashBin, IoPencil, IoSave, IoLocate, IoClipboardOutline } from "react-icons/io5";

import cn from 'classnames';
import { v4 as uuid } from 'uuid';
import { decodeRubyWithFallback } from 'cafe-utils/ruby';
import useAuthGuard from 'hooks/useAuthGuard';
import { generateQuestionSet } from '../../../utils/generateQuestionSet';
import { StudyProgress, StudySet } from 'cafe-types/study';
import QuestionSet from 'cafe-components/questionSet';
import debounce from 'lodash/debounce';
import { DEFAULT_STUDY_SET_SIZE, NEW_PROGRESS_TEMPLATE } from 'cafe-constants/index';

const NEW_PROGRESS = {
    started_at: new Date().getTime(),
    updated_at: new Date().getTime(),
    ...NEW_PROGRESS_TEMPLATE
}


export default function DeckPage() {
    useAuthGuard();
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const [currentStudyingDeck, setCurrentStudyingDeck] = useState<Deck>();
    const [currentDeckProgress, setCurrentDeckProgress] = useState<StudyProgress>();
    const t = store.t;
    const currentDeckId = router.query?.deck_id as string || '' as string;
    const [currentQuestionSet, setCurrentQuestionSet] = useState<StudySet>();

    // load deck on mounted
    useEffect(() => {
        if (currentDeckId) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: [currentDeckId]
                }
            }, `RPC_GET_DECK_BY_IDS[${currentDeckId}]`, (({ data, error }) => {
                setCurrentStudyingDeck(data[0]);
            })).then(({ data, error }) => {
                setCurrentStudyingDeck(data[0]);
            })
        }
    }, [currentDeckId])

    // load progress after deck is loaded
    useEffect(() => {
        const userStudyProgresses = store.user?.progress || {};
        let currentProgress = userStudyProgresses[currentDeckId];
        const hasNoWords = currentProgress && ([...currentProgress.level_0, ...currentProgress.level_1, ...currentProgress.level_2, ...currentProgress.level_3, ...currentProgress.level_4, ...currentProgress.level_5, ...currentProgress.level_6, ...currentProgress.level_7, ...currentProgress.level_8, ...currentProgress.level_9, ...currentProgress.level_10].length === 0);
        if (!!currentStudyingDeck && !!store.user?.id) {
            if (!currentProgress || hasNoWords) {
                currentProgress = {
                    ...NEW_PROGRESS,
                    deck_id: currentDeckId,
                    level_0: currentStudyingDeck?.words.map(w => w.id),
                };
            }
            setCurrentDeckProgress(currentProgress);
            const questionSet = generateQuestionSet(currentStudyingDeck, currentProgress!, currentProgress.section_size);
            setCurrentQuestionSet(questionSet);
        }
    }, [currentStudyingDeck?.id, store.user?.id])

    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading || !currentQuestionSet);
    }, [currentQuestionSet, store.isLocaleLoading || store.isUserLoading])

    const updateProgress = (result: StudySet) => {
        if (!currentDeckProgress) {
            return;
        }
        const newProgress = { ...currentDeckProgress };
        const questions = result.questions;
        const processedIds: string[] = [];
        for (let lv = 0; lv <= 10; lv++) {
            // @ts-ignore
            const currentLevel = [...newProgress['level_' + (lv)]] as string[];
            const toRemoveFromCurrentLevel: string[] = [];
            questions.forEach(q => {
                if (q.word && currentLevel.includes(q.word.id) && !processedIds.includes(q.word.id)) {
                    processedIds.push(q.word.id);
                    let adjustedRankDelta = q.rank_delta;
                    if (currentDeckProgress.use_easy_mode) {
                        // no penalty for easy mode
                        adjustedRankDelta >= -10 && (adjustedRankDelta = Math.max(0, adjustedRankDelta))
                    }
                    const toLevel = Math.min(Math.max(lv + adjustedRankDelta, 0), 10);
                    if (toLevel === lv) {
                        return;
                    } else {
                        // @ts-ignore
                        newProgress['level_' + (toLevel)] = [...newProgress['level_' + (toLevel)], q.word.id];
                        toRemoveFromCurrentLevel.push(q.word.id);
                    }
                }
            })
            // @ts-ignore
            newProgress['level_' + (lv)] = currentLevel.filter(id => !toRemoveFromCurrentLevel.includes(id));
            newProgress.updated_at = new Date().getTime();

            // sort lv0 words
            const referArray = currentStudyingDeck?.words.map(w => w.id) || [];
            newProgress.level_0 = newProgress.level_0.sort((a, b) => (referArray.indexOf(a) - referArray.indexOf(b)) > 0 ? 1 : -1)
            newProgress.has_started = true;
        }
        client.callRPC({
            rpc: RPC.RPC_UPDATE_USER_INFO,
            data: {
                progress: {
                    ...store.user?.progress,
                    [currentDeckId]: newProgress
                },
                setLastStudied: true,
            }
        })
        store.updateUserLocally({
            ...store.user, progress: {
                ...store.user?.progress,
                [currentDeckId]: newProgress
            }
        });
        setCurrentDeckProgress(newProgress);
    }

    return currentQuestionSet ? <Container>
        <QuestionSet key={currentQuestionSet.temp_id} onResultConfirmed={(result) => {
            updateProgress(result);
        }} questionSet={currentQuestionSet} onExit={() => {
            router.replace(`/deck/${currentDeckId}`)
        }} onContinue={() => {
            const questionSet = generateQuestionSet(currentStudyingDeck!, currentDeckProgress!, currentDeckProgress!.section_size);
            setCurrentQuestionSet(questionSet);
        }} />
    </Container> : null;
}