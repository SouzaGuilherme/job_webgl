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
var cameraOnn = 0;
var lookAtOnn = 0;
var translationX;
var translationY;
var translationZ;
var rotationX;
var rotationY;
var rotationZ;
var scaleX;
var scaleY;
var scaleZ;
var isTransformation;
var listAnimation = {
  isTransformation,
  translationX,
  translationY,
  translationZ,
  rotationX,
  rotationY,
  rotationZ,
  scaleX,
  scaleY,
  scaleZ,
};
var orderAnimation = [];
var cameraSelected = 0;
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
var multCameras = {
  camera: [],
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
var zoom;
var Tbezier;
var cameraAngleRadians;
var camPosition;
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
    cameraAngleRadians,
  }
  translation2 = [317, 281, 0];
  rotation2 = [degToRad(0), degToRad(0), degToRad(0)];
  //translation2 = [0, 0, -360];
  //rotation2 = [degToRad(190), degToRad(40), degToRad(30)];
  //translation2 = [150, 150, 0];
  //rotation2 = [degToRad(50), degToRad(25), degToRad(325)];
  scale2 = [1, 1, 1];
    teste.translation = translation2;
    teste.rotation = rotation2;
    teste.scale = scale2;
    teste.endPointBezier = [0, 0, 0];
    teste.midPointBezier = [0, 0, 0];
    teste.pointRotation = [0, 0, 0];
    teste.Tbezier = 0;
    teste.cameraAngleRadians = degToRad(0);
    console.log(teste);

  allObjects.teste[0] = teste;
  console.log(allObjects);

  var camera = {
    camPosition : [0, 0, -200],
    camPositionLookAt : [0, 0, -200],
    midPoint: [0, 0, 0],
    endPoint: [0, 0, 0],
    Tbezier: 0,
    zoom: 60,
    lookAtOnn: 0,
    cameraOnn: 0,
    followObject: 0,
  };
  multCameras.camera[0] = camera;
  console.log("CAMERA", multCameras);
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
  
  //Add camera
  var radius = 200; // ???? pq ????
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var zNear = 1;
  var zFar = 2000;
  //var projectionMatrix();

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
  
  //Add for camera
  // Center the F around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  var matrix = m4.xRotation(Math.PI);
  matrix = m4.translate(matrix, -50, -75, -15);

  for (var ii = 0; ii < vertices.length; ii += 3) {
    var vector = m4.transformVector(matrix, [vertices[ii + 0], vertices[ii + 1], vertices[ii + 2], 1]);
    vertices[ii + 0] = vector[0];
    vertices[ii + 1] = vector[1];
    vertices[ii + 2] = vector[2];
  }

  //-----------------------------------

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

  //Add for camera
  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0,
    ];
  },
  //--------------------------------------------------------------

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
  
  //Add for camera
  inverse: function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
             (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
             (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
             (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
             (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
           (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
           (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
           (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
           (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
           (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
           (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
           (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
           (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
           (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
           (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
           (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
           (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ];
  },

  transformVector: function(m, v) {
    var dst = [];
    for (var i = 0; i < 4; ++i) {
      dst[i] = 0.0;
      for (var j = 0; j < 4; ++j) {
        dst[i] += v[j] * m[j * 4 + i];
      }
    }
    return dst;
  },

  cross: function(a, b) {
    return [
       a[1] * b[2] - a[2] * b[1],
       a[2] * b[0] - a[0] * b[2],
       a[0] * b[1] - a[1] * b[0],
    ];
  },

  subtractVectors: function(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  },

  normalize: function(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    } else {
      return [0, 0, 0];
    }
  },

  lookAt: function(cameraPosition, target, up) {
    var zAxis = m4.normalize(
        m4.subtractVectors(cameraPosition, target));
    var xAxis = m4.normalize(m4.cross(up, zAxis));
    var yAxis = m4.normalize(m4.cross(zAxis, xAxis));

    return [
      xAxis[0], xAxis[1], xAxis[2], 0,
      yAxis[0], yAxis[1], yAxis[2], 0,
      zAxis[0], zAxis[1], zAxis[2], 0,
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2],
      1,
    ];
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
    //draw();
    drawAll();
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
    drawAll();
  };
};
//BEZIER CAM
function updateBezierEndCam(index, cameraSelected) {
  return function(event, ui) {
    multCameras.camera[cameraSelected].endPoint[index] = ui.value;
  };
};

function updateBezierMidCam(index, cameraSelected) {
  return function(event, ui) {
    multCameras.camera[cameraSelected].midPoint[index] = ui.value;
  };
};
function updateBezierT_Cam(cameraSelected) {
  return function(event, ui) {
    multCameras.camera[cameraSelected].Tbezier = ui.value;
    quadraticBezier(cameraSelected);
    drawAll();
  };
};

//Add for camera
function updateCameraAngle(objectSelected) {
    return function(event, ui){
      allObjects.teste[objectSelected].cameraAngleRadians = degToRad(ui.value);
      drawAll();
  }
};

function updateCameraPosition(index, cameraSelected) {
  return function(event, ui) {
    multCameras.camera[cameraSelected].camPosition[index] = ui.value;
    //draw();
    drawAll();
  };
};
function updateCameraPositionLookAt(index, cameraSelected) {
  return function(event, ui) {
    multCameras.camera[cameraSelected].camPositionLookAt[index] = ui.value;
    //draw();
    drawAll();
  };
};

function updateCameraZoom(cameraSelected) {
  return function(event, ui) {
    multCameras.camera[cameraSelected].zoom = ui.value;
    //draw();
    drawAll();
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

function UI(objectSelected, cameraSelected){
  // Setup a ui.
  webglLessonsUI.setupSlider("#x",      {value: allObjects.teste[objectSelected].translation[0], slide: updatePosition(0, objectSelected), min: -500, max: 500 });
  webglLessonsUI.setupSlider("#y",      {value: allObjects.teste[objectSelected].translation[1], slide: updatePosition(1, objectSelected), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#z",      {value: allObjects.teste[objectSelected].translation[2], slide: updatePosition(2, objectSelected), min: -1000, max:500});
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
  //CAMERA
    webglLessonsUI.setupSlider("#CAMERA", {value: radToDeg(allObjects.teste[objectSelected].cameraAngleRadians), slide: updateCameraAngle(objectSelected), min: -360, max: 360});
  //CAMERA TESTE 2
    webglLessonsUI.setupSlider("#camX", {value: multCameras.camera[cameraSelected].camPosition[0], slide: updateCameraPosition(0, cameraSelected), min: -200, max: 200});
    webglLessonsUI.setupSlider("#camY", {value: multCameras.camera[cameraSelected].camPosition[1], slide: updateCameraPosition(1, cameraSelected), min: -200, max: 200});
    webglLessonsUI.setupSlider("#camZ", {value: multCameras.camera[cameraSelected].camPosition[2], slide: updateCameraPosition(2, cameraSelected), min: -2000, max: 2000});
    webglLessonsUI.setupSlider("#camZoom", {value: multCameras.camera[cameraSelected].zoom, slide: updateCameraZoom(cameraSelected), min: 1, max: 180});
    webglLessonsUI.setupSlider("#lookAtX", {value: multCameras.camera[cameraSelected].camPositionLookAt[0], slide: updateCameraPositionLookAt(0, cameraSelected), min: -200, max: 200});
    webglLessonsUI.setupSlider("#lookAtY", {value: multCameras.camera[cameraSelected].camPositionLookAt[1], slide: updateCameraPositionLookAt(1, cameraSelected), min: -200, max: 200});
      webglLessonsUI.setupSlider("#lookAtZ", {value: multCameras.camera[cameraSelected].camPositionLookAt[2], slide: updateCameraPositionLookAt(2, cameraSelected), min: -200, max: 200});

  //BIEZER CAM
  webglLessonsUI.setupSlider("#camMidPointX",      {value: multCameras.camera[cameraSelected].midPoint[0], slide: updateBezierMidCam(0, cameraSelected), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#camMidPointY",      {value: multCameras.camera[cameraSelected].midPoint[1], slide: updateBezierMidCam(1, cameraSelected), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#camEndPointX",      {value: multCameras.camera[cameraSelected].endPoint[0], slide: updateBezierEndCam(0, cameraSelected), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#camEndPointY",      {value: multCameras.camera[cameraSelected].endPoint[1], slide: updateBezierEndCam(1, cameraSelected), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#camT_Bezier",      {value: multCameras.camera[cameraSelected].Tbezier, slide: updateBezierT_Cam(cameraSelected), min: 0, max: 1, step: 0.01, precision: 2});

  };
  var temp =0;
  function drawAll(now){
    
    now *= 0.001;
    var deltaTime = now - then;
    then = now;
    console.log("TIME",deltaTime); 
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    temp += deltaTime;

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

    //Add for camera
    if(multCameras.camera[cameraSelected].cameraOnn){
      var fieldOfViewRadians = degToRad(multCameras.camera[cameraSelected].zoom);
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var zNear = 1;
      var zFar = 2000;

      var perspectiveMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

      if(multCameras.camera[cameraSelected].lookAtOnn){
        // Get the camera's postion from the matrix we computed
        var cameraPosition = [
          multCameras.camera[cameraSelected].camPositionLookAt[0],
          multCameras.camera[cameraSelected].camPositionLookAt[1],
          multCameras.camera[cameraSelected].camPositionLookAt[2],
        ];
      /*
      }
      else if(multCameras.camera[cameraSelected].followObject){
        var cameraPosition = [
          multCameras.camera[cameraSelected].camPosition[0],
          multCameras.camera[cameraSelected].camPosition[1],
          multCameras.camera[cameraSelected].camPosition[2],
        ];
        */
      }else{
        var cameraPosition = [
          //317,281,0,
          0,0, 200,
        ];
      }
      //var cameraPosition = [0, 0, -200];
      var up = [0, -1, 0];
      var target = [
        0, 0, 0
        //-317,-281,-0,
        ];
      


      //LOOKAT
      var cameraMatrix = m4.lookAt(cameraPosition, target, up);

      let worldMatrix; 
      worldMatrix = m4.yRotation(degToRad(0));
      if(!multCameras.camera[cameraSelected].lookAtOnn){ 
        worldMatrix = m4.yRotation(degToRad(180));
        //worldMatrix = m4.xRotation(degToRad(45));
        worldMatrix = m4.translate(worldMatrix, -317, -281, 200);
      }else{
        //worldMatrix = m4.translate(worldMatrix, -317, -281, 200);
        // Origin in F
        //worldMatrix = m4.xRotate(worldMatrix, degToRad(180));
        //worldMatrix = m4.yRotate(worldMatrix, degToRad(150));
        worldMatrix = m4.translate(worldMatrix, -317, -281, 0);
        //worldMatrix = m4.yRotate(worldMatrix, degToRad(7));
        //worldMatrix = m4.translate(worldMatrix, -35, -75, -5);
        //worldMatrix = m4.translate(worldMatrix, 0, 0, 0);
      
      };

      // center the 'F' around its origin
      if(!multCameras.camera[cameraSelected].lookAtOnn){
        console.log("WORD");
        //worldMatrix = m4.translate(worldMatrix, -50, 5, -5);
        //worldMatrix = m4.translate(worldMatrix, -35, -75, -5);
      worldMatrix = m4.translate(worldMatrix, multCameras.camera[cameraSelected].camPosition[0], multCameras.camera[cameraSelected].camPosition[1], multCameras.camera[cameraSelected].camPosition[2]);
    }

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);
    //console.log("inverse->"+viewMatrix);

    // create a viewProjection matrix. This will both apply perspective
    // AND move the world so that the camera is effectively the origin
    var i = 0;
    for(i=0; i<allObjects.teste.length; i++){
      allObjects.teste[i].matrix = m4.multiply(perspectiveMatrix, viewMatrix);
      //  console.log(viewProjectionMatrix);
      allObjects.teste[i].matrix = m4.multiply(allObjects.teste[i].matrix, worldMatrix);
      allObjects.teste[i].matrix = m4.translate(allObjects.teste[i].matrix,
        allObjects.teste[i].translation[0],
        allObjects.teste[i].translation[1],
        allObjects.teste[i].translation[2],
      );
      
      allObjects.teste[i].matrix = m4.xRotate(allObjects.teste[i].matrix,
        allObjects.teste[i].rotation[0]);
      allObjects.teste[i].matrix = m4.yRotate(allObjects.teste[i].matrix,
        allObjects.teste[i].rotation[1]);
      allObjects.teste[i].matrix = m4.zRotate(allObjects.teste[i].matrix,
        allObjects.teste[i].rotation[2]);
      allObjects.teste[i].matrix = m4.scale(allObjects.teste[i].matrix,
        allObjects.teste[i].scale[0],
        allObjects.teste[i].scale[1],
        allObjects.teste[i].scale[2],
      );
      
      gl.uniformMatrix4fv(matrixLocation, false, allObjects.teste[i].matrix);

      gl.drawArrays(gl.TRIANGLES, 0, n);
      console.log("Olha", 
        allObjects.teste[objectSelected].translation[0],
        allObjects.teste[objectSelected].translation[1],
        allObjects.teste[objectSelected].translation[2],
        allObjects.teste[objectSelected].rotation[0],
        allObjects.teste[objectSelected].rotation[1],
        allObjects.teste[objectSelected].rotation[2],
      );
      console.log("AHAM",allObjects);
    }
  }else{
    //console.log("AQUI");
    var i =0;
    console.log("OLHA", allObjects.teste.length);
    for (i = 0; i < allObjects.teste.length; i++){
      allObjects.teste[i].matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 500);
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

      console.log("Olha sem camera", 
        allObjects.teste[objectSelected].translation[0],
        allObjects.teste[objectSelected].translation[1],
        allObjects.teste[objectSelected].translation[2],
        allObjects.teste[objectSelected].rotation[0],
        allObjects.teste[objectSelected].rotation[1],
        allObjects.teste[objectSelected].rotation[2],
      );

    }
  };

  //gl.uniformMatrix4fv(matrixLocation, false, allObjects.teste[objectSelected].matrix);
  //gl.uniformMatrix4fv(matrixLocation, false, allObjects.teste[objectSelected].matrix);


  //Tem o jeito que e bem explicadinho mas vou deixar assim no momento
  //gl.drawArrays(gl.TRIANGLES, 0, n);

  if(temp <= 7){
    //requestAnimationFrame(drawAll);
  }
};

init();
var n = drawFist();
var then = 0;
var rotationSpeed = 1;
drawAll();
UI(objectSelected, cameraSelected);

function selectObject(e){
  console.log(e);
  objectSelected = e;
  UI(e, cameraSelected);
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
  translation2 = [317, 281, 0];
  rotation2 = [degToRad(155), degToRad(0), degToRad(39)];
  //translation2 = [150, 150, 0];
  //rotation2 = [degToRad(40), degToRad(25), degToRad(325)];
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
  UI(opt.value, cameraSelected);

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
  UI(allObjects.teste.length-1, cameraSelected);
  draw();
  
};

function selectCamera(e){
  console.log(e);
  cameraSelected = e;
  drawAll();
  UI(objectSelected, e);
};

function addCamera() {
  // get reference to select element
    var sel = document.getElementById('listCameras');
    var opt = document.createElement('option');
    opt.appendChild( document.createTextNode(String(sel.length).concat(' - Camera')));

    // set value property of opt
  opt.value = sel.length;

  var camera = {
    camPosition : [0, 0, -200],
    zoom: 60,
    midPoint: [0, 0, 0],
    endPoint: [0, 0, 0],
  };
  multCameras.camera[opt.value] = camera;
  cameraSelected = opt.value;
  drawAll();
  UI(objectSelected, cameraSelected);
  // add opt to end of select box (sel)
  sel.appendChild(opt); 

}

function removeCamera() {
  // remove 2nd option in select box (sel)
  var sel = document.getElementById('listCameras');
    sel.removeChild( sel.options[sel.length-1] ); 

  multCameras.camera.splice(multCameras.camera.length-1);
  console.log("VAMO VER"+allObjects.teste.length);
  cameraSelected = multCameras.camera.length-1;
  drawAll();
  UI(objectSelected, cameraSelected);
  
};

function onnAndOffCamera(){
  console.log("TO AQUI");
  console.log("camera", multCameras.camera[cameraSelected].cameraOnn);
  if (!multCameras.camera[cameraSelected].cameraOnn)
    multCameras.camera[cameraSelected].cameraOnn = 1;
  else{
    multCameras.camera[cameraSelected].cameraOnn = 0;
    multCameras.camera[cameraSelected].lookAtOnn = 0;
  }
  console.log("camera", multCameras.camera[cameraSelected].camera);
  drawAll();
}

function onnAndOffLookAt(){
  console.log("TO AQUI lookAt");
  console.log("lookAtOnn", multCameras.camera[cameraSelected].lookAtOnn);
  if (!multCameras.camera[cameraSelected].lookAtOnn)
    multCameras.camera[cameraSelected].lookAtOnn = 1;
  else
    multCameras.camera[cameraSelected].lookAtOnn = 0;
  console.log("lookAtOnn", multCameras.camera[cameraSelected].lookAtOnn);
  drawAll();
}

function onnAndOffFollowObject(){
  console.log("TO AQUI followObject");
  console.log("lookAtOnn", multCameras.camera[cameraSelected].followObject);
  if (!multCameras.camera[cameraSelected].followObject)
    multCameras.camera[cameraSelected].followObject = 1;
  else
    multCameras.camera[cameraSelected].followObject = 0;
  console.log("lookAtOnn", multCameras.camera[cameraSelected].followObject);
  drawAll();
}

function addTranslationForAnimation(){
  var listAnimation = {
    translationX,
    translationY,
    translationZ,
    rotationX,
    rotationY,
    rotationZ,
    scaleX,
    scaleY,
    scaleZ,
  };

  var sel = document.getElementById('listForAnimation');
  var opt = document.createElement('li');

  if((document.getElementById("valEixo").value) == "x"){
    listAnimation.translationX = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "translationX";
    opt.appendChild( document.createTextNode(String(listAnimation.translationX).concat(' - Tranlation in X')));
    console.log("AHAM", listAnimation.translationX);
  }else if((document.getElementById("valEixo").value) == "y"){
    listAnimation.translationY = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "translationY";
    opt.appendChild( document.createTextNode(String(listAnimation.translationY).concat(' - Tranlation in Y')));
    console.log("AHAM", listAnimation.translationY);

  }else if((document.getElementById("valEixo").value) == "z"){
    listAnimation.translationZ = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "translationZ";
    opt.appendChild( document.createTextNode(String(listAnimation.translationZ).concat(' - Tranlation in Z')));
    console.log("AHAM", listAnimation.translationZ);
  }else{
    console.log("Error select a aixs");
    return;
  }

  orderAnimation[(orderAnimation.length)] = listAnimation;
  console.log("OLHA", orderAnimation);


  opt.value = sel.length;

  sel.appendChild(opt); 
  return;
};

function addRotationForAnimation(){
  var listAnimation = {
    translationX,
    translationY,
    translationZ,
    rotationX,
    rotationY,
    rotationZ,
    scaleX,
    scaleY,
    scaleZ,
  };

  var sel = document.getElementById('listForAnimation');
  var opt = document.createElement('li');

  if((document.getElementById("valEixo").value) == "x"){
    listAnimation.rotationX = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "rotationX";
    opt.appendChild( document.createTextNode(String(listAnimation.rotationX).concat(' - Rotation in X')));
    console.log("AHAM", listAnimation.rotationX);

  }else if((document.getElementById("valEixo").value) == "y"){
    listAnimation.rotationY = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "rotationY";
    opt.appendChild( document.createTextNode(String(listAnimation.rotationY).concat(' - Rotation in Y')));
    console.log("AHAM", listAnimation.rotationY);

  }else if((document.getElementById("valEixo").value) == "z"){
    listAnimation.rotationZ = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "rotationZ";
    opt.appendChild( document.createTextNode(String(listAnimation.rotationZ).concat(' - Rotation in Z')));
    console.log("AHAM", listAnimation.rotationZ);
  }else{
    console.log("Error select a aixs");
    return;
  }
  orderAnimation[(orderAnimation.length)] = listAnimation;
  console.log("OLHA", orderAnimation);
  opt.value = sel.length;

  sel.appendChild(opt); 
  return;
};

function addScaleForAnimation(){
  var listAnimation = {
    translationX,
    translationY,
    translationZ,
    rotationX,
    rotationY,
    rotationZ,
    scaleX,
    scaleY,
    scaleZ,
  };

  var sel = document.getElementById('listForAnimation');
  var opt = document.createElement('li');

  if((document.getElementById("valEixo").value) == "x"){
    listAnimation.scaleX = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "scaleX";
    opt.appendChild( document.createTextNode(String(listAnimation.scaleX).concat(' - Scale in X')));
    console.log("AHAM", listAnimation.scaleX);

  }else if((document.getElementById("valEixo").value) == "y"){
    listAnimation.scaleY = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "scaleY";
    opt.appendChild( document.createTextNode(String(listAnimation.scaleY).concat(' - Scale in Y')));
    console.log("AHAM", listAnimation.scaleY);

  }else if((document.getElementById("valEixo").value) == "z"){
    listAnimation.scaleZ = document.getElementById("valAnimation").value;
    listAnimation.isTransformation = "scaleZ";
    opt.appendChild( document.createTextNode(String(listAnimation.scaleZ).concat(' - Scale in Z')));
    console.log("AHAM", listAnimation.scaleZ);
  }else{
    console.log("Error select a aixs");
    return;
  }
  orderAnimation[(orderAnimation.length)] = listAnimation;
  console.log("OLHA", orderAnimation);
  opt.value = sel.length;

  sel.appendChild(opt); 
  return;
};


//INTERFACE
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
} 

var then = 0;
function startAnimation(){
  then = 0;
  requestAnimationFrame(drawAnimation);
  return;
};

var fazIsso = 200 / 5;
var temp =0;
var now = 0;
var index = 0;
function drawAnimation(now){
  now *= 0.001;
  var deltaTime = now - then;
  temp = temp + deltaTime;
  var control = orderAnimation.length;
  console.log("TAMANHO", orderAnimation.length);
  if(then == 0){
    then = now;
    temp = 0;
    requestAnimationFrame(drawAnimation);
  }else{
    var step = 0;
    var timeTransformationAnimation = 5;
    if(orderAnimation[index].isTransformation == "translationX"){
      step = orderAnimation[index].translationX / timeTransformationAnimation;
      allObjects.teste[objectSelected].translation[0] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "translationY"){
      step = orderAnimation[index].translationY / timeTransformationAnimation;
      allObjects.teste[objectSelected].translation[1] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "translationZ"){
      step = orderAnimation[index].translationZ / timeTransformationAnimation;
      allObjects.teste[objectSelected].translation[2] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "rotationX"){
      //Regra de tres
      step = theRuleOfThree(orderAnimation[index].rotationX);
      allObjects.teste[objectSelected].rotation[0] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "rotationY"){
      //Regra de tres
      step = theRuleOfThree(orderAnimation[index].rotationY);
      allObjects.teste[objectSelected].rotation[1] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "rotationZ"){
      //Regra de tres
      step = theRuleOfThree(orderAnimation[index].rotationZ);
      allObjects.teste[objectSelected].rotation[2] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "scaleX"){
      step = orderAnimation[index].scaleX / timeTransformationAnimation;
      allObjects.teste[objectSelected].scale[0] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "scaleY"){
      step = orderAnimation[index].scaleY / timeTransformationAnimation;
      allObjects.teste[objectSelected].scale[1] += step * deltaTime;
    }else if(orderAnimation[index].isTransformation == "scaleZ"){
      step = orderAnimation[index].scaleZ / timeTransformationAnimation;
      allObjects.teste[objectSelected].scale[2] += step * deltaTime;
    };
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    then = now;

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

    var i =0;
    for (i = 0; i < allObjects.teste.length; i++){
      allObjects.teste[i].matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 500);
      allObjects.teste[i].matrix = m4.translate(allObjects.teste[i].matrix, allObjects.teste[i].translation[0], allObjects.teste[i].translation[1], allObjects.teste[i].translation[2]);
      allObjects.teste[i].matrix = m4.xRotate(allObjects.teste[i].matrix, allObjects.teste[i].rotation[0]);
      allObjects.teste[i].matrix = m4.yRotate(allObjects.teste[i].matrix, allObjects.teste[i].rotation[1]);
      allObjects.teste[i].matrix = m4.zRotate(allObjects.teste[i].matrix, allObjects.teste[i].rotation[2]);
      allObjects.teste[i].matrix = m4.scale(allObjects.teste[i].matrix, allObjects.teste[i].scale[0], allObjects.teste[i].scale[1], allObjects.teste[i].scale[2]);

      // Set the matrix.
      gl.uniformMatrix4fv(matrixLocation, false, allObjects.teste[i].matrix);


      //Tem o jeito que e bem explicadinho mas vou deixar assim no momento
      gl.drawArrays(gl.TRIANGLES, 0, n);

    };

    if( temp < 5 ){
      requestAnimationFrame(drawAnimation);
    }else{
      index += 1;
      if(index < control){
        temp = 0;
        requestAnimationFrame(drawAnimation)
      }else
        index = 0;
        return;
    };
  };
};

function theRuleOfThree(step){
  var x = 360;
  var value = 1.2 * step;
  return value/x;
};
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
