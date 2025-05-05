import { useState } from "react";
import Form from "../UI/Form";

import styles from "../flights/StatusSearch.module.scss";

const CustomerFlightSearch = (props) => {
    const [filter, setFilter] = useState({
        airline: "",
        email: "",
    });

    const onFilterChange = (property, value) => {
        setFilter((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const onSearchHandler = () => {
        props.onSearch({
            type: "customer_flight",
            body: {
                airline: filter.airline,
                email: filter.email,
            },
        });
    };

    return (
        <div className={styles.container}>
            <main>
                <Form
                    column="2"
                    inputs={[
                        {
                            type: "text",
                            label: "Customer Email",
                            value: filter.email,
                            onChange: onFilterChange.bind(null, "email"),
                            required: "Customer Email is Required",
                        },
                    ]}
                    submit={{
                        text: "Search",
                        onClick: onSearchHandler,
                    }}
                />
            </main>
        </div>
    );
};

export default CustomerFlightSearch;
