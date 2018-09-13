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
}
