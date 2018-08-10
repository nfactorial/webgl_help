import BaseBuffer from '.';

const DEFAULT_CAPACITY = 1024;

/**
 * This buffer is used to represent a collection of four-point polygons.
 *
 * This allows the vertex buffer to specify each quad using four vertices.
 */
export default class QuadIndexBuffer extends BaseBuffer {
    /**
     *
     * @param {number=} capacity - The number of quads to be created within the buffer, the default is 1024.
     */
    constructor(capacity) {
        super();

        this._capacity = typeof capacity === 'number' ? capacity : DEFAULT_CAPACITY;
        this._rawBuffer = new Uint16Array(this._capacity * 6);
        this._generateIndices();
    }

    /**
     *
     * @param {WebGLRenderingContext} gl - The WebGL object to be used.
     */
    initialize(gl) {
        super._initialize(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);

        this._bufferData(this._rawBuffer);
    }

    /**
     * Generates the indices for all quads that are available for rendering within the buffer.
     * @private
     */
    _generateIndices() {
        for (let loop = 0, baseIndex = 0; loop < this._capacity; loop += 6, baseIndex += 4) {
            this._rawBuffer[loop + 0] = baseIndex + 0;
            this._rawBuffer[loop + 1] = baseIndex + 1;
            this._rawBuffer[loop + 2] = baseIndex + 2;

            this._rawBuffer[loop + 3] = baseIndex + 1;
            this._rawBuffer[loop + 4] = baseIndex + 3;
            this._rawBuffer[loop + 5] = baseIndex + 2;
        }
    }
}
