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

// >-----------------< Data Initialization >-------------------<
function initializeGraphs() {
  d3.csv("dataset.csv").then(data => {
      const cleanedData = data.map(d => ({
          age: parseAge(d["1. What is your age?"]),
          gender: genderGroup(d["2. Gender"]),
          socialMediaUsed: socialMediaUsedStringParse(d["7. What social media platforms do you commonly use?"]),
          socialMediaTime: parseSocialMediaTime(d["8. What is the average time you spend on social media every day?"]), //!Not used  yet
          distractionScale: parseScale(d["12. On a scale of 1 to 5, how easily distracted are you?"]), //!Not used yet
          botherScale: parseScale(d["13. On a scale of 1 to 5, how much are you bothered by worries?"]), //!Not used yet
          compareScale: parseScale(d["15. On a scale of 1-5, how often do you compare yourself to other successful people through the use of social media?"]),
          feelDepressed: parseScale(d["18. How often do you feel depressed or down?"]),
          feelAnxious: parseScale(d["19. How often do you feel anxious or nervous?"]), //!Not used yet
        }));

      const platformUsageByGender = countPlatformsByGender(cleanedData);

      createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight, cleanedData);
      createBarGraph("#side-graph-1", graphConfig.sideWidth, graphConfig.sideHeight, cleanedData);
      createDonutChart("#side-graph-2", graphConfig.sideWidth, graphConfig.sideHeight, platformUsageByGender);
  }).catch(error => {
      console.error("Error loading or processing data:", error);
  });
}

// >-----------------< Helper Functions >-------------------<
function parseAge(ageString) {
  const age = parseInt(ageString, 10);
  return isNaN(age) ? null : age;
}

//! Currently not used REMOVE in final delivery
function ageGap(age) {
  if (age === null) return "Unknown";
  if (age < 18) return "Under 18";
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  return "55+";
}

function genderGroup(gender) {
  if (gender === "Male" || gender === "Female") return gender;
  return "Other";
}

function parseSocialMediaTime(timeString) {
  if (!timeString) return "Unknown";
  return timeString.trim();
}

function parseScale(scaleString) {
  const scale = parseFloat(scaleString);
  return isNaN(scale) ? null : scale;
}

function socialMediaUsedStringParse(socialMediaUsed) {
  return socialMediaUsed ? socialMediaUsed.split(",").map(d => d.trim()) : [];
}

function countPlatformsByGender(data) {
  const platformCounts = {};

  data.forEach(entry => {
      const { gender, socialMediaUsed } = entry;

      socialMediaUsed.forEach(platform => {
          if (!platformCounts[platform]) {
              platformCounts[platform] = { Male: 0, Female: 0, Other: 0 };
          }
          platformCounts[platform][gender] = (platformCounts[platform][gender] || 0) + 1;
      });
  });

  return platformCounts;
}

// >-----------------< Donut Chart >-------------------<
function createDonutChart(containerId, width, height, platformUsageByGender) {
  const genders = ["Male", "Female", "Other"];
  const colors = [graphConfig.colors.Male, graphConfig.colors.Female, graphConfig.colors.Other];
  
  const innerRadius = 20;
  const outerRadius = Math.min(width, height) / 2 + 10;

  const svg = d3.select(containerId)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Tooltip container
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("padding", "10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");

  const data = Object.entries(platformUsageByGender).flatMap(([platform, counts]) => 
      genders.map((gender, genderIndex) => ({
          platform,
          gender,
          value: counts[gender],
          color: colors[genderIndex],
          genderIndex
      }))
  );

  const radiusScale = d3.scaleBand()
      .domain(Object.keys(platformUsageByGender))
      .range([innerRadius, outerRadius])
      .padding(0.1);

  const anglePerSection = Math.PI / 2;
  const angleScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, anglePerSection]);

  // Draw section borders
  Object.keys(platformUsageByGender).forEach((platform, platformIndex) => {
      genders.forEach((_, genderIndex) => {
          const borderArc = d3.arc()
              .innerRadius(radiusScale(platform))
              .outerRadius(radiusScale(platform) + radiusScale.bandwidth())
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
      .innerRadius(d => radiusScale(d.platform))
      .outerRadius(d => radiusScale(d.platform) + radiusScale.bandwidth())
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
              .text(`${d.platform} - ${d.gender}: ${d.value}`);
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
  Object.keys(platformUsageByGender).forEach((platform, platformIndex) => {
      const angle = -Math.PI / 2;
      const x = Math.cos(angle) * (radiusScale(platform) + radiusScale.bandwidth() / 2) - 30;
      const y = Math.sin(angle) * (radiusScale(platform) + radiusScale.bandwidth() / 2) + 4;

      svg.append("text")
          .attr("class", "label")
          .attr("x", x)
          .attr("y", y)
          .text(platform)
          .style("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#333");
  });
}


// >-----------------< Bar Graph >-------------------<
function createBarGraph(containerId, width, height, data) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = {top: 20, right: 20, bottom: 30, left: 40};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const barData = d3.rollup(data, v => v.length, d => d.gender);

  const x = d3.scaleBand()
    .domain(Array.from(barData.keys()))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(Array.from(barData.values()))])
    .nice()
    .range([chartHeight, 0]);

  // Axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y));

  // Bars
  g.selectAll(".bar")
    .data(Array.from(barData))
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", d => chartHeight - y(d[1]))
    .attr("fill", d => graphConfig.colors[d[0]]);
}

// >-----------------< Scatter Plot >-------------------<
function createScatterPlot(containerId, width, height, data) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = {top: 20, right: 20, bottom: 30, left: 40};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const ages = [...new Set(data.map(d => d.age))].sort((a, b) => a - b);

  const x = d3.scaleBand()
    .domain(ages)
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.feelDepressed)])
    .range([chartHeight, 0]);

  // Axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickValues(ages.filter((_, i) => i % 5 === 0)).tickSizeOuter(0))
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
    .attr("cx", d => x(d.age) + x.bandwidth() / 2)
    .attr("cy", d => y(d.feelDepressed))
    .attr("r", 5)
    .attr("fill", d => graphConfig.colors[d.gender])
    .attr("opacity", 0.7);

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
        .attr("fill", d => graphConfig.colors[d.gender]);
    });
}

document.addEventListener('DOMContentLoaded', initializeGraphs);