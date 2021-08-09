import classnames from "classnames";
import React from "react";
import { IoImageSharp } from "react-icons/io5";
import ImageUploading, { ErrorsType, ImageListType } from "react-images-uploading";
import styles from './index.module.css';

interface Props {
    emptyImageText?: string,
    onImageChanged: (data: ImageListType) => void,
    onError: (errors: ErrorsType, files?: ImageListType | undefined) => void,
    maxFileSize?: number,
    id?: string,
}

export function ImageUploader(props: Props) {
    const { emptyImageText = '' } = props;
    const [images, setImages] = React.useState([]);

    const onChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
    ) => {
        // data for submit
        setImages(imageList as never[]);
        props.onImageChanged(imageList);
    };

    return (
        <div className={styles.imageUploaderContainer}>
            <ImageUploading
                multiple
                value={images}
                onChange={onChange}
                maxNumber={1}
                acceptType={['jpg', 'jpgg', 'gif', 'png']}
                onError={props.onError}
                maxFileSize={props.maxFileSize || 1000000}
            >
                {({
                    imageList,
                    onImageUpload,
                    onImageUpdate,
                    onImageRemove,
                    isDragging,
                    dragProps,
                    errors
                }) => (
                    <div>


                        {imageList.map((image, index) => (
                            <div key={index} onClick={() => onImageUpdate(index)} className={(styles.imageContainer)}>
                                <img src={image.dataURL} alt="" {...(props.id ? {id : props.id} : {})} />
                                { /* <div className="image-item__btn-wrapper">
                                    <button onClick={() => onImageUpdate(index)}>Update</button>
                                    <button onClick={() => onImageRemove(index)}>Remove</button>
                                </div> */}

                            </div>
                        ))}
                        {imageList.length < 1 && (
                            <div
                                className={classnames(styles.emptyImage, styles.imageContainer)}
                                style={isDragging ? {
                                    borderColor: 'red'
                                } : undefined}
                                onClick={onImageUpload}
                                {...dragProps}
                            >
                                <span className={styles.emptyImageIcon}><IoImageSharp></IoImageSharp></span>
                                <span>{emptyImageText}</span>
                            </div>
                        )}
                    </div>
                )}
            </ImageUploading>
        </div>
    );
}
