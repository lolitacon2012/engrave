import { useState } from 'react'
import styles from './index.module.css'
interface Props {
    value?: boolean,
    onChange?: (value: boolean) => void
}
export function Switch(props: Props) {
    const value = props.value;
    return (<label className={styles.toggle}>
        <input className={styles.toggleCheckbox} checked={value} type="checkbox" onChange={() => {
            props.onChange && props.onChange(!value);
        }} />
        <div className={styles.toggleSwitch}></div>
    </label>)
}