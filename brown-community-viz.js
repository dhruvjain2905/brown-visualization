// Brown Community Visualization
// Main visualization logic


// ============================================
// State Management
// ============================================


const state = {
 currentScene: 'scene0', // scene0, scene1, scene2A, scene2A1, scene2A2
 dots: [],
 width: window.innerWidth,
 height: window.innerHeight,
 animating: false
};


// ============================================
// Interaction Lock (disable hover/click during animations)
// ============================================


function lockInteractions() {
  // Disable pointer events on all interactive elements
  document.body.classList.add('interactions-locked');
  svg.selectAll('.cluster-hover-area').style('pointer-events', 'none');
  dotsGroup.style('pointer-events', 'none');
}


function unlockInteractions() {
  // Re-enable pointer events
  document.body.classList.remove('interactions-locked');
  svg.selectAll('.cluster-hover-area').style('pointer-events', 'auto');
  dotsGroup.style('pointer-events', 'auto');
}


// ============================================
// SVG Setup
// ============================================


const svg = d3.select('#main-svg');
const backgroundCirclesGroup = svg.append('g').attr('id', 'background-circles-group');
const dotsGroup = svg.append('g').attr('id', 'dots-group');
const labelsGroup = svg.append('g').attr('id', 'labels-group');


// ============================================
// UI Elements
// ============================================


const titleOverlay = document.getElementById('title-overlay');
const legend = document.getElementById('legend');
const backButton = document.getElementById('back-button');
const buttonContainer = document.getElementById('button-container');
const facultyButtonContainer = document.getElementById('faculty-button-container');
const sliderContainer = document.getElementById('slider-container');
const clusterSlider = document.getElementById('cluster-slider');
const clickInstruction = document.getElementById('click-instruction');
const popupOverlay = document.getElementById('popup-overlay');
const popupModal = document.getElementById('popup-modal');
const popupClose = document.getElementById('popup-close');


// ============================================
// Dot Generation with Degree Type Support
// ============================================


function generateDotsWithDegreeTypes(concentrations) {
 // Generate dots for seniors with Bachelor's and Master's differentiation
 const dots = [];


 concentrations.forEach(conc => {
   // Add bachelor's dots
   for (let i = 0; i < conc.bachelors; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: colors.bachelors,
       degreeType: 'bachelors',
       concentrationName: conc.name,
       metadata: {
         bachelors: conc.bachelors,
         masters: conc.masters,
         topCombinations: conc.topCombinations
       }
     });
   }


   // Add master's dots
   for (let i = 0; i < conc.masters; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: colors.masters,
       degreeType: 'masters',
       concentrationName: conc.name,
       metadata: {
         bachelors: conc.bachelors,
         masters: conc.masters,
         topCombinations: conc.topCombinations
       }
     });
   }
 });


 return dots;
}


function generateDots(config, shuffle = false) {
 const dots = [];

 // If shuffling, calculate total count and use shared radius for all dots
 // This ensures dots are truly mixed spatially, not just in render order
 if (shuffle && config.clusters.length > 0) {
   const totalCount = config.clusters.reduce((sum, c) => sum + c.count, 0);
   const sharedRadius = Math.sqrt(totalCount) * 1.8; // Smaller initial cluster
   const centerX = config.clusters[0].x;
   const centerY = config.clusters[0].y;

   config.clusters.forEach(cluster => {
     for (let i = 0; i < cluster.count; i++) {
       const angle = Math.random() * 2 * Math.PI;
       const radius = Math.random() * sharedRadius;

       dots.push({
         x: centerX + Math.cos(angle) * radius,
         y: centerY + Math.sin(angle) * radius,
         targetX: centerX + Math.cos(angle) * radius,
         targetY: centerY + Math.sin(angle) * radius,
         color: cluster.color,
         clusterName: cluster.name,
         metadata: cluster.metadata || {}
       });
     }
   });

   // Shuffle dots to mix render order
   for (let i = dots.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [dots[i], dots[j]] = [dots[j], dots[i]];
   }
 } else {
   // Original behavior - each cluster has its own radius
   config.clusters.forEach(cluster => {
     const clusterRadius = Math.sqrt(cluster.count) * 2.5;

     for (let i = 0; i < cluster.count; i++) {
       const angle = Math.random() * 2 * Math.PI;
       const radius = Math.random() * clusterRadius;

       dots.push({
         x: cluster.x + Math.cos(angle) * radius,
         y: cluster.y + Math.sin(angle) * radius,
         targetX: cluster.x + Math.cos(angle) * radius,
         targetY: cluster.y + Math.sin(angle) * radius,
         color: cluster.color,
         clusterName: cluster.name,
         metadata: cluster.metadata || {}
       });
     }
   });
 }

 return dots;
}


// ============================================
// Scene Configurations
// ============================================


function getScene0Config() {
 return {
   clusters: [
     {
       x: state.width / 2,
       y: state.height * 0.55, // Lower to avoid title overlap
       count: brownData.students.total,
       color: colors.students,
       name: 'Students'
     },
     {
       x: state.width / 2,
       y: state.height * 0.55,
       count: brownData.faculty.total,
       color: colors.faculty,
       name: 'Faculty'
     },
     {
       x: state.width / 2,
       y: state.height * 0.55,
       count: brownData.staff.total,
       color: colors.staff,
       name: 'Staff'
     }
   ]
 };
}


function getScene1Config() {
 return {
   clusters: [
     {
       x: state.width * 0.25,
       y: state.height / 2,
       count: brownData.students.total,
       color: colors.students,
       name: 'Students',
       label: `Students\n${brownData.students.total.toLocaleString()}`
     },
     {
       x: state.width * 0.5,
       y: state.height / 2,
       count: brownData.faculty.total,
       color: colors.faculty,
       name: 'Faculty',
       label: `Faculty\n${brownData.faculty.total.toLocaleString()}`
     },
     {
       x: state.width * 0.75,
       y: state.height / 2,
       count: brownData.staff.total,
       color: colors.staff,
       name: 'Staff',
       label: `Staff\n${brownData.staff.total.toLocaleString()}`
     }
   ]
 };
}


function getScene2AConfig() {
 return {
   clusters: [
     {
       x: state.width / 2,
       y: state.height / 2,
       count: brownData.students.total,
       color: colors.students,
       name: 'Students',
       label: `Brown Students 2024\n~${brownData.students.total.toLocaleString()} students`
     }
   ]
 };
}


function getScene2BConfig() {
 return {
   clusters: [
     {
       x: state.width / 2,
       y: state.height / 2,
       count: brownData.faculty.total,
       color: colors.faculty,
       name: 'Faculty',
       label: `Brown Faculty 2024\n${brownData.faculty.total.toLocaleString()} faculty`
     }
   ]
 };
}


function getScene2CConfig() {
 return {
   clusters: [
     {
       x: state.width / 2,
       y: state.height / 2,
       count: brownData.staff.total,
       color: colors.staff,
       name: 'Staff',
       label: `Brown Staff 2024\n${brownData.staff.total.toLocaleString()} staff`
     }
   ]
 };
}


function getSeniorDotPositionsSingle() {
 // Calculate positions for single cluster at center
 const totalSeniors = brownData.students.seniorsByConcentration.reduce(
   (sum, conc) => sum + conc.bachelors + conc.masters, 0
 );


 const positions = [];
 const clusterRadius = Math.sqrt(totalSeniors) * 2.5;


 for (let i = 0; i < totalSeniors; i++) {
   const angle = Math.random() * 2 * Math.PI;
   const radius = Math.random() * clusterRadius;


   positions.push({
     x: state.width / 2 + Math.cos(angle) * radius,
     y: state.height / 2 + Math.sin(angle) * radius
   });
 }


 return positions;
}


function getSeniorDotPositionsClustered() {
 // Calculate positions for concentration clusters
 const concentrations = brownData.students.seniorsByConcentration;
 const numConcentrations = concentrations.length;


 const cols = 5;
 const rows = Math.ceil(numConcentrations / cols);
 const marginX = state.width * 0.14;
 const marginY = state.height * 0.2;
 const spacingX = (state.width - 2 * marginX) / (cols - 1);
 const spacingY = (state.height - 2 * marginY) / (rows - 1);


 const positions = [];
 const clusterInfo = [];


 concentrations.forEach((conc, i) => {
   const col = i % cols;
   const row = Math.floor(i / cols);
   const centerX = marginX + col * spacingX;
   const centerY = marginY + row * spacingY;


   const totalInConc = conc.bachelors + conc.masters;
   const clusterRadius = Math.sqrt(totalInConc) * 2.5;


   clusterInfo.push({
     name: conc.name,
     x: centerX,
     y: centerY,
     count: totalInConc,
     bachelors: conc.bachelors,
     masters: conc.masters,
     topCombinations: conc.topCombinations
   });


   for (let j = 0; j < totalInConc; j++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * clusterRadius;


     positions.push({
       x: centerX + Math.cos(angle) * radius,
       y: centerY + Math.sin(angle) * radius,
       concentrationName: conc.name
     });
   }
 });


 return { positions, clusterInfo };
}


// ============================================
// Scene Rendering
// ============================================


