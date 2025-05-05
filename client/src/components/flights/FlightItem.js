import { useLayoutEffect } from "react";
import AirplaneIcon from "../UI/AirplaneIcon";
import Arrow from "../UI/Arrow";
import Checkbox from "../UI/Checkbox";
import styles from "./FlightItem.module.scss";

const preProcess = (flight) => {
    if (flight.departure_date_time) {
        const time = new Date(flight.departure_date_time);

        flight.departure_date = time.toLocaleDateString("en-us", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        flight.departure_time = time.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (flight.arrival_date_time) {
        const time = new Date(flight.arrival_date_time);

        flight.arrival_date = time.toLocaleDateString("en-us", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        flight.arrival_time = time.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return flight;
};

const FlightItem = ({
    flight,
    onSelect,
    onDeselect,
    selected,
    selectable,
    showStatus,
    calculatedPrice,
}) => {
    const onClickHandler = () => {
        if (!selectable || !onSelect || !onDeselect) return;
        if (!selected) onSelect();
        else onDeselect();
    };
    flight = preProcess(flight);

    const showBasePrice = !showStatus && !calculatedPrice;

    return (
        <div className={styles.flight}>
            <header>
                <div className={styles.icon}>
                    <AirplaneIcon />
                </div>
                <div>
                    <div className={styles.airports}>
                        <span>{flight.departure_airport_code}</span>
                        <Arrow width={2} length={70} />
                        <span>{flight.arrival_airport_code}</span>
                    </div>
                    <div>
                        <span>{flight.airline_name}</span>
                    </div>
                </div>
            </header>
            <main onClick={onClickHandler}>
                {selectable && (
                    <div className={styles.select}>
                        <Checkbox
                            size={30}
                            checked={selected}
                            onClick={onClickHandler}
                            color="#FF7100"
                        />
                    </div>
                )}
                <div
                    className={styles.border}
                    style={{
                        backgroundColor: selected ? "#FF7100" : "",
                    }}
                ></div>
                <div
                    className={styles.content}
                    style={{
                        backgroundColor: selected ? "#FFF8E1" : "",
                    }}
                >
                    <div className={styles.flight_info}>
                        <div>
                            <span>{flight.departure_date}</span>
                            <span>{flight.departure_airport_code}</span>
                            <span>{flight.departure_time}</span>
                        </div>
                        <div className={styles.arrow}>
                            <Arrow
                                width={3}
                                length={170}
                                color="grey"
                                text={flight.time}
                            />
                        </div>
                        <div>
                            <span>{flight.arrival_date}</span>
                            <span>{flight.arrival_airport_code}</span>
                            <span>{flight.arrival_time}</span>
                        </div>
                    </div>
                    <div className={styles.airplane_info}>
                        <span>
                            {flight.airline_name + "-" + flight.airplane.id}
                        </span>
                        <AirplaneIcon />
                        <span>{flight.airplane.seat_number} Seats</span>
                    </div>
                    <div className={styles.price}>
                        {!!showStatus && <span>{flight.status}</span>}
                        {showBasePrice && (
                            <>
                                <span className={styles.text}>Starts From</span>
                                <span>{flight.base_price}</span>
                            </>
                        )}
                        {!!calculatedPrice && <span>{calculatedPrice}</span>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FlightItem;
