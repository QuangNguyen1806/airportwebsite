import { useState } from "react";
import Form from "../UI/Form";
import styles from "./DateSearch.module.scss";

const DateSearch = (props) => {
    const [from, setFrom] = useState(props.from);
    const [to, setTo] = useState(props.to);

    const onClickHandler = () => {
        props.onChange({
            from: from,
            to: to,
        });
    };

    return (
        <div className={styles.container}>
            <header>
                <span>{props.text}</span>
            </header>
            <main>
                <Form
                    column="2"
                    inputs={[
                        {
                            type: "month",
                            label: "From",
                            value: from,
                            onChange: setFrom,
                        },
                        {
                            type: "month",
                            label: "To",
                            value: to,
                            onChange: setTo,
                        },
                    ]}
                    submit={{
                        text: "Search",
                        onClick: onClickHandler,
                    }}
                />
            </main>
        </div>
    );
};

export default DateSearch;
