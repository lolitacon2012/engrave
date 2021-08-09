import React from "react";
import styles from "./index.module.css";
interface Props {
    children: React.ReactNode | React.ReactNode[] | string | string[],
    fullHeight?: boolean,
}
export default function Container(props: Props) {
    return <div className={styles.container} style={{
        height: props.fullHeight ? '100vh' : 'auto'
    }}>{
        props.children
    }</div>

}