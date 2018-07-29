/**
 * Base class for all WebGL buffer objects within the library.
 */
export default class BaseBuffer {
    constructor(capacity) {
        this._gl = null;
        this._bufferType = 0;
        this._drawType = 0;
        this._id = 0;
    }

    /**
     * Releases any hardware resources referenced by this object.
     */
    dispose() {
        if (this._gl) {
            this._gl.deleteBuffer(this._id);

            this._id = 0;       // TODO: Invalid GL_BUFFER_ID
            this._gl = null;
        }
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._bufferType;
    }

    /**
     * Ensures the buffer is active and available on the WebGL context.
     */
    enable() {
        this._gl.bindBuffer(this._bufferType, this._id);
    }

    disable() {

    }

    /**
     * Private method, to be called from derived classes, prepares the buffer for use by the application.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context we belong to.
     * @param {number} bufferType - The WebGL buffer type we are representing.
     * @param {number} drawType - The type of draw operation we will be using.
     * @private
     */
    _initialize(gl, bufferType, drawType) {
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
     * @private
     */
    _bufferData(data) {
        if (!this._gl) {
            throw new Error('BaseBuffer._bufferData - No WebGL context was available.');
        }

        this.enable();
        this._gl.bufferData(this._bufferType, data, this._drawType);
    }
}
