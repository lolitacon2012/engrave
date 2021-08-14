import { useRouter } from 'next/router'
import Container from "cafe-ui/pageContainer";
import styles from "./settings.module.css";
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from 'cafe-store/index';
import client from 'cafe-utils/client';
import { Deck } from 'cafe-types/deck'

import Button from 'cafe-ui/button';
import debounce from 'lodash/debounce';

import cn from 'classnames';
import useAuthGuard from 'hooks/useAuthGuard';
import { Switch } from 'cafe-ui/switch';
import { ImageUploader } from 'cafe-ui/imageUploader';
import { generateColorTheme } from 'cafe-utils/generateColorTheme';
import { DEFAULT_STUDY_SET_SIZE } from 'cafe-constants/index';
import { IoArrowBack, IoTrashBin } from 'react-icons/io5';
import modal, { alertDeveloping } from 'cafe-ui/modal';

interface Form {
    // deck
    deckName: string,
    deckAvatar: string,
    deckColor: string,

    // special
    isPublic: boolean; // if is public, then can join via invitation link

    // progress
    isEasyMode: boolean;
    studySize?: number | '';
    isRandomOrder: boolean;
    isRubyOnly: boolean,
}

// actions:
// unfollow / delete (not actually "delete", it's only archived)
// reset progress
// share link

