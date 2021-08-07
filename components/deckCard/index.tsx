import { Deck } from 'cafe-types/deck';
import styles from './index.module.css';
import cn from 'classnames';
import { StudyProgress } from 'cafe-types/study';
import { GlobalStoreContext } from 'cafe-store/index';
import React, { useContext } from 'react';
import { generateColorTheme } from 'cafe-utils/generateColorTheme';
import { IoBook } from 'react-icons/io5';

export default function DeckCard({ deck, onClickEnter, progress, shadow }: { deck: Deck | undefined, progress: StudyProgress | undefined, onClickEnter?: () => void, shadow: 'NORMAL' | 'SMALL' }) {
    const { t, user } = useContext(GlobalStoreContext);
    const totalWord = deck?.words.length || 0;
    const authorName = deck?.creator_name;
    const authorAvatar = deck?.creator_avatar;
    const isOwnDeck = deck?.creator_id === user?.id;
    const themeColor = deck?.color || '#ff0000';
    const themeColorSet = generateColorTheme(themeColor);
    const inRepeatStage = (progress?.level_1.length || 0) + (progress?.level_2.length || 0);
    const inReviewStage = (progress?.level_3.length || 0) + (progress?.level_4.length || 0) + (progress?.level_5.length || 0) + (progress?.level_6.length || 0) + (progress?.level_7.length || 0) + (progress?.level_8.length || 0) + (progress?.level_9.length || 0);
    const inFinalStage = progress?.level_10.length || 0;
    const isNew = totalWord - inRepeatStage - inReviewStage - inFinalStage;

    return (<div className={cn(styles.deckCard, shadow === 'NORMAL' && styles.withNormalShadow, shadow === 'SMALL' && styles.withSmallShadow)}>
        <div className={styles.imageContainer} style={{ backgroundColor: themeColorSet[8] }}>
            <div className={styles.titleImage} style={{ backgroundColor: themeColorSet[0] }}>
                {deck &&
                    // eslint-disable-next-line @next/next/no-img-element
                    (deck.avatar.length > 2 ? <img src={deck.avatar} alt={deck.name} /> : <span>{deck.avatar}</span>)
                }
            </div>
        </div>
        {deck && <div className={styles.contentContainer}>
            <h3 className={styles.titleText}>{deck.name}</h3>
            <div className={styles.cardProgress}>
                <div className={styles.progressBarContainer}>
                    <div className={styles.finished} style={{ flex: inFinalStage, backgroundColor: themeColorSet[2] }}></div>
                    <div className={styles.reviewing} style={{ flex: inReviewStage, backgroundColor: themeColorSet[4] }}></div>
                    <div className={styles.studying} style={{ flex: inRepeatStage, backgroundColor: themeColorSet[6] }}></div>
                    <div className={styles.new} style={{ flex: isNew }}></div>
                </div>
                <div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon, styles.progressColorIconNew)} /><h4 className={styles.title}>New</h4><h4>{isNew}</h4></div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon)} style={{ backgroundColor: themeColorSet[6] }} /><h4 className={styles.title}>Studying</h4><h4>{inRepeatStage}</h4></div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon)} style={{ backgroundColor: themeColorSet[4] }} /><h4 className={styles.title}>Reviewing</h4><h4>{inReviewStage}</h4></div>
                    <div className={styles.progressTextContainer}><div className={cn(styles.progressColorIcon)} style={{ backgroundColor: themeColorSet[2] }} /><h4 className={styles.title}>Finished</h4><h4>{inFinalStage}</h4></div>
                </div>
                <div className={styles.controlButtonContainer}>
                    {onClickEnter && <div className={styles.deckControlButton} style={{ backgroundColor: themeColorSet[1] }} onClick={onClickEnter}><IoBook /></div>}
                </div>
            </div>

            <div className={styles.cardfooter}>
                <h5 className={styles.wordCount}>{totalWord}{t('deck_component_words')}</h5>
                <img className={styles.authorAvatar} src={authorAvatar} alt={authorName} />
                <h5 className={styles.authorName}>{authorName}</h5>
            </div>
        </div>}
    </div>)
}