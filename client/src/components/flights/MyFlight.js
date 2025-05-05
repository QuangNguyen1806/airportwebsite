import { useState } from "react";
import Form from "../UI/Form";

import styles from "./MyFlight.module.scss";

const MyFlight = (props) => {
    const [filter, setFilter] = useState({
        start_date: "",
        end_date: "",
        source: "",
        target: "",
    });

    const [sourceType, setSourceType] = useState("city");
    const [toType, setToType] = useState("city");

    const onFilterChange = (property, value) => {
        setFilter((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const onSearchHandler = () => {
        props.onSearch({
            type: "myflight",
            body: {
                start_date: filter.start_date,
                end_date: filter.end_date,
                from: {
                    type: sourceType,
                    value: filter.source,
                },
                to: {
                    type: toType,
                    value: filter.target,
                },
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
                    inputs={[
                        {
                            type: "text",
                            label:
                                sourceType === "city"
                                    ? "Source City"
                                    : "Source Airport",
                            value: filter.source,
                            onChange: onFilterChange.bind(null, "source"),
                        },
                        {
                            type: "text",
                            label:
                                toType === "city"
                                    ? "Target City"
                                    : "Target Airport",
                            value: filter.target,
                            onChange: onFilterChange.bind(null, "target"),
                        },
                        {
                            type: "date",
                            label: "Start Date",
                            value: filter.start_date,
                            onChange: onFilterChange.bind(null, "start_date"),
                        },
                        {
                            type: "date",
                            label: "End Date",
                            value: filter.end_date,
                            onChange: onFilterChange.bind(null, "end_date"),
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

export default MyFlight;
