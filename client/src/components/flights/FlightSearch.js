import { useEffect, useState } from "react";
import Form from "../UI/Form";

import styles from "./FlightSearch.module.scss";

const FlightSearch = (props) => {
    const [type, setType] = useState("oneway");
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

    useEffect(() => {
        if (type === "oneway") onFilterChange("return", "");
    }, [type]);

    const inputs = [
        {
            type: "text",
            label: sourceType === "city" ? "Source City" : "Source Airport",
            value: filter.from,
            onChange: onFilterChange.bind(null, "from"),
            required: "Source is required",
        },
        {
            type: "text",
            label: toType === "city" ? "Target City" : "Target Airport",
            value: filter.to,
            onChange: onFilterChange.bind(null, "to"),
            required: "Destination is required",
        },
        {
            type: "date",
            label: "Departure Date",
            value: filter.departure,
            onChange: onFilterChange.bind(null, "departure"),
            required: "Departure Date is required",
        },
    ];

    if (type === "roundtrip") {
        inputs.push({
            type: "date",
            label: "Return Date",
            value: filter.return,
            onChange: onFilterChange.bind(null, "return"),
            required: "Return Date is required",
        });
    }

    const onSearchHandler = () => {
        props.onSearch({
            type: "flight_search",
            body: {
                from: {
                    type: sourceType,
                    value: filter.from,
                },
                to: {
                    type: toType,
                    value: filter.to,
                },
                departure: filter.departure,
                return: filter.return,
            },
        });
    };

    return (
        <div className={styles.container}>
            <header>
                <div>
                    <div>
                        <input
                            type={"radio"}
                            checked={type === "oneway"}
                            onClick={setType.bind(null, "oneway")}
                            onChange={() => {}}
                        />
                        <label>One Way</label>
                    </div>
                    <div>
                        <input
                            type={"radio"}
                            checked={type === "roundtrip"}
                            onClick={setType.bind(null, "roundtrip")}
                            onChange={() => {}}
                        />
                        <label>Round Trip</label>
                    </div>
                </div>
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
