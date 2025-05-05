import { useRef, useState } from "react";
import Modal from "./Modal";

import classes from "./SelectBar.module.css";

import { CaretDown } from "./Icons";

const bound = (value, upper, lower) => {
    if (upper > lower) [upper, lower] = [lower, upper];
    return value < upper ? upper : value > lower ? lower : value;
};

const getPositionTop = (top, offset, containerHeight, windowHeight) => {
    const margin = 20;
    return bound(top - offset, margin, windowHeight - containerHeight - margin);
};

const getName = (options, value) => {
    for (const div of options)
        for (const option of div)
            if (option.value === value) return option.name;
    return "";
};

const getIndex = (options, value) => {
    let index = 0;
    for (const div of options) {
        for (const option of div) {
            if (option.value === value) return index;
            ++index;
        }
    }
    return index;
};

const calcHeight = (options, optionHeight, borderHeight) => {
    let height = 0;
    for (const div of options) {
        height += div.length * optionHeight;
        height += borderHeight;
    }
    return height - borderHeight; //exclude last border
};

const SelectBar = (props) => {
    const [ModalOpen, setModalOpen] = useState(false);
    const [BarMouseDown, setBarMouseDown] = useState(false);

    const ref = useRef(null);

    const onClickHandler = (e) => {
        setBarMouseDown(false);
        setModalOpen(true);
    };

    const onMouseDownHandler = (e) => {
        setBarMouseDown(true);
    };

    const OptionRender = (option) => {
        return (
            <div
                key={option.value}
                className={`${classes.optionBar} ${
                    option.value === props.value ? classes.selected : ""
                }`}
                onClick={() => {
                    props.onChange(option.value);
                    setModalOpen(false);
                }}
                style={{
                    width: ref.current.offsetWidth,
                    height: ref.current.offsetHeight,
                }}
            >
                {/* <div className={classes.icon}>{IconMap[option.value]}</div> */}
                <span className={classes.text}>
                    {getName(props.options, option.value)}
                </span>
            </div>
        );
    };

    return (
        <>
            <div
                className={`${classes.selectBar}
                        ${ModalOpen ? classes.selectBarActive : ""}
                        ${BarMouseDown ? classes.selectBarAwake : ""}`}
                onClick={onClickHandler}
                onMouseDown={onMouseDownHandler}
                onMouseLeave={() => setBarMouseDown(false)}
                ref={ref}
            >
                {/* <div className={classes.icon}>{IconMap[props.value]}</div> */}
                <span className={classes.text}>
                    {getName(props.options, props.value)}
                </span>
                <div className={classes.arrow}>
                    <CaretDown size={10} color="#ff7100" />
                </div>
            </div>
            <Modal active={ModalOpen} deactive={setModalOpen.bind(null, false)}>
                {ModalOpen && (
                    <div
                        className={classes.optionContainer}
                        style={{
                            left: ref.current.getBoundingClientRect().left,
                            top: getPositionTop(
                                ref.current.getBoundingClientRect().top,
                                getIndex(props.options, props.value) *
                                    ref.current.offsetHeight,
                                calcHeight(
                                    props.options,
                                    ref.current.offsetHeight,
                                    1
                                ),
                                window.innerHeight
                            ),
                            height: `${calcHeight(
                                props.options,
                                ref.current.offsetHeight,
                                1
                            )}px`,
                        }}
                    >
                        {props.options.map((division, index, array) => {
                            return (
                                <div key={index}>
                                    {division.map((option) => {
                                        return OptionRender(option);
                                    })}
                                    {index === array.length - 1 ? null : (
                                        <span
                                            className={classes.division}
                                        ></span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default SelectBar;
