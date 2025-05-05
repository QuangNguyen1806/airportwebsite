import SearchHeader from "../../flights/SearchHeader";
import FlightCustomerSearch from "../FlightCustomerSearch";
import styles from "./CommentSearch.module.scss";

const CommentSearch = (props) => {
    return (
        <div className={styles.container}>
            <SearchHeader
                types={[
                    {
                        id: "comment",
                        text: "Search Flight",
                    },
                ]}
                current="comment"
                onChange={() => {}}
            />
            <FlightCustomerSearch
                onSearch={props.onSearch}
                default={props.value}
            />
        </div>
    );
};

export default CommentSearch;
