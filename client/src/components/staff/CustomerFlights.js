import styles from "./CustomerFlights.module.scss";

import FlightItem from "../flights/FlightItem";
import CustomerItem from "./CustomerItem";
import { useState } from "react";
import Button from "../UI/Button";

const CustomerFlights = ({ flights, customer }) => {
    const [maxIndex, setMaxIndex] = useState(3);

    return (
        <div className={styles.container}>
            <div className={styles.division}>
                <span>Selected Customer</span>
            </div>
            <CustomerItem customer={customer} />
            <div className={styles.division}>
                <span>Registered Tickets</span>
            </div>
            {flights.map((flight, index) => {
                if (index >= maxIndex) return;
                const key =
                    flight.airline_name +
                    flight.flight_number +
                    flight.departure_date;
                return <FlightItem key={key} flight={flight} selected />;
            })}
            {flights.length === 0 && (
                <span className={styles.noresult}>No Tickets Found</span>
            )}
            {flights.length > maxIndex && (
                <Button
                    text="View More"
                    onClick={() => setMaxIndex((prev) => prev + 3)}
                />
            )}
        </div>
    );
};

export default CustomerFlights;
