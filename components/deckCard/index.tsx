import { Deck } from 'cafe-types/deck';
import styles from './index.module.css';
import cn from 'classnames';
import { StudyProgress } from 'cafe-types/study';

export default function DeckCard({ deck, onClick, progress, shadow }: { deck: Deck | undefined, progress: StudyProgress | undefined, onClick?: () => void, shadow: 'NORMAL' | 'SMALL' }) {
    const totalWord = deck?.words.length || 0;
    const inFinalStage = progress?.level_10.length || 0;
    // const inRepeatStage = (progress?.level_1.length || 0) + (progress?.level_2.length || 0);
    const inReviewStage = (progress?.level_3.length || 0) + (progress?.level_4.length || 0) + (progress?.level_5.length || 0) + (progress?.level_6.length || 0) + (progress?.level_7.length || 0) + (progress?.level_8.length || 0) + (progress?.level_9.length || 0);
    const passedStudyStage = inReviewStage + inFinalStage;

    return (<div className={cn(styles.deckCard, onClick && styles.clickable, shadow === 'NORMAL' && styles.withNormalShadow, shadow === 'SMALL' && styles.withSmallShadow)} onClick={onClick}>
        <div className={styles.imageContainer}>
            <div className={styles.titleImage}>
                {deck &&
                    // eslint-disable-next-line @next/next/no-img-element
                    (deck.avatar.length > 2 ? <img src={deck.avatar} alt={deck.name} /> : <span>{deck.avatar}</span>)
                }
            </div>
        </div>
        {deck && <div className={styles.contentContainer}>
            <h3>{deck.name}</h3>
            <h4>词汇量：{totalWord}</h4>
            <h4>学习程度：{Math.ceil(100 * passedStudyStage / totalWord)}%</h4>
            <h4>熟练程度：{Math.ceil(100 * inFinalStage / totalWord)}%</h4>
        </div>}
    </div>)
}