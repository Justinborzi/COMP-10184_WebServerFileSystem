// Define line basic config
let width, height, gradient;

// set up tempature query type
let tempType = "C";
let curTemp = 0.00;

// Intialize time variables
let hours = 0;
let minutes = 0;
let seconds = 0;

// Set up chart sata config
const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
let labels = [];
let data = [];

/**
 * 
 * @param {*} ctx 
 * @param {*} chartArea 
 * @returns 
 */
function getGradient(ctx, chartArea) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
        );
        gradient.addColorStop(0, Samples.utils.CHART_COLORS.blue);
        gradient.addColorStop(0.5, Samples.utils.CHART_COLORS.yellow);
        gradient.addColorStop(1, Samples.utils.CHART_COLORS.red);
    }

    return gradient;
}

const myChart = new Chart("myChart", {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "Temperature",
                data: data,
                borderColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;

                    if (!chartArea) {
                        // This case happens on initial chart load
                        return;
                    }
                    return getGradient(ctx, chartArea);
                },
            },
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
        },
    },
});

function updateTempType() {
    if (tempType == "C") {
        tempType = "F";
    } else {
        tempType = "C";
    }
    setTempText(curTemp, tempType);
}

const convert = (temp) => {
    newTemp = 0.00;
    if (tempType == "C") {
        // (temp°C × 9/5) + 32 = temp°F
        newTemp = (temp * 9 / 5) + 32;
    } else {
        // (temp°F − 32) × 5/9 = temp°C
        newTemp = (temp - 32) * 5 / 9 + 32;
    }
    console.log(newTemp, temp, tempType);

    return newTemp.toFixed(2);
}

function addData(data) {
    const chartData = myChart.data;
    labels.push(minutes);
    if (chartData.datasets.length > 0) {
        chartData.labels = labels;

        for (let index = 0; index < chartData.datasets.length; ++index) {
            chartData.datasets[index].data.push(data);
        }

        myChart.update();
    }
}


function setTempText(temp, type = tempType) {
    $("#curTemp").removeClass();

    if (tempType == "C") {
        if (temp <= 10) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").classList.add("text-blue-500");
        }
        else if (temp < 15) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").classList.add("text-blue-500");
        }
        else if (temp < 25) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-yellow-500");
        }
        else if (temp < 30) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-yellow-500");
        }
        else if (temp < 35) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-orange-500");
        }
        else if (temp >= 35) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-red-500");
        }
    } else {
        if (temp <= 50) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-blue-500");
        }
        else if (temp < 59) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-blue-500");
        }
        else if (temp < 77) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-yellow-500");
        }
        else if (temp < 86) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-yellow-500");
        }
        else if (temp < 95) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-orange-500");
        }
        else if (temp >= 95) {
            $("#curTemp").text(`${temp}°${type}`);
            $("#curTemp").addClass("text-red-500");
        }
    }
}

$("#tempFormat").click(() => {
    curTemp = convert(curTemp);
    setTempText(convert(curTemp));
    const chartData = myChart.data;
    if (chartData.datasets.length > 0) {
        for (let index = 0; index < chartData.datasets.length; ++index) {
            for (let lower = 0; lower < chartData.datasets[index].data.length; lower++) {
                console.log(chartData.datasets[index].data[lower], convert(chartData.datasets[index].data[lower]));
                chartData.datasets[index].data[lower] = convert(chartData.datasets[index].data[lower]);
            }
        }

        myChart.update();
    }
    updateTempType();
});

setInterval(() => {
    seconds++;
    var hDisplay = (hours < 0 ? "00" : ("0" + hours).slice(-2)) + ":";
    var mDisplay = (minutes < 0 ? "00" : ("0" + minutes).slice(-2)) + ":";
    var sDisplay = seconds < 0 ? "00" : ("0" + seconds).slice(-2);

    if (seconds % 5 == 0) {
        $.get(`/temperature?type=${tempType}`, (data) => {
            console.log(`Second: ${seconds}`, data);
            setTempText(data.temperature);
            curTemp = data.temperature;
            $("#sensorId").text("Sensor ID: " + data.address);
        });
    } else if (minutes >= 59) {
        if (isNaN(minutes)) {
            minutes = 0;
        }
        seconds = 0;
        minutes = 0;
        if (isNaN(hours)) {
            minutes = 0;
        }
        hours++;
        $.get(`/temperature?type=${tempType}`, (data) => {
            console.log(`Hour: ${hours}`, data);
            addData(data.temperature);
            setTempText(data.temperature);
            curTemp = data.temperature;
        });
    } else if (seconds >= 59) {
        seconds = 0;
        if (isNaN(minutes)) {
            minutes = 0;
        }
        minutes++;
        $.get(`/temperature?type=${tempType}`, (data) => {
            console.log(`Minute: ${minutes}`, data);
            addData(data.temperature);
            setTempText(data.temperature);
            curTemp = data.temperature;
        });
    }

    $("#timeElapsed").text(hDisplay + mDisplay + sDisplay);
}, 1000);