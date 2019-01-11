/* Unit 15 | Assignment - Belly Button Biodiversity: Visualizations-and-Dashboards: JavaScript file  */

// Complete the following function that builds the metadata panel
function buildMetadata(sample) {
  var newdataSample = sample.split('_').pop(-1);
  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/"+newdataSample).then(function(data){
    console.log(data);
    // Use d3 to select the panel with id of `#sample-metadata`
    var metaSelector = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    // clear the input value
    document.getElementById("sample-metadata").innerHTML = "";
      
    // Use `Object.entries` to add each key and value pair to the panel
    // Iterate through each key and value
    Object.entries(data).forEach(([key, value]) => {
        metaSelector
        .append("p")
        .text(`${key}: ${value}`).node().value;
    });
      //--------- BONUS: Build the Gauge Chart------------------
      var wfreqData = data["WFREQ"];
      console.log(`WFREQ : ${wfreqData}`);
      // Enter a speed between 0 and 180
      var level = wfreqData*20;

      // Trig to calc meter point
      var degrees = 180 - level,
          radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);
  
      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
          pathX = String(x),
          space = ' ',
          pathY = String(y),
          pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);
  
      var data3 = [{ type: 'scatter',
        x: [0], y:[0],
          marker: {size: 15, color:'850000'},
          showlegend: false,
          name: 'Scrubs per Week',
          text: wfreqData,
          hoverinfo: 'text+ name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9,50/9,50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6',
                  '4-5', '3-4', '2-3','1-2','0-1',' '],
        textinfo: 'text',
        textposition:'inside',
        marker: {colors:[
        'rgba(12, 102, 0, .5)', 
        'rgba(14, 127, 0, .5)', 
        'rgba(21, 179, 0, .5)', 
        'rgba(27, 230, 0, .5)', 
        'rgba(52, 255, 26, .5)', 
        'rgba(97, 255, 77, .5)',
        'rgba(142, 255, 128, .5)', 
        'rgba(187, 255, 179, .5)',
        'rgba(232, 255, 230, .5)', 
        
        'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6',
        '4-5', '3-4', '2-3','1-2','0-1',' '],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
      }];
  
      var layout3 = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
              color: '850000'
            }
      }],
      text: {font: {color: 'white'}},
      paper_bgcolor: "rgba(0,0,0,0)",
      title: "<b>Belly Button Washing Frequency </b> <br> For Sample: "+ sample + "  <br> scrubs per Week ",
      height: 500,
      margin: {
      top: 10,
      bottom: 10,
      right: 10,
      left: 10
      },
      xaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]}
      };
  
    Plotly.newPlot('gauge', data3, layout3);
   
  });
}
//-----------------------------------------------
/* Create a PIE chart that uses data from your samples route (`/samples/<sample>`) to display the top 10 samples.
  
HINT: You will need to use slice() to grab the top 10 sample_values,
otu_ids, and labels (10 each).*/
function buildCharts(sample) {
  // Use `d3.json` to fetch the sample data for the plots
  d3.json("/samples/"+sample).then(function(data){
    //console.log(data);
    //Get top 10 sample data
    var topTenOtuid = data[0]["otu_ids"].slice(0,10);
    var topTenValues = data[0]["sample_values"].slice(0,10);
    var topTenOtuLabel = data[0]["otu_label"].slice(0,10);

    //* Use `sample_values` as the values for the PIE chart
    // * Use `otu_ids` as the labels for the pie chart
    // * Use `otu_labels` as the hovertext for the chart
    var trace1 = {
      labels: topTenOtuid,
      values: topTenValues,
      hovertext: topTenOtuLabel,
      hoverinfo: {bordercolor: 'black'},
      type: 'pie'
    };
    var dataPie = [trace1];
    var layout1 = {
      labels:{color: 'black'},
      margin: {
      top: 10,
      bottom: 10,
      right: 10,
      left: 10
      },
      height: 500,
      width: 450,
      paper_bgcolor: "rgba(0,0,0,0)",
    title:"<b>Pie Chart: Top Samples for </b>" + sample
    };
    var PIE = document.getElementById('pie');
    Plotly.newPlot(PIE, dataPie, layout1);

    //Build a Bubble Chart using the sample data
    /* Create a Bubble Chart that uses data from your samples route (`/samples/<sample>`) to display each sample.
    * Use `otu_ids` for the x values
    * Use `sample_values` for the y values
    * Use `sample_values` for the marker size 
    * Loop through sample data and find the OTU Taxonomic Name */
    var trace2 = {
    x: data[0]['otu_ids'],
    y: data[0]["sample_values"],
    hovertext: data[0]["otu_label"],
    hoverinfo: {bordercolor: 'black'},
    color: "black",
    mode: 'markers',
    marker: {
      colorscale: "Earth",
      size: data[0]['sample_values'],
      color: data[0]['otu_ids']
      }
    };
    var data2 = [trace2];
    var layout2 ={
    title: '<b>Bubble Plot: Sample Values for </b>' + sample,
    height: 600,

    margin: 
      {
        top: 10,
        bottom: 10,
        right: 10,
        left: 10
      },
      hovermode: 'closest',
      xaxis: { title: 'OTU ID' },
      yaxis: {title: 'SAMPLE VALUES' },
      
      paper_bgcolor: "rgba(0,0,0,0)"
    };
    var BUBBLE = document.getElementById('bubble');
    Plotly.newPlot(BUBBLE,data2,layout2);
    });  
}
//-----------------------------------------------
//Initalize the page with first sample data
function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
  // Use the first sample from the list to build the initial plots
  const firstSample = sampleNames[0];
  buildMetadata(firstSample);
  buildCharts(firstSample);
    
  });
}
//-----------------------------------------------
// Update the page each time with new sample
function optionChanged(newSample) {
// Fetch new data each time a new sample is selected
// Use the new sample from the list to build the updated plots
  buildMetadata(newSample);
  buildCharts(newSample); 
}
//--------------- End of all the functions ------------
/*************** Initialize the dashboard ***********/
init();

/************************ End of JavaScript file ************************ */