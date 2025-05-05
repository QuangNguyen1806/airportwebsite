import { useEffect, useState } from "react";
import Form from "../UI/Form";

import styles from "./FlightSearch.module.scss";

const FlightSearch = (props) => {
    const [sourceType, setSourceType] = useState("city");
    const [toType, setToType] = useState("city");

    const [filter, setFilter] = useState({
        from: "",
        to: "",
        departure: "",
        return: "",
    });

    const onFilterChange = (property, value) => {
        setFilter((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const inputs = [
        {
            type: "text",
            label: sourceType === "city" ? "Source City" : "Source Airport",
            value: filter.from,
            onChange: onFilterChange.bind(null, "from"),
        },
        {
            type: "text",
            label: toType === "city" ? "Target City" : "Target Airport",
            value: filter.to,
            onChange: onFilterChange.bind(null, "to"),
        },
        {
            type: "date",
            label: "From",
            value: filter.departure,
            onChange: onFilterChange.bind(null, "departure"),
        },
        {
            type: "date",
            label: "To",
            value: filter.return,
            onChange: onFilterChange.bind(null, "return"),
        },
    ];

    const onSearchHandler = () => {
        props.onSearch({
            type: "flight_search",
            body: {
                source: {
                    type: sourceType,
                    value: filter.from,
                },
                target: {
                    type: toType,
                    value: filter.to,
                },
                from: filter.departure,
                to: filter.return,
            },
        });
    };

    return (
        <div className={styles.container}>
            <header>
                <div></div>
                <div>
                    <div>
                        <input
                            type={"radio"}
                            checked={sourceType === "airport"}
                            onClick={setSourceType.bind(
                                null,
                                sourceType === "city" ? "airport" : "city"
                            )}
                            onChange={() => {}}
                        />
                        <label className={styles.fixedWidth}>
                            {sourceType === "city"
                                ? "Source Airport"
                                : "Source City"}
                        </label>
                    </div>
                    <div>
                        <input
                            type={"radio"}
                            checked={toType === "airport"}
                            onClick={setToType.bind(
                                null,
                                toType === "city" ? "airport" : "city"
                            )}
                            onChange={() => {}}
                        />
                        <label className={styles.fixedWidth}>
                            {toType === "city"
                                ? "Target Airport"
                                : "Target City"}
                        </label>
                    </div>
                </div>
            </header>
            <main>
                <Form
                    column="2"
                    inputs={inputs}
                    submit={{
                        text: "Search",
                        onClick: onSearchHandler,
                    }}
                />
            </main>
        </div>
    );
};

export default FlightSearch;
