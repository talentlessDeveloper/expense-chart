const dataset = [
  {
    day: "mon",
    amount: 17.45,
  },
  {
    day: "tue",
    amount: 34.91,
  },
  {
    day: "wed",
    amount: 52.36,
  },
  {
    day: "thu",
    amount: 31.07,
  },
  {
    day: "fri",
    amount: 23.39,
  },
  {
    day: "sat",
    amount: 43.28,
  },
  {
    day: "sun",
    amount: 25.48,
  },
];

// debounce resize function
function throttle(cb, delay = 300) {
  let lastTime = 0;

  return (...args) => {
    const now = new Date().getTime();
    if (now - lastTime < delay) return;
    cb(...args);
    lastTime = now;
  };
}

let tooltip = d3
  .select(".svg-chart")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("opacity", 0);

let margin = {
  top: 30,
  bottom: 40,
};

let height = 200 - margin.bottom;
// Initialize svg
let svg = d3.select(".svg-chart").append("svg").attr("height", height);

let xScale = d3.scaleLinear().domain([0, dataset.length]);

const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(dataset, (d) => d.amount)])
  .range([height, 0]);

let rect = svg
  .selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("rx", 5)
  .attr("y", (d) => yScale(d.amount))
  .attr("height", (d) => height - yScale(d.amount))
  .attr("class", "bar")
  .attr("fill", (d, i) => {
    let max = d3.max(dataset, (data) => {
      return data.amount;
    });
    return d.amount < max ? "hsl(10, 79%, 65%)" : "hsl(186, 34%, 60%)";
  });

let labels = d3.select(".svg-chart").append("div").attr("class", "labels");

const containerHeight = document.querySelector(".svg-chart").clientHeight;
const containerWidth = document.querySelector(".svg-chart").clientWidth;

function drawChart() {
  let width = parseInt(d3.select(".svg-chart").style("width"));
  let barWidth = width / (dataset.length + 2);
  svg.attr("width", width);
  xScale.range([0, width]);
  rect
    .attr("x", (d, i) => xScale(i))
    .attr("width", () => (width > 400 ? barWidth : 33))
    .on("mouseover", (e, d) => {
      if (window.innerWidth < 420) return;
      return tooltip.style("opacity", 1).html(`<p>$${d.amount}</p>`);
    })
    .on("mousemove", (e) => {
      let mouseMove = throttle(() => {
        let y = width > 400 ? `${e.pageY - 300}px` : `${e.pageY - 300}px`;

        if (window.innerWidth < 420) return;
        if (window.innerWidth > 420 && window.innerWidth < 500) {
          return tooltip.style("top", y).style("left", `${e.pageX}px`);
        }
        if (window.innerWidth > 500 && window.innerWidth < 610) {
          return tooltip.style("top", y).style("left", `${e.pageX - 50}px`);
        }
        if (window.innerWidth > 610 && window.innerWidth < 750) {
          return tooltip.style("top", y).style("left", `${e.pageX - 100}px`);
        }

        return tooltip.style("top", y).style("left", `${e.pageX - 420}px`);
      }, 1000);
      mouseMove();
    })
    .on("mouseleave", () => {
      if (window.innerWidth < 420) return;
      return tooltip.style("opacity", 0);
    })
    .on("click", (e, d) => {
      if (window.innerWidth > 420) return;

      let y = `${e.target.height + 40}px`;
      let x = `${e.pageX - 30}px`;
      e.target.style.opacity = 0.8;
      tooltip
        .style("opacity", 1)
        .html(`<p>$${d.amount}</p>`)
        .style("top", y)
        .style("left", x);

      setTimeout(() => {
        e.target.style.opacity = 1;
        tooltip.style("opacity", 0);
      }, 2000);
    });

  labels.style("width", `${width - 10}px`);
  labels
    .selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text((d) => d.day)
    .style("width", `${barWidth + 10}px`);
}

drawChart();

let updateChart = throttle(drawChart, 500);

window.addEventListener("resize", updateChart);