function renderScene(config, options = {}) {
 if (state.animating) return;
 state.animating = true;
 lockInteractions();


 const { duration = 1200, showLabels = false, onComplete } = options;


 // Update target positions
 let dotIndex = 0;
 config.clusters.forEach(cluster => {
   for (let i = 0; i < cluster.count && dotIndex < state.dots.length; i++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * Math.sqrt(cluster.count) * 2.5;


     state.dots[dotIndex].targetX = cluster.x + Math.cos(angle) * radius;
     state.dots[dotIndex].targetY = cluster.y + Math.sin(angle) * radius;
     state.dots[dotIndex].color = cluster.color;
     state.dots[dotIndex].clusterName = cluster.name;
     state.dots[dotIndex].metadata = cluster.metadata || {};


     dotIndex++;
   }
 });


 // Animate dots
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .transition()
   .duration(duration)
   .ease(d3.easeCubicInOut)
   .attr('cx', d => d.targetX)
   .attr('cy', d => d.targetY)
   .attr('fill', d => d.color)
   .attr('opacity', 0.9)
   .on('end', function(d, i) {
     if (i === 0) {
       state.dots.forEach((dot, idx) => {
         dot.x = dot.targetX;
         dot.y = dot.targetY;
       });
       state.animating = false;
       // Brief delay for labels to appear
       if (showLabels) {
         setTimeout(() => {
           unlockInteractions();
           if (onComplete) onComplete();
         }, 400);
       } else {
         unlockInteractions();
         if (onComplete) onComplete();
       }
     }
   });


 // Update labels
 if (showLabels) {
   renderLabels(config.clusters);
 } else {
   labelsGroup.selectAll('.cluster-label, .cluster-count').remove();
 }
}


function renderSeniorScene(positions, options = {}) {
 if (state.animating) return;
 state.animating = true;
 lockInteractions();


 const { duration = 1200, showLabels = false, clusterInfo = [], onComplete } = options;


 // Update each dot's target position
 state.dots.forEach((dot, i) => {
   if (i < positions.length) {
     dot.targetX = positions[i].x;
     dot.targetY = positions[i].y;
     if (positions[i].concentrationName) {
       dot.concentrationName = positions[i].concentrationName;
     }
   }
 });


 // Animate dots
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .transition()
   .duration(duration)
   .ease(d3.easeCubicInOut)
   .attr('cx', d => d.targetX)
   .attr('cy', d => d.targetY)
   .attr('opacity', 0.9)
   .on('end', function(d, i) {
     if (i === 0) {
       state.dots.forEach((dot, idx) => {
         dot.x = dot.targetX;
         dot.y = dot.targetY;
       });
       state.animating = false;
       // Brief delay for labels to appear
       if (showLabels) {
         setTimeout(() => {
           unlockInteractions();
           if (onComplete) onComplete();
         }, 400);
       } else {
         unlockInteractions();
         if (onComplete) onComplete();
       }
     }
   });


 // Update labels for clustered view
 if (showLabels && clusterInfo.length > 0) {
   renderConcentrationLabels(clusterInfo);
 } else if (showLabels) {
   // Single cluster label
   const totalSeniors = state.dots.length;
   renderSingleLabel('Class of 2024', `${totalSeniors.toLocaleString()} students`);
 } else {
   labelsGroup.selectAll('.cluster-label, .cluster-count').remove();
 }
}


function renderLabels(clusters, duration = 300) {
 // Interrupt any ongoing transitions and remove old labels immediately
 labelsGroup.selectAll('.cluster-label, .cluster-count')
   .interrupt()
   .remove();


 // Add new labels
 clusters.forEach(cluster => {
   if (!cluster.label) return;


   const lines = cluster.label.split('\n');
   const clusterRadius = Math.sqrt(cluster.count) * 2.5;


   // Main label
   labelsGroup.append('text')
     .attr('class', 'cluster-label')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 30)
     .text(lines[0])
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);


   // Count label if exists
   if (lines[1]) {
     labelsGroup.append('text')
       .attr('class', 'cluster-count')
       .attr('x', cluster.x)
       .attr('y', cluster.y - clusterRadius - 10)
       .text(lines[1])
       .style('opacity', 0)
       .transition()
       .duration(duration)
       .style('opacity', 1);
   }
 });
}


function renderSingleLabel(title, subtitle, duration = 300) {
 // Interrupt any ongoing transitions and remove old labels immediately
 labelsGroup.selectAll('.cluster-label, .cluster-count')
   .interrupt()
   .remove();


 const totalSeniors = state.dots.length;
 const clusterRadius = Math.sqrt(totalSeniors) * 2.5;


 labelsGroup.append('text')
   .attr('class', 'cluster-label')
   .attr('x', state.width / 2)
   .attr('y', state.height / 2 - clusterRadius - 30)
   .text(title)
   .style('opacity', 0)
   .transition()
   .duration(duration)
   .style('opacity', 1);


 labelsGroup.append('text')
   .attr('class', 'cluster-count')
   .attr('x', state.width / 2)
   .attr('y', state.height / 2 - clusterRadius - 10)
   .text(subtitle)
   .style('opacity', 0)
   .transition()
   .duration(duration)
   .style('opacity', 1);
}


function renderConcentrationLabels(clusterInfo, duration = 300) {
 // Interrupt any ongoing transitions and remove old labels immediately
 labelsGroup.selectAll('.cluster-label, .cluster-count')
   .interrupt()
   .remove();


 clusterInfo.forEach(cluster => {
   const clusterRadius = Math.sqrt(cluster.count) * 2.5;


   labelsGroup.append('text')
     .attr('class', 'cluster-label')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 20)
     .text(cluster.name)
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);
 });
}


// ============================================
// Scene Transitions
// ============================================


function transitionToScene0() {
 if (state.animating) return;
 state.currentScene = 'scene0';
 lockInteractions();


 // Show title overlay
 titleOverlay.style.opacity = '1';
 legend.classList.add('visible');


 // Hide all UI elements
 backButton.classList.remove('visible');
 buttonContainer.style.opacity = '0';
 buttonContainer.style.pointerEvents = 'none';
 sliderContainer.classList.remove('visible');
 clickInstruction.classList.remove('visible');


 renderScene(getScene0Config(), {
   duration: 1200,
   showLabels: false
 });
}


function transitionToScene1() {
 if (state.animating) return;
 state.currentScene = 'scene1';
 lockInteractions();


 // Hide title overlay
 titleOverlay.style.opacity = '0';

 // Hide back button (in case coming back from a sub-scene)
 backButton.classList.remove('visible');


 // Show click instruction
 setTimeout(() => {
   clickInstruction.classList.add('visible');
 }, 1400);


 const config = getScene1Config();
 renderScene(config, {
   duration: 1200,
   showLabels: true,
   onComplete: () => {
     // Make clusters clickable
     enableClusterClicking(config.clusters);
   }
 });
}


function transitionToScene2A() {
 if (state.animating) return;
 state.currentScene = 'scene2A';
 lockInteractions();


 // Remove hover areas from previous scene
 svg.selectAll('.cluster-hover-area').remove();

 // Clear labels from previous scene
 labelsGroup.selectAll('.cluster-label, .cluster-count').remove();

 // Hide click instruction
 clickInstruction.classList.remove('visible');


 // Show back button
 backButton.classList.add('visible');
 backButton.onclick = () => {
   // Hide slider when going back
   sliderContainer.classList.remove('visible');

   // Hide buttons
   buttonContainer.style.opacity = '0';
   buttonContainer.style.pointerEvents = 'none';

   // Clear background circles (from gender view)
   backgroundCirclesGroup.selectAll('*').remove();


   // Regenerate all dots when going back
   const config = getScene0Config();
   state.dots = generateDots(config);


   // Remove all existing circles
   dotsGroup.selectAll('circle').remove();


   // Create new circles
   dotsGroup.selectAll('circle')
     .data(state.dots)
     .join('circle')
     .attr('cx', d => d.x)
     .attr('cy', d => d.y)
     .attr('r', 3)
     .attr('fill', d => d.color)
     .attr('opacity', 0.9);


   // Reset legend to show all three roles
   legend.innerHTML = `
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.students};"></div>
       <span>Students</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.faculty};"></div>
       <span>Faculty</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.staff};"></div>
       <span>Staff</span>
     </div>
   `;


   transitionToScene1();
 };


 // Update legend to show only students
 legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.students};"></div>
     <span>Students</span>
   </div>
 `;


 // Keep only student dots, remove faculty and staff
 const studentCount = brownData.students.total;
 state.dots = state.dots.slice(0, studentCount);


 // Remove excess circles from DOM
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .exit()
   .transition()
   .duration(600)
   .attr('opacity', 0)
   .remove();


 renderScene(getScene2AConfig(), {
   duration: 800,
   showLabels: false,
   onComplete: () => {
     // Show buttons
     buttonContainer.style.opacity = '1';
     buttonContainer.style.pointerEvents = 'auto';
   }
 });
}


function transitionToScene2A1() {
 if (state.animating) return;
 state.currentScene = 'scene2A1';
 lockInteractions();


 // Hide buttons
 buttonContainer.style.opacity = '0';
 buttonContainer.style.pointerEvents = 'none';


 // Update legend for degree levels
 legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.bachelors};"></div>
     <span>Bachelor's</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.masters};"></div>
     <span>Master's</span>
   </div>
 `;


 // Update slider label
 document.getElementById('slider-label').textContent = 'Cluster by Concentration →';


 // Regenerate dots with Bachelor's/Master's colors for seniors only
 state.dots = generateDotsWithDegreeTypes(brownData.students.seniorsByConcentration);


 // Remove all existing circles and recreate with new data
 dotsGroup.selectAll('circle').remove();


 dotsGroup.selectAll('circle')
   .data(state.dots)
   .join('circle')
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('r', 3)
   .attr('fill', d => d.color)
   .attr('opacity', 0)
   .transition()
   .duration(800)
   .attr('opacity', 0.9);


 // Position dots in single cluster
 const positions = getSeniorDotPositionsSingle();
 renderSeniorScene(positions, {
   duration: 800,
   showLabels: true,
   onComplete: () => {
     // Show slider
     sliderContainer.classList.add('visible');
     clusterSlider.value = 0;
     currentSliderState = 'single';
   }
 });
}


