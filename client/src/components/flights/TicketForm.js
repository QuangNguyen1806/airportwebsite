import { useState } from "react";
import Form from "../UI/Form";
import styles from "./TicketForm.module.scss";

const priceElement = (price) => {
    const price_str = price === 0 ? "--" : price.toFixed(2) + "$";

    return (
        <div className={styles.price}>
            <span>Estimated Price: </span>
            <span>{price_str}</span>
        </div>
    );
};

const TicketForm = (props) => {
    const [cards, setCards] = useState({
        card_type: "credit",
        card_number: "",
        card_name: "",
        card_expiration: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
    });

    const onCardsChange = (property, value) => {
        setCards((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const onPurchaseHandler = () => {
        props.onPurchase(cards);
    };

    return (
        <div className={styles.form}>
            <Form
                column="2"
                inputs={[
                    {
                        type: "text",
                        label: "Passenger First Name",
                        value: cards.first_name,
                        onChange: onCardsChange.bind(null, "first_name"),
                        required: "Passenger First Name is Required",
                    },
                    {
                        type: "text",
                        label: "Passenger Last Name",
                        value: cards.last_name,
                        onChange: onCardsChange.bind(null, "last_name"),
                        required: "Passenger Last Name is Required",
                    },
                    {
                        type: "date",
                        label: "Passenger Date of Birth",
                        value: cards.date_of_birth,
                        onChange: onCardsChange.bind(null, "date_of_birth"),
                        required: "Passenger Date of Birth is Required",
                    },
                    {
                        type: "select",
                        label: "Card Type",
                        value: cards.card_type,
                        options: ["credit", "debit"],
                        onChange: onCardsChange.bind(null, "card_type"),
                        required: "Card Type is Required",
                    },
                    {
                        type: "text",
                        label: "Card Number",
                        value: cards.card_number,
                        onChange: onCardsChange.bind(null, "card_number"),
                        required: "Card Number is Required",
                    },
                    {
                        type: "text",
                        label: "Name on Card",
                        value: cards.card_name,
                        onChange: onCardsChange.bind(null, "card_name"),
                        required: "Name is Required",
                    },
                    {
                        type: "date",
                        label: "Card Expiration Date",
                        value: cards.card_expiration,
                        onChange: onCardsChange.bind(null, "card_expiration"),
                        required: "Expiration Date is Required",
                    },
                ]}
                submit={{
                    text: "Purchase",
                    onClick: onPurchaseHandler,
                    disabled: props.disabled,
                }}
                middle={priceElement(props.price)}
            />
        </div>
    );
};

export default TicketForm;
