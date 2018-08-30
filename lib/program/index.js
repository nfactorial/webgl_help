/**
 * @typedef {object} VertexAttribute
 * @property {number} index - Index of the vertex attribute.
 * @property {string} name - Name associated with the vertex attribute.
 */

import Shader from '../shader';
import { createAttributeBuffer, sizeofAttribute } from '../attributes';

export const InvalidProgramId = null;

/**
 * Represents a WebGL shader program.
 *
 * When wishing to render using the shader program, you should use the WebGLState object.
 *
 * state.useProgram(program.id);
 * state.enableAttributes(program.attributeBuffer);
 *
 * Attribute management may be moved out of this library, as it seems a little more higher level than this library
 * is intended to provide. Perhaps moved to become a part of the material system.
 */
export default class Program {
    constructor() {
        this._gl = null;
        this._id = InvalidProgramId;
        this._vertexShader = new Shader();
        this._fragmentShader = new Shader();

        this.attributeBuffer = null;
    }

    /**
     * Prepares the GPU program for use by the application.
     * @param {WebGLRenderingContext} gl
     * @param {string=} vertexShaderSource - Source code for the vertex shader, if not specified no vertex shader will be created.
     * @param {string=} fragmentShaderSource - Source code for the fragment shader, if not specified no fragment shader will be created.
     */
    initialize(gl, vertexShaderSource, fragmentShaderSource) {
        if (!gl) {
            throw new Error('Program.initialize - No WebGL context was specified.');
        }

        if (this._gl) {
            throw new Error('Program.initialize - Program has already been initialized.');
        }

        this._id = gl.createProgram();
        this._gl = gl;

        if (vertexShaderSource) {
            this._vertexShader.initialize(gl, gl.VERTEX_SHADER, vertexShaderSource);
            gl.attachShader(this.id, this._vertexShader.id);
        }

        if (fragmentShaderSource) {
            this._fragmentShader.initialize(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            gl.attachShader(this.id, this._fragmentShader.id);
        }

        gl.linkProgram(this.id);

        if (gl.getProgramParameter(this.id, gl.LINK_STATUS) === false) {
            console.error('Program compile error.');
            console.error(gl.getProgramParameter(this.id, gl.VALIDATE_STATUS));

            this.dispose();
        } else {
            this._createAttributeBuffer(gl, this.id);
        }
    }

    /**
     * Releases all GPU resources referenced by this object.
     */
    dispose() {
        if (this._gl) {
            this._gl.deleteProgram(this._id);

            this._fragmentShader.dispose();
            this._vertexShader.dispose();

            this._id = InvalidProgramId;
            this._gl = null;

            this.attributeBuffer = null;
        }
    }

    /**
     * Retrieves the WebGL identifier for this object.
     * @returns {WebGLProgram} The raw WebGLProgram object represented by this class.
     */
    get id() {
        return this._id;
    }

    /**
     * Creates an attribute buffer based on the active attributes within the program.
     * @param {WebGLRenderingContext} gl - The WebGL context the program belongs to.
     * @param {WebGLProgram} id - Identifier of the WebGL program we are extracting the attributes from.
     * @private
     */
    _createAttributeBuffer(gl, id) {
        const desc = [];
        const count = gl.getProgramParameter(id, gl.ACTIVE_ATTRIBUTES);

        let offset = 0;

        for (let loop = 0; loop < count; loop++) {
            const info = gl.getActiveAttrib(id, loop);

            desc.push({
                location: gl.getAttribLocation(this.id, info.name),
                size: info.size,
                type: info.type,
                normalized: false,  // TODO: Needs to be controllable
                stride: 0,
                offset,
            });

            offset += sizeofAttribute(gl, info.type) * info.size;
        }

        this.attributeBuffer = createAttributeBuffer(desc);
    }

    /**
     * Retrieves the number of active uniforms used by the shader program.
     * @returns {number} The number of active uniform variables in the program.
     */
    getActiveUniforms() {
        return this._gl.getProgramParameter(this.id, this._gl.ACTIVE_UNIFORMS);
    }

    /**
     * Retrieves the WebGLActiveInfo describing a uniform variable within the program.
     * The number of available uniforms can be determined with the getActiveUniforms method.
     * @param {number} index - Index of the uniform attribute to be retrieved.
     * @returns {WebGLActiveInfo}
     */
    getActiveUniform(index) {
        return this._gl.getActiveUniform(this.id, index);
    }

    /**
     * Gets the location of the uniform variable associated with the specified name.
     * @param {string} name - The name of the uniform whose location is to be retrieved.
     * @returns {WebGLUniformLocation|null} The location of the uniform variable or null if it could not be found.
     */
    getUniformLocation(name) {
        return this._id !== InvalidProgramId ? this._gl.getUniformLocation(this._id, name) : null;
    }
}
