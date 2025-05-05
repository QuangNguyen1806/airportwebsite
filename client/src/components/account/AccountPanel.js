import axios from "axios";
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";

import styles from "./AccountPanel.module.scss";
import DateSearch from "./DateSearch";
import InfoBox from "./InfoBox";
import SpendingChart from "./SpendingChart";
import { getCookie } from "../../utility";

const convertSpending = (spending) => {
    const result = {};
    for (const item of spending) {
        const month =
            item.month.substring(0, 4) + "-" + item.month.substring(4);
        result[month] = item.cost;
    }
    return result;
};

const convertMonth = (number) => {
    ++number;
    if (number <= 9) return "0" + number.toString();
    return number.toString();
};

const getYearMonth = (date) => {
    return date.getFullYear().toString() + "-" + convertMonth(date.getMonth());
};

const AccountPanel = (props) => {
    const { user } = useUser();

    const [data, setData] = useState();

    const halfYearAgo = new Date().setDate(new Date().getDate() - 183);

    const [spendingRange, setSpendingRange] = useState({
        from: getYearMonth(new Date(halfYearAgo)),
        to: getYearMonth(new Date()),
    });

    const [chartRange, setChartRange] = useState({
        from: getYearMonth(new Date(halfYearAgo)),
        to: getYearMonth(new Date()),
    });

    const [spending, setSpending] = useState();

    const fetchUserData = async () => {
        try {
            const result = await axios.get(
                `http://${process.env.REACT_APP_backend_baseurl}/api/customer`,
                {
                    params: {
                        type: "customer",
                        username: user.username,
                    },
                    withCredentials: true,
                }
            );

            setData(result.data);
        } catch (e) {
            console.error(e.response?.data.msg);
        }
    };

    const onAddPhoneNumber = async (phone_number) => {
        try {
            const result = await axios.post(
                `http://${process.env.REACT_APP_backend_baseurl}/api/user/phone_number`,
                {
                    type: "customer",
                    username: user.username,
                    phone_numbers: [phone_number],
                },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                }
            );

            fetchUserData();
        } catch (e) {
            console.error(e.response?.data.msg);
        }
    };

    const fetchSpendingData = async (range) => {
        try {
            const result = await axios.get(
                `http://${process.env.REACT_APP_backend_baseurl}/api/spending/`,
                {
                    params: {
                        email: user.username,
                        from: range.from,
                        to: range.to,
                    },
                    withCredentials: true,
                }
            );

            setSpending(result.data.costs);
        } catch (e) {
            console.error(e.response?.data.msg);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        fetchSpendingData(spendingRange);
    }, [spendingRange]);

    const onSpendingDateChangeHandler = ({ from, to }) => {
        setSpendingRange({
            from: from,
            to: to,
        });

        setChartRange({
            from: from,
            to: to,
        });
    };

    if (!data) return;

    return (
        <div className={styles.container}>
            <InfoBox
                title="Personal Details"
                info={[
                    {
                        name: "Email",
                        value: data.email,
                    },
                    {
                        name: "Name",
                        value: data.first_name + " " + data.last_name,
                    },
                    {
                        name: "Date of Birth",
                        value: new Date(data.date_of_birth)
                            .toDateString()
                            .split(" ")
                            .slice(1)
                            .join(" "),
                    },
                    {
                        name: "Phone Numbers",
                        value: data.phone_numbers,
                        add: true,
                        onAdd: onAddPhoneNumber,
                    },
                ]}
            />
            <InfoBox
                title="Address Details"
                info={[
                    {
                        name: "State",
                        value: data.address.state,
                    },
                    {
                        name: "City",
                        value: data.address.city,
                    },
                    {
                        name: "Street Name",
                        value: data.address.street_name,
                    },
                    {
                        name: "Building Numver",
                        value: data.address.building_number,
                    },
                    {
                        name: "Apartment Number",
                        value: data.address.apartment_number,
                    },
                    {
                        name: "Zip Code",
                        value: data.address.zip_code,
                    },
                ]}
            />
            <InfoBox
                title="Passport Details"
                info={[
                    {
                        name: "Passport Country",
                        value: data.passport.country,
                    },
                    {
                        name: "Passport Number",
                        value: data.passport.number,
                    },
                    {
                        name: "Passport Expiration",
                        value: new Date(data.passport.expiration)
                            .toDateString()
                            .split(" ")
                            .slice(1)
                            .join(" "),
                    },
                ]}
            />
            <DateSearch
                from={spendingRange.from}
                to={spendingRange.to}
                onChange={onSpendingDateChangeHandler}
                text="Track Your Spending"
            />
            {!!spending && (
                <SpendingChart
                    spending={convertSpending(spending)}
                    range={chartRange}
                    spendingRange={spendingRange}
                />
            )}
        </div>
    );
};

export default AccountPanel;
