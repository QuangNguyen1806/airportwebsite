import { useState } from "react";
import FlightResult from "./FlightResult";
import useUser from "../../hooks/useUser";

import styles from "./FlightsSubpage.module.scss";
import axios from "axios";

const selectedOne = (selectedFlights) => {
    return selectedFlights.reduce((prev, cur) => {
        return prev || cur;
    }, false);
};

const getSelectIndex = (selectedFlights) => {
    for (let i = 0; i < selectedFlights.length; ++i)
        if (selectedFlights[i]) return i;
};

const FlightsSubpage = (props) => {
    const { user } = useUser();

    const [selectedFlights, setSelectedFlights] = useState(
        Array(props.flights.length).fill(false)
    );

    const onSelectHandler = (index) => {
        const newState = Array(props.flights.length).fill(false);
        newState[index] = true;
        setSelectedFlights(newState);
    };

    const onDeselectHandler = (index) => {
        setSelectedFlights((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
        });
    };

    const actionHandler = async (action) => {};

    return (
        <div className={styles.container}>
            <FlightResult
                flights={props.flights}
                onSelectHandler={onSelectHandler}
                onDeselectHandler={onDeselectHandler}
                selectedFlights={selectedFlights}
            />
        </div>
    );
};

export default FlightsSubpage;
