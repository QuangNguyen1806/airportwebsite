import styles from "./Cart.module.scss";

const Cart = ({ title, children }) => {
    return (
        <div className={styles.container}>
            <header>
                <span>{title}</span>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default Cart;
