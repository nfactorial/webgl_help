export const InvalidFrameBufferId = null;

/**
 *
 */
export default class FrameBuffer {
    constructor() {
        this._id = InvalidFrameBufferId;
    }

    /**
     * Retrieves the raw WebGL frame-buffer id associated with this object.
     * @returns {WebGLFramebuffer|null} The WebGLFramebuffer object associated with this object.
     */
    get id() {
        return this._id;
    }
}
