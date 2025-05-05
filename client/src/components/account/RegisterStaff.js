import { useState } from "react";
import Form from "../UI/Form";
import axios from "axios";

import styles from "./RegisterStaff.module.scss";
import { Link, redirect, useNavigate } from "react-router-dom";

const RegisterStaff = (props) => {
    const navigate = useNavigate();

    const [info, setInfo] = useState({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone_number: "",
        email: "",
        airline: "",
    });

    const [error, setError] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const onInfoChange = (property, value) => {
        setInfo((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const registerHandler = async () => {
        let result;
        try {
            result = await axios.post(
                `http://${process.env.REACT_APP_backend_baseurl}/api/register`,
                {
                    register_type: "staff",
                    username: info.username,
                    name: {
                        first_name: info.first_name,
                        last_name: info.last_name,
                    },
                    email: info.email,
                    password: info.password,
                    phone_number: info.phone_number,
                    date_of_birth: info.date_of_birth,
                    airline: info.airline,
                }
            );

            setSuccessMsg("Register Succeed!");

            setTimeout(() => {
                navigate("/login?type=staff");
            }, 3000);
        } catch (e) {
            if (e.response?.data.msg) setError(e.response.data.msg);
            else setError("Unknown Error");
        }
    };

    return (
        <div className={styles.register}>
            <div>
                <img src="/login.png" />
            </div>
            <div className={styles.form}>
                <div>
                    <header>
                        <span>{`Welcome to RTicket`}</span>
                        <span>Create Your Airline Staff Account</span>
                    </header>
                    <Form
                        column="2"
                        inputs={[
                            {
                                type: "text",
                                label: "Username",
                                value: info.username,
                                onChange: onInfoChange.bind(null, "username"),
                                required: "Username is Required",
                            },
                            {
                                type: "password",
                                label: "Password",
                                value: info.password,
                                onChange: onInfoChange.bind(null, "password"),
                                required: "Password Field is Required",
                            },
                            {
                                type: "email",
                                label: "Email",
                                value: info.email,
                                onChange: onInfoChange.bind(null, "email"),
                                required: "Email Field is Required",
                            },
                            {
                                type: "text",
                                label: "First Name",
                                value: info.first_name,
                                onChange: onInfoChange.bind(null, "first_name"),
                                required: "First Name is Required",
                            },
                            {
                                type: "text",
                                label: "Last Name",
                                value: info.last_name,
                                onChange: onInfoChange.bind(null, "last_name"),
                                required: "Last Name is Required",
                            },
                            {
                                type: "date",
                                label: "Date of Birth",
                                value: info.date_of_birth,
                                onChange: onInfoChange.bind(
                                    null,
                                    "date_of_birth"
                                ),
                                required: "Date of Birth is Required",
                            },
                            {
                                type: "text",
                                label: "Phone Number",
                                value: info.phone_number,
                                onChange: onInfoChange.bind(
                                    null,
                                    "phone_number"
                                ),
                                required: "Phone Number is Required",
                            },
                            {
                                type: "text",
                                label: "Airline Name",
                                value: info.airline,
                                onChange: onInfoChange.bind(null, "airline"),
                                required: "Airline is Required",
                            },
                        ]}
                        submit={{
                            text: "Register",
                            onClick: registerHandler,
                        }}
                        onChange={() => setError("")}
                    />
                    <footer>
                        <div>
                            <span>RTicket Customer? </span>
                            <Link to="/register?type=customer">
                                <span>Register here</span>
                            </Link>
                        </div>
                    </footer>
                </div>
                <div className={styles.message}>
                    {successMsg ? (
                        <span style={{ color: "green" }}>{successMsg}</span>
                    ) : null}
                    {error ? (
                        <span style={{ color: "red" }}>{error}</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default RegisterStaff;
