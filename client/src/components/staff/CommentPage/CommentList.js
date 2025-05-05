import DisplayComment from "../../comment/DisplayComment";
import styles from "./CommentList.module.scss";

const getAverageRating = (comments) => {
    if (comments.length === 0) return 0;

    let sum = 0;
    for (const comment of comments) sum += comment.rating;

    return (sum / comments.length).toFixed(2);
};

const CommentList = ({ comments, error }) => {
    if (error) {
        return (
            <div className={styles.container}>
                <span className={styles.error}>{error}</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {comments.length !== 0 && (
                <span className={styles.rating}>
                    Average Rating: {getAverageRating(comments)}
                </span>
            )}
            {comments.map((comment) => {
                return (
                    <DisplayComment key={comment.author} comment={comment} />
                );
            })}
            {comments.length === 0 && (
                <span className={styles.nocomment}>No Comments Yet</span>
            )}
        </div>
    );
};

export default CommentList;
