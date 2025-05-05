import classes from './Modal.module.css';

const Modal = props => {
    if(!props.active) return null;

    const onClickHandler = (e) => {
        if(!props.deactive) return;
        if(e.target === e.currentTarget)
            props.deactive();
    }

    return <div
        className={`${classes.modal} ${props.center ? classes.center : ''}`}
        style={{backgroundColor: props.color}}
        onClick={onClickHandler}
    >
        {props.children}
    </div>
}

export default Modal;