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
import { ImageUploader } from "cafe-ui/imageUploader";
import Button from 'cafe-ui/button';
import { NEW_PROGRESS_TEMPLATE, RECOMMEND_THEME_COLORS } from 'cafe-constants/index';
import { generateColorTheme } from 'cafe-utils/generateColorTheme';
import { Switch } from 'cafe-ui/switch';
import classNames from 'classnames';
import modal from "cafe-ui/modal";
import { IoCreate, IoPeopleCircle } from "react-icons/io5";

const CREATE_DECK_FORM_NAME_INPUT_ID = 'CREATE_DECK_FORM_NAME_INPUT_ID';
const INVITATION_CODE_INPUT_ID = 'INVITATION_CODE_INPUT_ID';
interface NewDeck {
    avatar: string,
    name: string,
    color: string
}

enum DECK_CATEGORY {
    STUDYING = 'STUDYING', FOLLOWING = 'FOLLOWING', OWNING = 'OWNING'
}

const CreateDeckForm = (props: { closeModal: () => void, onSubmit: (newDeck: NewDeck) => Promise<void>, t: (key: string) => string; }) => {
    const { t } = props;
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckAvatar, setNewDeckAvatar] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newDeckColor, setNewDeckColor] = useState(RECOMMEND_THEME_COLORS[Math.floor((Math.random() * RECOMMEND_THEME_COLORS.length))]);
    const normalizedColor = (newDeckColor?.[0] === '#') ? newDeckColor : ('#' + newDeckColor);
    const validateDeckThemeColor = () => {
        if (!newDeckColor) return false;
        return /^#[0-9A-F]{6}$/i.test(normalizedColor);
    }
    const themeSet = validateDeckThemeColor() ? generateColorTheme(normalizedColor) : [];
    return <><div className={styles.modalFormContainer}>
        <ImageUploader emptyImageText={t('home_create_deck_upload_image')} onImageChanged={(data) => {
            const imageBase64 = data[0].dataURL;
            setNewDeckAvatar(imageBase64 || '');
        }} onError={(e) => {
            if (e?.acceptType) {
                alert(t('File type not accepted.'))
            } else if (e?.maxFileSize) {
                alert(t('Please select an image with size less than 1mb.'))
            } else {
                alert('Unknown error.')
            }
        }} />
        <div className={styles.deckCreationFormRightContainer}>
            <div className={styles.deckCreationFormInputItem}>
                <h4>{t('home_create_deck_name')}</h4>
                <input id={CREATE_DECK_FORM_NAME_INPUT_ID} onChange={(e) => {
                    setNewDeckName(e.target.value)
                }} type="text" />
            </div>
            <div className={styles.deckCreationFormInputItem}>
                <h4>{t('home_create_deck_theme_color')}</h4>
                <input type="text" value={newDeckColor} onChange={(e) => {
                    setNewDeckColor(e.target.value)
                }} style={validateDeckThemeColor() ? {
                    color: themeSet[18],
                    backgroundColor: themeSet[1],
                } : undefined} />
            </div>
        </div>
    </div>
        <div className={styles.modalButtonRowContainer}><div className={styles.modalButtonRowInnerContainer}>
            <Button disabled={!newDeckName || isLoading} onClick={async () => {
                setIsLoading(true)
                await props.onSubmit({
                    avatar: newDeckAvatar,
                    name: newDeckName,
                    color: validateDeckThemeColor() ? normalizedColor : '#ff0000'
                })
                props.closeModal();
            }} loading={isLoading}>{t('home_create_deck_submit')}</Button>
            <Button type="SECONDARY" disabled={isLoading} onClick={() => {
                props.closeModal();
            }} loading={isLoading}>{t('general_cancel')}</Button>
        </div></div>
    </>
};

const InvitationCodeForm = (props: { closeModal: () => void, onFollowDeck: (id: string) => void; t: (key: string) => string; followingDeckIds: string[], owningDeckIds: string[] }) => {
    const { t } = props;
    const [code, setCode] = useState('');
    const [result, setResult] = useState<Deck>();
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchDeckViaCode = async (code: string, followingDeckIds: string[], owningDeckIds: string[]) => {
        const result = await client.callRPC({
            rpc: RPC.RPC_GET_DECK_BY_INVITE_CODE, data: {
                code
            }
        })
        setIsLoading(false);
        if (result.data) {
            if (followingDeckIds.includes(result.data?.id)) {
                setError(t('home_search_code_error_following'))
            } else if (owningDeckIds.includes(result.data?.id)) {
                setError(t('home_search_code_error_owning'))
            } else {
                setResult(result.data);
            }
        } else {
            setError(t('home_search_code_error_invalid'))
        }
    }

    return <><div className={classNames(styles.modalFormContainer, styles.modalFormContainerVertical)} style={{ marginBottom: 24 }}>
        {!result && <input onChange={(e) => setCode(e.target.value)} value={code} disabled={isLoading} id={INVITATION_CODE_INPUT_ID} className={styles.codeSearchBar}></input>}
        {result && <DeckCard externali18n={t} isMiniCard={true} shadow={"SMALL"} deck={result} />}
        {error && <span className={styles.codeSearchError}>{error}</span>}
    </div>
        <div className={styles.modalButtonRowContainer}><div className={styles.modalButtonRowInnerContainer}>

            {!result && <Button disabled={isLoading || !code} onClick={async () => {
                setError('');
                setIsLoading(true);
                fetchDeckViaCode(code, props.followingDeckIds, props.owningDeckIds);
            }} loading={isLoading}>{t('home_search_code')}</Button>}

            {!error && !!result && <Button onClick={async () => {
                setIsLoading(true);
                await result && props.onFollowDeck(result?.id);
                setIsLoading(false);
                props.closeModal();
            }}>{t('home_search_code_follow')}</Button>}

            <Button type="SECONDARY" onClick={() => {
                props.closeModal();
            }}>{t('general_cancel')}</Button>
        </div></div>
    </>
};

