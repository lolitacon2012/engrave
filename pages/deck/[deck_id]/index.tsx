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
import { addDeckWordUpdatePool, addDeckWordInsertPool, commitDeckChange, addWordDeletePool, cleanCache } from 'cafe-utils/deckUpdatePoolUtils';
import { IoAddCircle, IoTrashBin, IoPencil, IoSave, IoLocate, IoClipboardOutline, IoArrowBack, IoGolf, IoSettings, IoShare, IoHelpCircle, IoRocket, IoMegaphoneSharp, IoStar } from "react-icons/io5";

import cn from 'classnames';
import { v4 as uuid } from 'uuid';
import { decodeRubyWithFallback } from 'cafe-utils/ruby';
import useAuthGuard from 'hooks/useAuthGuard';
import modal, { alertDeveloping } from 'cafe-ui/modal';

const WHATS_NEW_TIMESTAMP = 'whatsnew_20220528';

export default function DeckPage() {
    useAuthGuard();
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const t = store.t;
    const hasAuthenticated = (store.authenticatingInProgress === false);

    const [deck, setDeck] = useState<Partial<Deck> | undefined>(undefined);
    const [duplicatedWordIdsSet, setDuplicatedWordIdsSet] = useState<Set<string>>();
    useEffect(()=>{
        console.log('DeckPage loaded')
    }, [])
    useEffect(() => {
        const markAsRead = (c: () => void) => {
            localStorage.setItem(WHATS_NEW_TIMESTAMP, WHATS_NEW_TIMESTAMP);
            c();
        }
        if (!localStorage.getItem(WHATS_NEW_TIMESTAMP)) {
            markAsRead(()=>{});
            for (let i = 0, len = localStorage.length; i < len; ++i) {
                if (localStorage.key(i) && localStorage.key(i)?.includes('whatsnew_')) {
                    localStorage.removeItem(localStorage.key(i) || '');
                }
            }
            setTimeout(() => {
                modal.fire({
                    translator: t,
                    hideCancelButton: true,
                    title: t('general_update'),
                    contentRenderer: () => {
                        return <div>{t('general_update_' + WHATS_NEW_TIMESTAMP).split('\n').map(s => <p key={Math.random()} style={{ textAlign: 'left' }}>{s}</p>)}</div>
                    },
                    onConfirm: (closeModal) => markAsRead(closeModal),
                    onCancel: (closeModal) => markAsRead(closeModal),
                    disableClickOutside: true,
                    contentIconRenderer: () => <IoStar></IoStar>,
                })
            }, 300)
        }
    }, [])
    useEffect(() => {
        const newWordSet = new Set<string>();
        const newDuplicatedWordIdsSet = new Set<string>();
        const newDuplicatedWordsSet = new Set<string>();
        const pairs = (deck?.words?.map(w => {
            const decodedWord = decodeRubyWithFallback(w.content.word || '');
            return { id: w.id, word: decodedWord.mainOnlyText + decodedWord.rubyOnlyText }
        }) || []
        );
        for (let i = 0; i < pairs.length; i++) {
            const index = i;
            const currentPair = pairs[index];
            if (newWordSet.has(currentPair.word)) {
                newDuplicatedWordIdsSet.add(currentPair.id)
                newDuplicatedWordsSet.add(currentPair.word)
            }
            newWordSet.add(currentPair.word);
        }
        for (let i = 0; i < pairs.length; i++) {
            const index = pairs.length - 1 - i;
            const currentPair = pairs[index];
            if (newDuplicatedWordsSet.has(currentPair.word)) {
                newDuplicatedWordIdsSet.add(currentPair.id)
            }
        }
        setDuplicatedWordIdsSet(newDuplicatedWordIdsSet);
    }, [deck?.words])
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
        batchUpdateDeck(currentDeckId);
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
        }
    }

    const onDeleteWord = (wordId: string) => {
        modal.fire({
            translator: t,
            contentText: t('deck_page_delete_modal_text'),
            cancelButtonText: t("general_cancel"),
            confirmButtonText: t("general_delete"),
            type: 'DANGER',
            onConfirm: (closeModal) => {
                if (deck?.words) {
                    const newWords = deck?.words.filter(word => word.id !== wordId);
                    setDeck({
                        ...(deck || {}),
                        words: newWords
                    })
                    addDeckWordInsertPool(newWords.map(w => w.id));
                    addWordDeletePool(wordId);
                    batchUpdateDeck(currentDeckId);
                    closeModal();
                    setEditingWord(undefined);
                }
            }
        })
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
            creator_id: store.user?.id,
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
        const newId = res.data.newIds[0];
        setOldNewWordIdmapping({
            ...oldNewWordIdmapping,
            [tempUuid]: newId
        })
    }

    const sortedFilteredWordList = calculateDeckList();
    const onSearch = useCallback(debounce((keyword: string) => {
        setDebouncedSearchKeyword(keyword);
        batchUpdateDeck(currentDeckId);
        setEditingWord(undefined);
    }, 500), [])
    const onCheckDuplication = useCallback(debounce((keyword: string) => {
        return
    }, 300), [deck?.words])
    const batchUpdateDeck = useCallback(debounce((currentDeckId?: string) => {
        currentDeckId && commitDeckChange(currentDeckId, () => store.updateUser());
    }, 300), [])

    const onTabWithWordListLastWord = (e: KeyboardEvent) => {
        if ((document.activeElement?.className || '').includes('editing_meaning_input')) {

            const lastword = sortedFilteredWordList?.slice(-1)[0];

            const isEditingLastWord = (sortedFilteredWordList?.slice(-1)[0].id === editingWord?.id) || ((document.activeElement?.className || '').includes('editing_meaning_input_last'))

            if (!isEditingLastWord && editing) {
                return;
            }
            e.preventDefault();
            if (!!editingWord) {
                setEditingWord(undefined);
            }
            if (isEditingLastWord || editing) {
                onAddWord('', true);
            } else {
                setEditingWord(sortedFilteredWordList[sortedFilteredWordList.findIndex(w => w.id === editingWord?.id) + 1]);
            }
        }
    }

    const onTabKeyPress = (e: KeyboardEvent) => {
        const key = e.key || e.keyCode;
        if (key === 9 || key === "Tab") {
            onTabWithWordListLastWord(e);
        }
    }

    // shortkeys
    useEffect(() => {
        document.addEventListener('keydown', onTabKeyPress)
        return () => { document.removeEventListener('keydown', onTabKeyPress) }
    }, [sortedFilteredWordList, editingWord, editing])

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
            batchUpdateDeck(deck?.id)
        }
    }, [oldNewWordIdmapping])

    useEffect(() => {
        const onFinishLoading = (deck: Deck) => {
            setDeck(deck);
            if (!deck) {
                store.setError(404);
            }
        }
        // Fetch current deck
        if (currentDeckId) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: [currentDeckId]
                }
            }, `RPC_GET_DECK_BY_IDS[${currentDeckId}]`, (({ data, error }) => {
                onFinishLoading(data[0])
            })).then(({ data, error }) => {
                onFinishLoading(data[0])
            })
        }
    }, [store.user?.id, currentDeckId])

    useEffect(() => {
        deck?.id && cleanCache();
    }, [deck?.id])

    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading || !deck || deck.id !== currentDeckId);
    }, [deck, store.isLocaleLoading || store.isUserLoading])

    const rowRenderer = ({ key, index, style }: { key: string, index: number, style: any }) => {
        const content = sortedFilteredWordList[index].content;
        const wordId = sortedFilteredWordList[index].id;
        const isEditingThisWord = editingWord?.id === wordId;
        const isLastWord = wordId === sortedFilteredWordList[sortedFilteredWordList.length - 1].id;
        const highlight = index === scrollToIndex;
        const isDuplicated = duplicatedWordIdsSet?.has(wordId);
        const isDev = (process.env.NODE_ENV) === 'development';
        return (
            <div key={key} style={style} data-word-id={isDev ? wordId : undefined} className={cn(styles.wordRowOuterContainer, highlight && styles.highlightWord)}>
                <div className={cn(styles.wordRow, 'withSmallShadow')}>
                    {<div className={styles.wordWord}>{(editing || isEditingThisWord) ? <input id={isEditingThisWord ? 'editing_word_input' : undefined} value={content.word} onChange={(e) => {
                        onEditWord(e.target.value, content.meaning, wordId)
                    }} /> : decodeRubyWithFallback(content.word).element}{isDuplicated && <span className={styles.duplicationIndicator}><span><IoHelpCircle className={styles.duplicationIndicatorIcon} /></span><span>{t('deck_page_has_duplication')}</span></span>}</div>}
                    {<div className={styles.wordMeaning}>{(editing || isEditingThisWord) ? <input className={`editing_meaning_input${isLastWord ? '_last' : ''}`} value={content.meaning} onChange={(e) => {
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
    return hasAuthenticated && <Container fullHeight>
        <div className={styles.titleRow}>
            <h1>{deck?.name} - {t('deck_page_list')}</h1>
        </div>
        <div className={styles.controllerRow}>
            {!editing && <Button type={'PRIMARY'} onClick={() => {
                router.push(`/home`)
            }} iconRenderer={() => <IoArrowBack />}>{t('deck_page_back_to_list')}</Button>}
            {!editing && <Button type={'PRIMARY'} onClick={() => {
                if (!deck?.words?.length) {
                    modal.fire({
                        contentText: t('deck_page_empty_list'),
                        confirmButtonText: t("general_ok"),
                        translator: t,
                        hideCancelButton: true,
                    })
                } else {
                    router.push(`/deck/${currentDeckId}/study`)
                }
            }} iconRenderer={() => <IoGolf />}>{t(store.user?.progress?.[currentDeckId]?.has_started ? 'deck_page_continue_study' : 'deck_page_begin_study')}</Button>}
            {/* {!editing && <Button type={'PRIMARY'} onClick={() => {

            }}>{t('deck_page_flashcard')} ✔️</Button>} */}
            {!editing && <Button iconRenderer={() => <IoSettings />} type={'PRIMARY'} onClick={() => {
                setEditingWord(undefined);
                batchUpdateDeck(deck?.id);
                router.push(`/deck/${currentDeckId}/settings`)
            }}>{t('deck_page_settings')}</Button>}
            {isOwnDeck && !editing && <Button type={'PRIMARY'} onClick={() => {
                setEditing(true);
                setEditingWord(undefined);
                batchUpdateDeck(deck?.id);
            }} iconRenderer={() => <IoPencil />}>{t('deck_page_edit')}</Button>}
            {isOwnDeck && editing && <Button type={'PRIMARY'} onClick={() => {
                setEditing(false)
                setEditingWord(undefined);
                batchUpdateDeck(deck?.id);

            }} iconRenderer={() => <IoSave />}>{t('deck_page_exit_edit')}</Button>}
            {!editing && <Button type={'PRIMARY'} onClick={() => {
                alertDeveloping(t);
            }} iconRenderer={() => <IoShare />}>{t('deck_generate_code')}</Button>}

            <div className={styles.flexPlaceholder} />
            {!editing && <input className={cn(styles.searchBar, 'withSmallShadow')} placeholder={t('deck_page_search_tip')} value={searchKeyword} onChange={(keyword) => {
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
                        <Button iconRenderer={() => <IoAddCircle />} type={'PRIMARY'} onClick={() => {
                            onAddWord();
                        }}>{t('deck_page_add_first_word')}</Button>
                    </div> :
                    <>
                        {debouncedSearchKeyword && (sortedFilteredWordList.length > 0 ? <h3 className={styles.searchTitle}>{t("deck_page_search_result_title", {
                            number: sortedFilteredWordList.length + '', keyword: debouncedSearchKeyword
                        })}</h3> : <h3 className={styles.searchTitle}>{t("deck_page_search_result_empty_title", {
                            keyword: debouncedSearchKeyword
                        })}</h3>)}
                        {/* @ts-ignore AutoSizer is not fully compativle with react 18 */}
                        <AutoSizer>
                            {({ height, width }) => {
                                const heightDelta = debouncedSearchKeyword ? 52 : 0;
                                return (
                                    /* @ts-ignore AutoSizer is not fully compativle with react 18 */
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