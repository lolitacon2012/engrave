import Navbar from "cafe-components/navbar";
import Container from "cafe-ui/pageContainer";
import styles from "./home.module.css";
import { useRouter } from 'next/router'
import client from 'cafe-utils/client';
import { useContext, useEffect, useState } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from "cafe-store/index";
import { Deck } from "cafe-types/set";


export default function Home() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const [decks, setDecks] = useState<Deck[]>([]);
    useEffect(() => {
        // Fetch all decks and progress
        const allDecks = [...store.user?.studyingSetIds || [], ...store.user?.owningSetIds || []];
        if (allDecks.length > 0) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: allDecks
                }
            }).then((result: Deck[]) => {
                setDecks(result);
            })
        }
    }, [store.user])

    const renderDeckCard = () => {
        return decks.map((deck) => {
            return <div className={styles.deckCard} key={`deck_card_${deck.id}`} onClick={() => {
                router.push(`/study_set/${deck.id}`)
            }}>
                <div className={styles.imageContainer}>
                    <div className={styles.titleImage}>
                        {
                        // eslint-disable-next-line @next/next/no-img-element
                        deck.avatar.length > 2 ? <img src={deck.avatar} /> : <span>{deck.avatar}</span>
                        }
                    </div>
                </div>
                <div className={styles.contentContainer}>
                    <h3>{deck.name}</h3>
                    <h4>词汇量：{deck.words.length}</h4>
                    <h4>学习程度：59%</h4>
                    <h4>熟练程度：21%</h4>
                </div>
            </div>
        })
    }

    return (
        <>
            <Navbar />
            <Container>
                <h2>Currently Learning</h2>
                <div className={styles.deckCardsRow}>
                {renderDeckCard()}
                </div>
            </Container>
        </>
    )
};
