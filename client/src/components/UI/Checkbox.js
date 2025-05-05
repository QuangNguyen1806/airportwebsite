import styles from "./Checkbox.module.scss";

const Checkbox = (props) => {
    return (
        <div
            className={styles.checkbox}
            style={{
                height: props.size + "px",
                width: props.size + "px",
                backgroundColor: props.checked ? props.color : "",
            }}
            onClick={props.onClick}
        >
            {!!props.checked && (
                <span
                    style={{
                        fontSize: props.size + "px",
                    }}
                >
                    ✓
                </span>
            )}
        </div>
    );
};

export default Checkbox;
