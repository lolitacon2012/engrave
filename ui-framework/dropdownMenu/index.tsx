import styles from './index.module.css';
import cn from 'classnames';

interface DropdownMenuProps {
    children: React.ReactNode,
    clickToExpand?: boolean,
    items: { title: string, key: string }[],
    onItemClicked: (itemKey: string) => void,
}

export default function DropdownMenu(props: DropdownMenuProps) {
    const { children, clickToExpand, items, onItemClicked } = props;
    const hoverToExpand = !clickToExpand;
    // TODO: support clickToExpand
    return <div className={cn(styles.dropdownMenuIconContainer, hoverToExpand && styles.onHoverMenuIcon)}>
        {children}
        <div className={styles.dropdownMenuOuterContainer}>
            <div className={styles.dropdownMenuInnerContainer}>
                {items.map(item => <div onClick={()=>{onItemClicked(item.key)}} key={item.key} className={styles.dropdownMenuItem}>{item.title}</div>)}
            </div>
        </div>
    </div>
}