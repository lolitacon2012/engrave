import { useState } from 'react'
import styles from './index.module.css'
import { v4 as uuid } from 'uuid';
interface Props {
    value?: boolean,
    onChange?: (value: boolean) => void
    label?: string;
}
export function Switch(props: Props) {
    const value = props.value;
    const name = uuid();
    return (<label className={styles.toggle}>
        <input name={name + '-switch-input-name'} id={name + '-switch-input-id'} className={styles.toggleCheckbox} checked={value} type="checkbox" onChange={() => {
            props.onChange && props.onChange(!value);
        }} />
        <div className={styles.toggleSwitch}></div>
        {props.label && <span className={styles.toggleLabel}>{props.label}</span>}
    </label>)
}