const HOME_SHOWING_CATEGORIES = 'HOME_SHOWING_CATEGORIES';

export default function Home() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    useAuthGuard();
    const t = store.t;
    const hasAuthenticated = (store.authenticatingInProgress === false);
    const [decks, setDecks] = useState<Deck[]>();
    const [showingCategories, setShowingCategoriesLocally] = useState<{ [key: string]: boolean }>({
        [DECK_CATEGORY.FOLLOWING]: true,
        [DECK_CATEGORY.OWNING]: true,
        [DECK_CATEGORY.STUDYING]: true,
    });
    const setShowingCategories = (data: { [key: string]: boolean }) => {
        localStorage.setItem(HOME_SHOWING_CATEGORIES, JSON.stringify(data));
        setShowingCategoriesLocally(data);
    }
    const createNewDeck = async (newDeck: NewDeck) => {
        const result = await client.callRPC({
            rpc: RPC.RPC_CREATE_DECK, data: {
                deck: newDeck, words: [{
                    content: {
                        word: "Qahva",
                        meaning: "Coffee ☕",
                        customized_fields: []
                    }
                }]
            }
        });
        store.updateUser();
        return result.data;
    }

    const followingDecks = decks?.filter((d) => store.user?.followingDeckIds?.includes(d.id)) || [];
    const owningDecks = decks?.filter((d) => store.user?.owningDeckIds?.includes(d.id)) || [];
    const studyingDecks = decks?.filter((d) => store.user?.progress?.[d.id]?.has_started) || [];

    useEffect(() => {
        // Fetch all decks and progress
        const allDecks = [...store.user?.followingDeckIds || [], ...store.user?.owningDeckIds || []];
        if (allDecks.length > 0) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: allDecks
                }
            }, `RPC_GET_DECK_BY_IDS[${allDecks.join(',')}]`, ((result: { data?: Deck[], error: string }) => {
                setDecks(result.data?.sort((a, b) => (store.user?.progress?.[a.id]?.updated_at || 0) - (store.user?.progress?.[b.id]?.updated_at || 0) > 0 ? -1 : 1))
            })).then((result: { data?: Deck[], error: string }) => {
                setDecks(result.data?.sort((a, b) => (store.user?.progress?.[a.id]?.updated_at || 0) - (store.user?.progress?.[b.id]?.updated_at || 0) > 0 ? -1 : 1))
            })
        } else {
            setDecks([])
        }
        try {
            const s = JSON.parse(localStorage.getItem(HOME_SHOWING_CATEGORIES) || 'null');
            s && setShowingCategories(s);
        } catch (e) {
            console.warn(e);
        }
    }, [store.user])
    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading || !decks);
    }, [decks, store.isLocaleLoading || store.isUserLoading])

    const followDeck = async (id: string) => {
        const NEW_PROGRESS = {
            started_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            ...NEW_PROGRESS_TEMPLATE
        }
        await client.callRPC({
            rpc: RPC.RPC_UPDATE_USER_INFO,
            data: {
                followingDeckIds: [...store.user?.followingDeckIds || [], id],
                progress: {
                    ...store.user?.progress,
                    [id]: {
                        ...NEW_PROGRESS,
                        deck_id: id,
                    }
                },
            }
        })
        await store.updateUser();
        setTimeout(() => {
            router.push('/deck/' + id)
        }, 300)
    }

    const renderDeckCard = (category: DECK_CATEGORY) => {
        const renderDeckCardSingle = (mini: boolean, deck?: Deck) => deck?.id ? <DeckCard isMiniCard={mini} shadow={"NORMAL"} key={`deck_card_${deck?.id}`} deck={deck} progress={store.user?.progress?.[deck?.id]} onClickEnter={() => {
            deck && router.push(`/deck/${deck.id}`)
        }} /> : null;

        switch (category) {
            case DECK_CATEGORY.FOLLOWING: {
                return followingDecks.map((deck) => renderDeckCardSingle(true, deck))
            }
            case DECK_CATEGORY.OWNING: {
                return owningDecks.map((deck) => renderDeckCardSingle(true, deck))
            }
            case DECK_CATEGORY.STUDYING: {
                return studyingDecks.map((deck) => renderDeckCardSingle(false, deck))
            }
        }
    }

    return hasAuthenticated && (
        <>
            <Container>
                <div className={styles.sectionOuterContainer}>
                    <div className={styles.titleRow}><h1>{t('home_title')}</h1></div>
                    <div className={styles.controlRow}>
                        <div className={styles.controlRowLeft}>
                            <Switch value={showingCategories[DECK_CATEGORY.STUDYING]} onChange={(v) => setShowingCategories({ ...showingCategories, [DECK_CATEGORY.STUDYING]: v })} label={t('home_studying', { count: studyingDecks.length + '' })} />
                            <Switch value={showingCategories[DECK_CATEGORY.OWNING]} onChange={(v) => setShowingCategories({ ...showingCategories, [DECK_CATEGORY.OWNING]: v })} label={t('home_mine', { count: owningDecks.length + '' })} />
                            <Switch value={showingCategories[DECK_CATEGORY.FOLLOWING]} onChange={(v) => setShowingCategories({ ...showingCategories, [DECK_CATEGORY.FOLLOWING]: v })} label={t('home_following', { count: followingDecks.length + '' })} />
                        </div>
                        <div className={styles.controlRowRight}>
                            {/* <input className={styles.searchBar}></input> */}
                            <Button iconRenderer={() => <IoCreate />} onClick={() => {
                                modal.fire({
                                    contentRendererWillRenderButton: true,
                                    hideButtons: true,
                                    hideIcon: true,
                                    translator: t,
                                    disableClickOutside: true,
                                    title: t('deck_component_create_new'),
                                    contentRenderer: (closeModal) => <CreateDeckForm closeModal={closeModal} t={store.t} onSubmit={async (newDeck: NewDeck) => {
                                        const result = await createNewDeck(newDeck);
                                        router.push("/deck/" + result.id);
                                    }} />,
                                    didOpen: () => {
                                        document.getElementById(CREATE_DECK_FORM_NAME_INPUT_ID)?.focus();
                                    }
                                })
                            }}>{t('deck_component_create_new')}</Button>
                            <Button iconRenderer={() => <IoPeopleCircle />} onClick={() => {
                                modal.fire({
                                    translator: t,
                                    hideButtons: true,
                                    hideIcon: true,
                                    contentRendererWillRenderButton: true,
                                    disableClickOutside: true,
                                    title: t('home_join_via_code'),
                                    contentRenderer: (closeModal) => <InvitationCodeForm closeModal={closeModal} onFollowDeck={(id: string) => followDeck(id)} t={store.t} owningDeckIds={store.user?.owningDeckIds || []} followingDeckIds={store.user?.followingDeckIds || []} />,
                                    didOpen: () => {
                                        document.getElementById(INVITATION_CODE_INPUT_ID)?.focus();
                                    }
                                })
                            }}>{t('home_join_via_code')}</Button>
                        </div>
                    </div>
                    {/* <DeckCard isPlaceholder shadow={"NORMAL"} onClickEnter={() => {

                    }} /> */}
                    <div className={styles.section}>
                        {studyingDecks.length && showingCategories[DECK_CATEGORY.STUDYING] ? <><div className={styles.titleRow}><h1>{t('home_studying', { count: studyingDecks.length + '' })}</h1></div>
                            <div className={styles.deckCardsRow}>
                                {renderDeckCard(DECK_CATEGORY.STUDYING)}
                            </div></> : null}
                    </div>
                    <div className={styles.section}>
                        {owningDecks.length && showingCategories[DECK_CATEGORY.OWNING] ? <><div className={styles.titleRow}><h1>{t('home_mine', { count: owningDecks.length + '' })}</h1></div>
                            <div className={styles.deckCardsRow}>
                                {renderDeckCard(DECK_CATEGORY.OWNING)}
                            </div></> : null}
                    </div>
                    <div className={styles.section}>
                        {followingDecks.length && showingCategories[DECK_CATEGORY.FOLLOWING] ? <><div className={styles.titleRow}><h1>{t('home_following', { count: followingDecks.length + '' })}</h1></div>
                            <div className={styles.deckCardsRow}>
                                {renderDeckCard(DECK_CATEGORY.FOLLOWING)}
                            </div></> : null}
                    </div>
                    {/* <div className={styles.section}>
                        <div className={styles.titleRow}><h1>{t('home_all_decks')}</h1></div>
                        <div className={styles.deckCardsRow}>
                            {renderDeckCard()}
                        </div>
                    </div> */}
                </div>
            </Container>
        </>
    )
};