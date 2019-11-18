export const InvalidFrameBufferId = null;

/**
 * Represents a WebGL frame buffer object.
 */
export default class FrameBuffer {
    constructor() {
        this._gl = null;
        this._id = InvalidFrameBufferId;
    }

    /**
     * Discards all resources currently referenced by this object.
     */
    dispose() {
        if (this._id !== InvalidFrameBufferId) {
            this._gl.deleteFramebuffer(this._id);
            this._gl = null;

            this._id = InvalidFrameBufferId;
        }
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
     * Attach a texture to the color channel of the framebuffer object.
     * @param {WebGLRenderingContext} gl - The rendering context to be used.
     * @param {BaseTexture} texture - The texture to be bound to the framebuffers colour channel.
     * @param {number} level -
     */
    attachColor(gl, texture, level) {
        if (!texture) {
            throw new Error(`No texture supplied for framebuffer`);
        }

        if (this._id === InvalidFrameBufferId) {
            throw new Error('Cannot attach image to invalid framebuffer');
        }

        // See: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebuffertexture2d
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.id, level);
    }

    /**
     * Bind the specified resources to the framebuffer.
     * @param target
     * @param attachment
     * @param texTarget
     * @param texture
     * @param level
     * @private
     */
    _bindTexture2D(gl, target, attachment, texTarget, texture, level) {
        // TODO: Make this a part of the state manager
        gl.framebufferTexture2D(target, attachment, texTarget, texture, level);
    }

    /**
     * Retrieves the raw WebGL frame-buffer id associated with this object.
     * @returns {WebGLFramebuffer|null} The WebGLFramebuffer object associated with this object.
     */
    get id() {
        return this._id;
    }
}
