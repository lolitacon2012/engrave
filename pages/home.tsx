import Container from "cafe-ui/pageContainer";
import styles from "./home.module.css";
import { useRouter } from 'next/router'
import client from 'cafe-utils/client';
import React, { useContext, useEffect, useState } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from "cafe-store/index";
import { Deck } from "cafe-types/deck";
import DeckCard from "cafe-components/deckCard";
import useAuthGuard from "hooks/useAuthGuard";

export default function Home() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    useAuthGuard();

    const hasAuthenticated = (store.authenticatingInProgress === false);
    const [decks, setDecks] = useState<Deck[]>();
    const createDeck = (fullDeck?: string) => {
        const words = (fullDeck || '').split('========').map((w: string) => {
            const ww = w.split('--------')[0];
            const meaning = w.split('--------')[1];
            return {
                content: {
                    word: ww,
                    meaning: meaning,
                    customized_fields: []
                }
            }
        })
        const newDeck = {
            name: "O'zbek tili",
            avatar: "Uz",
            color: "#73A0A4",
        }
        client.callRPC({
            rpc: RPC.RPC_CREATE_DECK, data: {
                deck: newDeck, words: words
            }
        });
    }
    const createEmpty = () => {
        const newDeck = {
            name: "Empty Deck Name",
            avatar: "ED",
            color: "#73A000",
        }
        client.callRPC({
            rpc: RPC.RPC_CREATE_DECK, data: {
                deck: newDeck, words: [{
                    content: {
                        word: "Qahva",
                        meaning: "☕",
                        customized_fields: []
                    }
                }]
            }
        });
    }
    useEffect(() => {
        // Fetch all decks and progress
        const allDecks = [...store.user?.studyingDeckIds || [], ...store.user?.owningDeckIds || []];
        if (allDecks.length > 0) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: allDecks
                }
            }, `RPC_GET_DECK_BY_IDS[${allDecks.join(',')}]`, ((result: Deck[]) => {
                setDecks(result);
            })).then((result: Deck[]) => {
                setDecks(result);
            })
        }
    }, [store.user])
    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading || !decks);
    }, [decks, store.isLocaleLoading || store.isUserLoading])

    const renderDeckCard = () => {
        return decks?.map((deck) =>
            <DeckCard shadow={"NORMAL"} key={`deck_card_${deck?.id}`} deck={deck} progress={store.user?.progress?.[deck?.id]} onClickEnter={() => {
                deck && router.push(`/deck/${deck.id}`)
            }} />
        )
    }
    return hasAuthenticated && (
        <>
            <Container>
                <h1>Currently Learning</h1><button onClick={() => {
                    createDeck(``)
                }}>Create Testing Deck</button>
                <button onClick={() => {
                    createEmpty()
                }}>Create Empty Deck</button>
                <div className={styles.deckCardsRow}>
                    {renderDeckCard()}
                </div>
            </Container>
        </>
    )
};