// Simple vector drawing program using WebGL.
'use strict';

// Global WebGL context variable
let gl;


// Once the document is fully loaded run this init function.
window.addEventListener('load', function init() {
    // Get the HTML5 canvas object from it's ID
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) { window.alert('Could not find #webgl-canvas'); return; }

    // Get the WebGL context (save into a global variable)
    gl = canvas.getContext('webgl2');
    if (!gl) { window.alert("WebGL isn't available"); return; }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height); // this is the region of the canvas we want to draw on (all of it)
    gl.clearColor(1.0, 1.0, 1.0, 0.0); // setup the background color with red, green, blue, and alpha
    
    // Initialize the WebGL program, buffers, and events
    gl.program = initProgram();
    initBuffers();
    initEvents();

    // Render the scene
    render();
});


/**
 * Initializes the WebGL program.
 */
function initProgram() {
    // Compile shaders
    // Vertex Shader: simplest possible
    let vertShader = compileShader(gl, gl.VERTEX_SHADER,
        `#version 300 es
        precision mediump float;

        in vec4 aPosition;
        in vec4 aColor;

        out vec4 vColor;
        
        void main() {
            gl_Position = aPosition;
            gl_PointSize = 5.0; // make points visible
            vColor = aColor;
        }`
    );
    // Fragment Shader: simplest possible, chosen color is red for each point
    let fragShader = compileShader(gl, gl.FRAGMENT_SHADER,
        `#version 300 es
        precision mediump float;

        in vec4 vColor;
        out vec4 fragColor;

        void main() {
            fragColor = vColor;
        }`
    );

    // Link the shaders into a program and use them with the WebGL context
    let program = linkProgram(gl, vertShader, fragShader);
    gl.useProgram(program);
    
    // Get and save the position and color attribute indices
    program.aPosition = gl.getAttribLocation(program, 'aPosition'); // get the vertex shader attribute "aPosition"
    program.aColor = gl.getAttribLocation(program, 'aColor'); // get the vertex shader attribute "aColor"
    
    return program;
}


/**
 * Initialize the data buffers. This allocates a vertex array containing two array buffers:
 *   * For aPosition, 100000 2-component floats
 *   * For aColor, 100000 3-component floats
 * Both are setup for dynamic drawing.
 */
function initBuffers() {
	// TODO
}


/**
 * Initialize the event handlers and initialize any global variables based on the current values
 * in the HTML inputs.
 */
function initEvents() {
	// TODO
}


/**
 * Render the scene. This goes through each shape and draws its vertices using the appropriate
 * mode and range of vertices.
 */
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// TODO
}
