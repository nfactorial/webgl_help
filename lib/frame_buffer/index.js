export const InvalidFrameBufferId = null;

/**
 * Represents a WebGL frame buffer object.
 */
export default class FrameBuffer {
    constructor() {
        this._gl = null;
        this._id = InvalidFrameBufferId;
        this._width = 0;
        this._height = 0;
    }

    /**
     * Discards all resources currently referenced by this object.
     */
    dispose() {
        if (this._id !== InvalidFrameBufferId) {
            this._gl.deleteFramebuffer(this._id);
            this._id = InvalidFrameBufferId;
            this._gl = null;
        }

        this._width = 0;
        this._height = 0;
    }

    /**
     * Prepares the FrameBuffer object for use by the application.
     * @param {WebGLRenderingContext} gl - The WebGL context currently in use.
     */
    initialize(gl) {
        if (this._id !== InvalidFrameBufferId) {
            throw new Error('FrameBuffer already initialized.');
        }

        this._id = gl.createFramebuffer();
    }

    /**
     * Retrieves the raw WebGL frame-buffer id associated with this object.
     * @returns {WebGLFramebuffer|null} The WebGLFramebuffer object associated with this object.
     */
    get id() {
        return this._id;
    }

    /**
     * Gets the width of the frame buffer (in pixels)
     * @returns {number} The width of the frame buffer (in pixels).
     */
    get width() {
        return this._width;
    }

    /**
     * Retrieves the height of the frame buffer (in pixels)
     * @returns {number} The height of the frame buffer (in pixels).
     */
    get height() {
        return this._height;
    }
}
