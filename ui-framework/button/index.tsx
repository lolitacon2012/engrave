import React from "react";
import style from './index.module.css';

interface ButtonProps {
    type?: 'SMALL' | 'NORMAL' | 'LARGE',
    color?: 'BLACK-ALPHA' | 'PRIMARY',
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    children: string | string[] | React.ReactNode | React.ReactNode[];
}
const Button = (props: ButtonProps) => {
    const height = (props.type === 'SMALL' && 24) || (props.type === 'NORMAL' && 32) || (props.type === 'LARGE' && 40) || 32;
    const fontSize = (props.type === 'SMALL' && '0.8rem') || (props.type === 'NORMAL' && '1rem') || (props.type === 'LARGE' && '1.2rem') || '1rem';
    const backgroundColor = (props.color === 'BLACK-ALPHA' && 'rgba(0,0,0,0.16)') || (props.color === 'PRIMARY' && '#F687B3') || '#F687B3';
    const color = (props.color === 'BLACK-ALPHA' && 'white') || (props.color === 'PRIMARY' && 'white') || 'white';
    return <button className={style.button} style={
        {
            height, fontSize, backgroundColor, color
        }
    } onClick={(e) => { props.onClick && props.onClick(e) }}>{props.children}</button>
}
export default Button;