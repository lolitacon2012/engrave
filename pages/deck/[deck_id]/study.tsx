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
import swal from 'sweetalert';
import cn from 'classnames';
import { v4 as uuid } from 'uuid';
import { decodeRubyWithFallback } from 'cafe-utils/ruby';
import useAuthGuard from 'hooks/useAuthGuard';
import { generateQuestionSet } from './generateQuestionSet';
import { StudySet } from 'cafe-types/study';
import QuestionSet from 'cafe-components/questionSet';


export default function DeckPage() {
    useAuthGuard();
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const currentStudyingDeck = store.currentStudyingDeck;
    const currentDeckProgress = store.currentDeckProgress;
    const t = store.t;
    const hasAuthenticated = (store.authenticatingInProgress === false);
    const currentDeckId = router.query?.deck_id as string || '' as string;
    const [currentQuestionSet, setCurrentQuestionSet] = useState<StudySet>();
    // shortkeys
    // useEffect(() => {
    //     document.addEventListener('keydown', onTabKeyDown)
    //     return () => { document.removeEventListener('keydown', onTabKeyDown) }
    // }, [sortedFilteredWordList])

    useEffect(() => {
        // Generate a test
        if (currentStudyingDeck && hasAuthenticated && currentDeckId) {
            let progress = currentDeckProgress;
            if (!currentDeckProgress) {
                progress = {
                    id: undefined,
                    deck_id: currentDeckId,
                    started_at: new Date().getTime(),
                    section_size: 30,
                    level_0: currentStudyingDeck?.words.map(w => w.id),
                    level_1: [],
                    level_2: [],
                    level_3: [],
                    level_4: [],
                    level_5: [],
                    level_6: [],
                    level_7: [],
                    level_8: [],
                    level_9: [],
                    level_10: [],
                };
                store.setCurrentDeckProgress(progress);
            }
            const questionSet = generateQuestionSet(currentStudyingDeck, progress!, 32);
            console.log(questionSet)
            setCurrentQuestionSet(questionSet);
            // client.callRPC({
            //     rpc: RPC.RPC_GET_STUDY_SET, data: {
            //         ids: [currentDeckId]
            //     }
            // }, `RPC_GET_DECK_BY_IDS[${currentDeckId}]`, ((result: Deck[]) => {
            //     setDeck(result[0]);
            // })).then((result: Deck[]) => {
            //     setDeck(result[0]);
            // })
        }
    }, [hasAuthenticated])

    return hasAuthenticated && <Container>
        <QuestionSet questionSet={currentQuestionSet} onFinish={(result) => {
            console.log(result);
        }} onCancel={()=>{
            alert('you suck')
        }}/>
    </Container>
}