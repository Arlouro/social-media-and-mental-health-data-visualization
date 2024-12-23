// >-----------------< Graph Config >-------------------<
const graphConfig = {
  mainWidth: 750,
  mainHeight: 700,
  sideWidth: 300,
  sideHeight: 250,
  colors: {
    Male: '#285AAD',    
    Female: '#EA2F33',  
    Other: '#9DC518'
  },
  mentalHealthMetrics: [
    { key: 'feelDepressed', label: 'Depression Scale' },
    { key: 'compareScale', label: 'Social Comparison Scale' },
    { key: 'botherScale', label: 'Worry Scale' },
    { key: 'interestFluctuation', label: 'Interest Fluctuation Scale' },
    { key: 'sleep', label: 'Sleep Issues Scale' },
    { key: 'concentrationScale', label: 'Concentration Scale' },
    { key: 'socialValidation', label: 'Social Validation Scale' },
    { key: 'restlessness', label: 'Restlessness Scale' },
    { key: 'distractionScale', label: 'Distraction Scale' },
    { key: 'distractionWhileBusy', label: 'Distraction While Busy Scale' },
    { key: 'useWithoutPurpose', label: 'Use Without Purpose Scale' }
  ],
  socialMediaVisualizationOptions: [
    { key: 'platforms', label: 'Social Media Platforms' },
    { key: 'time', label: 'Time Spent on Social Media' }
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
      interestFluctuation: parseScale(d["19. On a scale of 1 to 5, how frequently does your interest in daily activities fluctuate?"]),
      sleep: parseScale(d["20. On a scale of 1 to 5, how often do you face issues regarding sleep?"]),
    }));

    const state = {
      selectedMentalHealthMetric: 'feelDepressed',
      selectedSocialMediaVisualization: 'platforms',
      selectedPlatform: null,
      selectedSocialMediaTime: null,
      selectedOccupation: null,
      selectedGender: null,
      selectedLabels: []
    };

    const platformUsageByGender = countPlatformsByGender(cleanedData);
    const timeUsageByGender = countSocialMediaTimeByGender(cleanedData);

    createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight, cleanedData, state);
    createLegendForMainGraph("#main-graph", state, cleanedData);
    createBarGraph("#side-graph-1", graphConfig.sideWidth, graphConfig.sideHeight, cleanedData);
    createDonutChart("#side-graph-2", graphConfig.sideWidth, graphConfig.sideHeight, platformUsageByGender, timeUsageByGender, state, cleanedData);
    
    setupScatterPlotInteractions(cleanedData, state);
    setupDonutChartInteractions(cleanedData, platformUsageByGender, timeUsageByGender, state);
    
  }).catch(error => {
    console.error("Error loading or processing data:", error);
  });
}


// >-----------------< Helper Functions >-------------------<
function parseAge(ageString) {
  const age = parseInt(ageString, 10);
  return isNaN(age) ? null : age;
}

function genderGroup(gender) {
  if (gender === "Male" || gender === "Female") return gender;
  return "Other";
}

function parseSocialMediaTime(timeString) {
  return timeString ? timeString.trim() : "Unknown";
}

function parseScale(scaleString) {
  const scale = parseFloat(scaleString);
  return isNaN(scale) ? null : scale;
}

function socialMediaUsedStringParse(socialMediaUsed) {
  return socialMediaUsed ? socialMediaUsed.split(",").map(d => d.trim()) : [];
}

function parseSocialMediaTimeToMinutes(timeString) {
  const timeMap = {
    "Less than 1 hour": 30,
    "Between 1 and 2 hours": 90,
    "Between 2 and 3 hours": 150,
    "Between 3 and 4 hours": 210,
    "Between 4 and 5 hours": 270,
    "More than 5 hours": 330
  };
  return timeMap[timeString] || 0;
}

function countPlatformsByGender(data) {
  const platformCounts = {};

  data.forEach(entry => {
    entry.socialMediaUsed.forEach(platform => {
      if (!platformCounts[platform]) {
        platformCounts[platform] = { Male: 0, Female: 0, Other: 0 };
      }
      platformCounts[platform][entry.gender]++;
    });
  });

  return Object.keys(platformCounts)
    .sort((a, b) => {
      const aTotal = Object.values(platformCounts[a]).reduce((acc, count) => acc + count, 0);
      const bTotal = Object.values(platformCounts[b]).reduce((acc, count) => acc + count, 0);
      return aTotal - bTotal;
    })
    .reduce((acc, platform) => {
      acc[platform] = platformCounts[platform];
      return acc;
    }, {});
}

