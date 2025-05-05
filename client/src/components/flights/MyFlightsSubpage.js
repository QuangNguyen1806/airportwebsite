import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import DisplayComment from "../comment/DisplayComment";
import MakeComment from "../comment/MakeComment";
import Button from "../UI/Button";
import FlightItem from "./FlightItem";
import styles from "./MyFlightsSubpage.module.scss";
import { getCookie } from "../../utility";

const MyFlightsSubpage = ({ flights }) => {
    const [selected, setSelected] = useState(
        Array(
            flights.future.length + flights.ongoing.length + flights.past.length
        ).fill(false)
    );

    const [maxIndex, setMaxIndex] = useState({
        future: 3,
        ongoing: 3,
        past: 3,
    });

    useEffect(() => {
        setSelected(
            Array(
                flights.future.length +
                    flights.ongoing.length +
                    flights.past.length
            ).fill(false)
        );
    }, [flights]);

    const incrementIndex = (type) => {
        setMaxIndex((prev) => {
            const newState = { ...prev };
            newState[type] += 3;

            return newState;
        });
    };

    const onSelectHandler = (index) => {
        const newState = Array(flights.length).fill(false);
        newState[index] = true;
        setSelected(newState);
    };

    const onDeselectHandler = (index) => {
        setSelected((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
        });
    };

    const onUnregisterHandler = async (index) => {
        try {
            const result = await axios.post(
                `http://${process.env.REACT_APP_backend_baseurl}/api/tickets/unregister`,
                {
                    ticket_id: flights.future[index].ticket_id,
                },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );

            window.location = "/?tab=myflight";
        } catch (e) {
            console.error(e.response?.data.msg);
        }
    };

    if (selected.length === 0) {
        return <span className={styles.noresult}>No Flights Found</span>;
    }

    return (
        <div className={styles.container}>
            {flights.future.length > 0 && (
                <div className={styles.division}>
                    <span>My Future Flights</span>
                </div>
            )}
            {flights.future.map((flight, index) => {
                if (index >= maxIndex.future) return;

                return (
                    <Fragment key={flight.ticket_id}>
                        <FlightItem
                            flight={flight}
                            selected={selected[index]}
                            onSelect={onSelectHandler.bind(null, index)}
                            onDeselect={onDeselectHandler.bind(null, index)}
                            showStatus={false}
                            selectable={true}
                            calculatedPrice={flight.actual_price}
                        />
                        {selected[index] && (
                            <Button
                                text="Unregister"
                                color="#041BD7"
                                onClick={onUnregisterHandler.bind(null, index)}
                            />
                        )}
                    </Fragment>
                );
            })}
            {flights.future.length > maxIndex.future && (
                <Button
                    onClick={incrementIndex.bind(null, "future")}
                    text="View More"
                />
            )}
            {flights.ongoing.length > 0 && (
                <div className={styles.division}>
                    <span>My Ongoing Flights</span>
                </div>
            )}
            {flights.ongoing.map((flight, index) => {
                if (index >= maxIndex.ongoing) return;
                const baseIndex = flights.future.length + index;

                return (
                    <FlightItem
                        key={flight.ticket_id}
                        flight={flight}
                        selected={selected[baseIndex]}
                        onSelect={onSelectHandler.bind(null, baseIndex)}
                        onDeselect={onDeselectHandler.bind(null, baseIndex)}
                        showStatus={true}
                        selectable={false}
                        calculatedPrice={flight.actual_price}
                    />
                );
            })}
            {flights.ongoing.length > maxIndex.ongoing && (
                <Button
                    onClick={incrementIndex.bind(null, "ongoing")}
                    text="View More"
                />
            )}
            {flights.past.length > 0 && (
                <div className={styles.division}>
                    <span>My Past Flights</span>
                </div>
            )}
            {flights.past.map((flight, index) => {
                if (index >= maxIndex.past) return;
                const baseIndex =
                    flights.future.length + flights.ongoing.length + index;

                return (
                    <Fragment key={flight.ticket_id}>
                        <FlightItem
                            flight={flight}
                            selected={selected[baseIndex]}
                            onSelect={onSelectHandler.bind(null, baseIndex)}
                            onDeselect={onDeselectHandler.bind(null, baseIndex)}
                            showStatus={false}
                            selectable={true}
                            calculatedPrice={flight.actual_price}
                        />
                        {selected[baseIndex] &&
                            (flight.comment ? (
                                <div className={styles.comment}>
                                    <span>My Comment:</span>
                                    <DisplayComment comment={flight.comment} />
                                </div>
                            ) : (
                                <div className={styles.comment}>
                                    <span>Make a Comment:</span>
                                    <MakeComment
                                        airline_name={flight.airline_name}
                                        flight_number={flight.flight_number}
                                        departure_date_time={
                                            flight.departure_date_time
                                        }
                                    />
                                </div>
                            ))}
                    </Fragment>
                );
            })}
            {flights.past.length > maxIndex.past && (
                <Button
                    onClick={incrementIndex.bind(null, "past")}
                    text="View More"
                />
            )}
        </div>
    );
};

export default MyFlightsSubpage;
