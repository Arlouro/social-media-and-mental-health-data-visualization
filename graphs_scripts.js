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
  },
  mentalHealthMetrics: [
    { key: 'feelDepressed', label: 'Depression Scale' },
    { key: 'compareScale', label: 'Social Comparison Scale' },
    { key: 'botherScale', label: 'Worry Scale' },
    { key: 'feelAnxious', label: 'Anxiety Scale' },
    { key: 'sleep', label: 'Sleep Issues Scale' },
    { key: 'concentrationScale', label: 'Concentration Scale' },
    { key: 'socialValidation', label: 'Social Validation Scale' },
    { key: 'restlessness', label: 'Restlessness Scale' },
    { key: 'distractionScale', label: 'Distraction Scale' },
    { key: 'distractionWhileBusy', label: 'Distraction While Busy Scale' },
    { key: 'useWithoutPurpose', label: 'Use Without Purpose Scale' }
  ]
};

// >-----------------< Data Initialization >-------------------<
function initializeGraphs() {
  d3.csv("dataset.csv").then(data => {
    const cleanedData = data.map(d => ({
      age: parseAge(d["1. What is your age?"]),
      gender: genderGroup(d["2. Gender"]),
      relationshipStatus: d["3. Relationship Status"],
      occupation: d["4. Occupation Status"],
      organization: d["5. What type of organization are you affiliated with?"],
      socialMediaUsed: socialMediaUsedStringParse(d["7. What social media platforms do you commonly use?"]),
      socialMediaTime: parseSocialMediaTime(d["8. What is the average time you spend on social media every day?"]),
      useWithoutPurpose: parseScale(d["9. How often do you find yourself using Social media without a specific purpose?"]),
      distractionWhileBusy: parseScale(d["10. How often do you get distracted by Social media when you are busy doing something?"]),
      restlessness: parseScale(d["11. Do you feel restless if you haven't used Social media in a while?"]),
      distractionScale: parseScale(d["12. On a scale of 1 to 5, how easily distracted are you?"]),
      botherScale: parseScale(d["13. On a scale of 1 to 5, how much are you bothered by worries?"]),
      concentrationScale: parseScale(d["14. Do you find it difficult to concentrate on things?"]),
      compareScale: parseScale(d["15. On a scale of 1-5, how often do you compare yourself to other successful people through the use of social media?"]),
      socialValidation: parseScale(d["17. How often do you look to seek validation from features of social media?"]),
      feelDepressed: parseScale(d["18. How often do you feel depressed or down?"]),
      feelAnxious: parseScale(d["19. How often do you feel anxious or nervous?"]),
      sleep: parseScale(d["20. On a scale of 1 to 5, how often do you face issues regarding sleep?"]),
    }));

    const platformUsageByGender = countPlatformsByGender(cleanedData);

    const state = {
      selectedMentalHealthMetric: 'feelDepressed',
      selectedPlatform: null,
      selectedGender: null
    };

    createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight, cleanedData, state);
    createLegendForMainGraph("#main-graph", state);
    createBarGraph("#side-graph-1", graphConfig.sideWidth, graphConfig.sideHeight, cleanedData, state);
    createDonutChart("#side-graph-2", graphConfig.sideWidth, graphConfig.sideHeight, platformUsageByGender, state);
    
    setupGraphInteractions(cleanedData, state);
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

  const sortedPlatforms = Object.keys(platformCounts).sort((a, b) => {
      const aTotal = Object.values(platformCounts[a]).reduce((acc, count) => acc + count, 0);
      const bTotal = Object.values(platformCounts[b]).reduce((acc, count) => acc + count, 0);
      return aTotal - bTotal;
  }
  );

  const sortedPlatformCounts = {};
  sortedPlatforms.forEach(platform => {
      sortedPlatformCounts[platform] = platformCounts[platform];
  });

  return sortedPlatformCounts;
}

// >-----------------< Scatter Plot >-------------------<
function setupGraphInteractions(data, state) {
  const metricSelector = d3.select("#main-graph")
    .append("select")
    .attr("class", "metric-selector")
    .style("position", "absolute")
    .style("top", "10px")
    .style("right", "10px");

  metricSelector.selectAll("option")
    .data(graphConfig.mentalHealthMetrics)
    .enter()
    .append("option")
    .attr("value", d => d.key)
    .text(d => d.label);

  metricSelector.on("change", function() {
    state.selectedMentalHealthMetric = this.value;
    d3.select("#main-graph").selectAll("svg").remove();
    createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight, data, state);
    createLegendForMainGraph("#main-graph", state);
  });
}

function createLegendForMainGraph(containerId, state) {
  const svg = d3.select(containerId).select("svg");
  const width = parseInt(svg.attr("width"));
  const height = parseInt(svg.attr("height"));

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 100}, 20)`);

  const legendData = [
    { color: graphConfig.colors.Male, label: 'Male' },
    { color: graphConfig.colors.Female, label: 'Female' },
    { color: graphConfig.colors.Other, label: 'Other' }
  ];

  const legendItems = legend.selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => d.color);

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text(d => d.label)
    .attr("font-size", "12px")
    .attr("fill", "#333");

  const currentMetric = graphConfig.mentalHealthMetrics.find(m => m.key === state.selectedMentalHealthMetric);
  svg.append("text")
    .attr("x", width - 100)
    .attr("y", height - 20)
    .text(`Metric: ${currentMetric.label}`)
    .attr("font-size", "12px")
    .attr("fill", "#666");
}

function createScatterPlot(containerId, width, height, data, state) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = {top: 50, right: 120, bottom: 50, left: 40};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const metricKey = state.selectedMentalHealthMetric;
  const ages = [...new Set(data.map(d => d.age))].sort((a, b) => a - b);

  const x = d3.scaleBand()
    .domain(ages)
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[metricKey])])
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

  // X-axis label
  svg.append("text")
    .attr("transform", `translate(${width/2}, ${height - 10})`)
    .style("text-anchor", "middle")
    .text("Age");

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", -height/2)
    .style("text-anchor", "middle")
    .text(graphConfig.mentalHealthMetrics.find(m => m.key === metricKey).label);

  // Scatter
  g.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.age) + x.bandwidth() / 2)
    .attr("cy", d => y(d[metricKey]))
    .attr("r", 5)
    .attr("fill", d => graphConfig.colors[d.gender])
    .attr("opacity", 0.7);

  svg.selectAll(".dot")
    .on("mouseenter", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 8)
        .attr("fill", "#333");
      
      // Show tooltip
      svg.append("text")
        .attr("class", "tooltip")
        .attr("x", x(d.age) + x.bandwidth() / 2 + margin.left)
        .attr("y", y(d[metricKey]) + margin.top - 10)
        .attr("text-anchor", "middle")
        .text(`Age: ${d.age}, ${graphConfig.mentalHealthMetrics.find(m => m.key === metricKey).label}: ${d[metricKey]}`)
        .attr("font-size", "12px")
        .attr("fill", "#666");
    })
    .on("mouseleave", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 5)
        .attr("fill", d => graphConfig.colors[d.gender]);
      
      svg.select(".tooltip").remove();
    });
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

document.addEventListener('DOMContentLoaded', initializeGraphs);