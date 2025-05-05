import { Link, useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";

import styles from "./Header.module.scss";

const Header = (props) => {
    const { user } = useUser();
    const navigate = useNavigate();

    const bgColor =
        props.page !== "Home" &&
        (props.page === "Login" ? "#2F5566" : "#010C39");

    return (
        <header
            className={styles.header}
            style={{
                backgroundImage:
                    props.page === "Home" ? "url(/airport.png)" : "",
                backgroundColor: bgColor,
            }}
        >
            <div className={styles.name} onClick={() => navigate("/")}>
                <span>QuangAirlines</span>
            </div>
            <div className={styles.bars}>
                <Link to="/">
                    <div
                        className={props.page === "Home" ? styles.focus : null}
                    >
                        <span>Home</span>
                    </div>
                </Link>
                {!user && (
                    <>
                        <Link to="/login">
                            <div
                                className={
                                    props.page === "Login" ? styles.focus : null
                                }
                            >
                                <span>Log in</span>
                            </div>
                        </Link>
                        <Link to="/register">
                            <div
                                className={
                                    props.page === "Signup"
                                        ? styles.focus
                                        : null
                                }
                            >
                                <span>Sign up</span>
                            </div>
                        </Link>
                    </>
                )}
                {!!user && (
                    <>
                        <Link to="/account">
                            <div
                                className={
                                    props.page === "account"
                                        ? styles.focus
                                        : null
                                }
                            >
                                <span>My Account</span>
                            </div>
                        </Link>
                        <Link to="/logout">
                            <div>
                                <span>Log out</span>
                            </div>
                        </Link>
                    </>
                )}
            </div>
            {props.page === "Home" && (
                <div className={styles.intro}>
                    <span>Travel To All</span>
                    <span>Over the World</span>
                </div>
            )}
        </header>
    );
};

export default Header;
