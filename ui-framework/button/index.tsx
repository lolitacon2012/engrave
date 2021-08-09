import classNames from "classnames";
import React from "react";
import { IoReloadCircle } from "react-icons/io5";
import style from './index.module.css';

interface ButtonProps {
    type?: 'SMALL' | 'NORMAL' | 'LARGE',
    color?: 'BLACK-ALPHA' | 'PRIMARY',
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    children: string | string[] | React.ReactNode | React.ReactNode[];
    disabled?: boolean,
    loading?: boolean,
}
const Button = (props: ButtonProps) => {
    const height = (props.type === 'SMALL' && 24) || (props.type === 'NORMAL' && 32) || (props.type === 'LARGE' && 40) || 32;
    const fontSize = (props.type === 'SMALL' && '0.8rem') || (props.type === 'NORMAL' && '1rem') || (props.type === 'LARGE' && '1.2rem') || '1rem';
    const backgroundColor = (props.color === 'BLACK-ALPHA' && 'rgba(0,0,0,0.16)') || (props.color === 'PRIMARY' && '#8ac6d1') || '#8ac6d1';
    const color = (props.color === 'BLACK-ALPHA' && 'white') || (props.color === 'PRIMARY' && 'white') || 'white';
    return <button className={style.button} style={
        {
            height, fontSize, backgroundColor, color, ...(props.disabled && {
                cursor: 'not-allowed'
            })
        }
    } onClick={(e) => { !props.disabled && props.onClick && props.onClick(e) }}>
        <div style={{
            visibility: props.loading ? 'hidden' : 'visible'
        }}>
            {props.children}
        </div>
        <div className={classNames(style.loadingContainer, props.loading && style.loading)}>
            <IoReloadCircle />
        </div>
    </button>
}
export default Button;