export default function DeckPage() {
    useAuthGuard();
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    const t = store.t;
    const hasAuthenticated = (store.authenticatingInProgress === false);

    const [deck, setDeck] = useState<Partial<Deck> | undefined>(undefined);
    const [form, setForm] = useState<Partial<Form>>({});
    // const [hasError, setHasError] = useState<Partial<Form>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const partialUpdateForm = (updatedFormFields: Partial<Form>) => {
        setForm({ ...form, ...updatedFormFields })
        setHasChanges(true);
    }

    const currentDeckId = router.query?.deck_id as string || '' as string;
    const isOwnDeck = deck?.creator_id === store.user?.id;
    const normalizedColor = (form.deckColor?.[0] === '#') ? form.deckColor : ('#' + form.deckColor);
    const validateDeckThemeColor = () => {
        if (!form.deckColor) return false;
        return /^#[0-9A-F]{6}$/i.test(normalizedColor);
    }
    const themeSet = validateDeckThemeColor() ? generateColorTheme(normalizedColor) : [];

    useEffect(() => {
        const onFinishLoading = (deck: Deck) => {
            setDeck(deck);

            if (!deck) {
                store.setError(404);
            }
            setForm({
                deckName: deck.name,
                deckAvatar: deck.avatar,
                deckColor: deck.color,
                studySize: store.user?.progress?.[deck.id].section_size || DEFAULT_STUDY_SET_SIZE,
                isEasyMode: !!store.user?.progress?.[deck.id].use_easy_mode,
                isRandomOrder: !!store.user?.progress?.[deck.id].use_random_order,
                isRubyOnly: !!store.user?.progress?.[deck.id].use_ruby_only,
            });
        }
        // Fetch current deck
        if (currentDeckId) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: [currentDeckId]
                }
            }, `RPC_GET_DECK_BY_IDS[${currentDeckId}]`, (({ data }) => {
                onFinishLoading(data[0])
            })).then(({ data }) => {
                onFinishLoading(data[0])
            })
        }
    }, [store.user?.id, currentDeckId])

    useEffect(() => {
        store.setLoading(store.isLocaleLoading || store.isUserLoading || !deck || deck.id !== currentDeckId);
    }, [deck, store.isLocaleLoading || store.isUserLoading])

    const deleteDeck = () => {
        // words need to be deleted as well.
        alertDeveloping(t);
    }

    const saveChanges = useCallback(debounce(async (newForm: Partial<Form>) => {
        if (!currentDeckId) {
            return;
        }
        await Promise.all([...(isOwnDeck ? [client.callRPC({
            rpc: RPC.RPC_UPDATE_DECK_BY_ID,
            data: {
                id: currentDeckId,
                name: newForm.deckName || deck?.name,
                color: newForm.deckColor || deck?.color,
                avatar: newForm.deckAvatar || deck?.avatar
            }
        })] : []), client.callRPC({
            rpc: RPC.RPC_UPDATE_USER_INFO,
            data: {
                progress: {
                    ...store.user?.progress,
                    [currentDeckId]: {
                        ...store.user?.progress?.[currentDeckId],
                        ...{
                            section_size: newForm.studySize || DEFAULT_STUDY_SET_SIZE,
                            use_random_order: !!newForm.isRandomOrder,
                            use_easy_mode: !!newForm.isEasyMode,
                            use_ruby_only: !!newForm.isRubyOnly,
                        }
                    }
                },
            }
        })]);
        store.updateUser();
        setHasChanges(false);
    }, 300), [currentDeckId, store.user?.progress, deck])

    useEffect(() => {
        Object.keys(form).length && hasChanges && saveChanges(form);
    }, [Object.values(form)]);

    const renderBackButton = useCallback(() => <Button iconRenderer={() => <IoArrowBack />} onClick={() => { router.push(`/deck/${currentDeckId}`) }}>{t('deck_settings_page_back_to_deck')}</Button>, [store.currentLocale, currentDeckId])
    const normalizedAvatarSrc = (form.deckAvatar || '').indexOf('data:') !== 0 ? ((form.deckAvatar || '').indexOf('https://') !== 0 ? '' : form.deckAvatar) : form.deckAvatar;
    return hasAuthenticated && <Container>
        <div className={styles.titleRow}>
            <h1>{deck?.name} - {t('deck_page_settings')}</h1>
            {renderBackButton()}
        </div>
        <div className={cn(styles.formContainer, 'withSmallShadow')}>
            {isOwnDeck && <><h4 className={styles.formDivider}>{t('deck_settings_page_deck_section')}</h4>
                <div className={styles.formRow}>
                    <div className={styles.formRowTitle}>
                        <h3>{t('deck_settings_page_deck_name')}</h3>
                    </div>

                    <div className={styles.formRowController}>
                        <input value={form.deckName || ''} onChange={(e) => {
                            partialUpdateForm({ deckName: e.target.value })
                        }} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formRowTitle}>
                        <h3>{t('deck_settings_page_deck_avatar')}</h3>
                        <h5>{t('deck_settings_page_deck_avatar_instruction')}</h5>
                    </div>

                    <div className={styles.formRowController}>
                        <ImageUploader emptyImageText={t('home_create_deck_upload_image')} onImageChanged={(data) => {
                            const imageBase64 = data[0].dataURL;
                            partialUpdateForm({ deckAvatar: imageBase64 })
                        }} initialDataUrls={normalizedAvatarSrc ? [normalizedAvatarSrc] : []} onError={(e) => {
                            if (e?.acceptType) {
                                alert(t('File type not accepted.'))
                            } else if (e?.maxFileSize) {
                                alert(t('Please select an image with size less than 1mb.'))
                            } else {
                                alert('Unknown error.')
                            }
                        }} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formRowTitle}>
                        <h3>{t('deck_settings_page_deck_color')}</h3>
                    </div>

                    <div className={styles.formRowController}>
                        <input type="text" value={form.deckColor || ''} onChange={(e) => {
                            partialUpdateForm({ deckColor: e.target.value })
                        }} style={validateDeckThemeColor() ? {
                            color: themeSet[19],
                            backgroundColor: themeSet[1],
                        } : undefined} />
                        <div className={styles.colorSampleContainer}>
                            <div className={styles.colorSample} style={{
                                backgroundColor: themeSet[2]
                            }
                            } />
                            <div className={styles.colorSample} style={{
                                backgroundColor: themeSet[4]
                            }
                            } />
                            <div className={styles.colorSample} style={{
                                backgroundColor: themeSet[6]
                            }} />
                            <div className={styles.colorSample} style={{
                                backgroundColor: themeSet[12]
                            }} /><div className={styles.colorSample} style={{
                                backgroundColor: themeSet[18]
                            }} /></div>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formRowTitle}>
                        <h3>{t('deck_settings_page_delete_deck')}</h3>
                        <h5>{t('deck_settings_page_delete_deck_instruction')}</h5>
                    </div>

                    <div className={styles.formRowController}>
                        <Button onClick={() => {
                            modal.fire({
                                translator: t,
                                type: 'DANGER',
                                confirmButtonText: t('general_delete'),
                                onConfirm: () => {
                                    deleteDeck()
                                },
                                contentText: t('deck_settings_page_delete_deck_warning')
                            })
                        }} iconRenderer={() => <IoTrashBin />} type="DANGER">{t('deck_settings_page_delete_deck')}</Button>
                    </div>
                </div>
            </>}

            <h4 className={styles.formDivider}>{t('deck_settings_page_progress_section')}</h4>
            <div className={styles.formRow}>
                <div className={styles.formRowTitle}>
                    <h3>{t('deck_settings_page_study_size')}</h3>
                </div>

                <div className={styles.formRowController}>
                    <input onChange={(e) => {
                        try {
                            const parsedNumber = Number.parseInt(e.target.value);
                            (Number.isInteger(parsedNumber) || (!e.target.value)) && partialUpdateForm({ studySize: parsedNumber || '' });
                            if (parsedNumber <= 0 || parsedNumber > 999) {
                                partialUpdateForm({ studySize: DEFAULT_STUDY_SET_SIZE })
                            }
                        } catch {
                            console.log('Not a number')
                        }

                    }} placeholder={`${DEFAULT_STUDY_SET_SIZE}`} value={form.studySize || DEFAULT_STUDY_SET_SIZE}></input>
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.formRowTitle}>
                    <h3>{t('deck_settings_page_study_is_random_order')}</h3>
                    <h5>{t('deck_settings_page_study_is_random_order_instruction')}</h5>
                </div>

                <div className={styles.formRowController}>
                    <Switch onChange={(v) => {
                        partialUpdateForm({
                            isRandomOrder: v
                        })
                    }} value={!!form.isRandomOrder} />
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.formRowTitle}>
                    <h3>{t('deck_settings_page_study_is_easy_mode')}</h3>
                    <h5>{t('deck_settings_page_study_is_easy_mode_instruction')}</h5>
                </div>

                <div className={styles.formRowController}>
                    <Switch onChange={(v) => {
                        partialUpdateForm({
                            isEasyMode: v
                        })
                    }} value={!!form.isEasyMode} />
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.formRowTitle}>
                    <h3>{t('deck_settings_page_study_ruby_only')}</h3>
                    <h5>{t('deck_settings_page_study_ruby_only_instruction')}</h5>
                </div>
                <div className={styles.formRowController}>
                    <Switch onChange={(v) => {
                        partialUpdateForm({
                            isRubyOnly: v
                        })
                    }} value={!!form.isRubyOnly} />
                    <div className={styles.rubyExample} ><span><ruby>祝詞<rt>のりと</rt></ruby></span>&nbsp;⇒&nbsp;祝詞&nbsp;{!form.isRubyOnly ? '✔' : '✖'}&nbsp;&nbsp;&nbsp;&nbsp;のりと&nbsp;✔</div>
                </div>
            </div>
            <div className={styles.formBottomControlRow}>
                {renderBackButton()}
            </div>

        </div>

    </Container>
}