function countSocialMediaTimeByGender(data) {
  const timeCategories = [
    "Less than 1 hour",
    "Between 1 and 2 hours",
    "Between 2 and 3 hours",
    "Between 3 and 4 hours",
    "Between 4 and 5 hours",
    "More than 5 hours"
  ];

  const timeUsageByGender = timeCategories.reduce((acc, category) => {
    acc[category] = { Male: 0, Female: 0, Other: 0 };
    return acc;
  }, {});

  data.forEach(entry => {
    if (timeUsageByGender[entry.socialMediaTime]) {
      timeUsageByGender[entry.socialMediaTime][entry.gender]++;
    }
  });

  return timeUsageByGender;
}


// >-----------------< Visualization Update >-------------------<
function updateAllVisualizations(data, state) {
  const filteredData = data.filter(d => {
    const platformMatch = !state.selectedPlatform || d.socialMediaUsed.includes(state.selectedPlatform);
    const socialMediaTimeMatch = !state.selectedSocialMediaTime || d.socialMediaTime === state.selectedSocialMediaTime;
    const occupationMatch = !state.selectedOccupation || d.occupation === state.selectedOccupation;
    const genderMatch = !state.selectedGender || d.gender === state.selectedGender;
    
    return platformMatch && socialMediaTimeMatch && occupationMatch && genderMatch;
  });

  d3.select("#main-graph").selectAll("*").remove();
  createScatterPlot("#main-graph", graphConfig.mainWidth, graphConfig.mainHeight, filteredData, state);
  createLegendForMainGraph("#main-graph", state, data);
  setupScatterPlotInteractions(data, state);
}


// >-----------------< Tooltip Creation >-------------------<
function createTooltip() {
  return d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("padding", "10px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");
}

// >-----------------< Legend Creation >-------------------<
function createLegendForMainGraph(containerId, state, data) {
  const svg = d3.select(containerId).select("svg");
  const width = parseInt(svg.attr("width"));
  const margin = { top: 60, right: 140, bottom: 70, left: 60 };

  svg.selectAll(".legend").remove();

  const controlContainer = svg.append("g")
    .attr("class", "dashboard-controls")
    .attr("transform", `translate(${width - margin.right}, 20)`);

  const legend = controlContainer.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(-220, -20)");

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
    .attr("transform", (d, i) => `translate(${i * 80}, 0)`)
    .style("cursor", "pointer");

  legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => d.color)
    .attr("class", "legend-rect");

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text(d => d.label)
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .attr("class", "legend-text");

  legendItems.on("click", function(event, d) {
    console.log("Legend click:", d.label, "Current state:", state.selectedGender);

    if (state.selectedGender === d.label) {
      state.selectedGender = null;
    } else {
      state.selectedGender = d.label;
    }

    legendItems.selectAll(".legend-rect, .legend-text")
      .transition()
      .duration(200)
      .style("opacity", function() {
        const currentLegendItem = d3.select(this.parentNode).datum();
        return state.selectedGender === null || currentLegendItem.label === state.selectedGender ? 1 : 0.3;
      });

    updateAllVisualizations(data, state);
  });

  legendItems.selectAll(".legend-rect, .legend-text")
    .style("opacity", function() {
      const currentLegendItem = d3.select(this.parentNode).datum();
      return state.selectedGender === null || currentLegendItem.label === state.selectedGender ? 1 : 0.3;
    });
}

// >-----------------< Scatter Plot Interactions >-------------------<
function setupScatterPlotInteractions(data, state) {
  const metricSelector = d3.select("#main-graph")
    .append("select")
    .attr("class", "metric-selector")
    .style("position", "absolute")
    .style("top", "50px")
    .style("left", "14px")
    .style("width", "200px");

  metricSelector.selectAll("option")
    .data(graphConfig.mentalHealthMetrics)
    .enter()
    .append("option")
    .attr("value", d => d.key)
    .text(d => d.label);

  metricSelector.property("value", state.selectedMentalHealthMetric);

  metricSelector.on("change", function() {
    state.selectedMentalHealthMetric = this.value;
    updateAllVisualizations(data, state);
  });
}

