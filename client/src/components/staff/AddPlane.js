import axios from "axios";
import { useState } from "react";
import Form from "../UI/Form";
import useUser from "../../hooks/useUser";
import { getCookie } from "../../utility";

const AddPlane = () => {
    const { user } = useUser();
    const [info, setInfo] = useState({
        seat_number: "",
        manufacturing_company: "",
        manufacturing_date: "",
        age: "",
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
                `http://${process.env.REACT_APP_backend_baseurl}/api/airplane/`,
                {
                    airline_name: user.airline,
                    seat_number: info.seat_number,
                    manufacturing_company: info.manufacturing_company,
                    manufacturing_date: info.manufacturing_date,
                    age: info.age,
                },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );

            setInfo({
                airline_name: "",
                id: "",
                seat_number: "",
                manufacturing_company: "",
                manufacturing_date: "",
                age: "",
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
                        label: "Seat Number",
                        value: info.seat_number,
                        onChange: onInfoChange.bind(null, "seat_number"),
                        required: "Seat Number is Required",
                    },
                    {
                        type: "text",
                        label: "Manufacturing Company",
                        value: info.manufacturing_company,
                        onChange: onInfoChange.bind(
                            null,
                            "manufacturing_company"
                        ),
                        required: "Manufacturing Company is Required",
                    },
                    {
                        type: "date",
                        label: "Manufacturing Date",
                        value: info.manufacturing_date,
                        onChange: onInfoChange.bind(null, "manufacturing_date"),
                        required: "Manufacturing Date is Required",
                    },
                    {
                        type: "number",
                        label: "Age",
                        value: info.age,
                        onChange: onInfoChange.bind(null, "age"),
                        required: "Age is Required",
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

export default AddPlane;
