import { useState } from "react";
import Form from "../UI/Form";
import axios from "axios";
import useUser from "../../hooks/useUser";

import styles from "./Login.module.scss";
import { Link, redirect, useNavigate } from "react-router-dom";
import { getCookie } from "../../utility";

const Login = (props) => {
    const navigate = useNavigate();

    const { saveUser } = useUser();

    const [credential, setCredential] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");

    const onCredentialChange = (property, value) => {
        setCredential((prev) => {
            const newState = { ...prev };
            newState[property] = value;
            return newState;
        });
    };

    const loginHandler = async () => {
        let result;
        try {
            result = await axios.post(
                `http://${process.env.REACT_APP_backend_baseurl}/api/login`,
                {
                    user_type: props.type,
                    username: credential.username,
                    password: credential.password,
                },
                {
                    withCredentials: true,
                }
            );

            saveUser({
                type: result.data.type,
                username: credential.username,
                first_name: result.data.first_name,
                last_name: result.data.last_name,
                airline: result.data.airline,
                expiration_date: result.data.expiration_date,
            });

            navigate("/");
        } catch (e) {
            if (e.response?.data.msg) setError(e.response.data.msg);
            else setError("Unknown Error");
        }
    };

    return (
        <div className={styles.login}>
            <div>
                <img src="/login.png" />
            </div>
            <div className={styles.form}>
                <div>
                    <header>
                        <span>{`Welcome back, ${props.type}`}</span>
                        <span>Login to your account</span>
                    </header>
                    <main>
                        <Form
                            inputs={[
                                {
                                    type: "text",
                                    label:
                                        props.type === "customer"
                                            ? "Email"
                                            : "Username",
                                    value: credential.username,
                                    placeholder:
                                        props.type === "customer"
                                            ? "example@email.com"
                                            : "Username",
                                    onChange: onCredentialChange.bind(
                                        null,
                                        "username"
                                    ),
                                    required:
                                        props.type === "customer"
                                            ? "Email Field is Required"
                                            : "Username is Required",
                                },
                                {
                                    type: "password",
                                    label: "Password",
                                    value: credential.password,
                                    placeholder: "••••••••",
                                    onChange: onCredentialChange.bind(
                                        null,
                                        "password"
                                    ),
                                    required: "Password Field is Required",
                                },
                            ]}
                            submit={{
                                text: "Log in",
                                onClick: loginHandler,
                            }}
                            onChange={() => {
                                setError("");
                            }}
                        />
                        {!!error && (
                            <span
                                className="error"
                                style={{
                                    fontSize: "12pt",
                                }}
                            >
                                {error}
                            </span>
                        )}
                    </main>
                    <footer>
                        <section>
                            <span>Don't Have an Account? </span>
                            <Link to={`/register?type=${props.type}`}>
                                Sign Up
                            </Link>
                        </section>
                        <section>
                            <span>
                                {props.type === "customer"
                                    ? "Airline Staff? "
                                    : "RTicket Customer? "}
                            </span>
                            <Link
                                to={`/login?type=${
                                    props.type === "customer"
                                        ? "staff"
                                        : "customer"
                                }`}
                            >
                                Log In Here
                            </Link>
                        </section>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;
