import ReactDOM from 'react-dom';
import Container from "cafe-ui/pageContainer";
import styles from "./home.module.css";
import { useRouter } from 'next/router'
import client from 'cafe-utils/client';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from "cafe-store/index";
import { Deck } from "cafe-types/deck";
import DeckCard from "cafe-components/deckCard";
import useAuthGuard from "hooks/useAuthGuard";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import { ImageUploader } from "cafe-ui/imageUploader";
import Button from 'cafe-ui/button';
import { RECOMMEND_THEME_COLORS } from 'cafe-constants/index';
import { generateColorTheme } from 'cafe-utils/generateColorTheme';
const ReactSwal = withReactContent(Swal);

const CREATE_DECK_FORM_NAME_INPUT_ID = 'CREATE_DECK_FORM_NAME_INPUT_ID';
interface NewDeck {
    avatar: string,
    name: string,
    color: string
}

const CreateDeckForm = (props: { onSubmit: (newDeck: NewDeck) => Promise<void>, t: (key: string) => string; }) => {
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
    return <><div className={styles.deckCreationFormContainer}>
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
        <div className={styles.deckCreationSubmitButton}>
            <Button disabled={!newDeckName || isLoading} onClick={async () => {
                setIsLoading(true)
                await props.onSubmit({
                    avatar: newDeckAvatar,
                    name: newDeckName,
                    color: validateDeckThemeColor() ? normalizedColor : '#ff0000'
                })
                ReactSwal.close();
            }} loading={isLoading}>{t('home_create_deck_submit')}</Button>
            <Button disabled={isLoading} onClick={() => {
                ReactSwal.close();
            }} loading={isLoading}>{t('general_cancel')}</Button>
        </div>
    </>
};

export default function Home() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    useAuthGuard();
    const t = store.t;
    const hasAuthenticated = (store.authenticatingInProgress === false);
    const [decks, setDecks] = useState<Deck[]>();
    // const createDeck = (fullDeck?: string) => {
    //     const words = (fullDeck || '').split('========').map((w: string) => {
    //         const ww = w.split('--------')[0];
    //         const meaning = w.split('--------')[1];
    //         return {
    //             content: {
    //                 word: ww,
    //                 meaning: meaning,
    //                 customized_fields: []
    //             }
    //         }
    //     })
    //     const newDeck = {
    //         name: "O'zbek tili",
    //         avatar: "Uz",
    //         color: "#73A0A4",
    //     }
    //     client.callRPC({
    //         rpc: RPC.RPC_CREATE_DECK, data: {
    //             deck: newDeck, words: words
    //         }
    //     });
    // }
    const createNewDeck = async (newDeck: NewDeck) => {
        await client.callRPC({
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
                setDecks(result.sort((a, b) => a.created_at - b.created_at > 0 ? -1 : 1))
            })).then((result: Deck[]) => {
                setDecks(result.sort((a, b) => a.created_at - b.created_at > 0 ? -1 : 1))
            })
        } else {
            setDecks([])
        }
    }, [store.user])
    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading || !decks);
    }, [decks, store.isLocaleLoading || store.isUserLoading])

    const studyingCards = decks?.filter(deck => {
        return !!store.user?.progress?.[deck.id];
    })

    const nonStudyingCards = decks?.filter(deck => {
        return !!!store.user?.progress?.[deck.id];
    })

    const renderDeckCard = (isStudying?: boolean) => {
        return ((isStudying ? studyingCards : nonStudyingCards) || []).map((deck) =>
            <DeckCard isMiniCard={!isStudying} shadow={"NORMAL"} key={`deck_card_${deck?.id}`} deck={deck} progress={store.user?.progress?.[deck?.id]} onClickEnter={() => {
                deck && router.push(`/deck/${deck.id}`)
            }} />
        )
    }

    return hasAuthenticated && (
        <>
            <Container>
                {studyingCards?.length ? <><h1>{t('home_title')}</h1>
                    <div className={styles.deckCardsRow}>
                        {renderDeckCard(true)}
                    </div></> : null}
                <h1>{t('home_all_decks')}</h1>
                <div className={styles.deckCardsRow}>
                    <DeckCard isPlaceholder shadow={"NORMAL"} onClickEnter={() => {
                        ReactSwal.fire({
                            allowOutsideClick: false,
                            title: <p>{t('deck_component_create_new')}</p>,
                            html: <CreateDeckForm t={store.t} onSubmit={async (newDeck: NewDeck) => {
                                await createNewDeck(newDeck);
                            }} />,
                            showConfirmButton: false,
                            didOpen: () => {
                                document.getElementById(CREATE_DECK_FORM_NAME_INPUT_ID)?.focus();
                            }
                        })
                    }} />
                    {renderDeckCard()}
                </div>
            </Container>
        </>
    )
};