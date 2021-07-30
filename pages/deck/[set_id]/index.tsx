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
import DeckCard from 'cafe-components/deckCard';
import { addDeckUpdatePool, commit as commitDeckUpdate } from 'cafe-utils/deckUpdatePoolUtils';

export default function DeckPage() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const [deck, setDeck] = useState<Partial<Deck> | undefined>(undefined);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [loading, setIsLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const currentDeckId = router.query?.set_id || '';
    const isOwnDeck = deck?.creator_id === store.user?.id;
    const calculateDeckList = () => {
        let originalOrder = deck?.words || [];
        if (!!searchKeyword) {
            originalOrder = originalOrder.filter(word => (word.content.meaning?.includes(searchKeyword) || word.content.word?.includes(searchKeyword)))
        }
        return originalOrder;
    }
    const onEditWord = (word: string, meaning: string, wordId?: string, index?: number) => {
        // must be UPDATE, can not handle ADD new word
        const newWords = deck?.words || [];
        const originalWordIndex = (index !== undefined) ? (index) : (newWords.findIndex((w) => w.id === wordId));
        const originalWord = newWords[originalWordIndex] || {};
        const newContent = {
            ...originalWord?.content,
            word, meaning
        }
        newWords[originalWordIndex] = {
            ...originalWord,
            content: newContent,
        }
        setDeck({
            ...(deck || {}),
            words: newWords
        })
        addDeckUpdatePool(originalWord.id, newContent);
        deck?.id && debouncedBatchUpdateDeck(deck.id);
    }
    const sortedFilteredWordList = calculateDeckList();
    const onSearch = useCallback(debounce((keyword: string) => {
        setSearchKeyword(keyword);
    }, 500), [])
    const debouncedBatchUpdateDeck = useCallback(debounce((currentDeckId: string) => {
        commitDeckUpdate(currentDeckId);
    }, 1000), [])
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
    }, [store.user, currentDeckId])
    const rowRenderer = ({ key, index, style }: { key: string, index: number, style: any }) => {
        const content = sortedFilteredWordList[index].content;
        return (
            <div key={key} style={style} className={styles.wordRowOuterContainer}>
                <div className={styles.wordRow}>
                    {<div className={styles.wordWord}>{editing ? <input value={content.word} onChange={(e) => {
                        onEditWord(e.target.value, content.meaning, undefined, index)
                    }} /> : content.word}</div>}
                    {<div className={styles.wordMeaning}>{editing ? <input value={content.meaning} onChange={(e) => {
                        onEditWord(content.word, e.target.value, undefined, index)
                    }} /> : <span>{content.meaning}</span>}</div>}
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
            {!editing && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                router.push(`/deck/${currentDeckId}/study`)
            }}>{t('deck_page_continue_study')} ✍️</Button>}
            {!editing && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                router.push(`/deck/${currentDeckId}/study`)
            }}>{t('deck_page_flashcard')} ✔️</Button>}
            {!editing && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                router.push(`/deck/${currentDeckId}/study`)
            }}>{t('deck_page_settings')} ⚙️</Button>}
            {isOwnDeck && !editing && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                setEditing(true)
            }}>{t('deck_page_edit')} ✏️</Button>}
            {isOwnDeck && editing && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                setEditing(false)
            }}>{t('deck_page_exit_edit')} 💾</Button>}

            <div className={styles.flexPlaceholder} />
            {!editing && <input className={styles.searchBar} placeholder={t('deck_page_search_tip')} onChange={(keyword) => {
                onSearch(keyword.target.value)
            }} />}
        </div>
        <div className={styles.statsAndListRow}>
            <DeckCard shadow={"SMALL"} deck={deck as Deck} />
            <div className={styles.wordListContainer}>
                {searchKeyword && (sortedFilteredWordList.length > 0 ? <h3 className={styles.searchTitle}>Showing {sortedFilteredWordList.length} results for keyword &quot;{searchKeyword}&quot;:</h3> : <h3 className={styles.searchTitle}>Keyword &quot;{searchKeyword}&quot; has no search result.</h3>)}
                <AutoSizer>
                    {({ height, width }) => {
                        const heightDelta = searchKeyword ? 52 : 0;
                        return (
                            <List
                                width={width}
                                height={height - heightDelta}
                                rowCount={sortedFilteredWordList.length}
                                rowHeight={108}
                                rowRenderer={rowRenderer}
                            />
                        )
                    }}
                </AutoSizer>
            </div>
        </div>

    </Container>
}