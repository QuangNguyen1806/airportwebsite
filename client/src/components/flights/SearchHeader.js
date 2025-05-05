import { useEffect, useRef, useState } from "react";
import styles from "./SearchHeader.module.scss";

const SearchHeader = ({ types, current, onChange, size, gap }) => {
    const target = useRef();
    const target_parent = useRef();

    const [indicator, setIndicator] = useState();

    const getPosition = () => {
        if (!target.current || !target_parent.current) return;
        return {
            left:
                target.current.getBoundingClientRect().x -
                target_parent.current.getBoundingClientRect().x,
            width: target.current.getBoundingClientRect().width,
        };
    };

    useEffect(() => {
        setIndicator(getPosition());
    }, [target.current, target_parent.current, current]);

    return (
        <div className={styles.container}>
            <div
                ref={target_parent}
                style={{
                    gap: gap,
                }}
            >
                {types.map((type, index) => {
                    return (
                        <div
                            key={index}
                            style={{
                                color: type.id === current ? "#FF7100" : null,
                                fontSize: size,
                            }}
                            onClick={onChange.bind(null, type.id)}
                            ref={type.id === current ? target : null}
                        >
                            <span>{type.text}</span>
                        </div>
                    );
                })}
                {!!indicator && (
                    <span
                        className={styles.indicator}
                        style={{
                            left: indicator.left,
                            width: indicator.width,
                        }}
                    ></span>
                )}
            </div>
        </div>
    );
};

export default SearchHeader;
