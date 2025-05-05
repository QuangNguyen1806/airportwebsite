import { useState } from "react";

import axios from "axios";

import styles from "./ShowFlight.module.scss";
import useUser from "../../hooks/useUser";
import Search from "./Search";
import FlightsSubpage from "./FlightsSubpage";
import StatusSubpage from "./StatusSubpage";
import MyFlightsSubpage from "./MyFlightsSubpage";

const convertFlights = ({ flights }) => {
    flights.sort((a, b) => {
        return (
            new Date(b.departure_date_time) - new Date(a.departure_date_time)
        );
    });

    const converted = {
        future: [],
        ongoing: [],
        past: [],
    };

    for (const flight of flights) {
        const one_day_before = new Date(
            new Date(flight.departure_date_time) - 1
        );
        const arrival_date = new Date(flight.arrival_date_time);
        if (one_day_before > new Date()) converted.future.push(flight);
        else if (arrival_date < new Date()) converted.past.push(flight);
        else converted.ongoing.push(flight);
    }

    converted.future.sort((a, b) => {
        return (
            new Date(a.departure_date_time) - new Date(b.departure_date_time)
        );
    });

    return converted;
};

const ShowFlights = (props) => {
    const { user } = useUser();
    const [result, setResult] = useState();
    const [error, setError] = useState("");

    const onSearchHandler = async (search_body) => {
        setError("");
        const { type, body } = search_body;
        if (type === "flight_search") {
            const params = {};

            if (body.departure) params["departure_date"] = body.departure;
            if (body.return) params["return_date"] = body.return;
            if (body.from.value) {
                if (body.from.type === "city")
                    params["source_city"] = body.from.value;
                else if (body.from.type === "airport")
                    params["source_airport"] = body.from.value;
            }
            if (body.to.value) {
                if (body.to.type === "city")
                    params["destination_city"] = body.to.value;
                else if (body.to.type === "airport")
                    params["destination_airport"] = body.to.value;
            }

            try {
                const result = await axios.get(
                    `http://${process.env.REACT_APP_backend_baseurl}/api/flights/future`,
                    {
                        params: params,
                    }
                );

                setResult({
                    type: "flight",
                    content: result.data,
                });
            } catch (e) {
                setError(e.response?.data.msg);
                console.error(e.response?.data.msg);
            }
        } else if (type === "status") {
            let result;
            try {
                result = await axios.get(
                    `http://${process.env.REACT_APP_backend_baseurl}/api/flights/status`,
                    {
                        params: {
                            airline_name: body.airline,
                            flight_number: body.flight_number,
                            departure_date_time:
                                body.departure_date + " " + body.departure_time,
                        },
                    }
                );
                setResult({
                    type: "status",
                    content: result.data,
                });
            } catch (e) {
                setError(e.response?.data.msg);
                console.error(e.response?.data.msg);
            }
        } else if (type === "myflight") {
            if (!user) return;
            const params = {
                email: user.username,
                type: user.type,
            };

            if (body.start_date) params["start_date"] = body.start_date;
            if (body.end_date) params["end_date"] = body.end_date;
            if (body.from.value) {
                if (body.from.type === "city")
                    params["source_city"] = body.from.value;
                else if (body.from.type === "airport")
                    params["source_airport"] = body.from.value;
            }
            if (body.to.value) {
                if (body.to.type === "city")
                    params["destination_city"] = body.to.value;
                else if (body.to.type === "airport")
                    params["destination_airport"] = body.to.value;
            }

            try {
                const result = await axios.get(
                    `http://${process.env.REACT_APP_backend_baseurl}/api/flights/schedule`,
                    {
                        params: params,
                        withCredentials: true,
                    }
                );

                setResult({
                    type: "myflight",
                    content: result.data,
                });
            } catch (e) {
                setError(e.response?.data.msg);
                console.error(e.response?.data.msg);
            }
        }
    };

    const clearResult = () => {
        setResult(null);
    };

    const renderSubpage = (result) => {
        if (result?.type === "flight")
            return <FlightsSubpage flights={result.content} />;
        else if (result?.type === "status")
            return <StatusSubpage flight={result.content} />;
        else if (result?.type === "myflight")
            return (
                <MyFlightsSubpage flights={convertFlights(result.content)} />
            );
    };

    return (
        <div className={styles.container}>
            <Search onSearch={onSearchHandler} onChange={clearResult} />
            {!!error && <span className={styles.error}>{error}</span>}
            {renderSubpage(result)}
        </div>
    );
};

export default ShowFlights;
