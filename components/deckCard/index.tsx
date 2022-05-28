import { Deck } from 'cafe-types/deck';
import styles from './index.module.css';
import cn from 'classnames';
import { StudyProgress } from 'cafe-types/study';
import { GlobalStoreContext } from 'cafe-store/index';
import React, { useContext } from 'react';
import { generateColorTheme } from 'cafe-utils/generateColorTheme';
import { IoTime, IoPricetags, IoGolfOutline } from 'react-icons/io5';
import { getTimeString } from 'cafe-utils/getTimeTillNow';

export default function DeckCard({ deck, onClickEnter, progress, shadow, isPlaceholder, isMiniCard, externali18n }: { isMiniCard?: boolean, isPlaceholder?: boolean, deck?: Deck | undefined, progress?: StudyProgress | undefined, externali18n?: (s: string, k: any) => string, onClickEnter?: () => void, shadow: 'NORMAL' | 'SMALL' }) {
    const { t: storeT, user } = useContext(GlobalStoreContext);
    const t = externali18n || storeT;
    const totalWord = deck?.words.length || 0;
    const authorName = deck?.creator_name;
    const authorAvatar = deck?.creator_avatar;
    const isOwnDeck = deck?.creator_id === user?.id;
    const themeColor = deck?.color || '#000000';
    const themeColorSet = generateColorTheme(themeColor);
    // learning
    const inRepeatStage = (progress?.level_1.length || 0) + (progress?.level_2.length || 0) + (progress?.level_3.length || 0) + (progress?.level_4.length || 0) + (progress?.level_5.length || 0);
    // reviewing
    const inReviewStage = (progress?.level_6.length || 0) + (progress?.level_7.length || 0) + (progress?.level_8.length || 0) + (progress?.level_9.length || 0);
    // mastered
    const inFinalStage = progress?.level_10.length || 0;
    const isNew = Math.max(0, totalWord - inRepeatStage - inReviewStage - inFinalStage);
    const noStudyProgress = inRepeatStage + inReviewStage + inFinalStage === 0;

    const { key, placeholder } = getTimeString(progress?.updated_at || 0);
    const isImageSrc = deck?.avatar.indexOf('data:image') === 0 || deck?.avatar.indexOf('https://') === 0;
    return (<div onClick={() => { onClickEnter && onClickEnter() }} className={cn(styles.deckCard, onClickEnter && styles.clickable, shadow === 'NORMAL' && 'withNormalShadow', shadow === 'SMALL' && 'withSmallShadow', isPlaceholder && styles.placeHolder)}>
        {!deck && isPlaceholder && <div className={styles.placeHolderContainer}>
            <h2><IoPricetags /></h2>
            <h3>{t('deck_component_create_new')}</h3>
        </div>}
        {deck && <div className={styles.imageContainer} style={{ backgroundColor: themeColorSet[8] }}>
            <div className={styles.titleImage} style={{ backgroundColor: themeColorSet[0] }}>
                {deck &&
                    // eslint-disable-next-line @next/next/no-img-element
                    (isImageSrc ? <img src={deck.avatar} alt={deck.name} /> : <span>{deck.name.slice(0, 2)}</span>)
                }
            </div>
        </div>}
        {deck && <div className={styles.contentContainer}>
            <h3 className={styles.titleText}>{deck.name}</h3>
            {!noStudyProgress && !isMiniCard && <div className={styles.cardProgress}>
                <div className={styles.progressBarContainer}>
                    <div className={styles.finished} style={{ flex: inFinalStage, backgroundColor: themeColorSet[2] }}></div>
                    <div className={styles.reviewing} style={{ flex: inReviewStage, backgroundColor: themeColorSet[4] }}></div>
                    <div className={styles.studying} style={{ flex: inRepeatStage, backgroundColor: themeColorSet[6] }}></div>
                    <div className={styles.new} style={{ flex: isNew }}></div>
                </div>
                <div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon, styles.progressColorIconNew)} /><h4 className={styles.title}>{t('deck_component_new')}</h4><h4>{isNew}</h4></div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon)} style={{ backgroundColor: themeColorSet[6] }} /><h4 className={styles.title}>{t('deck_component_studying')}</h4><h4>{inRepeatStage}</h4></div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon)} style={{ backgroundColor: themeColorSet[4] }} /><h4 className={styles.title}>{t('deck_component_reviewing')}</h4><h4>{inReviewStage}</h4></div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon)} style={{ backgroundColor: themeColorSet[2] }} /><h4 className={styles.title}>{t('deck_component_finished')}</h4><h4>{inFinalStage}</h4></div>
                    <div className={styles.progressTextContainer}><IoTime className={cn(styles.progressColorIcon)} style={{ color: themeColorSet[2] }} /><h4 className={styles.title}>{t('deck_component_last_studied')}</h4><h4>{t(key, placeholder)}</h4></div>
                </div>
                {/* <div className={styles.controlButtonContainer}>
                    {onClickEnter && <div className={styles.deckControlButton} style={{ backgroundColor: themeColorSet[1] }} onClick={onClickEnter}><IoBook /></div>}
                </div> */}
            </div>}
            {noStudyProgress && !isMiniCard && <div className={cn(styles.cardProgress, styles.noProgress)}>
                <span><IoGolfOutline /></span>
                <h4>{t('deck_component_no_progress')}</h4>
            </div>}

            <div className={styles.cardfooter}>
                <h5 className={styles.wordCount}>{totalWord}{t('deck_component_words')}</h5>
                {// eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.authorAvatar} src={authorAvatar} alt={authorName} />}
                <h5 className={styles.authorName}>{authorName}</h5>
            </div>
        </div>}
    </div>)
}