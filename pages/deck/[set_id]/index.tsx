import { useRouter } from 'next/router'
import Container from "cafe-ui/pageContainer";
import styles from "./index.module.css";
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from 'cafe-store/index';
import client from 'cafe-utils/client';
import { Deck } from 'cafe-types/set'
import t from 'cafe-utils/i18n';
import Button from 'cafe-ui/button';
import { AutoSizer, List } from 'react-virtualized';
import debounce from 'lodash/debounce';

export default function DeckPage() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const [deck, setDeck] = useState<Deck | undefined>(undefined);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [loading, setIsLoading] = useState(true);
    const currentDeckId = router.query?.set_id || '';
    const isOwnDeck = deck?.creator_id === store.user?.id;
    const calculateDeckList = () => {
        let originalOrder = deck?.words || [];
        if (!!searchKeyword) {
            originalOrder = originalOrder.filter(word => (word.content.meaning.includes(searchKeyword) || word.content.word.includes(searchKeyword)))
        }
        return originalOrder;
    }
    const sortedFilteredWordList = calculateDeckList();
    const onSearch = useCallback(debounce((keyword: string) => {
        setSearchKeyword(keyword);
    }, 500), [])
    useEffect(() => {
        // Fetch current deck
        if (currentDeckId) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: [currentDeckId]
                }
            }, `RPC_GET_DECK_BY_IDS[${currentDeckId}]`, ((result: Deck[]) => {
                setDeck(result[0]);
                setIsLoading(false);
            })).then((result: Deck[]) => {
                setDeck(result[0]);
                setIsLoading(false);
            })
        }
    }, [store.user])
    const rowRenderer = ({ key, index }: { key: string, index: number }) => {
        const content = sortedFilteredWordList[index].content;
        return (
            <div key={key} className={styles.wordRowOuterContainer}>
                <div className={styles.wordRow}>
                    <div className={styles.wordWord}>{content.word}</div>
                    <div className={styles.wordMeaning}><span>{content.meaning}</span></div>
                    <div className={styles.wordControllers}></div>
                </div>
            </div>

        );
    }

    return loading ? null : <Container>
        <div className={styles.titleRow}>
            <h1>{deck?.name}</h1>
            <h5>{t('deck_page_created_by')}{deck?.creator_name || t('general_anonymous')}</h5>
        </div>
        <div className={styles.controllerRow}>
            <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                router.push(`/deck/${currentDeckId}/study`)
            }}>{t('deck_page_continue_study')} ✍️</Button>
            <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                router.push(`/deck/${currentDeckId}/study`)
            }}>{t('deck_page_flashcard')} ✔️</Button>
            <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                router.push(`/deck/${currentDeckId}/study`)
            }}>{t('deck_page_settings')} ⚙️</Button>
            {isOwnDeck && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                router.push(`/deck/${currentDeckId}/study`)
            }}>{t('deck_page_edit')} ✏️</Button>}
            <div className={styles.flexPlaceholder} />
            <input className={styles.searchBar} placeholder={t('deck_page_search_tip')} onChange={(keyword) => {
                onSearch(keyword.target.value)
            }} />
        </div>
        <div className={styles.wordListContainer}>
            {searchKeyword && <h2>Showing {sortedFilteredWordList.length} results for keyword &quot;{searchKeyword}&quot;:</h2>}
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        width={width}
                        height={height}
                        rowCount={sortedFilteredWordList.length}
                        rowHeight={108}
                        rowRenderer={rowRenderer}
                    />
                )}
            </AutoSizer>
        </div>
    </Container>
}