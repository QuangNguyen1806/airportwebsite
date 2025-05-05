import FlightItem from "./FlightItem";
import styles from "./StatusSubpage.module.scss";

const StatusSubpage = (props) => {
    return (
        <div className={styles.container}>
            <FlightItem
                flight={props.flight}
                selectable={false}
                showStatus={true}
            />
        </div>
    );
};

export default StatusSubpage;
