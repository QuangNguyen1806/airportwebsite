import styles from "./DisplayComment.module.scss";
import Stars from "./Stars";

const DisplayComment = ({ comment }) => {
    if (!comment?.rating) return;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Stars maxStars={5} filled={comment.rating} />
                {!!comment.author && <span>{comment.author}</span>}
            </div>
            <div className={styles.comment}>
                <span>{comment.comment}</span>
            </div>
        </div>
    );
};

export default DisplayComment;
