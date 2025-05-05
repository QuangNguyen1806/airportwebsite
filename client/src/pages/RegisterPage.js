import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RegisterCustomer from "../components/account/RegisterCustomer";
import RegisterStaff from "../components/account/RegisterStaff";
import Header from "../components/Header";
import useUser from "../hooks/useUser";

const RegisterPage = (props) => {
    const { user } = useUser();
    let [searchParams, _] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    return (
        <div>
            <Header page="Signup" />
            {searchParams.get("type") === "staff" ? (
                <RegisterStaff />
            ) : (
                <RegisterCustomer />
            )}
        </div>
    );
};

export default RegisterPage;
