import { useRouter } from 'next/router'
import Container from "cafe-ui/pageContainer";
import styles from "./index.module.css";
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from 'cafe-store/index';
import client from 'cafe-utils/client';
import { Deck, Word } from 'cafe-types/deck'

import Button from 'cafe-ui/button';
import { AutoSizer, List } from 'react-virtualized';
import debounce from 'lodash/debounce';
import DeckCard from 'cafe-components/deckCard';
import { addDeckWordUpdatePool, addDeckWordInsertPool, commitDeckChange, addWordDeletePool } from 'cafe-utils/deckUpdatePoolUtils';
import { IoAddCircle, IoTrashBin, IoPencil, IoSave, IoLocate, IoClipboardOutline } from "react-icons/io5";
import swal from 'sweetalert';
import cn from 'classnames';
import { v4 as uuid } from 'uuid';
import { decodeRubyWithFallback } from 'cafe-utils/ruby';
import useAuthGuard from 'hooks/useAuthGuard';


export default function DeckPage() {
    useAuthGuard();
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const t = store.t;
    const hasAuthenticated = (store.authenticatingInProgress === false);
    const [deck, setDeck] = useState<Partial<Deck> | undefined>(undefined);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState<string>('');
    const [editing, setEditing] = useState(false);
    const [editingWord, setEditingWordValue] = useState<Word>();
    const [scrollToIndex, setScrollToIndex] = useState<number>();
    const setEditingWord = (w?: Word) => {
        setEditingWordValue(w || undefined);
        setTimeout(() => {
            document.getElementById('editing_word_input')?.focus();
        }, 0)
    }
    const [pendingNewWordTempIds, setPendingNewWordTempIds] = useState<string[]>([]);
    const [oldNewWordIdmapping, setOldNewWordIdmapping] = useState<{ [key: string]: string }>({});
    const currentDeckId = router.query?.deck_id as string || '' as string;
    const isOwnDeck = deck?.creator_id === store.user?.id;
    const isEmptyDeck = !deck?.words?.length;
    const calculateDeckList = () => {
        let originalOrder = deck?.words || [];
        if (!!debouncedSearchKeyword) {
            originalOrder = originalOrder.filter(word => {
                const unifiedKeyword = debouncedSearchKeyword.toLowerCase();
                const unifiedMeaning = word.content.meaning?.toLowerCase() || '';
                const unifiedWord = word.content.word?.toLowerCase() || '';
                return (unifiedMeaning.includes(unifiedKeyword) || unifiedWord.includes(unifiedKeyword))
            })
        }
        return originalOrder;
    }
    const onEditWord = (word: string, meaning: string, wordId: string) => {
        const isTempWord = pendingNewWordTempIds.includes(wordId);

        // must be UPDATE, can not handle ADD or DELETE word
        const newWords = deck?.words || [];
        const originalWordIndex = newWords.findIndex((w) => w.id === wordId);
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
        if (!isTempWord) {
            addDeckWordUpdatePool(originalWord.id, newContent);
            deck?.id && debouncedBatchUpdateDeck(deck.id);
        }
    }

    const onDeleteWord = (wordId: string) => {
        swal({
            text: t('deck_page_delete_modal_text'),
            icon: "warning",
            buttons: [t("general_cancel"), t("general_delete")],
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete && deck?.words) {
                    const newWords = deck?.words.filter(word => word.id !== wordId);
                    setDeck({
                        ...(deck || {}),
                        words: newWords
                    })
                    addDeckWordInsertPool(newWords.map(w => w.id));
                    addWordDeletePool(wordId);
                    debouncedBatchUpdateDeck(currentDeckId);
                }
            });
    }

    const onAddWord = async (wordId?: string, addToLast?: boolean) => {
        const afterWordId = wordId || sortedFilteredWordList[sortedFilteredWordList.length - 1]?.id || '';
        const addToFront = !wordId && !addToLast;
        setSearchKeyword('');
        setDebouncedSearchKeyword('');
        const tempUuid = uuid();
        const newEmptyWord = {
            id: tempUuid,
            deck_id: currentDeckId,
            created_at: new Date().getTime(),
            edited_at: new Date().getTime(),
            content: {
                word: "",
                meaning: "",
                customized_fields: []
            }
        } as Word;
        const originalWords = deck?.words || [];
        const index = addToFront ? 0 : (addToLast ? originalWords.length - 1 : originalWords.findIndex(word => word.id === afterWordId));
        setPendingNewWordTempIds([...pendingNewWordTempIds, tempUuid]);
        const tempNewWordsList = [...(originalWords.slice(0, index + 1)), newEmptyWord, ...(originalWords.slice(index + 1))];
        setDeck({
            ...(deck || {}),
            words: tempNewWordsList,
        })
        setEditingWord(newEmptyWord);
        const res = await client.callRPC({
            rpc: RPC.RPC_CREATE_WORDS,
            data: {
                deck_id: currentDeckId,
                contents: [{
                    word: "",
                    meaning: "",
                    customized_fields: []
                }]
            }
        });
        const newId = res.newIds[0];
        setOldNewWordIdmapping({
            ...oldNewWordIdmapping,
            [tempUuid]: newId
        })
    }

    const sortedFilteredWordList = calculateDeckList();
    const onSearch = useCallback(debounce((keyword: string) => {
        setDebouncedSearchKeyword(keyword);
    }, 500), [])
    const debouncedBatchUpdateDeck = useCallback(debounce((currentDeckId?: string) => {
        currentDeckId && commitDeckChange(currentDeckId);
    }, 500), [])

    const onTabWithWordListLastWord = (e: KeyboardEvent) => {
        if (document.activeElement?.id === 'editing_meaning_input_last') {
            e.preventDefault();
            if (!!editingWord) {
                setEditingWord(undefined);
            }
            onAddWord('', true);
        }
    }

    const onTabKeyDown = (e: KeyboardEvent) => {
        const key = e.key || e.keyCode;
        if (key === 9 || key === "Tab") {
            onTabWithWordListLastWord(e);
        }
    }

    // shortkeys
    useEffect(() => {
        document.addEventListener('keydown', onTabKeyDown)
        return () => { document.removeEventListener('keydown', onTabKeyDown) }
    }, [sortedFilteredWordList])

    // listening on new word's new id
    useEffect(() => {
        const keys = Object.keys(oldNewWordIdmapping);
        if (keys.length > 0) {
            const newWordIds = [] as string[];
            setDeck({
                ...(deck || {}),
                words: deck?.words?.map((w) => {
                    if (keys.includes(w.id)) {
                        const newId = oldNewWordIdmapping[keys[keys.indexOf(w.id)]];
                        newWordIds.push(newId);
                        // update editing word id to new id
                        (editingWord?.id === w.id) && setEditingWord({
                            ...w,
                            id: newId
                        })
                        return {
                            ...w,
                            id: newId
                        }
                    } else {
                        newWordIds.push(w.id);
                        return w
                    }
                })
            })
            setOldNewWordIdmapping({});
            setPendingNewWordTempIds(pendingNewWordTempIds.filter(i => !keys.includes(i)));
            addDeckWordInsertPool(newWordIds);
            debouncedBatchUpdateDeck(deck?.id)
        }
    }, [oldNewWordIdmapping])

    useEffect(() => {
        // Fetch current deck
        if (currentDeckId) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: [currentDeckId]
                }
            }, `RPC_GET_DECK_BY_IDS[${currentDeckId}]`, ((result: Deck[]) => {
                setDeck(result[0]);
            })).then((result: Deck[]) => {
                setDeck(result[0]);
            })
        }
    }, [store.user, currentDeckId])

    useEffect(() => {
        deck?.id && commitDeckChange(deck?.id);
    }, [deck?.id])

    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading || !deck);
    }, [deck, store.isLocaleLoading || store.isUserLoading])

    const rowRenderer = ({ key, index, style }: { key: string, index: number, style: any }) => {
        const content = sortedFilteredWordList[index].content;
        const wordId = sortedFilteredWordList[index].id;
        const isEditingThisWord = editingWord?.id === wordId;
        const isLastWord = wordId === sortedFilteredWordList[sortedFilteredWordList.length - 1].id;
        const highlight = index === scrollToIndex;
        const isDev = (process.env.NODE_ENV) === 'development';
        return (
            <div key={key} style={style} data-word-id={isDev ? wordId : undefined} className={cn(styles.wordRowOuterContainer, highlight && styles.highlightWord)}>
                <div className={styles.wordRow}>
                    {<div className={styles.wordWord}>{(editing || isEditingThisWord) ? <input id={isEditingThisWord ? 'editing_word_input' : undefined} value={content.word} onChange={(e) => {
                        onEditWord(e.target.value, content.meaning, wordId)
                    }} /> : decodeRubyWithFallback(content.word)}</div>}
                    {<div className={styles.wordMeaning}>{(editing || isEditingThisWord) ? <input id={isLastWord ? 'editing_meaning_input_last' : undefined} value={content.meaning} onChange={(e) => {
                        onEditWord(content.word, e.target.value, wordId)
                    }} /> : <span>{content.meaning}</span>}</div>}
                    {isOwnDeck && <div className={styles.wordControllers}>
                        {isEditingThisWord && !editing && <div className={styles.wordController}>{<IoSave onClick={() => {
                            setEditingWord(undefined);
                        }} />}</div>}
                        {!isEditingThisWord && !editing && <div className={styles.wordController} onClick={() => {
                            setEditingWord(sortedFilteredWordList[index]);
                        }}>{<IoPencil />}</div>}
                        <div className={styles.wordController}>{<IoTrashBin onClick={() => {
                            onDeleteWord(wordId);
                        }} />}</div>
                        {(editing || !editingWord) && <div className={styles.wordController}>{<IoAddCircle onClick={() => {
                            onAddWord(wordId);
                        }} />}</div>}
                        {!isEditingThisWord && !editing && debouncedSearchKeyword && <div className={styles.wordController}>{<IoLocate onClick={() => {
                            const indexInOriginalList = deck?.words?.findIndex(w => w.id === wordId) || 0;
                            setSearchKeyword('');
                            setDebouncedSearchKeyword('');
                            setScrollToIndex(indexInOriginalList);
                            setTimeout(() => {
                                setScrollToIndex(undefined)
                            }, 500)
                        }} />}</div>}
                    </div>}
                </div>
            </div>
        );
    }

    return hasAuthenticated && <Container>
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
                setEditing(true);
                setEditingWord(undefined);
            }}>{t('deck_page_edit')} ✏️</Button>}
            {isOwnDeck && editing && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                setEditing(false)
                setEditingWord(undefined);

            }}>{t('deck_page_exit_edit')} 💾</Button>}

            <div className={styles.flexPlaceholder} />
            {!editing && <input className={styles.searchBar} placeholder={t('deck_page_search_tip')} value={searchKeyword} onChange={(keyword) => {
                onSearch(keyword.target.value);
                setSearchKeyword(keyword.target.value);
            }} />}
        </div>
        <div className={styles.statsAndListRow}>
            <DeckCard shadow={"SMALL"} deck={deck as Deck} progress={store.user?.progress?.[currentDeckId]} />
            <div className={styles.wordListContainer}>
                {isEmptyDeck ?
                    <div className={styles.emptyWordList}>
                        <h1><IoClipboardOutline /></h1>
                        <h2>{t('deck_page_empty_list')}</h2>
                        <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                            onAddWord();
                        }}>{t('deck_page_add_first_word')} ⛳</Button>
                    </div> :
                    <>
                        {debouncedSearchKeyword && (sortedFilteredWordList.length > 0 ? <h3 className={styles.searchTitle}>Showing {sortedFilteredWordList.length} results for keyword &quot;{debouncedSearchKeyword}&quot;:</h3> : <h3 className={styles.searchTitle}>Keyword &quot;{debouncedSearchKeyword}&quot; has no search result.</h3>)}
                        <AutoSizer>
                            {({ height, width }) => {
                                const heightDelta = debouncedSearchKeyword ? 52 : 0;
                                return (
                                    <List
                                        width={width}
                                        height={height - heightDelta}
                                        rowCount={sortedFilteredWordList.length}
                                        rowHeight={108}
                                        rowRenderer={rowRenderer}
                                        scrollToIndex={scrollToIndex}
                                    />
                                )
                            }}
                        </AutoSizer>
                    </>
                }
            </div>
        </div>

    </Container>
}