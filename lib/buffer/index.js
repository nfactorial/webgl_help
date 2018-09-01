export const InvalidBufferId = null;

const DEFAULT_CAPACITY = 1024;

/**
 * Base class for all WebGL buffer objects within the library.
 */
export default class BaseBuffer {
    constructor(capacity = DEFAULT_CAPACITY) {
        this._gl = null;
        this._capacity = capacity;
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
     * Private method, to be called from derived classes, prepares the buffer for use by the application.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context we belong to.
     * @param {number} bufferType - The WebGL buffer type we are representing.
     * @param {number} drawType - The type of draw operation we will be using.
     * @protected
     */
    initialize(gl, bufferType, drawType) {
        if (this._gl) {
            throw new Error('BaseBuffer._initialize - Buffer has already been initialized.');
        }

        if (!gl) {
            throw new Error('BaseBuffer._initialize - Invalid WebGL context was specified.');
        }

        this._gl = gl;
        this._bufferType = bufferType;
        this._drawType = drawType;

        this._id = gl.createBuffer();
    }

    /**
     * Copies the specified block of data into the buffer.
     * @param data
     * @protected
     */
    _bufferData(data) {
        if (!this._gl) {
            throw new Error('BaseBuffer._bufferData - No WebGL context was available.');
        }

        this._gl.bufferData(this._bufferType, data, this._drawType);
    }
}