// >-----------------< Donut Chart Interactions >-------------------<
function setupDonutChartInteractions(data, platformUsageByGender, timeUsageByGender, state) {
  const svg = d3.select("#side-graph-2");
  
  svg.selectAll(".arc")
    .on("click", function(event, d) {
      const visualizationType = state.selectedSocialMediaVisualization;
      
      if (visualizationType === 'platforms') {
        state.selectedPlatform = state.selectedPlatform === d.category ? null : d.category;
        state.selectedSocialMediaTime = null;
      } else if (visualizationType === 'time') {
        state.selectedSocialMediaTime = state.selectedSocialMediaTime === d.category ? null : d.category;
        state.selectedPlatform = null;
      }
      
      updateAllVisualizations(data, state);
    });
}

// >-----------------< Graph Creation >-------------------<
// Scatter Plot >----<
function createScatterPlot(containerId, width, height, data, state) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { top: 60, right: 150, bottom: 70, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const metricKey = state.selectedMentalHealthMetric;

  const x = d3.scaleLinear()
    .domain([10, 70])
    .range([0, chartWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[metricKey])])
    .range([chartHeight, 0]);

  // Axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .style("text-anchor", "center")
    .attr("dy", "0.8em")
    .style("font-size", "12px")
    .style("fill", "#555");

  g.append("g")
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#555");

  // X-axis label
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom / 2})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("Age");

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 3)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text(graphConfig.mentalHealthMetrics.find(m => m.key === metricKey).label);

  const pointGroups = d3.groups(data, d => `${x(d.age)}-${y(d[metricKey])}`);

  const scatter = g.selectAll(".dot")
    .data(pointGroups)
    .enter()
    .append("g")
    .attr("class", "point-group");

  scatter.each(function(group) {
    const points = group[1];
    const baseX = x(points[0].age);
    const baseY = y(points[0][metricKey]);

    if (points.length === 1) {
      d3.select(this)
        .append("circle")
        .attr("class", "dot")
        .attr("cx", baseX)
        .attr("cy", baseY)
        .attr("r", 5)
        .attr("fill", d => graphConfig.colors[points[0].gender])
        .attr("opacity", 0.7);
    } else {
      const radius = 5;
      const spreadRadius = radius * points.length;

      points.forEach((point, index) => {
        d3.select(this)
          .append("circle")
          .attr("class", "dot overlay-dot")
          .attr("cx", baseX)
          .attr("cy", baseY)  
          .attr("r", radius)
          .attr("fill", graphConfig.colors[point.gender])
          .attr("opacity", 0.7)
          .attr("data-base-x", baseX)
          .attr("data-base-y", baseY)
          .attr("data-index", index)
          .attr("data-spread-radius", spreadRadius);
      });
    }
  });

  const tooltip = createTooltip();

  svg.selectAll(".point-group")
    .each(function() {
      d3.select(this).attr("data-dispersed", "false");
    })
    .style("cursor", "pointer")
    .on("click", function(event, group) {
      const pointGroup = d3.select(this);
      const points = pointGroup.selectAll(".overlay-dot");
      const isCurrentlyDispersed = pointGroup.attr("data-dispersed") === "true";

      if (points.size() > 1) {
        if (!isCurrentlyDispersed) {
          points.each(function() {
            const index = parseFloat(this.getAttribute('data-index'));
            const baseX = parseFloat(this.getAttribute('data-base-x'));
            const baseY = parseFloat(this.getAttribute('data-base-y'));
            const spreadRadius = parseFloat(this.getAttribute('data-spread-radius'));
            const angle = (2 * Math.PI * index) / points.size();
            
            const dispersedX = baseX + spreadRadius * Math.sin(angle);
            const dispersedY = baseY + spreadRadius * Math.cos(angle);

            d3.select(this).transition()
              .duration(500)
              .attr("cx", dispersedX)
              .attr("cy", dispersedY);
          });
          
          pointGroup.attr("data-dispersed", "true");
        } else {
          points.transition()
            .duration(500)
            .attr("cx", function() { 
              return parseFloat(this.getAttribute('data-base-x')); 
            })
            .attr("cy", function() { 
              return parseFloat(this.getAttribute('data-base-y')); 
            });
          
          pointGroup.attr("data-dispersed", "false");
        }
      }
    });

  svg.selectAll(".dot")
    .on("mousemove", function(event, d) {
      const pointGroup = d3.select(this.parentNode);
      const firstPoint = pointGroup.datum()[1][0];
      tooltip.style("visibility", "visible")
        .text(`${firstPoint.age} years old - ${firstPoint[metricKey]}`);
      tooltip.style("top", `${event.pageY + 5}px`)
        .style("left", `${event.pageX + 5}px`);
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });
}

