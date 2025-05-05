import axios from "axios";
import { useState } from "react";
import Form from "../UI/Form";
import { getCookie } from "../../utility";

const AddPort = () => {
    const [info, setInfo] = useState({
        code: "",
        name: "",
        city: "",
        country: "",
        airport_type: "international",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const onInfoChange = (property, value) => {
        setError("");
        setInfo((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const onAddHandler = async () => {
        setError("");
        try {
            const result = await axios.put(
                `http://${process.env.REACT_APP_backend_baseurl}/api/airport/`,
                {
                    code: info.code,
                    name: info.name,
                    city: info.city,
                    country: info.country,
                    airport_type: info.airport_type,
                },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );

            setInfo({
                code: "",
                name: "",
                city: "",
                country: "",
                airport_type: "",
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
                        label: "Airport Code",
                        value: info.code,
                        onChange: onInfoChange.bind(null, "code"),
                        required: "Code Number is Required",
                    },
                    {
                        type: "text",
                        label: "Airport Name",
                        value: info.name,
                        onChange: onInfoChange.bind(null, "name"),
                        required: "Name is Required",
                    },
                    {
                        type: "text",
                        label: "City",
                        value: info.city,
                        onChange: onInfoChange.bind(null, "city"),
                        required: "City is Required",
                    },
                    {
                        type: "text",
                        label: "Country",
                        value: info.country,
                        onChange: onInfoChange.bind(null, "country"),
                        required: "Country is Required",
                    },
                    {
                        type: "select",
                        label: "Airport Type",
                        value: info.airport_type,
                        options: ["international", "domestic", "both"],
                        onChange: onInfoChange.bind(null, "airport_type"),
                        required: "Airport Type is Required",
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

export default AddPort;
