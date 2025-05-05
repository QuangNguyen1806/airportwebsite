import { useState } from "react";
import Button from "./Button";
import styles from "./Form.module.scss";

const renderInput = ({
    key,
    type,
    label,
    value,
    options,
    props,
    onChange,
    placeholder,
    error,
}) => {
    if (type === "empty") {
        return <div key={key}></div>;
    }

    if (type === "select") {
        return (
            <div key={key} className={styles.input}>
                <span>{label}</span>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((option) => {
                        return (
                            <option value={option} key={option}>
                                {option}
                            </option>
                        );
                    })}
                </select>
                <span className={styles.inputError}>{error}</span>
            </div>
        );
    }

    return (
        <div key={key} className={styles.input}>
            <span>{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                {...props}
            />
            <span className={styles.inputError}>{error}</span>
        </div>
    );
};

const checkInput = (inputs) => {
    for (const [index, input] of inputs.entries()) {
        if (input.required && !input.value.trim())
            return {
                index: index,
                error: input.required,
            };
    }
};

const Form = (props) => {
    const [error, setError] = useState();

    const onSubmitHandler = () => {
        const msg = checkInput(props.inputs);
        if (!msg) props.submit.onClick();
        else setError(msg);
    };

    const onChangeHandler = (index, value) => {
        if (props.onChange) props.onChange();
        if (error && index === error.index) setError(null);
        props.inputs[index].onChange(value);
    };

    return (
        <div className={styles.form}>
            <div
                className={styles.inputs}
                style={{
                    gridTemplateColumns: `repeat(${
                        props.column ? props.column : 1
                    }, 1fr)`,
                }}
            >
                {props.inputs.map((input, index) => {
                    return renderInput({
                        key: index,
                        type: input.type,
                        label: input.label,
                        value: input.value,
                        options: input.options,
                        props: input.props,
                        onChange: onChangeHandler.bind(null, index),
                        placeholder: input.placeholder,
                        error: error?.index === index ? error.error : "",
                    });
                })}
            </div>
            {!!props.middle && props.middle}
            <Button {...props.submit} onClick={onSubmitHandler} />
        </div>
    );
};

export default Form;