// Donut Chart >----<
function createDonutChart(containerId, width, height, platformUsageByGender, timeUsageByGender, state, data) {
  const donutContainer = d3.select(containerId)
    .append("div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("flex-direction", "column")
    .style("margin-bottom", "20px")
    .style("align-items", "center");

  const visualizationSelector = donutContainer
    .append("select")
    .attr("class", "metric-selector")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")	
    .style("border-radius", "4px")
    .style("background-color", "white")
    .style("width", "200px")
    .style("margin-right", "170px")
    .style("margin-top", "-7px");

  visualizationSelector.selectAll("option")
    .data(graphConfig.socialMediaVisualizationOptions)
    .enter()
    .append("option")
    .attr("value", d => d.key)
    .text(d => d.label);

  visualizationSelector.property("value", state.selectedSocialMediaVisualization);

  function renderDonutChart(visualizationType) {
    donutContainer.select("svg").remove();

    const currentData = visualizationType === 'platforms' 
      ? platformUsageByGender 
      : timeUsageByGender;

    const newSvg = donutContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const genders = ["Male", "Female", "Other"];
    const colors = [graphConfig.colors.Male, graphConfig.colors.Female, graphConfig.colors.Other];
    
    const innerRadius = 20;
    const outerRadius = Math.min(width, height) / 2 + 10;

    const tooltip = createTooltip();

    const preparedData = Object.entries(currentData).flatMap(([category, counts]) => 
      genders.map((gender, genderIndex) => ({
        category,
        gender,
        value: counts[gender],
        color: colors[genderIndex],
        genderIndex
      }))
    );

    const radiusScale = d3.scaleBand()
      .domain(Object.keys(currentData))
      .range([innerRadius, outerRadius])
      .padding(0.1);

    const anglePerSection = Math.PI / 2;
    const angleScale = d3.scaleLinear()
      .domain([0, d3.max(preparedData, d => d.value)])
      .range([0, anglePerSection]);

    Object.keys(currentData).forEach((category) => {
      genders.forEach((_, genderIndex) => {
        const borderArc = d3.arc()
          .innerRadius(radiusScale(category))
          .outerRadius(radiusScale(category) + radiusScale.bandwidth())
          .startAngle(genderIndex * anglePerSection)
          .endAngle((genderIndex + 1) * anglePerSection);

        newSvg.append("path")
          .attr("class", "section-border")
          .attr("d", borderArc)
          .attr("fill", "none")
          .attr("stroke", "#aaa")
          .attr("stroke-width", 1);
      });
    });

    const arc = d3.arc()
      .innerRadius(d => radiusScale(d.category))
      .outerRadius(d => radiusScale(d.category) + radiusScale.bandwidth())
      .startAngle(d => d.genderIndex * anglePerSection)
      .endAngle(d => d.genderIndex * anglePerSection + angleScale(d.value));

    newSvg.selectAll("path.arc")
      .data(preparedData)
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("d", arc)
      .attr("fill", d => d.color)
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        tooltip.style("visibility", "visible")
          .text(`${d.category} - ${d.gender}: ${d.value}`);
      })
      .on("mousemove", function(event) {
        tooltip.style("top", `${event.pageY + 5}px`)
          .style("left", `${event.pageX + 5}px`);
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
      })
      .on("click", function(event, d) {
        const visualizationType = state.selectedSocialMediaVisualization;
        
        if (visualizationType === 'platforms') {
          state.selectedPlatform = state.selectedPlatform === d.category ? null : d.category;
          state.selectedSocialMediaTime = null;
        } else if (visualizationType === 'time') {
          state.selectedSocialMediaTime = state.selectedSocialMediaTime === d.category ? null : d.category;
          state.selectedPlatform = null;
        }
        
        updateAllVisualizations(data, state);
      });

    newSvg.selectAll(".arc")
      .attr("opacity", function(d) {
        const isSelected = (visualizationType === 'platforms' && state.selectedPlatform === d.category) ||
                           (visualizationType === 'time' && state.selectedSocialMediaTime === d.category);
        return isSelected ? 0.7 : 1;
      });

    // Labels 
    Object.keys(currentData).forEach((category) => {
      const angle = -Math.PI / 2;

      const x = Math.cos(angle) * (radiusScale(category) + radiusScale.bandwidth() / 2) - 10;
      const y = Math.sin(angle) * (radiusScale(category) + radiusScale.bandwidth() / 2) + 4;

      newSvg.append("text")
        .attr("class", "label")
        .attr("x", x)
        .attr("y", y)
        .text(category)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("fill", "#333");
    });
  }

  visualizationSelector.on("change", function() {
    state.selectedPlatform = null;
    state.selectedSocialMediaTime = null;
    
    state.selectedSocialMediaVisualization = this.value;
    renderDonutChart(this.value);
    
    updateAllVisualizations(data, state);
  });

  renderDonutChart(state.selectedSocialMediaVisualization);
}

