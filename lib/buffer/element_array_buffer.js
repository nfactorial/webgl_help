import BaseBuffer from './index';

export default class ElementArrayBuffer extends BaseBuffer {
    /**
     *
     * @param {WebGLRenderingContext} gl - The WebGL context to be used when creating the buffer.
     * @param {number} drawType - The type of data contained within the buffer.
     * @returns {ElementArrayBuffer} Reference to self, to allow for call chaining.
     */
    initialize(gl, drawType) {
        super.initializeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, drawType);
        return this;
    }

    /**
     * Binds the array buffer to the current WebGL context.
     * @param {WebGLState} state - The state manager for the WebGL context in use.
     * @returns {ElementArrayBuffer} Reference to self to allow for call chaining.
     */
    bind(state) {
        state.bindElementArrayBuffer(this.id);
        return this;
    }
}
