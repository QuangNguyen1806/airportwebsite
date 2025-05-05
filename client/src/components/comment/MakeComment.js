import { useState } from "react";
import styles from "./MakeComment.module.scss";
import Stars from "./Stars";
import TextareaAutosize from "react-textarea-autosize";
import Button from "../UI/Button";
import axios from "axios";
import useUser from "../../hooks/useUser";
import { getCookie } from "../../utility";

const MakeComment = (props) => {
    const { user } = useUser();
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const onStarsChangeHandler = (value) => {
        if (error) setError("");
        setStars(value);
    };

    const onClickHandler = async () => {
        if (!stars) {
            setError("Please Give a Rating");
            return;
        }

        try {
            const result = await axios.put(
                `http://${process.env.REACT_APP_backend_baseurl}/api/comment/`,
                {
                    email: user.username,
                    airline_name: props.airline_name,
                    flight_number: props.flight_number,
                    departure_date_time: props.departure_date_time,
                    rating: stars,
                    comment: comment,
                },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );

            window.location = "/?tab=myflight";
        } catch (e) {
            console.error(e.response?.data.msg);
        }
    };

    return (
        <div className={styles.container}>
            <Stars
                maxStars={5}
                filled={stars}
                editable={true}
                onChange={onStarsChangeHandler}
            />
            <div className={styles.comment}>
                <TextareaAutosize
                    className={styles.textarea}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comment Here..."
                />
            </div>
            <Button
                text="Post"
                onClick={onClickHandler}
                disabled={stars === 0}
            />
            {!!error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default MakeComment;
