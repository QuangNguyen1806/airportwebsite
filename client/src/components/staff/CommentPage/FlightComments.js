import axios from "axios";
import { useEffect, useState } from "react";
import CommentList from "./CommentList";
import CommentSearch from "./CommentSearch";

const FlightComments = ({ flight: initalFlight }) => {
    const [flight, setFlight] = useState(initalFlight);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState("");

    const onSearchHandler = (flight) => {
        setFlight({
            airline: flight.body.airline,
            flight_number: flight.body.flight_number,
            departure_date_time: flight.body.departure_date_time,
        });
    };

    const fetchComments = async (flight) => {
        setError("");
        try {
            const result = await axios.get(
                `http://${process.env.REACT_APP_backend_baseurl}/api/comment`,
                {
                    params: {
                        airline_name: flight.airline,
                        flight_number: flight.flight_number,
                        departure_date_time: flight.departure_date_time,
                    },
                    withCredentials: true,
                }
            );

            setComments(result.data.comments);
        } catch (e) {
            setComments([]);
            setError(e.response?.data.msg);
            console.error(e.response?.data.msg);
        }
    };

    useEffect(() => {
        if (!flight) return;
        fetchComments(flight);
    }, [flight]);

    return (
        <div>
            <CommentSearch onSearch={onSearchHandler} value={flight} />
            <CommentList comments={comments} error={error} />
        </div>
    );
};

export default FlightComments;
