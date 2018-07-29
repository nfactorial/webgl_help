import {InvalidProgram} from '../program';

/**
 * Manages the state of the current device.
 */
export default class WebGLState {
    constructor() {
        this._gl = null;
        this._activeProgram = InvalidProgram;
        this._buffers = [];
    }

    invalidate() {
        this._activeProgram = InvalidProgram;
    }

    /**
     * Retrieves the Program object currently in use by the state.
     * @returns {Program} The Program instance currently in use by the gl state.
     */
    get program() {
        return this._activeProgram;
    }

    /**
     * Enables the specified program on the WebGL device.
     * @param {Program|null} program - The Program instance to be enabled on the device.
     */
    useProgram(program) {
        if (this._activeProgram !== program) {
            this._gl.useProgram(program ? program.id : InvalidProgram);
            this._activeProgram = program;
        }
    }

    /**
     *
     * @param type
     * @param buffer
     */
    bindBuffer(type, buffer) {
        // TODO: Are we accepting a WebGLHelper.Buffer or a raw GL buffer id?
        // TODO: This should be consistent between resource types
        // TODO: Perhaps, because we are a low-level state management we use raw GL?
        // TODO: Should not access array with 'type' directly, as WebGL.BUFFER_TYPE can be large values. Provide our own?
        if (this._buffers[type] !== buffer) {
            this._gl.bindBuffer(type, buffer.id);
            this._buffers[type] = buffer;
        }
    }
}
