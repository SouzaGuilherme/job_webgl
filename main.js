"use strict";
var vertexShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a varying the color to the fragment shader
out vec4 v_color;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

var fragmentShaderSource = `#version 300 es
precision highp float;

// the varied color passed from the vertex shader
in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;
  var matrix = []; 
  var teste = {
    matrix,
    translation: [],
    rotation: [],
    scale: []
  }
  var allObjects = {
    teste: [],
  };
var objects = [];
var objectSelected = 0;
var first = 0;
var matrixLocation;
var translation;
var rotation;
var scale;
var translation2;
var rotation2;
var scale2;
var program;
var Tbezier;
var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl2");
if(!gl)
  throw new Error('WebGL not supported');
alert("webgl in using");

function init(){
  // Use our boilerplate utils to compile the shaders and link into a program
  //var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
  
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
  var teste = {
    matrix,
    translation: [],
    rotation: [],
    scale: [],
    endPointBezier: [],
    midPointBezier: [],
    pointRotation: [],
    Tbezier,
  }
  translation2 = [700, 150, 0];
  rotation2 = [degToRad(40), degToRad(25), degToRad(325)];
  scale2 = [1, 1, 1];
    teste.translation = translation2;
    teste.rotation = rotation2;
    teste.scale = scale2;
    teste.endPointBezier = [0, 0, 0];
    teste.midPointBezier = [0, 0, 0];
    teste.pointRotation = [0, 0, 0];
    teste.Tbezier = 0;
    console.log(teste);

  allObjects.teste[0] = teste;
  console.log(allObjects);
  console.log("PRIMEIRO "+allObjects.teste[0]);
  return;
};

function drawFist(){
  var n = initBuffers(gl);
  // Chenck number vestices
  if(n < 0){
    console.log('Failed to set the positions of the vertices');
    return -1;
  }
  return n;
};

function draw(){
  //UI(objectSelected);
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Specify the color for clearing <canvas>
  gl.clearColor(1, 1, 1, 1);
  //gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw a line
  //gl.useProgram(program);
  //gl.drawArrays(gl.TRIANGLES, 0, n);
  // turn on depth testing
  gl.enable(gl.DEPTH_TEST);

  // tell webgl to cull faces
  gl.enable(gl.CULL_FACE);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);
  //------------------------------------
  // First let's make some variables
  // to hold the translation,

  console.log(allObjects);
  console.log(allObjects.teste[0].translation);
  // Bind the attribute/buffer set we want.
  //gl.bindVertexArray(vao);
  // Compute the matrix
  for ( var i = 0; i < allObjects.teste.length; i++){
    allObjects.teste[i].matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    allObjects.teste[i].matrix = m4.translate(allObjects.teste[i].matrix, allObjects.teste[i].translation[0], allObjects.teste[i].translation[1], allObjects.teste[i].translation[2]);
    allObjects.teste[i].matrix = m4.xRotate(allObjects.teste[i].matrix, allObjects.teste[i].rotation[0]);
    allObjects.teste[i].matrix = m4.yRotate(allObjects.teste[i].matrix, allObjects.teste[i].rotation[1]);
    allObjects.teste[i].matrix = m4.zRotate(allObjects.teste[i].matrix, allObjects.teste[i].rotation[2]);
    allObjects.teste[i].matrix = m4.scale(allObjects.teste[i].matrix, allObjects.teste[i].scale[0], allObjects.teste[i].scale[1], allObjects.teste[i].scale[2]);
    //For rotation in center or point select
    //allObjects.teste[i].matrix = m4.translate(allObjects.teste[i].matrix, -50, -75, allObjects.teste[i].translation[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, allObjects.teste[i].matrix);


    //Tem o jeito que e bem explicadinho mas vou deixar assim no momento
    gl.drawArrays(gl.TRIANGLES, 0, n);

    console.log("VAIII "+allObjects.teste.length);
  }
  return;
}


function initBuffers(){
  const vertices = [
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
  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(program, 'a_position');
  if(aPosition < 0){
    console.log("Error in getAttribLocation aPosition");
    return -1;
  }

  var aColor = gl.getAttribLocation(program, 'a_color');
  if(aColor < 0){
    console.log("Error in getAttribLocation aColor");
    return -1;
  }

  // look up uniform locations
  matrixLocation = gl.getUniformLocation(program, "u_matrix");

  gl.enableVertexAttribArray(aPosition);


  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  //gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(aPosition, size, type, normalize, stride, offset);


  //----------------------------//
  const setColors = [
    // left column front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

    // top rung front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

    // middle rung front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

    // left column back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

    // top rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

    // middle rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

    // top
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,

    // top rung right
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,

    // under top rung
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,

    // between top rung and middle
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,

    // top of middle rung
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,

    // right of middle rung
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,

    // bottom of middle rung.
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,

    // right of bottom
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,

    // bottom
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,

    // left side
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
  ];

  var colorBuffer = gl.createBuffer();
  //Fazer a verificacao aqui
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(setColors), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(aColor);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      aColor, size, type, normalize, stride, offset);


  //coloquei aqui mesmo por enquanto
  gl.bindVertexArray(vao);
  return n
};

var m4 = {

  projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

};

function radToDeg(r) {
  return r * 180 / Math.PI;
};

function degToRad(d) {
  return d * Math.PI / 180;
};


function updatePosition(index, objectSelected) {
  return function(event, ui) {
    allObjects.teste[objectSelected].translation[index] = ui.value;
    draw();
  };
};

function updateRotation(index, objectSelected) {
  return function(event, ui) {
    var angleInDegrees = ui.value;
    var angleInRadians = degToRad(angleInDegrees);
    allObjects.teste[objectSelected].rotation[index] = angleInRadians;
    draw();
  };
};

function updatePointRotation(index, objectSelected){
  return function (event, ui) {
    var angleInDegrees = 360 - ui.value;
    var rotationInRadians = angleInDegrees * Math.PI / 180;
    allObjects.teste[objectSelected].pointRotation[index] = rotationInRadians;
    draw();
  }
}

function updateScale(index, objectSelected) {
  return function(event, ui) {
    allObjects.teste[objectSelected].scale[index] = ui.value;
    draw();
  };
};

//BEZIER
function updateBezierEnd(index, objectSelected) {
  return function(event, ui) {
    allObjects.teste[objectSelected].endPointBezier[index] = ui.value;
  };
};

function updateBezierMid(index, objectSelected) {
  return function(event, ui) {
    allObjects.teste[objectSelected].midPointBezier[index] = ui.value;
  };
};

function updateBezierT(objectSelected) {
  return function(event, ui) {
    allObjects.teste[objectSelected].Tbezier = ui.value;
    console.log("T-Update"+allObjects.teste[objectSelected].Tbezier);
    quadraticBezier(objectSelected);
    draw();
  };
};

function drawBezier (pointBezierX, pointBezierY, objectSelected){
  console.log("X"+pointBezierX,"Y" + pointBezierY);
  //UI(objectSelected);
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Specify the color for clearing <canvas>
  gl.clearColor(1, 1, 1, 1);
  //gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw a line
  //gl.useProgram(program);
  //gl.drawArrays(gl.TRIANGLES, 0, n);
  // turn on depth testing
  gl.enable(gl.DEPTH_TEST);

  // tell webgl to cull faces
  gl.enable(gl.CULL_FACE);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);
  //------------------------------------
  // First let's make some variables
  // to hold the translation,

  allObjects.teste[objectSelected].matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
  allObjects.teste[objectSelected].matrix = m4.translate(allObjects.teste[objectSelected].matrix, pointBezierX, pointBezierY, allObjects.teste[objectSelected].translation[2]);
  allObjects.teste[objectSelected].matrix = m4.xRotate(allObjects.teste[objectSelected].matrix, allObjects.teste[objectSelected].rotation[0]);
  allObjects.teste[objectSelected].matrix = m4.yRotate(allObjects.teste[objectSelected].matrix, allObjects.teste[objectSelected].rotation[1]);
  allObjects.teste[objectSelected].matrix = m4.zRotate(allObjects.teste[objectSelected].matrix, allObjects.teste[objectSelected].rotation[2]);
  allObjects.teste[objectSelected].matrix = m4.scale(allObjects.teste[objectSelected].matrix, allObjects.teste[objectSelected].scale[0], allObjects.teste[objectSelected].scale[1], allObjects.teste[objectSelected].scale[2]);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLocation, false, allObjects.teste[objectSelected].matrix);


  //Tem o jeito que e bem explicadinho mas vou deixar assim no momento
  gl.drawArrays(gl.TRIANGLES, 0, n);

  return;
  
};
// p0 == allObjects.teste[index].translation[1]
// p2 == allObjects.teste[index].endendPointBezier[1] == definido pelo usuario
// p1 == allObjects.teste[index].midendPointBezier[1] == p2/2
//       allObjects.teste[index].midendPointBezier[2] == definido pelo usuario
function quadraticBezier(objectSelected){
  console.log("T-QUADRATIC"+allObjects.teste[objectSelected].Tbezier);
  console.log("STARTx"+allObjects.teste[objectSelected].translation[0]);
  console.log("STARTy"+allObjects.teste[objectSelected].translation[1]);
  console.log("MIDx"+allObjects.teste[objectSelected].midPointBezier[0]);
  console.log("MIDy"+allObjects.teste[objectSelected].midPointBezier[1]);
  console.log("ENDx"+allObjects.teste[objectSelected].endPointBezier[0]);
  console.log("ENDy"+allObjects.teste[objectSelected].endPointBezier[1]);
  const p0x = allObjects.teste[objectSelected].translation[0];
  const p0y = allObjects.teste[objectSelected].translation[1];
  const p1x = allObjects.teste[objectSelected].midPointBezier[0];
  const p1y = allObjects.teste[objectSelected].midPointBezier[1];
  const p2x = allObjects.teste[objectSelected].endPointBezier[0];
  const p2y = allObjects.teste[objectSelected].endPointBezier[1];
  const t = allObjects.teste[objectSelected].Tbezier;

  const pFinalx = (1.0 - t) * (1.0 - t) * p0x + 2.0 * (1.0 - t) * t * p1x + t * t * p2x;
  const pFinaly = (1.0 - t) * (1.0 - t) * p0y + 2.0 * (1.0 - t) * t * p1y + t * t * p2y;
  allObjects.teste[objectSelected].translation[0] = pFinalx;
  allObjects.teste[objectSelected].translation[1] = pFinaly;
  //drawBezier(pFinalx, pFinaly, objectSelected);
  return ;
};

function UI(objectSelected){
  // Setup a ui.
  webglLessonsUI.setupSlider("#x",      {value: allObjects.teste[objectSelected].translation[0], slide: updatePosition(0, objectSelected), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y",      {value: allObjects.teste[objectSelected].translation[1], slide: updatePosition(1, objectSelected), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#z",      {value: allObjects.teste[objectSelected].translation[2], slide: updatePosition(2, objectSelected), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angleX", {value: radToDeg(allObjects.teste[objectSelected].rotation[0]), slide: updateRotation(0, objectSelected), max: 360});
  webglLessonsUI.setupSlider("#angleY", {value: radToDeg(allObjects.teste[objectSelected].rotation[1]), slide: updateRotation(1, objectSelected), max: 360});
  webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(allObjects.teste[objectSelected].rotation[2]), slide: updateRotation(2, objectSelected), max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: allObjects.teste[objectSelected].scale[0], slide: updateScale(0, objectSelected), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: allObjects.teste[objectSelected].scale[1], slide: updateScale(1, objectSelected), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleZ", {value: allObjects.teste[objectSelected].scale[2], slide: updateScale(2, objectSelected), min: -5, max: 5, step: 0.01, precision: 2});

  //BIEZER
  webglLessonsUI.setupSlider("#endpointBiezerX",      {value: allObjects.teste[objectSelected].endPointBezier[0], slide: updateBezierEnd(0, objectSelected), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#endpointBiezerY",      {value: allObjects.teste[objectSelected].endPointBezier[1], slide: updateBezierEnd(1, objectSelected), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#midpointBiezerX",      {value: allObjects.teste[objectSelected].midPointBezier[0], slide: updateBezierMid(0, objectSelected), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#midpointBiezerY",      {value: allObjects.teste[objectSelected].midPointBezier[1], slide: updateBezierMid(1, objectSelected), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#T_Bezier",      {value: allObjects.teste[objectSelected].Tbezier, slide: updateBezierT(objectSelected), min: 0, max: 1, step: 0.01, precision: 2});


  //Rotation in point
  webglLessonsUI.setupSlider("#pointAngleY",  {value: allObjects.teste[objectSelected].pointRotation[1] * 180 / Math.PI | 0, slide: updatePointRotation, max: 360});

};

function drawAll(){
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Specify the color for clearing <canvas>
  gl.clearColor(1, 1, 1, 1);
  //gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // turn on depth testing
  gl.enable(gl.DEPTH_TEST);

  // tell webgl to cull faces
  gl.enable(gl.CULL_FACE);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);


  console.log("DESENHO 1: " + allObjects.teste[0].matrix);
  
  allObjects.teste[0].matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
  allObjects.teste[0].matrix = m4.translate(allObjects.teste[0].matrix, allObjects.teste[0].translation[0], allObjects.teste[0].translation[1], allObjects.teste[0].translation[2]);
  allObjects.teste[0].matrix = m4.xRotate(allObjects.teste[0].matrix, allObjects.teste[0].rotation[0]);
  allObjects.teste[0].matrix = m4.yRotate(allObjects.teste[0].matrix, allObjects.teste[0].rotation[1]);
  allObjects.teste[0].matrix = m4.zRotate(allObjects.teste[0].matrix, allObjects.teste[0].rotation[2]);
  allObjects.teste[0].matrix = m4.scale(allObjects.teste[0].matrix, allObjects.teste[0].scale[0], allObjects.teste[0].scale[1], allObjects.teste[0].scale[2]);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLocation, false, allObjects.teste[0].matrix);


  //Tem o jeito que e bem explicadinho mas vou deixar assim no momento
  gl.drawArrays(gl.TRIANGLES, 0, n);
};

init();
var n = drawFist();
drawAll();
UI(0);

function selectObject(e){
  console.log(e);
  objectSelected = e;
  UI(e);
};

function add() {
  // get reference to select element
    var sel = document.getElementById('listObjects');
    var opt = document.createElement('option');
    opt.appendChild( document.createTextNode(String(sel.length).concat(' - Object')));

    // set value property of opt
    opt.value = sel.length;
  var teste = {
    matrix,
    translation: [],
    rotation: [],
    scale: [],
    endPointBezier: [],
    midPointBezier: [],
    Tbezier,
  }
  translation2 = [150, 150, 0];
  rotation2 = [degToRad(40), degToRad(25), degToRad(325)];
  scale2 = [1, 1, 1];
    teste.translation = translation2;
    teste.rotation = rotation2;
    teste.scale = scale2;
    teste.endPointBezier = [];
    teste.midPointBezier =  [];
  teste.pointRotation = []
    teste.Tbezier = 0;
    console.log(teste);

  allObjects.teste[opt.value] = teste;
  console.log(allObjects);
  UI(opt.value);
  draw();
    // add opt to end of select box (sel)
    sel.appendChild(opt); 
}

function remove() {
  // remove 2nd option in select box (sel)
  if(allObjects.teste.length == 1){
    console.log("Last Object present in screen");
    return;
  }
  var sel = document.getElementById('listObjects');
    sel.removeChild( sel.options[sel.length-1] ); 
  allObjects.teste.splice(allObjects.teste.length-1);
  console.log("VAMO VER"+allObjects.teste.length);
  UI(allObjects.teste.length-1);
  draw();
  
};

