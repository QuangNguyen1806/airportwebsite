import { useState } from "react";
import Form from "../UI/Form";

import styles from "./StatusSearch.module.scss";

const StatusSearch = (props) => {
    const [filter, setFilter] = useState({
        airline: "",
        flight_number: "",
        departure_date: "",
        departure_time: "",
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
            type: "status",
            body: {
                airline: filter.airline,
                flight_number: filter.flight_number,
                departure_date: filter.departure_date,
                departure_time: filter.departure_time,
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
                            label: "Airline Name",
                            value: filter.airline,
                            onChange: onFilterChange.bind(null, "airline"),
                            required: "Airline Name is Required",
                        },
                        {
                            type: "text",
                            label: "Flight Number",
                            value: filter.flight_number,
                            onChange: onFilterChange.bind(
                                null,
                                "flight_number"
                            ),
                            required: "Flight Number is Required",
                        },
                        {
                            type: "date",
                            label: "Departure Date",
                            value: filter.departure_date,
                            onChange: onFilterChange.bind(
                                null,
                                "departure_date"
                            ),
                            required: "Departure Date is Required",
                        },
                        {
                            type: "time",
                            props: {
                                step: "1",
                            },
                            label: "Departure Time",
                            value: filter.departure_time,
                            onChange: onFilterChange.bind(
                                null,
                                "departure_time"
                            ),
                            required: "Departure Time is Required",
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

export default StatusSearch;
