// Simple vector drawing program using WebGL.
'use strict';

const MAX_NUM_OF_VERTICES = 100000;

// Global WebGL context variable
let gl;

let selectModeElm; // the select element for setting the mode
let selectColorElm; // the input element for setting the color


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

    gl.objects = [] // create an array to store all created objects
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
 * An object storing the mode, number of points, and the references to the buffers is returned.
 * Both are setup for dynamic drawing.
 */
function createObject(mode) {
    const object = {
        mode: mode,
        numPoints: 0
    };

    // Create and Bind VAO
    object.VAO = gl.createVertexArray();
    gl.bindVertexArray(object.VAO);

    // Load the vertex coordinate data onto the GPU and associate with attribute
    object.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_NUM_OF_VERTICES * 2 * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(gl.program.aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.program.aPosition);

    // Load the color data onto the GPU and associate with attribute
    object.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_NUM_OF_VERTICES * 3 * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(gl.program.aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.program.aColor);

    // TODO: Cleanup
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return object;
}

function stringToColor(str) {
    return Float32Array.of(
        parseInt(str.substr(1, 2), 16) / 255.0,
        parseInt(str.substr(3, 2), 16) / 255.0,
        parseInt(str.substr(5, 2), 16) / 255.0,
        1
    );
}

/**
 * Initialize the event handlers and initialize any global variables based on the current values
 * in the HTML inputs.
 */
function initEvents() {
    // Set the initial color
    selectColorElm = document.getElementById("draw-color");
    setColor(selectColorElm.value);
    
    // Set the initial draw mode
    selectModeElm = document.getElementById("draw-mode");
    setMode(selectModeElm.value);

    gl.canvas.addEventListener('click', onClick);

    // set the mode on the change event
    selectModeElm.addEventListener('change', (e) => {
        setMode(e.target.value);
    });

    // set the color on the input event
    selectColorElm.addEventListener('input', (e) => {
        setColor(e.target.value);
    })
}


/**
 * Render the scene. This goes through each shape and draws its vertices using the appropriate
 * mode and range of vertices.
 */
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // renders each object in gl.objects
    for (let i = 0; i < gl.objects.length; i++) {
        const object = gl.objects[i];

        gl.bindVertexArray(object.VAO);
        gl.drawArrays(object.mode, 0, object.numPoints); // draw mode based on object.mode
    
        // Cleanup
        gl.bindVertexArray(null);
    }
}

/*
Takes in a valid mode and returns its associated GLEnum.
Throws and error if the mode entered is not a valid option.
*/
function getGLModeFromText(mode) {
    const options = [
        ['POINTS', gl.POINTS],
        ['LINES', gl.LINES], ['LINE_STRIP', gl.LINE_STRIP], ['LINE_LOOP', gl.LINE_LOOP],
        ['TRIANGLES', gl.TRIANGLES], ['TRIANGLE_STRIP', gl.TRIANGLE_STRIP], ['TRIANGLE_FAN', gl.TRIANGLE_FAN]
    ];

    const i = options.findIndex((o) => o[0] === mode);
    if (i === -1) {
        throw Error("\"" + mode + "\" is not a valid mode.");
    } else {
        return options[i][1];
    }
}

/*
Creates a new object for the mode given and
sets the current active object to it.
*/
function setMode(mode) {
    const newObject = createObject(getGLModeFromText(mode));
    gl.currentObject = newObject;
    gl.objects.push(newObject);
}

/*
Parses the given color and sets the current
color value to it.
*/
function setColor(color) {
    gl.currentColor = stringToColor(color);
}

/*
Adds a new vertex onto the current object based on the point that
was clicked and the current color. calculates the newPoints by converting
from screen space. finally re-renders.
 */
function onClick(event) {
    let x = event.offsetX;
    let y = event.offsetY;
    let w = this.offsetWidth;
    let h = this.offsetHeight;

    // Convert coordinates from screen space
    x = (x / (w/2)) - 1;
    y = (-y / (h/2)) + 1;

    let newPoint = [x, y];

    // Bind the current VAO
    gl.bindVertexArray(gl.currentObject.VAO);

    // Add the new point to the current position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.currentObject.positionBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, gl.currentObject.numPoints * 2 * Float32Array.BYTES_PER_ELEMENT, Float32Array.from(newPoint));

    // Add the current color to the current color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.currentObject.colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER,  gl.currentObject.numPoints * 3 * Float32Array.BYTES_PER_ELEMENT, Float32Array.from(gl.currentColor));

    // Cleanup
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.currentObject.numPoints += 1;

    // Render the updated scene
    render();
}
