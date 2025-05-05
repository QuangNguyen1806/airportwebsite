import styles from "./Button.module.scss";

const Button = (props) => {
    return (
        <button
            type="button"
            className={styles.button}
            disabled={props.disabled}
            onClick={props.disabled ? null : props.onClick}
            style={{
                backgroundColor: props.color,
            }}
        >
            {props.text}
        </button>
    );
};

export default Button;
