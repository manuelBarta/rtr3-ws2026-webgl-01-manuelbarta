
import { createProgram } from "./rtr/core/ShaderHelper.js"
import { Matrix4 } from "./rtr/math/Matrix4.js";
import { Color } from "./rtr/math/Color.js";
import { BufferGeometry } from "./rtr/core/BufferGeometry.js";
import { WebGLProgram } from "./rtr/core/WebGLProgram.js";

import GUI from './rtr/lil-gui/lil-gui.module.min.js';

function useBuffer(gl, buffer, itemSize, location = 0, normalize = false) {

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, itemSize, gl.FLOAT, normalize, 0, 0);

}

function createBuffer(gl, arrayData) {

    // Create a buffer.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Upload Geometry data
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(arrayData), gl.STATIC_DRAW);

    return buffer;

}

function createIndex(gl, indices) {

    // create the index buffer
    const indexBuffer = gl.createBuffer();

    // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        Uint16Array.from(indices),
        gl.STATIC_DRAW
    );

    return indexBuffer;

}

function main() {

    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', "canvas");
    canvas.style.display = 'block';
    canvas.width = canvas.height = Math.min(window.innerWidth, window.innerHeight);
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }
    document.body.appendChild(canvas);



    const triangleGeometry = new BufferGeometry();
    triangleGeometry.setAttribute('position', {
        'array': [
            .5, 1, 0,
            0, 0, 0,
            1, 0.3, 0,
        ],
        'itemSize': 3
    });
    triangleGeometry.setAttribute('color', {
        'array': [
            1, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 1
        ],
        'itemSize': 4
    });

    //const triangle1 = new TriangleGeometry(0,0,0);
    //const triangle2 = new TriangleGeometry(0,0.5,0);


    // Indexed Geometry - Quad
    const quadIndexed = createBuffer(gl, [
        -0.1, -0.5, 0, // 0
        -0.1, 0.5, 0,  // 1
        -.8, -0.5, 0,  // 2
        -.8, 0.5, 0    // 3
    ]);
    
    // Indexed Geometry - Quad
    const indices = createIndex(gl, [
        0, 1, 2,   // first triangle
        2, 1, 3,   // second triangle
    ]);
    // Quad Color Buffer - 4 vertices with 4 color components
    const quadColors = createBuffer(gl, [
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 1, 1, 1,
    ]);

    // TODO: Create a BufferGeometry for quad
    const quadGeometry = new BufferGeometry();
    quadGeometry.setIndex([
        0, 1, 2,   // first triangle
        2, 1, 3,   // second triangle
    ]);

    // setup GLSL program
    const program = new WebGLProgram(gl);

    // look up where the vertex data needs to go.
    const positionLocation = 0; // using layout(location=0) in the shaders
    // optionally you can use gl.getAttribLocation(program, "a_position");





    // Draw the scene.
    function drawScene() {

        // Define the size of the WebGL window/view on the canvas in pixel
        // maps NDC to window coordinates
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(controls.background.r, controls.background.g, controls.background.b, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the transformation matrix
        var matrix = new Matrix4();
        matrix = matrix.multiply(new Matrix4().makeTranslation(controls.translation.x, controls.translation.y, 0));
        matrix = matrix.multiply(new Matrix4().makeRotationZ(controls.angleInRadians));
        matrix = matrix.multiply(new Matrix4().makeScale(controls.scale.x, controls.scale.y, 1));

        // Tell it to use our program (pair of shaders)
        // gl.useProgram(program);
        program.use();



        // lookup uniforms
        //  const matrixLocation = gl.getUniformLocation(program, "modelMatrix");
        // const colorLocation = gl.getUniformLocation(program, "color");

        // set the uniforms
        program.setUniform("modelMatrix", matrix); // Set the matrix.
        program.setUniform("color", controls.color); // Set the color.

        // triangle - bind buffer and set attribute pointers
        triangleGeometry.draw(gl, program);

        // quad - bind buffer and set attribute pointers
        quadGeometry.draw(gl, program);
        useBuffer(gl, quadColors, 4, 1); // color buffer is at location=1
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        // quad - draw the geometry.
        // gl.drawArrays(gl.TRIANGLES, 0, 6); // <-- this is for non-indexed geometry
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // <-- ADD

    }


    // some settings that can be changed
    var controls = {
        'translation': { 'x': 0.0, 'y': 0.0 },
        'angleInRadians': 0,
        'scale': { 'x': 1, 'y': 1 },
        'color': new Color(0xff0000),
        'background': new Color(0xffffff),
    };

    drawScene(); // draw the scene once

    // ------------------------------------------------------------------------------------
    // GUI below
    // ------------------------------------------------------------------------------------

    var gui = new GUI();
    const transFolder = gui.addFolder('translation');
    transFolder.add(controls.translation, 'x', -1, 1).onChange(drawScene);
    transFolder.add(controls.translation, 'y', -1, 1).onChange(drawScene);
    transFolder.open();
    gui.add(controls, 'angleInRadians', 0.0, 2.0 * Math.PI).onChange(drawScene);
    const scaleFolder = gui.addFolder('scale');
    scaleFolder.add(controls.scale, 'x', -1, 1).onChange(drawScene);
    scaleFolder.add(controls.scale, 'y', -1, 1).onChange(drawScene);
    scaleFolder.open();
    gui.addColor(controls, 'color').onChange(drawScene);
    gui.addColor(controls, 'background').onChange(drawScene);

}

main(); // start everything!
