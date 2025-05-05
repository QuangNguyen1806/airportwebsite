import { useState } from "react";
import FlightItem from "../flights/FlightItem";
import CustomerItem from "./CustomerItem";
import styles from "./ShowCustomers.module.scss";
import Button from "../UI/Button";

const ShowCustomers = ({ info: { customers, flight } }) => {
    const [maxIndex, setMaxIndex] = useState(3);

    return (
        <div className={styles.container}>
            <div className={styles.division}>
                <span>Selected Flight</span>
            </div>
            <FlightItem flight={flight} selected />
            <div className={styles.division}>
                <span>Customers</span>
            </div>
            {customers.map((customer, index) => {
                if (index >= maxIndex) return;
                return (
                    <CustomerItem
                        key={customer.email + customer.purchased_date}
                        customer={customer}
                        ticket={true}
                    />
                );
            })}
            {customers.length > maxIndex && (
                <div>
                    <Button
                        text="View More"
                        onClick={() => {
                            setMaxIndex((prev) => prev + 3);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ShowCustomers;
