import { Profile } from "../UI/Icons";
import styles from "./CustomerItem.module.scss";

const convertDate = (date) => {
    return new Date(date).toDateString().split(" ").slice(1).join(" ");
};

const CustomerItem = ({ customer, ticket }) => {
    return (
        <div className={styles.container}>
            <header>
                <div>
                    <div className={styles.name}>
                        <Profile size={40} color="#ff7100" />
                        <span>
                            {customer.first_name} {customer.last_name}
                        </span>
                    </div>
                    <div className={styles.email}>
                        <span>{customer.email}</span>
                    </div>
                </div>
            </header>
            <main>
                <section>
                    <span>Address</span>
                    <div>
                        <div>
                            {!!customer.address.state && (
                                <>
                                    <span>State</span>
                                    <span>{customer.address.state}</span>
                                </>
                            )}
                        </div>
                        <div>
                            {!!customer.address.city && (
                                <>
                                    <span>City</span>
                                    <span>{customer.address.city}</span>
                                </>
                            )}
                        </div>
                        <div>
                            {!!customer.address.zip_code && (
                                <>
                                    <span>Zip Code</span>
                                    <span>{customer.address.zip_code}</span>
                                </>
                            )}
                        </div>
                    </div>
                </section>
                <section>
                    <span>Passport</span>
                    <div>
                        <div>
                            <span>Number</span>
                            <span>{customer.passport.number}</span>
                        </div>
                        <div>
                            <span>Expiration</span>
                            <span>
                                {convertDate(customer.passport.expiration)}
                            </span>
                        </div>
                        <div>
                            <span>Country</span>
                            <span>{customer.passport.country}</span>
                        </div>
                    </div>
                </section>
                {!!ticket && (
                    <section>
                        <span>Purchased At</span>
                        <div>
                            <div>
                                <span>Date</span>
                                <span>
                                    {convertDate(customer.purchased_date)}
                                </span>
                            </div>
                            <div>
                                <span>Price</span>
                                <span>{customer.price}</span>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default CustomerItem;
