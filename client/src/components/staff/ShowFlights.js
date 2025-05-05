import { useState } from "react";

import axios from "axios";

import styles from "../flights/ShowFlight.module.scss";
import Search from "./Search";
import FlightsSubpage from "./FlightsSubpage";
import ShowCustomers from "./ShowCustomers";
import CustomerFlights from "./CustomerFlights";
import useUser from "../../hooks/useUser";

const ShowFlights = (props) => {
    const { user } = useUser();
    const [result, setResult] = useState();
    const [error, setError] = useState("");

    const getInitialResult = async () => {
        try {
            const result = await axios.get(
                `http://${process.env.REACT_APP_backend_baseurl}/api/flights`,
                {
                    params: {
                        airline: user.airline,
                        start_date: new Date().toLocaleDateString("en-us", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                        }),
                        end_date: new Date(
                            new Date().setDate(new Date().getDate() + 30)
                        ).toLocaleDateString("en-us", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                        }),
                    },
                    withCredentials: true,
                }
            );

            setResult({
                type: "flight",
                content: result.data.flights,
            });
        } catch (e) {
            setError(e.response?.data.msg);
            console.error(e.response?.data.msg);
        }
    };

    const onSearchHandler = async (search_body) => {
        setError("");
        if (user.type !== "staff") return;

        const { type, body } = search_body;
        if (type === "flight_search") {
            const params = {
                airline: user.airline,
            };

            if (body.from) params["start_date"] = body.from;
            if (body.to) params["end_date"] = body.to;
            if (body.source.value) {
                if (body.source.type === "city")
                    params["source_city"] = body.source.value;
                else if (body.source.type === "airport")
                    params["source_airport"] = body.source.value;
            }
            if (body.target.value) {
                if (body.target.type === "city")
                    params["destination_city"] = body.target.value;
                else if (body.target.type === "airport")
                    params["destination_airport"] = body.target.value;
            }

            try {
                const result = await axios.get(
                    `http://${process.env.REACT_APP_backend_baseurl}/api/flights`,
                    {
                        params: params,
                        withCredentials: true,
                    }
                );

                setResult({
                    type: "flight",
                    content: result.data.flights,
                });
            } catch (e) {
                setError(e.response?.data.msg);
                console.error(e.response?.data.msg);
            }
        } else if (type === "customer") {
            try {
                const result = await axios.get(
                    `http://${process.env.REACT_APP_backend_baseurl}/api/customer/all`,
                    {
                        params: {
                            airline: user.airline,
                            flight_number: body.flight_number,
                            departure_date_time: body.departure_date_time,
                        },
                        withCredentials: true,
                    }
                );

                setResult({
                    type: "customer",
                    content: result.data,
                });
            } catch (e) {
                setError(e.response?.data.msg);
                console.error(e.response?.data.msg);
            }
        } else if (type === "customer_flight") {
            try {
                const result = await axios.get(
                    `http://${process.env.REACT_APP_backend_baseurl}/api/flights/schedule`,
                    {
                        params: {
                            type: user.type,
                            email: body.email,
                            airline: user.airline,
                        },
                        withCredentials: true,
                    }
                );

                setResult({
                    type: "customer_flight",
                    content: result.data,
                });
            } catch (e) {
                setError(e.response?.data.msg);
                console.error(e.response?.data.msg);
            }
        }
    };

    const onChange = (type) => {
        setError("");
        if (type === "flight") getInitialResult();
        else setResult(null);
    };

    const renderResult = (result) => {
        if (!result) return null;
        if (result.type === "flight")
            return <FlightsSubpage flights={result.content} />;
        else if (result.type === "customer")
            return <ShowCustomers info={result.content} />;
        else if (result.type === "customer_flight")
            return (
                <CustomerFlights
                    flights={result.content.flights}
                    customer={result.content.customer}
                />
            );
    };

    return (
        <div className={styles.container}>
            <Search onSearch={onSearchHandler} onChange={onChange} />
            {!!error && <span className={styles.error}>{error}</span>}
            {renderResult(result)}
        </div>
    );
};

export default ShowFlights;
