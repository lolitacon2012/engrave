import Button from 'cafe-ui/button';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IoAccessibility, IoAlertCircle, IoCheckmarkCircle, IoInformationCircle, IoWarning } from 'react-icons/io5';
import { v4 as uuid } from 'uuid';
import styles from './index.module.css';

const MODAL_MOUNT_POINT_ID = 'MODAL_MOUNT_POINT_ID';
interface FireParameters {
    title?: string;
    contentText?: string;
    contentIconRenderer?: () => React.ReactNode;
    hideIcon?: boolean;
    hideButtons?: boolean;
    contentRenderer?: (closeModal: () => void) => React.ReactNode;
    contentRendererWillRenderButton?: boolean;
    onConfirm?: (closeModal: () => void) => void;
    onCancel?: (closeModal: () => void) => void;
    cancelButtonText?: string;
    confirmButtonText?: string;
    hideCancelButton?: boolean;
    disableClickOutside?: boolean;
    type?: 'PRIMARY' | 'DANGER' | 'INFO' | 'WARNING' | 'SUCCESS'
    buttonRenders?: (() => void)[];
    buttonPosition?: 'CENTER' | 'RIGHT';
    translator: (k: string, o?: any) => string;
    didOpen?: () => void;
}
const ModalReactComponent = (props: FireParameters & { id: string, unmountSelf: () => void, onMounted: (id: string, closeModal: () => void) => void; }) => {
    const [hidden, setHidden] = useState(true);

    const closeModal = () => {
        setHidden(true);
        setTimeout(() => {
            props.unmountSelf();
        }, 300)
    }
    useEffect(() => {
        setHidden(false);
        props.didOpen && props.didOpen();
        props.onMounted(props.id, closeModal)
        return () => { }
    }, [])
    const renderControlButtons = () => {
        return (<>
            {!props.hideCancelButton && <Button type='SECONDARY' onClick={() => {
                props.onCancel ? props.onCancel(closeModal) : closeModal()
            }}>{props.cancelButtonText || props.translator('general_cancel')}</Button>}
            <Button type='PRIMARY' onClick={() => {
                props.onConfirm ? props.onConfirm(closeModal) : closeModal()
            }}>{props.confirmButtonText || props.translator('general_ok')}</Button>
        </>)
    }
    const _contentIconRenderer = props.hideIcon ? () => null : props.contentIconRenderer || (() => {
        switch (props.type) {
            case 'DANGER': return <IoAlertCircle />
            case 'WARNING': return <IoWarning />
            case 'SUCCESS': return <IoCheckmarkCircle />
            default: return <IoInformationCircle />
        }
    })
    return <div onClick={() => {
        !props.disableClickOutside && (props.onCancel ? props.onCancel(closeModal) : closeModal());
    }} className={classNames(styles.modalBackground, hidden && styles.hidden)}>
        <div onClick={(e) => {
            e.stopPropagation();
        }} className={classNames(styles.modal, hidden && styles.hidden, 'withNormalShadow')}>
            <div className={styles.titleRow}>
                {!props.hideIcon && <div className={classNames(styles.contentIcon, hidden && styles.hidden, styles.primary, props.type === "WARNING" && styles.warning, props.type === "SUCCESS" && styles.success, props.type === "INFO" && styles.info, props.type === "DANGER" && styles.danger)}>{_contentIconRenderer()}</div>}
                {props.title && <h2>{props.title}</h2>}
            </div>
            <div className={styles.contentContainer} style={{
                ...(props.contentRendererWillRenderButton && {
                    marginBottom: 0
                })
            }}>{props.contentRenderer ? props.contentRenderer(closeModal) : props.contentText && <p>{props.contentText}</p>}</div>
            {!props.hideButtons && <div className={classNames(styles.buttonContainer, props.buttonPosition === 'RIGHT' && styles.buttonToRight)}>{props.buttonRenders ? props.buttonRenders.map((r) => r()) : renderControlButtons()}</div>}
        </div>
    </div>
}



class Modal {

    private addToInstanceIdToCloseModal = (id: string, closeModal: () => void) => {
        this.instanceIdToCloseModal[id] = closeModal;
    }
    private instanceIdToCloseModal: { [key: string]: () => void } = {};
    private createMountingPoint = () => {
        if (!!document && !document.getElementById(MODAL_MOUNT_POINT_ID)) {
            const modalContainer = document.createElement("div");   // Create a <button> element
            modalContainer.id = MODAL_MOUNT_POINT_ID;                   // Insert text
            document.body.appendChild(modalContainer);
        }
    }
    public fire = (fireParameters: FireParameters) => {
        this.createMountingPoint();
        const newId = uuid() + '__cafe_modal';
        const thisModalContainer = document.createElement("div");
        thisModalContainer.id = newId;
        document.getElementById(MODAL_MOUNT_POINT_ID)?.appendChild(thisModalContainer);
        ReactDOM.render(<><ModalReactComponent id={newId} {...fireParameters} unmountSelf={() => {
            ReactDOM.unmountComponentAtNode(thisModalContainer);
            thisModalContainer.remove();
            delete this.instanceIdToCloseModal[newId];
        }} onMounted={(id: string, closeModal: () => void) => {
            this.addToInstanceIdToCloseModal(id, closeModal)
        }} /></>, thisModalContainer);
    }
    public closeAll = () => {
        Object.keys(this.instanceIdToCloseModal).forEach(id => {
            this.instanceIdToCloseModal[id]();
        })
    }
}

const modal = new Modal();
const alertDeveloping = (t: (k: string, f?: any) => string) => {
    modal.fire({
        translator: t,
        contentText: t('general_developing'),
        hideCancelButton: true,
        confirmButtonText: t('general_looking_forward'),
        contentIconRenderer: () => '尬',
    })
}
export default modal;
export { alertDeveloping };