import "./App.css";

import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Context } from "./context/context";

import Main from "./pages/Main";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Logout from "./pages/Logout";
import Account from "./pages/Account";
import Comment from "./pages/Comment";
import axios from "axios";
import { getCookie } from "./utility";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Main />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/logout",
        element: <Logout />,
    },
    {
        path: "/account",
        element: <Account />,
    },
    {
        path: "/comment",
        element: <Comment />,
    },
]);

const getUser = () => {
    const user = {
        type: localStorage.getItem("type"),
        username: localStorage.getItem("username"),
        first_name: localStorage.getItem("first_name"),
        last_name: localStorage.getItem("last_name"),
        airline: localStorage.getItem("airline"),
        expiration_date: localStorage.getItem("expiration_date"),
    };
    if (!user.username) return null;
    if (user.expiration_date && new Date(user.expiration_date) < new Date()) {
        axios.post(
            `http://${process.env.REACT_APP_backend_baseurl}/api/logout`,
            {},
            {
                withCredentials: true,
                headers: {
                    "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                },
            }
        );
        localStorage.removeItem("type");
        localStorage.removeItem("username");
        localStorage.removeItem("first_name");
        localStorage.removeItem("last_name");
        localStorage.removeItem("airline");
        localStorage.removeItem("expiration_date");
        return null;
    }

    user.expiration_date = null;

    return user;
};

function App() {
    const [user, setUser] = useState(getUser());

    return (
        <Context.Provider value={{ user: user, setUser: setUser }}>
            <RouterProvider router={router} />
        </Context.Provider>
    );
}

export default App;
