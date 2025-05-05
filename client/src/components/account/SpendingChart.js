import styles from "./SpendingChart.module.scss";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const filterSpending = (spending, range) => {
    const result = {};
    for (const date of Object.keys(spending)) {
        if (
            new Date(date) >= new Date(range.from) &&
            new Date(date) <= new Date(range.to)
        )
            result[date] = spending[date];
    }

    return result;
};

const SpendingChart = (props) => {
    const filtered = filterSpending(props.spending, props.range);
    const total = Object.values(props.spending)
        .reduce((prev, spending) => {
            return prev + +spending;
        }, 0)
        .toFixed(2);

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
                        return `Spending: ${context.raw}`;
                    },
                },
                displayColors: false,
            },
        },
        scales: {
            y: {
                ticks: {
                    beginAtZero: true,
                    stepSize: 100,
                },
            },
        },
    };

    const data = {
        labels: Object.keys(filtered),
        datasets: [
            {
                data: Object.values(filtered),
                backgroundColor: "#ff7100",
            },
        ],
    };

    return (
        <div className={styles.container}>
            <div>
                <span>Total Spending: {total}$</span>
                <span>
                    From {props.spendingRange.from} To {props.spendingRange.to}
                </span>
            </div>
            {!!total && <Bar options={options} data={data} />}
        </div>
    );
};

export default SpendingChart;
