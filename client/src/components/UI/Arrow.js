import styles from "./Arrow.module.scss";

const Arrow = ({ width, length, color, text }) => {
    return (
        <div
            className={styles.arrow}
            style={{
                height: width + "px",
                width: length + "px",
                backgroundColor: color,
            }}
        >
            <div
                className={styles.upper}
                style={{
                    height: width + "px",
                    width: width * 4 + "px",
                    backgroundColor: color,
                }}
            ></div>
            <div
                className={styles.bottom}
                style={{
                    height: width + "px",
                    width: width * 4 + "px",
                    backgroundColor: color,
                }}
            ></div>
            <span>{text}</span>
        </div>
    );
};

export default Arrow;
