import { useState } from "react";
import Form from "../UI/Form";

import styles from "../flights/StatusSearch.module.scss";

const convertDate = (datetime) => {
    return new Date(datetime).toISOString().split("T")[0];
};

const convertTime = (datetime) => {
    return new Date(datetime).toISOString().split("T")[1].split(".")[0];
};

const FlightCustomerSearch = (props) => {
    const [filter, setFilter] = useState({
        airline: props.default?.airline ? props.default.airline : "",
        flight_number: props.default?.flight_number
            ? props.default.flight_number
            : "",
        departure_date: props.default?.departure_date_time
            ? convertDate(props.default.departure_date_time)
            : "",
        departure_time: props.default?.departure_date_time
            ? convertTime(props.default.departure_date_time)
            : "",
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
            type: "customer",
            body: {
                airline: filter.airline,
                flight_number: filter.flight_number,
                departure_date_time:
                    filter.departure_date + " " + filter.departure_time,
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
                            label: "Flight Number",
                            value: filter.flight_number,
                            onChange: onFilterChange.bind(
                                null,
                                "flight_number"
                            ),
                            required: "Flight Number is Required",
                        },
                        {
                            type: "empty",
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
                                step: 1,
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

export default FlightCustomerSearch;
