import styles from "./TicketChart.module.scss";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const convertTickets = (tickets) => {
    const result = {};
    for (const ticket of tickets) result[ticket.year_month] = ticket.number;
    return result;
};

const TicketChart = (props) => {
    const converted = useMemo(convertTickets.bind(null, props.tickets), [
        props.tickets,
    ]);

    const total = useMemo(() => {
        return props.tickets.reduce((prev, cur) => {
            return prev + cur.number;
        }, 0);
    }, [props.tickets]);

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
            duration: 0,
            animation: {
                onComplete: function (ctx) {
                    console.log(ctx);
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Tickets Sold: ${context.raw}`;
                    },
                },
                displayColors: false,
            },
        },
        scales: {
            y: {
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        if (Math.floor(value) === value) {
                            return value;
                        }
                    },
                },
            },
        },
    };

    const data = {
        labels: Object.keys(converted),
        datasets: [
            {
                data: Object.values(converted),
                backgroundColor: "#ff7100",
            },
        ],
    };

    return (
        <div className={styles.container}>
            <div>
                <span>Total: {total} Tickets</span>
                <span>
                    From {props.range.from} To {props.range.to}
                </span>
            </div>
            <Bar options={options} data={data} />
        </div>
    );
};

export default TicketChart;
