import axios from "axios";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlightItem from "../flights/FlightItem";
import Button from "../UI/Button";
import SelectBar from "../UI/SelectBar";
import { getCookie } from "../../utility";

import styles from "./FlightResult.module.scss";

const isPastFlight = (flight) => {
    return new Date(flight.arrival_date) <= new Date();
};

const FlightResult = ({
    flights,
    onSelectHandler,
    onDeselectHandler,
    selectedFlights,
}) => {
    const navigate = useNavigate();

    const [status, setStatus] = useState(
        useMemo(() => flights.map((flight) => flight.status), [flights])
    );

    useEffect(() => {
        setStatus(flights.map((flight) => flight.status));
    }, [flights]);

    const [maxIndex, setMaxIndex] = useState(3);

    const [autoSaveID, setAutoSaveId] = useState(null);

    const changeFlightStatus = async (index) => {
        try {
            const result = await axios.post(
                `http://${process.env.REACT_APP_backend_baseurl}/api/flights/status`,
                {
                    status: status[index],
                    airline_name: flights[index].airline_name,
                    flight_number: flights[index].flight_number,
                    arrival_date: flights[index].arrival_date,
                    departure_date_time: flights[index].departure_date_time,
                },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );
        } catch (e) {
            console.error(e.response?.data.msg);
        }
    };

    const onStatusChangeHandler = (index, value) => {
        setStatus((prev) => {
            const newState = [...prev];
            newState[index] = value;
            return newState;
        });

        if (autoSaveID) clearTimeout(autoSaveID);
        setAutoSaveId(
            setTimeout(() => {
                changeFlightStatus(index);
                setAutoSaveId(null);
            }, 3000)
        );
    };

    const onClickHandler = (flight) => {
        navigate(
            `/comment?airline=${flight.airline_name}&flight=${flight.flight_number}&departure=${flight.departure_date_time}`
        );
    };

    return (
        <div className={styles.container}>
            {flights.length === 0 && (
                <span className={styles.noresult}>No Flights Found</span>
            )}
            <ul>
                {flights.map((flight, index) => {
                    if (index >= maxIndex) return;
                    const key =
                        flight.airline_name +
                        flight.flight_number +
                        flight.departure_date_time;
                    return (
                        <Fragment key={key}>
                            <FlightItem
                                flight={flight}
                                onSelect={onSelectHandler.bind(null, index)}
                                onDeselect={onDeselectHandler.bind(null, index)}
                                selected={selectedFlights[index]}
                                selectable={true}
                            />
                            {selectedFlights[index] && (
                                <div className={styles.toolBar}>
                                    <SelectBar
                                        onChange={onStatusChangeHandler.bind(
                                            null,
                                            index
                                        )}
                                        value={status[index]}
                                        options={[
                                            [
                                                {
                                                    value: "scheduled",
                                                    name: "Scheduled",
                                                },
                                                {
                                                    value: "ontime",
                                                    name: "On Time",
                                                },
                                                {
                                                    value: "delayed",
                                                    name: "Delayed",
                                                },
                                                {
                                                    value: "departed",
                                                    name: "Departed",
                                                },
                                                {
                                                    value: "arrived",
                                                    name: "Arrived",
                                                },
                                            ],
                                        ]}
                                    />
                                    <Button
                                        text="View Comments"
                                        onClick={onClickHandler.bind(
                                            null,
                                            flight
                                        )}
                                        disabled={!isPastFlight(flight)}
                                    />
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </ul>
            {flights.length > maxIndex && (
                <div className={styles.viewmore}>
                    <Button
                        text="View More"
                        onClick={() => {
                            setMaxIndex((prev) => prev + 3);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default FlightResult;
