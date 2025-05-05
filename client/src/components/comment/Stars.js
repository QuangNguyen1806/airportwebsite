import { EmptyStar, FilledStar } from "../UI/Icons";
import styles from "./Stars.module.scss";

const Stars = (props) => {
    const onClickHandler = (index) => {
        if (!props.editable) return;
        props.onChange(index + 1);
    };

    return (
        <div className={styles.stars}>
            {((number, filled) => {
                const stars = [];
                for (let i = 0; i < number; ++i) {
                    stars.push(
                        <div
                            key={i}
                            onClick={onClickHandler.bind(null, i)}
                            style={{
                                cursor: props.editable ? "pointer" : "default",
                            }}
                        >
                            {i < filled ? (
                                <FilledStar size={30} color="#ff7100" />
                            ) : (
                                <EmptyStar size={30} color="#ff7100" />
                            )}
                        </div>
                    );
                }
                return stars;
            })(props.maxStars, props.filled)}
        </div>
    );
};

export default Stars;
