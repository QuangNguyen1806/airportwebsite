import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import axios from "axios";
import { getCookie } from "../utility";

const Logout = () => {
    const { user, removeUser } = useUser();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const result = await axios.post(
                `http://${process.env.REACT_APP_backend_baseurl}/api/logout`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );
        } catch (e) {
            console.error(e.response?.data.msg);
        } finally {
            removeUser();
        }
    };

    useEffect(() => {
        if (!user) navigate("/");
        logout();
    }, [user]);

    return <p>Logging out...</p>;
};

export default Logout;