// ============================================
// Scene 2A-2: Gender View
// ============================================


function generateDotsWithGenderTypes() {
 // Generate dots for FIRST-YEAR students only with gender differentiation
 const dots = [];
 const genderData = brownData.students.byGender;
 const genders = ['men', 'women', 'nonBinary'];


 // Process each gender in order
 genders.forEach(genderKey => {
   const data = genderData[genderKey];
   const color = colors[genderKey];


   // Use first-year class data only
   const enrolledFirstYear = data.byClass.firstYear;


   // Calculate total admitted first-years (assuming same yield rate)
   const admittedFirstYear = Math.round(enrolledFirstYear / (data.yieldRate / 100));
   const notEnrolledFirstYear = admittedFirstYear - enrolledFirstYear;


   // Add enrolled students (solid dots)
   for (let i = 0; i < enrolledFirstYear; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: color,
       opacity: 0.9,
       genderType: genderKey,
       enrolled: true,
       metadata: {
         ...data,
         genderName: genderKey.charAt(0).toUpperCase() + genderKey.slice(1),
         enrolledFirstYear: enrolledFirstYear,
         admittedFirstYear: admittedFirstYear
       }
     });
   }


   // Add SAMPLED admitted but not enrolled students (shadow/muted dots)
   // Sample 30% of non-enrolled for performance
   const sampleSize = Math.round(notEnrolledFirstYear * 0.3);
   for (let i = 0; i < sampleSize; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: '#999', // Grey for non-enrolled
       opacity: 0.25,
       genderType: genderKey,
       enrolled: false,
       metadata: {
         ...data,
         genderName: genderKey.charAt(0).toUpperCase() + genderKey.slice(1),
         enrolledFirstYear: enrolledFirstYear,
         admittedFirstYear: admittedFirstYear
       }
     });
   }
 });


 return dots;
}


function getGenderDotPositionsSingle() {
 // Calculate positions for single cluster at center
 const totalDots = state.dots.length;
 const positions = [];
 const clusterRadius = Math.sqrt(totalDots) * 2.5;


 for (let i = 0; i < totalDots; i++) {
   const angle = Math.random() * 2 * Math.PI;
   const radius = Math.random() * clusterRadius;


   positions.push({
     x: state.width / 2 + Math.cos(angle) * radius,
     y: state.height / 2 + Math.sin(angle) * radius
   });
 }


 return positions;
}


function getGenderDotPositionsClustered() {
 // Calculate positions for 3 gender clusters
 const genderData = brownData.students.byGender;
 const genders = ['men', 'women', 'nonBinary'];


 const positions = [];
 const clusterInfo = [];


 genders.forEach((genderKey, idx) => {
   const data = genderData[genderKey];


   // Use first-year data only
   const enrolledFirstYear = data.byClass.firstYear;
   const admittedFirstYear = Math.round(enrolledFirstYear / (data.yieldRate / 100));
   const notEnrolledFirstYear = admittedFirstYear - enrolledFirstYear;
   const sampleSize = Math.round(notEnrolledFirstYear * 0.3);


   // Calculate applicants for first-year (proportional to total applicants)
   const applicantsFirstYear = Math.round(data.applicants * (enrolledFirstYear / data.enrolled));


   const totalInCluster = enrolledFirstYear + sampleSize;


   // Position clusters horizontally - men and women spread apart, non-binary to the right
   // Men at 0.18, Women at 0.52, Non-binary at 0.82
   const xPositions = [0.18, 0.52, 0.82];
   const x = state.width * xPositions[idx];
   const y = state.height / 2;


   // SMALLER clusters to leave room for background circle
   const clusterRadius = Math.sqrt(totalInCluster) * 1.2;


   // Calculate background circle radius based on total applicants
   const backgroundRadius = Math.sqrt(applicantsFirstYear) * 1.2;


   clusterInfo.push({
     name: genderKey.charAt(0).toUpperCase() + genderKey.slice(1),
     genderKey: genderKey,
     x: x,
     y: y,
     count: totalInCluster,
     enrolled: enrolledFirstYear,
     admitted: admittedFirstYear,
     applicants: applicantsFirstYear,
     acceptanceRate: data.acceptanceRate,
     yieldRate: data.yieldRate,
     byClass: data.byClass,
     clusterRadius: clusterRadius,
     backgroundRadius: backgroundRadius
   });


   // Generate positions for ENROLLED dots (solid, colored)
   for (let j = 0; j < enrolledFirstYear; j++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * clusterRadius;


     positions.push({
       x: x + Math.cos(angle) * radius,
       y: y + Math.sin(angle) * radius,
       genderType: genderKey
     });
   }


   // Generate positions for SAMPLED non-enrolled dots (grey, faded)
   for (let j = 0; j < sampleSize; j++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * clusterRadius;


     positions.push({
       x: x + Math.cos(angle) * radius,
       y: y + Math.sin(angle) * radius,
       genderType: genderKey
     });
   }
 });


 return { positions, clusterInfo };
}


function renderBackgroundCircles(clusterInfo, options = {}) {
 // Render large grey blob shapes with dotted borders representing total applicant pool
 const { duration = 1200, show = true } = options;


 if (!show) {
   // Fade out and remove background blobs and labels
   backgroundCirclesGroup.selectAll('circle, text')
     .transition()
     .duration(duration)
     .attr('opacity', 0)
     .remove();
   return;
 }


 // Remove existing background elements
 backgroundCirclesGroup.selectAll('circle, text').remove();


 // Draw background blobs for each cluster
 clusterInfo.forEach(cluster => {
   // Calculate blob radius - should be ~20x larger than enrolled cluster to show 5% acceptance
   const blobRadius = cluster.backgroundRadius * 3.5;


   // Add the blob circle with dotted stroke
   backgroundCirclesGroup.append('circle')
     .attr('cx', cluster.x)
     .attr('cy', cluster.y)
     .attr('r', 0)
     .attr('fill', '#f0f0f0')
     .attr('stroke', '#999')
     .attr('stroke-width', 2)
     .attr('stroke-dasharray', '8,4')
     .attr('opacity', 0)
     .transition()
     .duration(duration)
     .attr('r', blobRadius)
     .attr('opacity', 0.4);


   // Add label for the blob
   backgroundCirclesGroup.append('text')
     .attr('x', cluster.x)
     .attr('y', cluster.y + blobRadius + 25)
     .attr('text-anchor', 'middle')
     .attr('font-family', 'Inter, sans-serif')
     .attr('font-size', '14px')
     .attr('font-weight', '600')
     .attr('fill', '#666')
     .attr('opacity', 0)
     .text(`${cluster.applicants.toLocaleString()} applicants (not admitted)`)
     .transition()
     .duration(duration)
     .attr('opacity', 1);
 });
}


function renderGenderScene(positions, options = {}) {
 if (state.animating) return;
 state.animating = true;
 lockInteractions();


 const { duration = 1200, showLabels = false, clusterInfo = [], onComplete } = options;


 // Update each dot's target position
 state.dots.forEach((dot, i) => {
   if (i < positions.length) {
     dot.targetX = positions[i].x;
     dot.targetY = positions[i].y;
     if (positions[i].genderType) {
       dot.genderType = positions[i].genderType;
     }
   }
 });


 // Animate dots
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .transition()
   .duration(duration)
   .ease(d3.easeCubicInOut)
   .attr('cx', d => d.targetX)
   .attr('cy', d => d.targetY)
   .attr('opacity', d => d.opacity)
   .on('end', function(d, i) {
     if (i === 0) {
       state.dots.forEach((dot) => {
         dot.x = dot.targetX;
         dot.y = dot.targetY;
       });
       state.animating = false;
       // Brief delay for labels to appear
       if (showLabels) {
         setTimeout(() => {
           unlockInteractions();
           if (onComplete) onComplete();
         }, 400);
       } else {
         unlockInteractions();
         if (onComplete) onComplete();
       }
     }
   });


 // Update labels
 if (showLabels && clusterInfo.length > 0) {
   renderGenderLabels(clusterInfo);
 } else if (showLabels) {
   // Calculate total first-year students
   const totalFirstYear = brownData.students.byGender.men.byClass.firstYear +
                         brownData.students.byGender.women.byClass.firstYear +
                         brownData.students.byGender.nonBinary.byClass.firstYear;
   renderSingleLabel('First-Year Students by Gender', `${totalFirstYear.toLocaleString()} students (Class of 2028)`);
 } else {
   labelsGroup.selectAll('.cluster-label, .cluster-count').remove();
 }
}


