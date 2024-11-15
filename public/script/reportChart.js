function clearCharts() {
  $("#pieChar1").empty(); // Clear pie chart 1
  $("#pieChar2").empty(); // Clear pie chart 2
  $("#barChart1").empty(); // Clear bar chart (line chart)
}

//Function for updating charts
function renderCharts(data) {
  if (chart1) chart1.destroy();
  if (chart2) chart2.destroy();
  if (chart3) chart3.destroy();

  const conformCount = data.pieChar1.ConformCount;
  const waitingCount = data.pieChar1.WaitingCount;
  const cancelCount = data.pieChar1.CancelCount;

  var pieChar1 = {
    series: [conformCount, waitingCount, cancelCount],
    chart: {
      width: 380,
      type: "pie",
    },
    labels: ["Conform", "Waiting", "Cancel"],
    colors: ["#1cfc03", "#ecfc03", "#fc0703"],
    title: {
      text: "Tickets By Status",
      align: "left",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  var chart1 = new ApexCharts(document.getElementById("pieChar1"), pieChar1);
  chart1.render();

  // Render PieChart2
  const youngCount = data.pieChar2.youngCount;
  const adultCount = data.pieChar2.adultCount;
  const childCount = data.pieChar2.childCount;
  const handicapCount = data.pieChar2.handicapCount;

  var pieChar2 = {
    series: [youngCount, adultCount, childCount, handicapCount],
    chart: {
      width: 380,
      type: "pie",
    },
    labels: ["Young", "Adult", "Child", "Handicap"],
    title: {
      text: "Tickets By Category",
      align: "left",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  var chart2 = new ApexCharts(document.getElementById("pieChar2"), pieChar2);
  chart2.render();

  // Render Line Chart for the last 7 days
  const days = data.lineChart.day;
  const totalTicket = data.lineChart.totalCount;
  var lineChart1 = {
    series: [
      {
        name: "Total Tickets",
        data: totalTicket,
      },
    ],
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      text: "Last 7 Days Trends",
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: days,
    },
  };

  var chart3 = new ApexCharts(document.querySelector("#barChart1"), lineChart1);
  chart3.render();
}
