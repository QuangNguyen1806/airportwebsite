import useUser from "../../hooks/useUser";
import FlightItem from "./FlightItem";

import styles from "./FlightResult.module.scss";

const FlightResult = ({
    flights,
    onSelectFromHandler,
    onDeselectFromHandler,
    onSelectToHandler,
    onDeselectToHandler,
    selectedFromFlights,
    selectedToFlights,
}) => {
    const { user } = useUser();

    return (
        <div className={styles.container}>
            <div className={styles.division}>
                <span>Select Departure Flight</span>
            </div>
            <ul>
                {flights.flights_to.map((flight, index) => {
                    const key =
                        flight.airline_name +
                        flight.flight_number +
                        flight.departure_date;
                    return (
                        <FlightItem
                            flight={flight}
                            key={key}
                            onSelect={onSelectToHandler.bind(null, index)}
                            onDeselect={onDeselectToHandler.bind(null, index)}
                            selected={selectedToFlights[index]}
                            selectable={!!user}
                        />
                    );
                })}
            </ul>
            {!!flights.flights_from && (
                <>
                    <div className={styles.division}>
                        <span>Select Return Flight</span>
                    </div>
                    <ul>
                        {flights.flights_from.map((flight, index) => {
                            const key =
                                flight.airline_name +
                                flight.flight_number +
                                flight.departure_date;
                            return (
                                <FlightItem
                                    flight={flight}
                                    key={key}
                                    onSelect={onSelectFromHandler.bind(
                                        null,
                                        index
                                    )}
                                    onDeselect={onDeselectFromHandler.bind(
                                        null,
                                        index
                                    )}
                                    selected={selectedFromFlights[index]}
                                    selectable={!!user}
                                />
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
};

export default FlightResult;
