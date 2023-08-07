/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.5 - Activity: Adding SVGs to the screen
*/

const svg = d3.select('#chart-area').attr("width",500).attr("height",400)

svg.append("line").attr("x1",5).attr("y1",5).attr("x2",25).attr("y2",5).attr("stroke","green").attr("stroke-width",5).attr("fill","green")
