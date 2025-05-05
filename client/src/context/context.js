import { createContext } from "react";
export const Context = createContext({
    user: {
        type: "",
        username: "",
        first_name: "",
        last_name: "",
        airline: "",
    },
    setUser: () => {},
});
