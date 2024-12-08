# Mental Health vs. Social Media Use

## Overview

This project is an **interactive dashboard** designed to analyze the relationship between **social media usage** and **mental health**. By visualizing data across various dimensions such as age, gender, and mental health metrics, the project provides users with insights into how digital interactions may influence psychological well-being.

The dashboard is built using **D3.js**, **JavaScript**, **CSS**, and **HTML**, and features multiple interactive visualizations that enable users to filter, explore, and analyze data dynamically.

---

### Features

#### 1. Interactive Scatter Plot

- **Dynamic Metric Selection**: Users can toggle between various mental health metrics (e.g., depression, concentration, sleep issues).
- **Cluster Interactions**: Points representing overlapping data can be dispersed for better analysis. *(still needs some work)*
- **Tooltips**: Hovering over points displays detailed information, such as age and the selected metric value.

#### 2. Donut Chart (Social Media Dimensions)

- **Category Switching**: Users can switch between visualizing popular social media platforms and time spent on social media.
- **Interactive Segments**: Clicking on segments filters data across the dashboard, dynamically updating the scatter plot and bar chart. *(missing visual feedback)*
- **Tooltips**: Provides additional context (e.g., percentage of total) when hovering over segments.

#### 3. Bar Chart (Depression vs. Social Media Time)

- **Time Segmentation by Gender**: Displays average time spent on social media for different depression levels, segmented by gender.
- **Tooltips**: Provides additional context (e.g., average time in minutes) when hovering over bars.

#### 4. Real-Time Filtering and Synchronization

- **Global State Management**: Filters applied in one chart (e.g., selecting a gender or a platform) update all visualizations simultaneously.
- **Dynamic Updates**: All charts re-render in real-time when a filter or selection is changed.

---

### Technologies Used

- **D3.js**: For creating interactive and dynamic data visualizations.
- **JavaScript**: Handles the logic for filtering, state management, and interactions.
- **CSS**: For styling the dashboard, ensuring a responsive and modern design.
- **HTML**: Provides the structural foundation for the dashboard.

---

### File Structure

- `index.html`: The main HTML file that hosts the dashboard.
- `styles.css`: Contains some of the styles for the dashboard, including layout and color schemes.
- `graphs_scripts.js`: JavaScript file responsible for data processing, chart creation, and interaction logic.

---

### Installation and Usage

#### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge) that supports D3.js and JavaScript.

#### Steps to Run

1. Download the project files.
2. Place the files in a local server or open `index.html` directly in your browser.
3. The dashboard will load and display the visualizations. Ensure the data file (`dataset.csv`) is present in the same directory if needed for dynamic updates.

---

### Dataset

The dataset used for this project comes from the [Kaggle Social Media and Mental Health Dataset](https://www.kaggle.com/datasets/souvikahmed071/social-media-and-mental-health/data). It contains responses to various survey questions about social media usage and its impact on mental health.

---

### Future Improvements

- **Data Expansion**: Add more dimensions or datasets for deeper insights.
- **Advanced Filtering**: Enable multi-dimensional filtering (e.g., filtering by both gender and occupation).
- **Export Options**: Allow users to download filtered data or visualizations as images or reports.

---

### Authors

- **André Louro** - Implementation and Documentation
- **Petra Freitas** - Design and Conceptualization

---

### License

This project is open-source and can be freely used, modified, and distributed for non-commercial purposes. For details, refer to the license file (if available).
