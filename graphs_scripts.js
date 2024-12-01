// >-----------------< Graph Config >-------------------<
const graphConfig = {
  mainWidth: 600,
  mainHeight: 600,
  sideWidth: 350,
  sideHeight: 250,
  colors: {
      Male: '#3498db',    // Vibrant blue
      Female: '#e74c3c',  // Vibrant red
      Other: '#2ecc71'    // Vibrant green
  }
};

// >-----------------< Generate Dummy Data >-------------------<
function generateData(maxValue = 60, minValue = 10) {
  const genders = ["Male", "Female", "Other"];
  const levels = ["Poor", "Fair", "Good", "Excellent"];

  return genders.flatMap((gender, genderIndex) => 
      levels.map((level, levelIndex) => ({
          gender,
          level,
          value: Math.floor(Math.random() * (maxValue - minValue) + minValue),
          color: graphConfig.colors[gender],
          genderIndex,
          levelIndex
      }))
  );
}

// >-----------------< Donut Chart >-------------------<
function createDonutChart(containerId, width, height) {
  const genders = ["Male", "Female", "Other"];
  const levels = ["Poor", "Fair", "Good", "Excellent"];
  const colors = ["#3498db", "#e74c3c", "#2ecc71"];
  const max_donut_value = 70;
  const min_donut_value = 20;

  const innerRadius = 40;
  const outerRadius = Math.min(width, height) / 2 - 30;

  const svg = d3.select(containerId)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

  svg.selectAll(".arc")
  .on("mouseenter", function() {
      d3.select(this)
          .transition()
          .duration(200)
          .attr("filter", "url(#drop-shadow)");
  })
  .on("mouseleave", function() {
      d3.select(this)
          .transition()
          .duration(200)
          .attr("filter", "none");
  });

  // Tooltip container
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("padding", "8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");

  //! Generate data
  const data = genders.flatMap((gender, genderIndex) => 
      levels.map((level, levelIndex) => ({
          gender,
          level,
          value: Math.random() * (max_donut_value - min_donut_value) + min_donut_value,
          color: colors[genderIndex],
          genderIndex,
          levelIndex
      }))
  );

  const radiusScale = d3.scaleBand()
      .domain(levels)
      .range([innerRadius, outerRadius])
      .padding(0.1);

  const anglePerSection = Math.PI / 2;
  const angleScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, anglePerSection]);

  // Draw section borders
  levels.forEach((level, levelIndex) => {
      genders.forEach((_, genderIndex) => {
          const borderArc = d3.arc()
              .innerRadius(radiusScale(level))
              .outerRadius(radiusScale(level) + radiusScale.bandwidth())
              .startAngle(genderIndex * anglePerSection)
              .endAngle((genderIndex + 1) * anglePerSection);

          svg.append("path")
              .attr("class", "section-border")
              .attr("d", borderArc)
              .attr("fill", "none")
              .attr("stroke", "#aaa")
              .attr("stroke-width", 1);
      });
  });

  // Arcs
  const arc = d3.arc()
      .innerRadius(d => radiusScale(d.level))
      .outerRadius(d => radiusScale(d.level) + radiusScale.bandwidth())
      .startAngle(d => d.genderIndex * anglePerSection)
      .endAngle(d => d.genderIndex * anglePerSection + angleScale(d.value));

  svg.selectAll("path.arc")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("d", arc)
      .attr("fill", d => d.color)
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
              .text(`${d.gender} - ${d.level}: ${Math.round(d.value)}`);
      })
      .on("mousemove", event => {
          tooltip.style("top", `${event.pageY + 5}px`)
              .style("left", `${event.pageX + 5}px`);
      })
      .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
          const interpolate = d3.interpolate(0, d.value);
          return function (t) {
              d.value = interpolate(t);
              return arc(d);
          };
      });

  // Labels
  levels.forEach((level, levelIndex) => {
      const angle = -Math.PI / 2;
      const x = Math.cos(angle) * (radiusScale(level) + radiusScale.bandwidth() / 2) - 30;
      const y = Math.sin(angle) * (radiusScale(level) + radiusScale.bandwidth() / 2) + 4;

      svg.append("text")
          .attr("class", "label")
          .attr("x", x)
          .attr("y", y)
          .text(level)
          .style("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333");
  });
}


// >-----------------< Bar Graph >-------------------<
function createBarGraph(containerId, width, height) {
    const data = generateData();
    
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    //! Prepare data for bar graph
    const barData = d3.group(data, d => d.gender);

    const x = d3.scaleBand()
        .domain(Array.from(barData.keys()))
        .range([0, chartWidth])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([chartHeight, 0]);

    svg.selectAll(".bar")
      .on("mouseenter", function() {
          d3.select(this)
              .transition()
              .duration(200)
              .attr("fill", d => d3.rgb(d.color).brighter(0.2));
      })
      .on("mouseleave", function() {
          d3.select(this)
              .transition()
              .duration(200)
              .attr("fill", d => d.color);
      });

    // Axis
    g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y));

    // Bars
    g.selectAll(".bar")
        .data(Array.from(barData))
        .enter().append("g")
        .attr("class", "bar-group")
        .selectAll("rect")
        .data(d => d[1])
        .enter().append("rect")
        .attr("x", d => x(d.gender))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => chartHeight - y(d.value))
        .attr("fill", d => d.color);
}


// >-----------------< Scatter Plot >-------------------<
function createScatterPlot(containerId, width, height) {
  const data = generateData();
  
  const svg = d3.select(containerId)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

  const margin = {top: 20, right: 20, bottom: 30, left: 40};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, chartWidth]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([chartHeight, 0]);

  // Axis
  g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("line, path")
      .style("stroke", "#bbb");

  g.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .selectAll("line, path")
      .style("stroke", "#bbb");

  // Scatter
  g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.value))
      .attr("cy", chartHeight)
      .attr("r", 5)
      .attr("fill", d => d.color)
      .attr("opacity", 0.7)
      .transition()
      .duration(1000)
      .attr("cy", d => y(d.value))
      .delay((d, i) => i * 50);

    svg.selectAll(".dot")
      .on("mouseenter", function() {
          d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 8)
              .attr("fill", "#333");
      })
      .on("mouseleave", function() {
          d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 5)
              .attr("fill", d => d.color);
      });
}

// >-----------------< Initialize Graphs >-------------------<
function initializeGraphs() {
    createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight);
    
    createBarGraph("#side-graph-1", graphConfig.sideWidth, graphConfig.sideHeight);
    createDonutChart("#side-graph-2", graphConfig.sideWidth, graphConfig.sideHeight);
}

document.addEventListener('DOMContentLoaded', initializeGraphs);