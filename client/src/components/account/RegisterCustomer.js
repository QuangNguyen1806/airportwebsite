import { useState } from "react";
import Form from "../UI/Form";
import axios from "axios";

import styles from "./RegisterCustomer.module.scss";
import { Link, redirect, useNavigate } from "react-router-dom";

const RegisterCustomer = (props) => {
    const navigate = useNavigate();

    const [info, setInfo] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        building_number: "",
        street_name: "",
        apartment_number: "",
        city: "",
        state: "",
        zip_code: "",
        phone_number: "",
        passport_number: "",
        passport_expiration: "",
        passport_country: "",
        date_of_birth: "",
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
        try {
            const result = await axios.post(
                `http://${process.env.REACT_APP_backend_baseurl}/api/register`,
                {
                    register_type: "customer",
                    name: {
                        first_name: info.first_name,
                        last_name: info.last_name,
                    },
                    email: info.email,
                    password: info.password,
                    phone_number: info.phone_number,
                    address: {
                        building_number: info.building_number,
                        street_name: info.street_name,
                        apartment_number: info.apartment_number,
                        city: info.city,
                        state: info.state,
                        zip_code: info.zip_code,
                    },
                    passport: {
                        number: info.passport_number,
                        expiration: info.passport_expiration,
                        country: info.passport_country,
                    },
                    date_of_birth: info.date_of_birth,
                }
            );

            setSuccessMsg("Register Succeed!");

            setTimeout(() => {
                navigate("/login?type=customer");
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
                        <span>Create Your Account</span>
                    </header>
                    <Form
                        column="3"
                        inputs={[
                            {
                                type: "email",
                                label: "Email",
                                value: info.email,
                                onChange: onInfoChange.bind(null, "email"),
                                required: "Email Field is Required",
                            },
                            {
                                type: "password",
                                label: "Password",
                                value: info.password,
                                onChange: onInfoChange.bind(null, "password"),
                                required: "Password Field is Required",
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
                                type: "text",
                                label: "Building Number",
                                value: info.building_number,
                                onChange: onInfoChange.bind(
                                    null,
                                    "building_number"
                                ),
                                required: "Building Number is Required",
                            },
                            {
                                type: "text",
                                label: "Street Name",
                                value: info.street_name,
                                onChange: onInfoChange.bind(
                                    null,
                                    "street_name"
                                ),
                                required: "Street Name is Required",
                            },
                            {
                                type: "text",
                                label: "Apartment Number",
                                value: info.apartment_number,
                                onChange: onInfoChange.bind(
                                    null,
                                    "apartment_number"
                                ),
                                required: "Apartment Number is Required",
                            },
                            {
                                type: "text",
                                label: "State",
                                value: info.state,
                                onChange: onInfoChange.bind(null, "state"),
                                required: "State is Required",
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
                                label: "Zip Code",
                                value: info.zip_code,
                                onChange: onInfoChange.bind(null, "zip_code"),
                                required: "Zip Code is Required",
                            },
                            {
                                type: "text",
                                label: "Passport Number",
                                value: info.passport_number,
                                onChange: onInfoChange.bind(
                                    null,
                                    "passport_number"
                                ),
                                required: "Passport Number is Required",
                            },
                            {
                                type: "date",
                                label: "Passport Expiration",
                                value: info.passport_expiration,
                                onChange: onInfoChange.bind(
                                    null,
                                    "passport_expiration"
                                ),
                                required: "Passport Expiration is Required",
                            },
                            {
                                type: "text",
                                label: "Passport Country",
                                value: info.passport_country,
                                onChange: onInfoChange.bind(
                                    null,
                                    "passport_country"
                                ),
                                required: "Passport Date is Required",
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
                        ]}
                        submit={{
                            text: "Register",
                            onClick: registerHandler,
                        }}
                        onChange={() => setError("")}
                    />
                    <footer>
                        <div>
                            <span>RTicket Staff? </span>
                            <Link to="/register?type=staff">
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

export default RegisterCustomer;