function renderGenderLabels(clusterInfo, duration = 300) {
 // Interrupt any ongoing transitions and remove old labels immediately
 labelsGroup.selectAll('.cluster-label, .cluster-count')
   .interrupt()
   .remove();


 clusterInfo.forEach(cluster => {
   const clusterRadius = Math.sqrt(cluster.count) * 2.5;


   labelsGroup.append('text')
     .attr('class', 'cluster-label')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 30)
     .text(cluster.name)
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);


   labelsGroup.append('text')
     .attr('class', 'cluster-count')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 10)
     .text(`${cluster.enrolled.toLocaleString()} enrolled`)
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);
 });
}


// ============================================
// Faculty Dot Generation Functions
// ============================================


function generateFacultyDotsForDepartment() {
 // Generate dots for faculty - all same color (faculty orange)
 const dots = [];
 const departments = brownData.faculty.byDepartment;

 departments.forEach(dept => {
   for (let i = 0; i < dept.count; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: colors.faculty,
       departmentName: dept.name,
       metadata: {
         count: dept.count,
         assistantProf: dept.assistantProf,
         associateProf: dept.associateProf,
         fullProf: dept.fullProf
       }
     });
   }
 });

 return dots;
}


function generateFacultyDotsWithGender() {
 // Generate dots for faculty colored by gender, organized by rank
 const dots = [];
 const rankData = brownData.faculty.byRank;
 const ranks = ['assistantProf', 'associateProf', 'fullProf'];
 const rankNames = {
   assistantProf: 'Assistant Professor',
   associateProf: 'Associate Professor',
   fullProf: 'Full Professor'
 };

 ranks.forEach(rankKey => {
   const data = rankData[rankKey];

   // Add men dots
   for (let i = 0; i < data.men; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: colors.men,
       genderType: 'men',
       rankKey: rankKey,
       rankName: rankNames[rankKey],
       metadata: {
         total: data.total,
         men: data.men,
         women: data.women
       }
     });
   }

   // Add women dots
   for (let i = 0; i < data.women; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: colors.women,
       genderType: 'women',
       rankKey: rankKey,
       rankName: rankNames[rankKey],
       metadata: {
         total: data.total,
         men: data.men,
         women: data.women
       }
     });
   }
 });

 return dots;
}


function getFacultyDotPositionsSingle() {
 // Calculate positions for single cluster at center
 const totalFaculty = brownData.faculty.total;
 const positions = [];
 const clusterRadius = Math.sqrt(totalFaculty) * 2.5;

 for (let i = 0; i < totalFaculty; i++) {
   const angle = Math.random() * 2 * Math.PI;
   const radius = Math.random() * clusterRadius;

   positions.push({
     x: state.width / 2 + Math.cos(angle) * radius,
     y: state.height / 2 + Math.sin(angle) * radius
   });
 }

 return positions;
}


function getFacultyDotPositionsByDepartment() {
 // Calculate positions for department clusters
 const departments = brownData.faculty.byDepartment;
 const numDepts = departments.length;

 const cols = 4;
 const rows = Math.ceil(numDepts / cols);
 const marginX = state.width * 0.14;
 const marginY = state.height * 0.2;
 const spacingX = (state.width - 2 * marginX) / (cols - 1);
 const spacingY = (state.height - 2 * marginY) / (rows - 1);

 const positions = [];
 const clusterInfo = [];

 departments.forEach((dept, i) => {
   const col = i % cols;
   const row = Math.floor(i / cols);
   const centerX = marginX + col * spacingX;
   const centerY = marginY + row * spacingY;

   const clusterRadius = Math.sqrt(dept.count) * 2.5;

   clusterInfo.push({
     name: dept.name,
     x: centerX,
     y: centerY,
     count: dept.count,
     assistantProf: dept.assistantProf,
     associateProf: dept.associateProf,
     fullProf: dept.fullProf
   });

   for (let j = 0; j < dept.count; j++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * clusterRadius;

     positions.push({
       x: centerX + Math.cos(angle) * radius,
       y: centerY + Math.sin(angle) * radius,
       departmentName: dept.name
     });
   }
 });

 return { positions, clusterInfo };
}


function getFacultyDotPositionsByRank() {
 // Calculate positions for rank clusters (3 clusters: Assistant, Associate, Full)
 const rankData = brownData.faculty.byRank;
 const ranks = ['assistantProf', 'associateProf', 'fullProf'];
 const rankNames = {
   assistantProf: 'Assistant Professor',
   associateProf: 'Associate Professor',
   fullProf: 'Full Professor'
 };

 const positions = [];
 const clusterInfo = [];

 ranks.forEach((rankKey, idx) => {
   const data = rankData[rankKey];
   const totalInCluster = data.total;

   // Position clusters horizontally
   const x = state.width * (0.2 + idx * 0.3);
   const y = state.height / 2;

   const clusterRadius = Math.sqrt(totalInCluster) * 2.5;

   clusterInfo.push({
     name: rankNames[rankKey],
     rankKey: rankKey,
     x: x,
     y: y,
     count: totalInCluster,
     men: data.men,
     women: data.women
   });

   // Generate positions for men
   for (let j = 0; j < data.men; j++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * clusterRadius;

     positions.push({
       x: x + Math.cos(angle) * radius,
       y: y + Math.sin(angle) * radius,
       rankKey: rankKey,
       genderType: 'men'
     });
   }

   // Generate positions for women
   for (let j = 0; j < data.women; j++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * clusterRadius;

     positions.push({
       x: x + Math.cos(angle) * radius,
       y: y + Math.sin(angle) * radius,
       rankKey: rankKey,
       genderType: 'women'
     });
   }
 });

 return { positions, clusterInfo };
}


function renderFacultyScene(positions, options = {}) {
 if (state.animating) return;
 state.animating = true;
 lockInteractions();

 const { duration = 1200, showLabels = false, clusterInfo = [], onComplete } = options;

 // Update each dot's target position
 state.dots.forEach((dot, i) => {
   if (i < positions.length) {
     dot.targetX = positions[i].x;
     dot.targetY = positions[i].y;
     if (positions[i].departmentName) {
       dot.departmentName = positions[i].departmentName;
     }
     if (positions[i].rankKey) {
       dot.rankKey = positions[i].rankKey;
     }
   }
 });

 // Animate dots
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .transition()
   .duration(duration)
   .ease(d3.easeCubicInOut)
   .attr('cx', d => d.targetX)
   .attr('cy', d => d.targetY)
   .attr('opacity', 0.9)
   .on('end', function(_, i) {
     if (i === 0) {
       state.dots.forEach((dot) => {
         dot.x = dot.targetX;
         dot.y = dot.targetY;
       });
       state.animating = false;
       // Brief delay for labels to appear
       if (showLabels) {
         setTimeout(() => {
           unlockInteractions();
           if (onComplete) onComplete();
         }, 400);
       } else {
         unlockInteractions();
         if (onComplete) onComplete();
       }
     }
   });

 // Update labels
 if (showLabels && clusterInfo.length > 0) {
   renderFacultyLabels(clusterInfo);
 } else if (showLabels) {
   renderSingleLabel('Brown Faculty 2024', `${brownData.faculty.total.toLocaleString()} faculty members`);
 } else {
   labelsGroup.selectAll('.cluster-label, .cluster-count').remove();
 }
}


function renderFacultyLabels(clusterInfo, duration = 300) {
 // Interrupt any ongoing transitions and remove old labels immediately
 labelsGroup.selectAll('.cluster-label, .cluster-count')
   .interrupt()
   .remove();

 clusterInfo.forEach(cluster => {
   const clusterRadius = Math.sqrt(cluster.count) * 2.5;

   labelsGroup.append('text')
     .attr('class', 'cluster-label')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 20)
     .text(cluster.name)
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);

   // Add count below label
   labelsGroup.append('text')
     .attr('class', 'cluster-count')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 5)
     .text(`${cluster.count}`)
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);
 });
}


// ============================================
// Staff Dot Generation Functions
// ============================================


function generateStaffDots() {
 // Generate dots for staff - all same color (staff green)
 const dots = [];
 const divisions = brownData.staff.byDivision;

 divisions.forEach(div => {
   for (let i = 0; i < div.count; i++) {
     dots.push({
       x: state.width / 2,
       y: state.height / 2,
       targetX: state.width / 2,
       targetY: state.height / 2,
       color: colors.staff,
       divisionName: div.name,
       metadata: {
         count: div.count,
         subDepts: div.subDepts
       }
     });
   }
 });

 return dots;
}


function getStaffDotPositionsSingle() {
 // Calculate positions for single cluster at center
 const totalStaff = brownData.staff.total;
 const positions = [];
 const clusterRadius = Math.sqrt(totalStaff) * 2.5;

 for (let i = 0; i < totalStaff; i++) {
   const angle = Math.random() * 2 * Math.PI;
   const radius = Math.random() * clusterRadius;

   positions.push({
     x: state.width / 2 + Math.cos(angle) * radius,
     y: state.height / 2 + Math.sin(angle) * radius
   });
 }

 return positions;
}


