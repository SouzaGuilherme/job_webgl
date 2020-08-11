"use strict";
var vertexShaderSource = `
attribute vec3 aPosition;
void main() {
    gl_Position = vec4(aPosition, 1);
}
`;

var fragmentShaderSource = `
precision highp float;
void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
}
`;
var program;
var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl2");
if(!gl)
  throw new Error('WebGL not supported');
alert("webgl in using");

function init(){
  var vertexShader = gl.createShader(gl.VERTEX_SHADER); 
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  // Check the compile status
  const compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(vertexShader);
    console.log("*** Error compiling shader '" + vertexShader + "':" + lastError);
    gl.deleteShader(vertexShader);
    return null;
  }

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if(!linked){
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    console.log("Error in program linking:" + lastError);

    gl.deleteProgram(program);
    return null;
  }
  //gl.useProgram(program);
  
  /*
  const positionLocation = gl.getAttribLocation(program, `aPosition`);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  // Create a buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
  */
};

function draw(){
  var n = initBuffers(gl);
  // Chenck number vestices
  if(n < 0){
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a line
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, n);
};

function initBuffers(){
  const vertices = [
    /*
    -0.5, -0.5,
    -0.5, +0.5,
    0.0, +0.5,
    0.0,  0.0,
    0.0, -0.5,
    +0.5, -0.5,

*/
    /*
    -0.5, -0.5, 0.0,
    -0.5, +0.5, 0.0,
    0.0, +0.5, 0.0,
    0.0,  0.0, 0.0,
    0.0, -0.5, 0.0,
    +0.5, -0.5, 0.0,
    */

    /*
    0, 1, 0,
    1, -1, 0,
    -1, -1, 0,
    */
    // left column front
    0,   0,  0,
    0, 150,  0,
    30,   0,  0,
    0, 150,  0,
    30, 150,  0,
    30,   0,  0,

    // top rung front
    30,   0,  0,
    30,  30,  0,
    100,   0,  0,
    30,  30,  0,
    100,  30,  0,
    100,   0,  0,

    // middle rung front
    30,  60,  0,
    30,  90,  0,
    67,  60,  0,
    30,  90,  0,
    67,  90,  0,
    67,  60,  0,

    // left column back
    0,   0,  30,
    30,   0,  30,
    0, 150,  30,
    0, 150,  30,
    30,   0,  30,
    30, 150,  30,

    // top rung back
    30,   0,  30,
    100,   0,  30,
    30,  30,  30,
    30,  30,  30,
    100,   0,  30,
    100,  30,  30,

    // middle rung back
    30,  60,  30,
    67,  60,  30,
    30,  90,  30,
    30,  90,  30,
    67,  60,  30,
    67,  90,  30,

    // top
    0,   0,   0,
    100,   0,   0,
    100,   0,  30,
    0,   0,   0,
    100,   0,  30,
    0,   0,  30,

    // top rung right
    100,   0,   0,
    100,  30,   0,
    100,  30,  30,
    100,   0,   0,
    100,  30,  30,
    100,   0,  30,

    // under top rung
    30,   30,   0,
    30,   30,  30,
    100,  30,  30,
    30,   30,   0,
    100,  30,  30,
    100,  30,   0,

    // between top rung and middle
    30,   30,   0,
    30,   60,  30,
    30,   30,  30,
    30,   30,   0,
    30,   60,   0,
    30,   60,  30,

    // top of middle rung
    30,   60,   0,
    67,   60,  30,
    30,   60,  30,
    30,   60,   0,
    67,   60,   0,
    67,   60,  30,

    // right of middle rung
    67,   60,   0,
    67,   90,  30,
    67,   60,  30,
    67,   60,   0,
    67,   90,   0,
    67,   90,  30,

    // bottom of middle rung.
    30,   90,   0,
    30,   90,  30,
    67,   90,  30,
    30,   90,   0,
    67,   90,  30,
    67,   90,   0,

    // right of bottom
    30,   90,   0,
    30,  150,  30,
    30,   90,  30,
    30,   90,   0,
    30,  150,   0,
    30,  150,  30,

    // bottom
    0,   150,   0,
    0,   150,  30,
    30,  150,  30,
    0,   150,   0,
    30,  150,  30,
    30,  150,   0,

    // left side
    0,   0,   0,
    0,   0,  30,
    0, 150,  30,
    0,   0,   0,
    0, 150,  30,
    0, 150,   0,
  ];

  var n = 16*6;

  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer){
    console.log("Error in create buffer");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(program, 'aPosition');
  if(aPosition < 0){
    console.log("Error in getAttribLocation");
    return -1;
  }

  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  return n
};

init();
draw();
