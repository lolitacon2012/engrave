import classNames from "classnames";
import React from "react";
import { IoReloadCircle } from "react-icons/io5";
import style from './index.module.css';

interface ButtonProps {
    // type?: 'SMALL' | 'NORMAL' | 'LARGE',
    type?: 'SECONDARY' | 'PRIMARY',
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    children: string | string[] | React.ReactNode | React.ReactNode[];
    disabled?: boolean,
    loading?: boolean,
    iconRenderer?: () => React.ReactNode;
}
const Button = (props: ButtonProps) => {
    // const height = (props.type === 'SMALL' && 24) || (props.type === 'NORMAL' && 32) || (props.type === 'LARGE' && 40) || 32;
    // const fontSize = (props.type === 'SMALL' && '0.8rem') || (props.type === 'NORMAL' && '1rem') || (props.type === 'LARGE' && '1.2rem') || '1rem';
    // const backgroundColor = (props.color === 'PRIMARY' && 'var(--cafe-3)') || (props.color === 'SECONDARY' && 'white') || 'var(--cafe-3)';
    // const color = (props.color === 'PRIMARY' && 'white') || 'white';
    return <button className={classNames(style.button, 'withSmallShadow', (props.type === 'PRIMARY' || !props.type) && style.primary, (props.type === 'SECONDARY') && style.secondary, props.disabled && style.disabled)} onClick={(e) => { !props.disabled && props.onClick && props.onClick(e) }}>
        <div className={(style.textContainer)} style={{
            visibility: props.loading ? 'hidden' : 'visible'
        }}>
            {props.iconRenderer && <div className={style.iconContainer}>{props.iconRenderer()}</div>}
            {props.children}
        </div>
        <div className={classNames(style.loadingContainer, props.loading && style.loading)}>
            <IoReloadCircle />
        </div>
    </button>
}
export default Button;