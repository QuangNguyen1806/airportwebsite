import { useState } from "react";
import SelectBar from "../UI/SelectBar";
import AddFlight from "./AddFlight";
import AddPlane from "./AddPlane";
import AddPort from "./AddPort";

import styles from "./Add.module.scss";

const Add = (props) => {
    const [type, setType] = useState("flight");

    const renderAddType = (type) => {
        if (type === "flight") return <AddFlight />;
        else if (type === "plane") return <AddPlane />;
        else if (type === "airport") return <AddPort />;
    };

    return (
        <div className={styles.container}>
            <header>
                <SelectBar
                    options={[
                        [
                            {
                                value: "flight",
                                name: "Add Flight",
                            },
                            {
                                value: "plane",
                                name: "Add Airplane",
                            },
                            {
                                value: "airport",
                                name: "Add Airport",
                            },
                        ],
                    ]}
                    value={type}
                    onChange={setType}
                />
            </header>
            {renderAddType(type)}
        </div>
    );
};

export default Add;
