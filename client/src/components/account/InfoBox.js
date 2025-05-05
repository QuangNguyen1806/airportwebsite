import { useState } from "react";
import Button from "../UI/Button";
import styles from "./InfoBox.module.scss";

const renderItem = ({ key, name, value, add, state, onChange, onAdd }) => {
    if (Array.isArray(value)) {
        return (
            <section key={key}>
                <div>{name}</div>
                <section className={styles.list}>
                    {value.map((item, index) => {
                        return (
                            <div
                                className={`${!value && styles.empty}`}
                                key={index}
                            >
                                <span>{item}</span>
                            </div>
                        );
                    })}
                    {!!add && (
                        <div>
                            <input
                                placeholder="Add"
                                value={state}
                                onChange={(e) => onChange(e.target.value)}
                            />
                            {!!state && (
                                <div className={styles.button}>
                                    <Button text="Add" onClick={onAdd} />
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </section>
        );
    }

    return (
        <section key={key}>
            <div>{name}</div>
            <div className={`${!value && styles.empty}`}>
                <span>{value}</span>
            </div>
        </section>
    );
};

const InfoBox = ({ title, info }) => {
    const [update, setUpdate] = useState(
        Array.from({ length: info.length }, (_) => "")
    );

    const onUpdate = (index, value) => {
        setUpdate((prev) => {
            const newState = [...prev];
            newState[index] = value;
            return newState;
        });
    };

    const onAdd = (index) => {
        onUpdate(index, "");
        info[index].onAdd(update[index]);
    };

    return (
        <div className={styles.container}>
            <header>
                <span>{title}</span>
            </header>
            <main>
                <div>
                    {info.map((item, index) => {
                        return renderItem({
                            key: index,
                            name: item.name,
                            value: item.value,
                            add: item.add,
                            state: update[index],
                            onChange: onUpdate.bind(null, index),
                            onAdd: onAdd.bind(null, index),
                        });
                    })}
                </div>
            </main>
        </div>
    );
};

export default InfoBox;
