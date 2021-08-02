import { useRouter } from 'next/router'
import Container from "cafe-ui/pageContainer";
import styles from "./index.module.css";
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from 'cafe-store/index';
import client from 'cafe-utils/client';
import { Deck, Word } from 'cafe-types/set'
import t from 'cafe-utils/i18n';
import Button from 'cafe-ui/button';
import { AutoSizer, List } from 'react-virtualized';
import debounce from 'lodash/debounce';
import DeckCard from 'cafe-components/deckCard';
import { addDeckWordUpdatePool, addDeckWordInsertPool, commitDeckChange } from 'cafe-utils/deckUpdatePoolUtils';
import { IoAddCircle, IoTrashBin, IoPencil, IoSave } from "react-icons/io5";
import swal from 'sweetalert';
import { v4 as uuid } from 'uuid';

export default function DeckPage() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const [deck, setDeck] = useState<Partial<Deck> | undefined>(undefined);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState<string>('');
    const [loading, setIsLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editingWord, setEditingWordValue] = useState<Word>();
    const setEditingWord = (w?: Word) => {
        setEditingWordValue(w || undefined);
        setTimeout(() => {
            document.getElementById('editing_word_input')?.focus();
        }, 0)
    }
    const [pendingNewWordTempIds, setPendingNewWordTempIds] = useState<string[]>([]);
    const [oldNewWordIdmapping, setOldNewWordIdmapping] = useState<{ [key: string]: string }>({});
    const currentDeckId = router.query?.set_id || '';
    const isOwnDeck = deck?.creator_id === store.user?.id;
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

        // must be UPDATE, can not handle ADD new word
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
            buttons: [true, true],
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete && deck?.words) {
                    setDeck({
                        ...(deck || {}),
                        words: deck?.words.filter(word => word.id !== wordId)
                    })
                    // add to delete pool
                }
            });
    }

    const onAddWord = async (afterWordId: string) => {
        setSearchKeyword('');
        setDebouncedSearchKeyword('');
        const tempUuid = uuid();
        const newEmptyWord = {
            id: tempUuid,
            set_id: currentDeckId,
            created_at: new Date().getTime(),
            edited_at: new Date().getTime(),
            content: {
                word: "",
                meaning: "",
                customized_fields: []
            }
        } as Word;
        const originalWords = deck?.words || [];
        const index = originalWords.findIndex(word => word.id === afterWordId);
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
                set_id: currentDeckId,
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
    const debouncedBatchUpdateDeck = useCallback(debounce((currentDeckId: string) => {
        commitDeckChange(currentDeckId);
    }, 1000), [])
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
                setIsLoading(false);
            })).then((result: Deck[]) => {
                setDeck(result[0]);
                setIsLoading(false);
            })
        }
    }, [store.user, currentDeckId])
    const rowRenderer = ({ key, index, style }: { key: string, index: number, style: any }) => {
        const content = sortedFilteredWordList[index].content;
        const wordId = sortedFilteredWordList[index].id;
        const isEditingThisWord = editingWord?.id === wordId;
        return (
            <div key={key} style={style} className={styles.wordRowOuterContainer}>
                <div className={styles.wordRow}>
                    {<div className={styles.wordWord}>{(editing || isEditingThisWord) ? <input id={isEditingThisWord ? 'editing_word_input' : undefined} value={content.word} onChange={(e) => {
                        onEditWord(e.target.value, content.meaning, wordId)
                    }} /> : content.word}</div>}
                    {<div className={styles.wordMeaning}>{(editing || isEditingThisWord) ? <input value={content.meaning} onChange={(e) => {
                        onEditWord(content.word, e.target.value, wordId)
                    }} /> : <span>{content.meaning}</span>}</div>}
                    <div className={styles.wordControllers}>
                        {isEditingThisWord && <div className={styles.wordController}>{<IoSave onClick={() => {
                            setEditingWord(undefined);
                        }} />}</div>}
                        {!isEditingThisWord && <div className={styles.wordController} onClick={() => {
                            setEditingWord(sortedFilteredWordList[index]);
                        }}>{<IoPencil />}</div>}
                        <div className={styles.wordController}>{<IoTrashBin onClick={() => {
                            onDeleteWord(wordId);
                        }} />}</div>
                        {!editingWord && <div className={styles.wordController}>{<IoAddCircle onClick={() => {
                            onAddWord(wordId);
                        }} />}</div>}
                    </div>
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
                setEditing(true);
            }}>{t('deck_page_edit')} ✏️</Button>}
            {isOwnDeck && editing && <Button type={'LARGE'} color={'PRIMARY'} onClick={() => {
                setEditing(false)
            }}>{t('deck_page_exit_edit')} 💾</Button>}

            <div className={styles.flexPlaceholder} />
            {!editing && <input className={styles.searchBar} placeholder={t('deck_page_search_tip')} value={searchKeyword} onChange={(keyword) => {
                onSearch(keyword.target.value);
                setSearchKeyword(keyword.target.value);
            }} />}
        </div>
        <div className={styles.statsAndListRow}>
            <DeckCard shadow={"SMALL"} deck={deck as Deck} />
            <div className={styles.wordListContainer}>
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
                            />
                        )
                    }}
                </AutoSizer>
            </div>
        </div>

    </Container>
}