function getStaffDotPositionsByDivision() {
 // Calculate positions for division clusters
 const divisions = brownData.staff.byDivision;
 const numDivs = divisions.length;

 const cols = 3;
 const rows = Math.ceil(numDivs / cols);
 const marginX = state.width * 0.15;
 const marginY = state.height * 0.2;
 const spacingX = (state.width - 2 * marginX) / (cols - 1);
 const spacingY = (state.height - 2 * marginY) / (rows - 1);

 const positions = [];
 const clusterInfo = [];

 divisions.forEach((div, i) => {
   const col = i % cols;
   const row = Math.floor(i / cols);
   const centerX = marginX + col * spacingX;
   const centerY = marginY + row * spacingY;

   const clusterRadius = Math.sqrt(div.count) * 2.5;

   clusterInfo.push({
     name: div.name,
     x: centerX,
     y: centerY,
     count: div.count,
     subDepts: div.subDepts
   });

   for (let j = 0; j < div.count; j++) {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * clusterRadius;

     positions.push({
       x: centerX + Math.cos(angle) * radius,
       y: centerY + Math.sin(angle) * radius,
       divisionName: div.name
     });
   }
 });

 return { positions, clusterInfo };
}


function renderStaffScene(positions, options = {}) {
 if (state.animating) return;
 state.animating = true;
 lockInteractions();

 const { duration = 1200, showLabels = false, clusterInfo = [], onComplete } = options;

 // Update each dot's target position
 state.dots.forEach((dot, i) => {
   if (i < positions.length) {
     dot.targetX = positions[i].x;
     dot.targetY = positions[i].y;
     if (positions[i].divisionName) {
       dot.divisionName = positions[i].divisionName;
     }
   }
 });

 // Animate dots
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .transition()
   .duration(duration)
   .ease(d3.easeCubicInOut)
   .attr('cx', d => d.targetX)
   .attr('cy', d => d.targetY)
   .attr('opacity', 0.9)
   .on('end', function(_, i) {
     if (i === 0) {
       state.dots.forEach((dot) => {
         dot.x = dot.targetX;
         dot.y = dot.targetY;
       });
       state.animating = false;
       // Brief delay for labels to appear
       if (showLabels) {
         setTimeout(() => {
           unlockInteractions();
           if (onComplete) onComplete();
         }, 400);
       } else {
         unlockInteractions();
         if (onComplete) onComplete();
       }
     }
   });

 // Update labels
 if (showLabels && clusterInfo.length > 0) {
   renderStaffLabels(clusterInfo);
 } else if (showLabels) {
   renderSingleLabel('Brown Staff 2024', `${brownData.staff.total.toLocaleString()} staff members`);
 } else {
   labelsGroup.selectAll('.cluster-label, .cluster-count').remove();
 }
}


function renderStaffLabels(clusterInfo, duration = 300) {
 // Interrupt any ongoing transitions and remove old labels immediately
 labelsGroup.selectAll('.cluster-label, .cluster-count')
   .interrupt()
   .remove();

 clusterInfo.forEach(cluster => {
   const clusterRadius = Math.sqrt(cluster.count) * 2.5;

   labelsGroup.append('text')
     .attr('class', 'cluster-label')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 20)
     .text(cluster.name)
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);

   // Add count below label
   labelsGroup.append('text')
     .attr('class', 'cluster-count')
     .attr('x', cluster.x)
     .attr('y', cluster.y - clusterRadius - 5)
     .text(`${cluster.count.toLocaleString()}`)
     .style('opacity', 0)
     .transition()
     .duration(duration)
     .style('opacity', 1);
 });
}


function transitionToScene2A2() {
 if (state.animating) return;
 state.currentScene = 'scene2A2';
 lockInteractions();


 // Hide buttons
 buttonContainer.style.opacity = '0';
 buttonContainer.style.pointerEvents = 'none';


 // Update legend for gender with enrolled/admitted/applicants legend
 legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.men};"></div>
     <span>Men (enrolled)</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.women};"></div>
     <span>Women (enrolled)</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.nonBinary};"></div>
     <span>Non-binary (enrolled)</span>
   </div>
   <div class="legend-item" style="margin-top: 12px; border-top: 1px solid #e0e0e0; padding-top: 12px;">
     <div class="legend-dot" style="background: #999; opacity: 0.25;"></div>
     <span>Admitted (did not enroll)</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: #f0f0f0; border: 2px dotted #999; opacity: 0.6;"></div>
     <span>Total applicants (not admitted)</span>
   </div>
 `;


 // Update slider label
 document.getElementById('slider-label').textContent = 'Separate by Gender →';


 // Regenerate dots with gender colors for all students
 state.dots = generateDotsWithGenderTypes();


 // Remove all existing circles and recreate with new data
 dotsGroup.selectAll('circle').remove();


 dotsGroup.selectAll('circle')
   .data(state.dots)
   .join('circle')
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('r', 3)
   .attr('fill', d => d.color)
   .attr('opacity', 0)
   .transition()
   .duration(800)
   .attr('opacity', d => d.opacity);


 // Position dots in single cluster
 const positions = getGenderDotPositionsSingle();
 renderGenderScene(positions, {
   duration: 800,
   showLabels: true,
   onComplete: () => {
     // Show slider
     sliderContainer.classList.add('visible');
     clusterSlider.value = 0;
     currentSliderState = 'single';
   }
 });
}


// ============================================
// Scene 2B: Faculty View
// ============================================


function transitionToScene2B() {
 if (state.animating) return;
 state.currentScene = 'scene2B';
 lockInteractions();

 // Remove hover areas from previous scene
 svg.selectAll('.cluster-hover-area').remove();

 // Clear labels from previous scene
 labelsGroup.selectAll('.cluster-label, .cluster-count').remove();

 // Hide click instruction
 clickInstruction.classList.remove('visible');

 // Show back button
 backButton.classList.add('visible');
 backButton.onclick = () => {
   // Hide slider and faculty buttons when going back
   sliderContainer.classList.remove('visible');
   facultyButtonContainer.style.opacity = '0';
   facultyButtonContainer.style.pointerEvents = 'none';

   // Regenerate all dots when going back
   const config = getScene0Config();
   state.dots = generateDots(config);

   // Remove all existing circles
   dotsGroup.selectAll('circle').remove();

   // Create new circles
   dotsGroup.selectAll('circle')
     .data(state.dots)
     .join('circle')
     .attr('cx', d => d.x)
     .attr('cy', d => d.y)
     .attr('r', 3)
     .attr('fill', d => d.color)
     .attr('opacity', 0.9);

   // Reset legend to show all three roles
   legend.innerHTML = `
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.students};"></div>
       <span>Students</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.faculty};"></div>
       <span>Faculty</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.staff};"></div>
       <span>Staff</span>
     </div>
   `;

   transitionToScene1();
 };

 // Update legend to show only faculty
 legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.faculty};"></div>
     <span>Faculty</span>
   </div>
 `;

 // Keep only faculty dots (they come after students in the dot array)
 const studentCount = brownData.students.total;
 const facultyCount = brownData.faculty.total;
 state.dots = state.dots.slice(studentCount, studentCount + facultyCount);

 // Remove excess circles from DOM
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .exit()
   .transition()
   .duration(600)
   .attr('opacity', 0)
   .remove();

 // Update remaining dots to move to center
 const config = getScene2BConfig();
 renderScene(config, {
   duration: 800,
   showLabels: false,
   onComplete: () => {
     // Show faculty buttons
     facultyButtonContainer.style.opacity = '1';
     facultyButtonContainer.style.pointerEvents = 'auto';
   }
 });
}


function transitionToScene2B1() {
 if (state.animating) return;
 state.currentScene = 'scene2B1';
 lockInteractions();

 // Hide faculty buttons
 facultyButtonContainer.style.opacity = '0';
 facultyButtonContainer.style.pointerEvents = 'none';

 // Update legend for faculty (single color)
 legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.faculty};"></div>
     <span>Faculty</span>
   </div>
 `;

 // Update slider label
 document.getElementById('slider-label').textContent = 'Cluster by Department →';

 // Regenerate dots for departments (all same color)
 state.dots = generateFacultyDotsForDepartment();

 // Remove all existing circles and recreate with new data
 dotsGroup.selectAll('circle').remove();

 dotsGroup.selectAll('circle')
   .data(state.dots)
   .join('circle')
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('r', 3)
   .attr('fill', d => d.color)
   .attr('opacity', 0)
   .transition()
   .duration(800)
   .attr('opacity', 0.9);

 // Position dots in single cluster
 const positions = getFacultyDotPositionsSingle();
 renderFacultyScene(positions, {
   duration: 800,
   showLabels: true,
   onComplete: () => {
     // Show slider
     sliderContainer.classList.add('visible');
     clusterSlider.value = 0;
     currentSliderState = 'single';
   }
 });
}


function transitionToScene2B2() {
 if (state.animating) return;
 state.currentScene = 'scene2B2';
 lockInteractions();

 // Hide faculty buttons
 facultyButtonContainer.style.opacity = '0';
 facultyButtonContainer.style.pointerEvents = 'none';

 // Update legend for gender
 legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.men};"></div>
     <span>Men</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.women};"></div>
     <span>Women</span>
   </div>
 `;

 // Update slider label
 document.getElementById('slider-label').textContent = 'Cluster by Rank →';

 // Regenerate dots with gender colors
 state.dots = generateFacultyDotsWithGender();

 // Remove all existing circles and recreate with new data
 dotsGroup.selectAll('circle').remove();

 dotsGroup.selectAll('circle')
   .data(state.dots)
   .join('circle')
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('r', 3)
   .attr('fill', d => d.color)
   .attr('opacity', 0)
   .transition()
   .duration(800)
   .attr('opacity', 0.9);

 // Position dots in single cluster
 const positions = getFacultyDotPositionsSingle();
 renderFacultyScene(positions, {
   duration: 800,
   showLabels: true,
   onComplete: () => {
     // Show slider
     sliderContainer.classList.add('visible');
     clusterSlider.value = 0;
     currentSliderState = 'single';
   }
 });
}


