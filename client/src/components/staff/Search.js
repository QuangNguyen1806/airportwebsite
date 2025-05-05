import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useUser from "../../hooks/useUser";
import FlightSearch from "./FlightSearch";
import styles from "./Search.module.scss";
import SearchHeader from "../flights/SearchHeader";
import FlightCustomerSearch from "./FlightCustomerSearch";
import Add from "./Add";
import CustomerFlightSearch from "./CustomerFlightSearch";

const Search = (props) => {
    const [type, setType] = useState("flight");

    let [searchParams, _] = useSearchParams();

    useEffect(() => {
        props.onChange(type);
    }, [type]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "flight") setType("flight");
        else if (tab === "customer") setType("customer");
        else if (tab === "addflight") setType("addflight");
        else if (tab === "addport") setType("addport");
        else if (tab === "addplane") setType("addplane");
    }, [searchParams]);

    const types = [
        {
            id: "flight",
            text: "Search Flights",
        },
        {
            id: "customer",
            text: "Show Flight Customer",
        },
        {
            id: "cust_flight",
            text: "Search Customer's Flight",
        },
        {
            id: "add",
            text: "Add Item",
        },
    ];

    const onSearchHandler = (search_body) => {
        props.onSearch(search_body);
    };

    const renderMainFilter = (type) => {
        if (type === "flight") {
            return <FlightSearch onSearch={onSearchHandler} />;
        } else if (type === "customer") {
            return <FlightCustomerSearch onSearch={onSearchHandler} />;
        } else if (type === "add") {
            return <Add />;
        } else if (type === "cust_flight") {
            return <CustomerFlightSearch onSearch={onSearchHandler} />;
        }
    };

    return (
        <div className={styles.container}>
            <SearchHeader
                types={types}
                current={type}
                onChange={setType}
                size="14pt"
                gap="70px"
            />
            {renderMainFilter(type)}
        </div>
    );
};

export default Search;
