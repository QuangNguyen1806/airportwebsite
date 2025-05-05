import axios from "axios";
import { useState } from "react";
import Form from "../UI/Form";
import { getCookie } from "../../utility";
import useUser from "../../hooks/useUser";

const AddFlight = () => {
    const { user } = useUser();

    const [info, setInfo] = useState({
        flight_number: "",
        departure_date: "",
        departure_time: "",
        departure_airport_code: "",
        arrival_date: "",
        arrival_time: "",
        arrival_airport_code: "",
        base_price: "",
        airplane_id: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const onInfoChange = (property, value) => {
        setError("");
        setSuccess("");
        setInfo((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const onAddHandler = async () => {
        setError("");
        const body = { ...info };
        body.departure_date_time =
            body.departure_date + " " + body.departure_time;
        body.arrival_date_time = body.arrival_date + " " + body.arrival_time;
        body.airline_name = user.airline;

        try {
            const result = await axios.put(
                `http://${process.env.REACT_APP_backend_baseurl}/api/flights/`,
                body,
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );

            setInfo({
                airline_name: "",
                flight_number: "",
                departure_date: "",
                departure_time: "",
                departure_airport_code: "",
                arrival_date: "",
                arrival_time: "",
                arrival_airport_code: "",
                base_price: "",
                airplane_id: "",
            });
            setSuccess("Success!");
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (e) {
            setError(e.response?.data.msg);
            console.error(e.response?.data.msg);
        }
    };

    return (
        <div
            style={{
                padding: "20px",
            }}
        >
            <Form
                column="2"
                inputs={[
                    {
                        type: "text",
                        label: "Flight Number",
                        value: info.flight_number,
                        onChange: onInfoChange.bind(null, "flight_number"),
                        required: "Flight Number is Required",
                    },
                    {
                        type: "date",
                        label: "Departure Date",
                        value: info.departure_date,
                        onChange: onInfoChange.bind(null, "departure_date"),
                        required: "Departure Date is Required",
                    },
                    {
                        type: "time",
                        label: "Departure Time",
                        props: {
                            step: "1",
                        },
                        value: info.departure_time,
                        onChange: onInfoChange.bind(null, "departure_time"),
                        required: "Departure Time is Required",
                    },
                    {
                        type: "text",
                        label: "Depart. Port Code",
                        value: info.departure_airport_code,
                        onChange: onInfoChange.bind(
                            null,
                            "departure_airport_code"
                        ),
                        required: "Depart. Port Code is Required",
                    },
                    {
                        type: "date",
                        label: "Arrival Date",
                        value: info.arrival_date,
                        onChange: onInfoChange.bind(null, "arrival_date"),
                        required: "Arrival Date is Required",
                    },
                    {
                        type: "time",
                        label: "Arrival Time",
                        props: {
                            step: "1",
                        },
                        value: info.arrival_time,
                        onChange: onInfoChange.bind(null, "arrival_time"),
                        required: "Arrival Time is Required",
                    },
                    {
                        type: "text",
                        label: "Arrival Port Code",
                        value: info.arrival_airport_code,
                        onChange: onInfoChange.bind(
                            null,
                            "arrival_airport_code"
                        ),
                        required: "Arrival Port Code is Required",
                    },
                    {
                        type: "text",
                        label: "Base Price",
                        value: info.base_price,
                        onChange: onInfoChange.bind(null, "base_price"),
                        required: "Base Price is Required",
                    },
                    {
                        type: "text",
                        label: "Airplane ID",
                        value: info.airplane_id,
                        onChange: onInfoChange.bind(null, "airplane_id"),
                        required: "Airplane ID is Required",
                    },
                ]}
                submit={{
                    text: "Add",
                    onClick: onAddHandler,
                }}
            />
            {!!error && <span className="error">{error}</span>}
            {!!success && <span className="success">{success}</span>}
        </div>
    );
};

export default AddFlight;
