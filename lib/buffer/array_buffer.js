import BaseBuffer from './index';

export default class ArrayBuffer extends BaseBuffer {
    constructor() {
        super();
    }

    /**
     *
     * @param {WebGLRenderingContext} gl - The WebGL context to be used when creating the buffer.
     * @param {number} drawType - The type of data contained within the buffer.
     * @returns {ArrayBuffer} Reference to self, to allow for call chaining.
     */
    initialize(gl, drawType) {
        super.initializeBuffer(gl, gl.ARRAY_BUFFER, drawType);
        return this;
    }

    /**
     * Binds the array buffer to the current WebGL context.
     * @param {WebGLState} state - The state manager for the WebGL context in use.
     * @returns {ArrayBuffer} Reference to self to allow for call chaining.
     */
    bind(state) {
        state.bindArrayBuffer(this.id);
        return this;
    }
}
