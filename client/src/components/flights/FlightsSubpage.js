import { useEffect, useState } from "react";
import FlightResult from "./FlightResult";
import useUser from "../../hooks/useUser";
import Button from "../UI/Button";

import styles from "./FlightsSubpage.module.scss";
import TicketForm from "./TicketForm";
import axios from "axios";
import { getCookie } from "../../utility";

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

    const [ticketForm, setTicketForm] = useState(false);
    const [success, setSuccess] = useState("");
    const [calculatedPrice, setCalculatedPrice] = useState(0);

    const [selectedFromFlights, setSelectedFromFlights] = useState(
        Array(props.flights.flights_from?.length).fill(false)
    );

    const [selectedToFlights, setSelectedToFlights] = useState(
        Array(props.flights.flights_to.length).fill(false)
    );

    const noResult =
        props.flights.flights_to.length === 0 &&
        (!props.flights.flights_from ||
            props.flights.flights_from.length === 0);

    const onSelectFromHandler = (index) => {
        const newState = Array(props.flights.flights_from.length).fill(false);
        newState[index] = true;
        setSelectedFromFlights(newState);
    };

    const onDeselectFromHandler = (index) => {
        setSelectedFromFlights((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
        });
    };

    const onSelectToHandler = (index) => {
        const newState = Array(props.flights.flights_to.length).fill(false);
        newState[index] = true;
        setSelectedToFlights(newState);
    };

    const onDeselectToHandler = (index) => {
        setSelectedToFlights((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
        });
    };

    const fetchCalculatedPrice = async (flight) => {
        try {
            const result = await axios.get(
                `http://${process.env.REACT_APP_backend_baseurl}/api/tickets/price`,
                {
                    params: {
                        airline_name: flight.airline_name,
                        flight_number: flight.flight_number,
                        departure_date_time: flight.departure_date_time,
                    },
                }
            );

            return result.data.calculated_price;
        } catch (e) {
            console.error(e.response.data.msg);
        }
    };

    const getTotalPrice = async (flights) => {
        let sum = 0;
        for (const flight of flights)
            sum += +(await fetchCalculatedPrice(flight));
        setCalculatedPrice(sum);
    };

    const proceedable =
        selectedOne(selectedToFlights) &&
        (!props.flights.flights_from || selectedOne(selectedFromFlights));

    useEffect(() => {
        if (!proceedable && ticketForm) setTicketForm(false);
    }, [proceedable]);

    useEffect(() => {
        if (ticketForm === false) return;

        const flights = [];
        for (let i = 0; i < selectedToFlights.length; ++i)
            if (selectedToFlights[i]) flights.push(props.flights.flights_to[i]);

        if (!!props.flights.flights_from) {
            for (let i = 0; i < selectedFromFlights.length; ++i)
                if (selectedFromFlights[i])
                    flights.push(props.flights.flights_from[i]);
        }

        getTotalPrice(flights);
    }, [ticketForm]);

    const onPurchaseHandler = async (cards) => {
        if (!user) return;

        const fromIndex = !!props.flights.flights_from
            ? getSelectIndex(selectedFromFlights)
            : null;
        const toIndex = getSelectIndex(selectedToFlights);

        const body = {
            type: !!props.flights.flights_from ? "round-trip" : "one-way",
            email: user.username,
            first_name: cards.first_name,
            last_name: cards.last_name,
            date_of_birth: cards.date_of_birth,
            card_type: cards.card_type,
            card_number: cards.card_number,
            card_name: cards.card_name,
            expiration_date: cards.card_expiration,
        };

        body["to"] = {
            airline_name: props.flights.flights_to[toIndex].airline_name,
            flight_number: props.flights.flights_to[toIndex].flight_number,
            arrival_date: props.flights.flights_to[toIndex].arrival_date,
            departure_date_time:
                props.flights.flights_to[toIndex].departure_date_time,
        };

        if (fromIndex !== null) {
            body["from"] = {
                airline_name: props.flights.flights_from[fromIndex].airline,
                flight_number:
                    props.flights.flights_from[fromIndex].flight_number,
                arrival_date:
                    props.flights.flights_from[fromIndex].arrival_date,
                departure_date:
                    props.flights.flights_from[fromIndex].departure_date,
            };
        }

        try {
            const result = await axios.put(
                `http://${process.env.REACT_APP_backend_baseurl}/api/tickets/register`,
                body,
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );

            setSuccess("Success!");
            setTimeout(() => {
                window.location = "/?tab=myflight";
            }, 3000);
        } catch (e) {
            console.error(e.response?.data.msg);
        }
    };

    return (
        <div className={styles.container}>
            {noResult && (
                <span className={styles.noresult}>No Result Found</span>
            )}
            {!noResult && (
                <>
                    <FlightResult
                        flights={props.flights}
                        onSelectFromHandler={onSelectFromHandler}
                        onDeselectFromHandler={onDeselectFromHandler}
                        onSelectToHandler={onSelectToHandler}
                        onDeselectToHandler={onDeselectToHandler}
                        selectedFromFlights={selectedFromFlights}
                        selectedToFlights={selectedToFlights}
                    />
                    {!!user && !ticketForm && (
                        <div className={styles.checkout}>
                            <Button
                                text="Continue to Check Out"
                                disabled={!proceedable}
                                onClick={setTicketForm.bind(null, true)}
                            />
                        </div>
                    )}
                    {!!ticketForm && (
                        <TicketForm
                            disabled={!proceedable}
                            onPurchase={onPurchaseHandler}
                            price={calculatedPrice}
                        />
                    )}
                    {!!success && (
                        <div className={styles.success}>{success}</div>
                    )}
                </>
            )}
        </div>
    );
};

export default FlightsSubpage;