// ============================================
// Scene 2C: Staff View
// ============================================


function transitionToScene2C() {
 if (state.animating) return;
 state.currentScene = 'scene2C';
 lockInteractions();

 // Remove hover areas from previous scene
 svg.selectAll('.cluster-hover-area').remove();

 // Clear labels from previous scene
 labelsGroup.selectAll('.cluster-label, .cluster-count').remove();

 // Hide click instruction
 clickInstruction.classList.remove('visible');

 // Show back button
 backButton.classList.add('visible');
 backButton.onclick = () => {
   // Hide slider when going back
   sliderContainer.classList.remove('visible');

   // Regenerate all dots when going back
   const config = getScene0Config();
   state.dots = generateDots(config);

   // Remove all existing circles
   dotsGroup.selectAll('circle').remove();

   // Create new circles
   dotsGroup.selectAll('circle')
     .data(state.dots)
     .join('circle')
     .attr('cx', d => d.x)
     .attr('cy', d => d.y)
     .attr('r', 3)
     .attr('fill', d => d.color)
     .attr('opacity', 0.9);

   // Reset legend to show all three roles
   legend.innerHTML = `
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.students};"></div>
       <span>Students</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.faculty};"></div>
       <span>Faculty</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.staff};"></div>
       <span>Staff</span>
     </div>
   `;

   transitionToScene1();
 };

 // Update legend to show only staff
 legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.staff};"></div>
     <span>Staff</span>
   </div>
 `;

 // Update slider label
 document.getElementById('slider-label').textContent = 'Cluster by Division →';

 // Keep only staff dots (they come after students and faculty in the dot array)
 const studentCount = brownData.students.total;
 const facultyCount = brownData.faculty.total;
 state.dots = state.dots.slice(studentCount + facultyCount);

 // Remove excess circles from DOM
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .exit()
   .transition()
   .duration(600)
   .attr('opacity', 0)
   .remove();

 // Regenerate dots for staff
 state.dots = generateStaffDots();

 // Remove all existing circles and recreate with new data
 dotsGroup.selectAll('circle').remove();

 dotsGroup.selectAll('circle')
   .data(state.dots)
   .join('circle')
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('r', 3)
   .attr('fill', d => d.color)
   .attr('opacity', 0)
   .transition()
   .duration(800)
   .attr('opacity', 0.9);

 // Position dots in single cluster
 const positions = getStaffDotPositionsSingle();
 renderStaffScene(positions, {
   duration: 800,
   showLabels: true,
   onComplete: () => {
     // Show slider directly (no buttons for staff)
     sliderContainer.classList.add('visible');
     clusterSlider.value = 0;
     currentSliderState = 'single';
   }
 });
}


// ============================================
// Cluster Clicking
// ============================================


function enableClusterClicking(clusters) {
 // Remove any existing hover areas
 svg.selectAll('.cluster-hover-area').remove();


 // Create invisible hover areas for each cluster
 clusters.forEach(cluster => {
   const radius = Math.sqrt(cluster.count) * 2.5 + 50;


   const hoverArea = svg.append('circle')
     .attr('class', 'cluster-hover-area')
     .attr('cx', cluster.x)
     .attr('cy', cluster.y)
     .attr('r', radius)
     .attr('fill', 'transparent')
     .attr('cursor', 'pointer')
     .on('mouseenter', function() {
       // Pulse effect
       d3.select(this)
         .transition()
         .duration(300)
         .attr('fill', 'rgba(0,0,0,0.05)');


       // Bold the label
       labelsGroup.selectAll('.cluster-label')
         .filter(function() {
           return d3.select(this).text() === cluster.label.split('\n')[0];
         })
         .transition()
         .duration(200)
         .style('font-weight', '700');
     })
     .on('mouseleave', function() {
       d3.select(this)
         .transition()
         .duration(300)
         .attr('fill', 'transparent');


       labelsGroup.selectAll('.cluster-label')
         .transition()
         .duration(200)
         .style('font-weight', '600');
     })
     .on('click', function() {
       if (cluster.name === 'Students') {
         transitionToScene2A();
       } else if (cluster.name === 'Faculty') {
         transitionToScene2B();
       } else if (cluster.name === 'Staff') {
         transitionToScene2C();
       }
     });
 });
}


// ============================================
// Slider Interaction
// ============================================


let sliderAnimating = false;
let currentSliderState = 'single'; // 'single' or 'clustered'


clusterSlider.addEventListener('input', function(e) {
 if (sliderAnimating || state.animating) return;

 // Check if we're in a valid scene for slider interaction
 const validScenes = ['scene2A1', 'scene2A2', 'scene2B1', 'scene2B2', 'scene2C'];
 if (!validScenes.includes(state.currentScene)) return;


 const value = parseFloat(e.target.value);


 if (state.currentScene === 'scene2A1') {
   // Concentration view slider
   if (value < 0.5 && currentSliderState === 'clustered') {
     // Transition to single cluster
     sliderAnimating = true;
     currentSliderState = 'single';
     lockInteractions();


     const positions = getSeniorDotPositionsSingle();
     renderSeniorScene(positions, {
       duration: 800,
       showLabels: true,
       onComplete: () => {
         sliderAnimating = false;
         svg.selectAll('.cluster-hover-area').remove();
       }
     });
   } else if (value >= 0.5 && currentSliderState === 'single') {
     // Transition to clustered
     sliderAnimating = true;
     currentSliderState = 'clustered';
     lockInteractions();


     const { positions, clusterInfo } = getSeniorDotPositionsClustered();
     renderSeniorScene(positions, {
       duration: 1200,
       showLabels: true,
       clusterInfo: clusterInfo,
       onComplete: () => {
         sliderAnimating = false;
         enableConcentrationClicking(clusterInfo);
       }
     });
   }
 } else if (state.currentScene === 'scene2A2') {
   // Gender view slider
   if (value < 0.5 && currentSliderState === 'clustered') {
     // Transition to single cluster
     sliderAnimating = true;
     currentSliderState = 'single';
     lockInteractions();


     const positions = getGenderDotPositionsSingle();


     // Hide background circles when in single cluster mode
     renderBackgroundCircles([], { duration: 800, show: false });


     renderGenderScene(positions, {
       duration: 800,
       showLabels: true,
       onComplete: () => {
         sliderAnimating = false;
         svg.selectAll('.cluster-hover-area').remove();
       }
     });
   } else if (value >= 0.5 && currentSliderState === 'single') {
     // Transition to clustered
     sliderAnimating = true;
     currentSliderState = 'clustered';
     lockInteractions();


     const { positions, clusterInfo } = getGenderDotPositionsClustered();


     // Show background circles when clustering
     renderBackgroundCircles(clusterInfo, { duration: 1200, show: true });


     renderGenderScene(positions, {
       duration: 1200,
       showLabels: true,
       clusterInfo: clusterInfo,
       onComplete: () => {
         sliderAnimating = false;
         enableGenderClicking(clusterInfo);
       }
     });
   }
 } else if (state.currentScene === 'scene2B1') {
   // Faculty department view slider
   if (value < 0.5 && currentSliderState === 'clustered') {
     // Transition to single cluster
     sliderAnimating = true;
     currentSliderState = 'single';
     lockInteractions();

     const positions = getFacultyDotPositionsSingle();
     renderFacultyScene(positions, {
       duration: 800,
       showLabels: true,
       onComplete: () => {
         sliderAnimating = false;
         svg.selectAll('.cluster-hover-area').remove();
       }
     });
   } else if (value >= 0.5 && currentSliderState === 'single') {
     // Transition to clustered by department
     sliderAnimating = true;
     currentSliderState = 'clustered';
     lockInteractions();

     const { positions, clusterInfo } = getFacultyDotPositionsByDepartment();
     renderFacultyScene(positions, {
       duration: 1200,
       showLabels: true,
       clusterInfo: clusterInfo,
       onComplete: () => {
         sliderAnimating = false;
         enableDepartmentClicking(clusterInfo);
       }
     });
   }
 } else if (state.currentScene === 'scene2B2') {
   // Faculty rank view slider
   if (value < 0.5 && currentSliderState === 'clustered') {
     // Transition to single cluster
     sliderAnimating = true;
     currentSliderState = 'single';
     lockInteractions();

     const positions = getFacultyDotPositionsSingle();
     renderFacultyScene(positions, {
       duration: 800,
       showLabels: true,
       onComplete: () => {
         sliderAnimating = false;
         svg.selectAll('.cluster-hover-area').remove();
       }
     });
   } else if (value >= 0.5 && currentSliderState === 'single') {
     // Transition to clustered by rank
     sliderAnimating = true;
     currentSliderState = 'clustered';
     lockInteractions();

     const { positions, clusterInfo } = getFacultyDotPositionsByRank();
     renderFacultyScene(positions, {
       duration: 1200,
       showLabels: true,
       clusterInfo: clusterInfo,
       onComplete: () => {
         sliderAnimating = false;
         enableRankClicking(clusterInfo);
       }
     });
   }
 } else if (state.currentScene === 'scene2C') {
   // Staff division view slider
   if (value < 0.5 && currentSliderState === 'clustered') {
     // Transition to single cluster
     sliderAnimating = true;
     currentSliderState = 'single';
     lockInteractions();

     const positions = getStaffDotPositionsSingle();
     renderStaffScene(positions, {
       duration: 800,
       showLabels: true,
       onComplete: () => {
         sliderAnimating = false;
         svg.selectAll('.cluster-hover-area').remove();
       }
     });
   } else if (value >= 0.5 && currentSliderState === 'single') {
     // Transition to clustered by division
     sliderAnimating = true;
     currentSliderState = 'clustered';
     lockInteractions();

     const { positions, clusterInfo } = getStaffDotPositionsByDivision();
     renderStaffScene(positions, {
       duration: 1200,
       showLabels: true,
       clusterInfo: clusterInfo,
       onComplete: () => {
         sliderAnimating = false;
         enableDivisionClicking(clusterInfo);
       }
     });
   }
 }
});


// Snap slider on release
clusterSlider.addEventListener('change', function(e) {
 const value = parseFloat(e.target.value);
 e.target.value = value < 0.5 ? 0 : 1;
});


// ============================================
// Concentration Clicking
// ============================================


function enableConcentrationClicking(clusterInfo) {
 // Remove existing hover areas
 svg.selectAll('.cluster-hover-area').remove();


 clusterInfo.forEach(cluster => {
   const radius = Math.sqrt(cluster.count) * 2.5 + 20;


   const hoverArea = svg.append('circle')
     .attr('class', 'cluster-hover-area')
     .attr('cx', cluster.x)
     .attr('cy', cluster.y)
     .attr('r', radius)
     .attr('fill', 'transparent')
     .attr('cursor', 'pointer')
     .on('mouseenter', function() {
       // Highlight this cluster
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', d => d.concentrationName === cluster.name ? 1 : 0.3);


       // Bold label
       labelsGroup.selectAll('.cluster-label')
         .filter(function() {
           return d3.select(this).text() === cluster.name;
         })
         .transition()
         .duration(200)
         .style('font-weight', '700')
         .style('font-size', '20px');
     })
     .on('mouseleave', function() {
       // Reset opacity
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', 0.9);


       // Reset label
       labelsGroup.selectAll('.cluster-label')
         .transition()
         .duration(200)
         .style('font-weight', '600')
         .style('font-size', '18px');
     })
     .on('click', function() {
       showConcentrationPopup(cluster);
     });
 });
}


// ============================================
// Gender Clicking
// ============================================


function enableGenderClicking(clusterInfo) {
 // Remove existing hover areas
 svg.selectAll('.cluster-hover-area').remove();


 clusterInfo.forEach(cluster => {
   const radius = Math.sqrt(cluster.count) * 2.5 + 20;


   svg.append('circle')
     .attr('class', 'cluster-hover-area')
     .attr('cx', cluster.x)
     .attr('cy', cluster.y)
     .attr('r', radius)
     .attr('fill', 'transparent')
     .attr('cursor', 'pointer')
     .on('mouseenter', function() {
       // Highlight this cluster
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', d => d.genderType === cluster.genderKey ? d.opacity : d.opacity * 0.3);


       // Bold label
       labelsGroup.selectAll('.cluster-label')
         .filter(function() {
           return d3.select(this).text() === cluster.name;
         })
         .transition()
         .duration(200)
         .style('font-weight', '700')
         .style('font-size', '20px');
     })
     .on('mouseleave', function() {
       // Reset opacity
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', d => d.opacity);


       // Reset label
       labelsGroup.selectAll('.cluster-label')
         .transition()
         .duration(200)
         .style('font-weight', '600')
         .style('font-size', '18px');
     })
     .on('click', function() {
       showGenderPopup(cluster);
     });
 });
}


// ============================================
// Faculty Department Clicking
// ============================================


function enableDepartmentClicking(clusterInfo) {
 // Remove existing hover areas
 svg.selectAll('.cluster-hover-area').remove();

 clusterInfo.forEach(cluster => {
   const radius = Math.sqrt(cluster.count) * 2.5 + 20;

   svg.append('circle')
     .attr('class', 'cluster-hover-area')
     .attr('cx', cluster.x)
     .attr('cy', cluster.y)
     .attr('r', radius)
     .attr('fill', 'transparent')
     .attr('cursor', 'pointer')
     .on('mouseenter', function() {
       // Highlight this cluster
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', d => d.departmentName === cluster.name ? 1 : 0.3);

       // Bold label
       labelsGroup.selectAll('.cluster-label')
         .filter(function() {
           return d3.select(this).text() === cluster.name;
         })
         .transition()
         .duration(200)
         .style('font-weight', '700')
         .style('font-size', '20px');
     })
     .on('mouseleave', function() {
       // Reset opacity
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', 0.9);

       // Reset label
       labelsGroup.selectAll('.cluster-label')
         .transition()
         .duration(200)
         .style('font-weight', '600')
         .style('font-size', '18px');
     })
     .on('click', function() {
       showDepartmentPopup(cluster);
     });
 });
}


// ============================================
// Faculty Rank Clicking
// ============================================


function enableRankClicking(clusterInfo) {
 // Remove existing hover areas
 svg.selectAll('.cluster-hover-area').remove();

 clusterInfo.forEach(cluster => {
   const radius = Math.sqrt(cluster.count) * 2.5 + 20;

   svg.append('circle')
     .attr('class', 'cluster-hover-area')
     .attr('cx', cluster.x)
     .attr('cy', cluster.y)
     .attr('r', radius)
     .attr('fill', 'transparent')
     .attr('cursor', 'pointer')
     .on('mouseenter', function() {
       // Highlight this cluster
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', d => d.rankKey === cluster.rankKey ? 1 : 0.3);

       // Bold label
       labelsGroup.selectAll('.cluster-label')
         .filter(function() {
           return d3.select(this).text() === cluster.name;
         })
         .transition()
         .duration(200)
         .style('font-weight', '700')
         .style('font-size', '20px');
     })
     .on('mouseleave', function() {
       // Reset opacity
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', 0.9);

       // Reset label
       labelsGroup.selectAll('.cluster-label')
         .transition()
         .duration(200)
         .style('font-weight', '600')
         .style('font-size', '18px');
     })
     .on('click', function() {
       showRankPopup(cluster);
     });
 });
}


// ============================================
// Staff Division Clicking
// ============================================


function enableDivisionClicking(clusterInfo) {
 // Remove existing hover areas
 svg.selectAll('.cluster-hover-area').remove();

 clusterInfo.forEach(cluster => {
   const radius = Math.sqrt(cluster.count) * 2.5 + 20;

   svg.append('circle')
     .attr('class', 'cluster-hover-area')
     .attr('cx', cluster.x)
     .attr('cy', cluster.y)
     .attr('r', radius)
     .attr('fill', 'transparent')
     .attr('cursor', 'pointer')
     .on('mouseenter', function() {
       // Highlight this cluster
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', d => d.divisionName === cluster.name ? 1 : 0.3);

       // Bold label
       labelsGroup.selectAll('.cluster-label')
         .filter(function() {
           return d3.select(this).text() === cluster.name;
         })
         .transition()
         .duration(200)
         .style('font-weight', '700')
         .style('font-size', '20px');
     })
     .on('mouseleave', function() {
       // Reset opacity
       dotsGroup.selectAll('circle')
         .transition()
         .duration(200)
         .attr('opacity', 0.9);

       // Reset label
       labelsGroup.selectAll('.cluster-label')
         .transition()
         .duration(200)
         .style('font-weight', '600')
         .style('font-size', '18px');
     })
     .on('click', function() {
       showDivisionPopup(cluster);
     });
 });
}


// ============================================
// Popup Modal
// ============================================


function showConcentrationPopup(cluster) {
 const { bachelors = 0, masters = 0, topCombinations = [] } = cluster;
 const total = bachelors + masters;
 const bachelorsPercent = total > 0 ? (bachelors / total * 100).toFixed(1) : 0;
 const mastersPercent = total > 0 ? (masters / total * 100).toFixed(1) : 0;


 const content = `
   <h2>${cluster.name}</h2>
   <div class="popup-subtitle">Class of 2024</div>


   <div class="popup-stat">
     <div class="popup-stat-label">Total Students</div>
     <div class="popup-stat-value">${total}</div>
   </div>


   ${bachelors > 0 ? `
   <div class="popup-stat">
     <div class="popup-stat-label">Bachelor's: ${bachelors} (${bachelorsPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${bachelorsPercent}%; background: ${colors.bachelors};"></div>
     </div>
   </div>
   ` : ''}


   ${masters > 0 ? `
   <div class="popup-stat">
     <div class="popup-stat-label">Master's: ${masters} (${mastersPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${mastersPercent}%; background: ${colors.masters};"></div>
     </div>
   </div>
   ` : ''}

 `;


 document.getElementById('popup-content').innerHTML = content;
 popupOverlay.classList.add('visible');
 popupModal.classList.add('visible');


 // Animate bars
 setTimeout(() => {
   document.querySelectorAll('.popup-bar-fill').forEach(bar => {
     bar.style.width = bar.style.width;
   });
 }, 50);
}


function showGenderPopup(cluster) {
 const { enrolled = 0, admitted = 0, acceptanceRate = 0, yieldRate = 0, byClass = {} } = cluster;
 const enrolledPercent = ((enrolled / brownData.students.total) * 100).toFixed(1);
 const admittedPercent = ((admitted / (brownData.students.byGender.men.admitted + brownData.students.byGender.women.admitted + brownData.students.byGender.nonBinary.admitted)) * 100).toFixed(1);


 const content = `
   <h2>${cluster.name} Students</h2>
   <div class="popup-subtitle">All Classes (2024)</div>


   <div class="popup-stat">
     <div class="popup-stat-label">Enrolled: ${enrolled.toLocaleString()} (${enrolledPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${enrolledPercent}%; background: ${colors[cluster.genderKey]};"></div>
     </div>
   </div>


   <div class="popup-stat">
     <div class="popup-stat-label">Admitted: ${admitted.toLocaleString()} (${admittedPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${admittedPercent}%; background: ${colors[cluster.genderKey]}; opacity: 0.5;"></div>
     </div>
   </div>


   <div class="popup-stat">
     <div class="popup-stat-label">Acceptance Rate</div>
     <div class="popup-stat-value">${acceptanceRate.toFixed(1)}%</div>
   </div>


   <div class="popup-stat">
     <div class="popup-stat-label">Yield Rate</div>
     <div class="popup-stat-value">${yieldRate.toFixed(1)}%</div>
   </div>


   ${byClass && Object.keys(byClass).length > 0 ? `
   <div class="popup-stat">
     <div class="popup-stat-label">Breakdown by Class</div>
     <ul class="popup-list">
       <li>First-year: ${byClass.firstYear || 0}</li>
       <li>Sophomore: ${byClass.sophomore || 0}</li>
       <li>Junior: ${byClass.junior || 0}</li>
       <li>Senior: ${byClass.senior || 0}</li>
     </ul>
   </div>
   ` : ''}
 `;


 document.getElementById('popup-content').innerHTML = content;
 popupOverlay.classList.add('visible');
 popupModal.classList.add('visible');


 // Animate bars
 setTimeout(() => {
   document.querySelectorAll('.popup-bar-fill').forEach(bar => {
     bar.style.width = bar.style.width;
   });
 }, 50);
}


function showDepartmentPopup(cluster) {
 const { count = 0, assistantProf = 0, associateProf = 0, fullProf = 0 } = cluster;
 const assistantPercent = count > 0 ? (assistantProf / count * 100).toFixed(1) : 0;
 const associatePercent = count > 0 ? (associateProf / count * 100).toFixed(1) : 0;
 const fullPercent = count > 0 ? (fullProf / count * 100).toFixed(1) : 0;

 const content = `
   <h2>${cluster.name}</h2>
   <div class="popup-subtitle">Faculty Department</div>

   <div class="popup-stat">
     <div class="popup-stat-label">Total Faculty</div>
     <div class="popup-stat-value">${count}</div>
   </div>

   <div class="popup-stat">
     <div class="popup-stat-label">Assistant Professors: ${assistantProf} (${assistantPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${assistantPercent}%; background: ${colors.faculty};"></div>
     </div>
   </div>

   <div class="popup-stat">
     <div class="popup-stat-label">Associate Professors: ${associateProf} (${associatePercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${associatePercent}%; background: ${colors.faculty}; opacity: 0.7;"></div>
     </div>
   </div>

   <div class="popup-stat">
     <div class="popup-stat-label">Full Professors: ${fullProf} (${fullPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${fullPercent}%; background: ${colors.faculty}; opacity: 0.5;"></div>
     </div>
   </div>
 `;

 document.getElementById('popup-content').innerHTML = content;
 popupOverlay.classList.add('visible');
 popupModal.classList.add('visible');

 // Animate bars
 setTimeout(() => {
   document.querySelectorAll('.popup-bar-fill').forEach(bar => {
     bar.style.width = bar.style.width;
   });
 }, 50);
}


function showRankPopup(cluster) {
 const { count = 0, men = 0, women = 0 } = cluster;
 const menPercent = count > 0 ? (men / count * 100).toFixed(1) : 0;
 const womenPercent = count > 0 ? (women / count * 100).toFixed(1) : 0;

 const content = `
   <h2>${cluster.name}</h2>
   <div class="popup-subtitle">Faculty by Gender</div>

   <div class="popup-stat">
     <div class="popup-stat-label">Total Faculty</div>
     <div class="popup-stat-value">${count}</div>
   </div>

   <div class="popup-stat">
     <div class="popup-stat-label">Men: ${men} (${menPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${menPercent}%; background: ${colors.men};"></div>
     </div>
   </div>

   <div class="popup-stat">
     <div class="popup-stat-label">Women: ${women} (${womenPercent}%)</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${womenPercent}%; background: ${colors.women};"></div>
     </div>
   </div>
 `;

 document.getElementById('popup-content').innerHTML = content;
 popupOverlay.classList.add('visible');
 popupModal.classList.add('visible');

 // Animate bars
 setTimeout(() => {
   document.querySelectorAll('.popup-bar-fill').forEach(bar => {
     bar.style.width = bar.style.width;
   });
 }, 50);
}


function showDivisionPopup(cluster) {
 const { count = 0, subDepts = [] } = cluster;
 const percentOfTotal = ((count / brownData.staff.total) * 100).toFixed(1);

 const content = `
   <h2>${cluster.name}</h2>
   <div class="popup-subtitle">Staff Division</div>

   <div class="popup-stat">
     <div class="popup-stat-label">Total Staff</div>
     <div class="popup-stat-value">${count.toLocaleString()}</div>
   </div>

   <div class="popup-stat">
     <div class="popup-stat-label">Percentage of All Staff: ${percentOfTotal}%</div>
     <div class="popup-bar">
       <div class="popup-bar-fill" style="width: ${percentOfTotal}%; background: ${colors.staff};"></div>
     </div>
   </div>

   ${subDepts.length > 0 ? `
   <div class="popup-stat">
     <div class="popup-stat-label">Sub-Departments</div>
     <ul class="popup-list">
       ${subDepts.map(dept => `<li>${dept}</li>`).join('')}
     </ul>
   </div>
   ` : ''}
 `;

 document.getElementById('popup-content').innerHTML = content;
 popupOverlay.classList.add('visible');
 popupModal.classList.add('visible');

 // Animate bars
 setTimeout(() => {
   document.querySelectorAll('.popup-bar-fill').forEach(bar => {
     bar.style.width = bar.style.width;
   });
 }, 50);
}


function closePopup() {
 popupOverlay.classList.remove('visible');
 popupModal.classList.remove('visible');
}


popupClose.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', closePopup);


// ============================================
// Button Handlers
// ============================================


document.getElementById('btn-concentration').addEventListener('click', () => {
 transitionToScene2A1();
});


document.getElementById('btn-gender').addEventListener('click', () => {
 transitionToScene2A2();
});


document.getElementById('btn-department').addEventListener('click', () => {
 transitionToScene2B1();
});


document.getElementById('btn-rank').addEventListener('click', () => {
 transitionToScene2B2();
});


// ============================================
// Scroll-based Navigation
// ============================================


let lastScrollY = 0;


window.addEventListener('scroll', () => {
 if (state.animating) return; // Don't trigger transitions during animations

 const scrollY = window.scrollY;
 const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);


 // Scene 0 -> Scene 1 transition around 20-30% scroll
 if (state.currentScene === 'scene0' && scrollPercent > 0.25) {
   transitionToScene1();
 }


 lastScrollY = scrollY;
});


// ============================================
// Window Resize
// ============================================


window.addEventListener('resize', () => {
 state.width = window.innerWidth;
 state.height = window.innerHeight;


 // Re-render current scene
 if (state.currentScene === 'scene0') {
   // For scene0, recalculate positions with shared radius to keep dots mixed
   const config = getScene0Config();
   const totalCount = config.clusters.reduce((sum, c) => sum + c.count, 0);
   const sharedRadius = Math.sqrt(totalCount) * 1.8;
   const centerX = config.clusters[0].x;
   const centerY = config.clusters[0].y;

   // Update each dot's position within the shared radius
   state.dots.forEach(dot => {
     const angle = Math.random() * 2 * Math.PI;
     const radius = Math.random() * sharedRadius;
     dot.x = centerX + Math.cos(angle) * radius;
     dot.y = centerY + Math.sin(angle) * radius;
     dot.targetX = dot.x;
     dot.targetY = dot.y;
   });

   // Re-render dots at new positions
   dotsGroup.selectAll('circle')
     .data(state.dots)
     .attr('cx', d => d.x)
     .attr('cy', d => d.y);
 } else if (state.currentScene === 'scene1') {
   const config = getScene1Config();
   renderScene(config, { duration: 0, showLabels: true });
   enableClusterClicking(config.clusters);
 }
 // Add other scenes as needed
});


// ============================================
// Initialization
// ============================================


function init() {
 // Generate initial dots with shuffle to mix colors
 const config = getScene0Config();
 state.dots = generateDots(config, true);


 // Render initial dots
 dotsGroup.selectAll('circle')
   .data(state.dots)
   .join('circle')
   .attr('cx', d => d.x)
   .attr('cy', d => d.y)
   .attr('r', 3)
   .attr('fill', d => d.color)
   .attr('opacity', 0)
   .transition()
   .duration(1000)
   .attr('opacity', 0.9);


 // Show initial UI
 legend.classList.add('visible');
}


// Start the visualization
init();


