import { Deck } from 'cafe-types/deck';
import styles from './index.module.css';
import cn from 'classnames';

export default function DeckCard({deck, key, onClick, shadow} : {deck: Deck | undefined, key?: string, onClick?: ()=>void, shadow: 'NORMAL' | 'SMALL'}) {
    return (<div className={cn(styles.deckCard, onClick && styles.clickable, shadow === 'NORMAL' && styles.withNormalShadow, shadow === 'SMALL' && styles.withSmallShadow)} key={key} onClick={onClick}>
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
            <h4>词汇量：{deck.words.length}</h4>
            <h4>学习程度：59%</h4>
            <h4>熟练程度：21%</h4>
        </div>}
    </div>)
}