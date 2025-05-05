import Login from "../components/account/Login";
import Header from "../components/Header";
import { useNavigate, useSearchParams } from "react-router-dom";
import useUser from "../hooks/useUser";
import { useEffect } from "react";

const LoginPage = (props) => {
    const { user } = useUser();
    let [searchParams, _] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    return (
        <div>
            <Header page="Login" />
            <Login
                type={
                    searchParams.get("type") === "staff" ? "staff" : "customer"
                }
            />
        </div>
    );
};

export default LoginPage;
