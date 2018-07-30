/**
 * @typedef {object} VertexAttribute
 * @property {number} index - Index of the vertex attribute.
 * @property {string} name - Name associated with the vertex attribute.
 */

import Shader from '../shader';

export const InvalidProgramId = null;

/**
 * Represents a WebGL shader program.
 */
export default class Program {
    constructor() {
        this._gl = null;
        this._id = InvalidProgramId;
        this._vertexShader = new Shader();
        this._fragmentShader = new Shader();
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
            gl.attachShader(this._id, this._vertexShader.id);
        }

        if (fragmentShaderSource) {
            this._fragmentShader.initialize(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            gl.attachShader(this._id, this._fragmentShader.id);
        }

        gl.linkProgram(this._id);

        if (gl.getProgramParameter(this._id, gl.LINK_STATUS) === false) {
            console.error('Program compile error.');
            console.error(gl.getProgramParameter(this._id, gl.VALIDATE_STATUS));

            this.dispose();
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
        }
    }

    /**
     * Retrieves the WebGL identifier for this object.
     * @returns {WebGLProgram} The raw WebGLProgram object represented by this class.
     */
    get id() {
        return this._id;
    }

    configureAttributes(gl, attributes) {
        const count = attributes.length;
        for (let loop = 0; loop < count; ++loop) {
            const attr = attributes[loop];

            const location = gl.getAttribLocation(this._id, attr.name);
            switch (attr.type) {
                case 'byte':
                    gl.vertexAttribPointer(location, attr.size, gl.BYTE, attr.normalized, attr.stride, attr.offset);
                    break;

                case 'short':
                    gl.vertexAttribPointer(location, attr.size, gl.SHORT, attr.normalized, attr.stride, attr.offset);
                    break;

                case 'ubyte':
                    gl.vertexAttribPointer(location, attr.size, gl.UNSIGNED_BYTE, attr.normalized, attr.stride, attr.offset);
                    break;

                case 'ushort':
                    gl.vertexAttribPointer(location, attr.size, gl.UNSIGNED_SHORT, attr.normalized, attr.stride, attr.offset);
                    break;

                case 'float':
                    gl.vertexAttribPointer(location, attr.size, gl.FLOAT, attr.normalized, attr.stride, attr.offset);
                    break;

                default:
                    throw new Error('VertexBuffer.initialize - Unknown data type specified for vertex attribute.');
            }

            gl.enableVertexAttribArray(location);
        }
    }

    /**
     * Binds a generic vertex index to an attribute location.
     * @param {number} index - Index of the generic vertex to bind.
     * @param {string} name - The name of the variable to which the vertex will be bound.
     * @returns {Program} The program object to allow for call chaining.
     */
    bindAttribLocation(index, name) {
        this._gl.bindAttribLocation(this._id, index, name);
        return this;
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