// Bar Graph >----<
function createBarGraph(containerId, width, height, data) {
  const svg = d3.select(containerId)
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { top: 10, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right + 70;
  const chartHeight = height - margin.top - margin.bottom + 60;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const depressionGroups = d3.groups(data, d => d.feelDepressed);

  const averageTimeByDepression = depressionGroups.map(([depression, group]) => {
    const genderGroups = d3.groups(group, d => d.gender);
    const averageTimeByGender = genderGroups.map(([gender, genderGroup]) => {
      const totalMinutes = genderGroup.reduce((sum, d) => sum + parseSocialMediaTimeToMinutes(d.socialMediaTime), 0);
      const averageMinutes = totalMinutes / genderGroup.length;
      return { gender, averageMinutes };
    });
    return { depression, averageTimeByGender };
  });

  const x = d3.scaleBand()
    .domain([1, 2, 3, 4, 5])
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(averageTimeByDepression, d => d3.max(d.averageTimeByGender, g => g.averageMinutes))])
    .nice()
    .range([chartHeight, 0]);

  const genders = ["Male", "Female", "Other"];

  const colorScale = d3.scaleOrdinal()
    .domain(genders)
    .range([graphConfig.colors.Male, graphConfig.colors.Female, graphConfig.colors.Other]);

  // X-axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "0.3em")

  // Y-axis
  g.append("g")
    .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#555");

  // Bars
  averageTimeByDepression.forEach(d => {
    const barGroup = g.append("g")
      .attr("transform", `translate(${x(d.depression)},0)`);

    const sortedAverageTimeByGender = d.averageTimeByGender.sort((a, b) => b.averageMinutes - a.averageMinutes);

    barGroup.selectAll("rect")
      .data(sortedAverageTimeByGender)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => y(d.averageMinutes))
      .attr("width", x.bandwidth())
      .attr("height", d => chartHeight - y(d.averageMinutes))
      .attr("fill", d => colorScale(d.gender))
      .attr("opacity", 1)
      .on("mouseover", function(event, d) {
        tooltip.style("visibility", "visible")
          .text(`${d.gender}: ${d.averageMinutes.toFixed(2)} minutes`);
      })
      .on("mousemove", function(event) {
        tooltip.style("top", `${event.pageY + 5}px`)
          .style("left", `${event.pageX + 5}px`);
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
      })
      .on("mouseenter", function() {
        d3.select(this)
          .transition()
          .attr("opacity", 0.7);
      })
      .on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      });
  });

  const tooltip = createTooltip();

  // Y-axis label
  svg.append("text")
    .attr("transform", `translate(0, 5) rotate(-90)`)
    .attr("y", margin.left / 3)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("Average Time Spent on Social Media (minutes)");

  // X-axis label
  svg.append("text")
    .attr("transform", `translate(${width / 2 + 60}, ${height - margin.bottom / 3 + 60})`)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("Depression Level");
}

document.addEventListener('DOMContentLoaded', initializeGraphs);