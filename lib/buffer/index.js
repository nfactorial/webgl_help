export const InvalidBufferId = null;

/**
 * Base class for all WebGL buffer objects within the library.
 */
export default class BaseBuffer {
    constructor() {
        this._gl = null;
        this._bufferType = 0;
        this._drawType = 0;
        this._id = InvalidBufferId;
    }

    /**
     * Releases any hardware resources referenced by this object.
     */
    dispose() {
        if (this._gl) {
            this._gl.deleteBuffer(this._id);

            this._id = InvalidBufferId;
            this._gl = null;
        }
    }

    /**
     * Retrieves the raw WebGL buffer id associated with this buffer object.
     * @returns {WebGLBuffer|null} The WebGLBuffer object associated with this buffer.
     */
    get id() {
        return this._id;
    }

    /**
     * The type of buffer represented by this object.
     * @returns {number|*}
     */
    get type() {
        return this._bufferType;
    }

    /**
     * Prepares the buffer for use using the supplied description.
     * This method should not be called directly, instead use a concrete implementations initialize method.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context we belong to.
     * @param {number} bufferType - The WebGL buffer type we are representing.
     * @param {number} drawType - The type of draw operation we will be using.
     * @returns {BaseBuffer} Reference to self to allow for call chaining.
     */
    initializeBuffer(gl, bufferType, drawType) {
        if (this._gl) {
            throw new Error('Buffer has already been initialized.');
        }

        if (!gl) {
            throw new Error('Invalid WebGL context was specified.');
        }

        this._gl = gl;
        this._bufferType = bufferType;
        this._drawType = drawType;

        this._id = gl.createBuffer();

        return this;
    }

    /**
     * Copies the specified block of data into the buffer.
     * @param data
     * @protected
     */
    bufferData(data) {
        if (!this._gl) {
            throw new Error('No WebGL context available.');
        }

        this._gl.bufferData(this._bufferType, data, this._drawType);
    }
}
