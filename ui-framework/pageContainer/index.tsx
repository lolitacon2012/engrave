import React from "react";
import styles from "./index.module.css";
interface Props {
    children: React.ReactNode | React.ReactNode[] | string | string[]
}
export default function Container(props: Props) {
    return <div className={styles.container}>{
        props.children
    }</div>

}