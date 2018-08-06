import {InvalidBufferId} from '../buffer';
import {InvalidProgramId} from '../program';

const MAXIMUM_TEXTURE_UNITS = 32;

/**
 * Manages the state of the current device.
 * The WebGLState object uses raw WebGL objects rather than any wrappers that are included with the library.
 * This makes the WebGLState object more reusable, it also allows it to work even if the application isn't using
 * all our internal support wrappers.
 */
export default class WebGLState {
    constructor() {
        this._gl = null;
        this._textureUnits = [];

        this._activeProgram = InvalidProgramId;

        this._depthRead = {
            isSet: false,
            isEnabled: true
        };
        this._depthWrite = {
            isSet: false,
            isEnabled: true
        };

        this._arrayBuffer = InvalidBufferId;
        this._elementArrayBuffer = InvalidBufferId;

        for (let loop = 0; loop < MAXIMUM_TEXTURE_UNITS; ++loop) {
            this._textureUnits[loop] = {
                type: 0,        // InvalidTextureType
                texture: null   // InvalidTextureId
            };
        }
    }

    invalidate() {
        this._activeProgram = InvalidProgramId;
        this._arrayBuffer = InvalidBufferId;
        this._elementArrayBuffer = InvalidBufferId;

        this._depthRead.isSet = false;
        this._depthRead.isEnabled = true;

        this._depthWrite.isSet = false;
        this._depthWrite.isEnabled = true;

        for (let loop = 0; loop < MAXIMUM_TEXTURE_UNITS; ++loop) {
            this._textureUnits[loop].type = 0;          // InvalidTextureType
            this._textureUnits[loop].texture = null;    // InvalidTextureId;
        }
    }

    /**
     * Retrieves the Program object currently in use by the state.
     * @returns {WebGLProgram} The WebGLProgram instance currently in use by the gl state.
     */
    get program() {
        return this._activeProgram;
    }

    /**
     * Determines whether or not reading from the depth buffer is enabled.
     * @returns {boolean} True if reading from the depth buffer is enabled otherwise false.
     */
    get depthRead() {
        return this._depthRead.isEnabled;
    }

    /**
     * Enables or disables reading from the depth buffer.
     * @param {boolean} value - True if depth read should be enabled otherwise false.
     */
    set depthRead(value) {
        if (this._gl && !this._depthRead.isSet || value !== this._depthRead.isEnabled) {
            this._depthRead.isSet = true;
            this._depthRead.isEnabled = value;

            value ? this._gl.enable(this._gl.DEPTH_TEST) : this._gl.disable(this._gl.DEPTH_TEST);
        }
    }

    /**
     * Determines whether or not writing to the depth buffer is currently enabled.
     * @returns {boolean} True if writing to the depth buffer is enabled otherwise false.
     */
    get depthWrite() {
        return this._depthWrite.isEnabled;
    }

    /**
     * Enables or disables writing to the depth buffer.
     * @param {boolean} value - True if writing to the depth buffer should be enabled otherwise false.
     */
    set depthWrite(value) {
        if (this._gl && !this._depthWrite.isSet || value !== this._depthWrite.isEnabled) {
            this._depthWrite.isSet = true;
            this._depthWrite.isEnabled = value;

            this._gl.depthMask(value);
        }
    }

    /**
     * Enables the specified program on the WebGL device.
     * @param {WebGLProgram} programId - The WebGLProgram to be enabled on the device.
     */
    useProgram(programId) {
        if (this._activeProgram !== programId) {
            this._gl.useProgram(programId);
            this._activeProgram = programId;
        }
    }

    /**
     *
     * @param {number} textureUnit
     * @param {WebGLTexture} textureId - The WebGL texture to be bound to the specified texture.
     */
    bindTexture2D(textureUnit, textureId) {
        // TODO: Not sure whether to split bindTexture into bindTexture2D/bindTexture3D etc. or
        // TODO: have caller specify texture type as a parameter (eg: bindTexture(gl.TEXTURE_2D, textureUnit, textureId)).
        if (textureUnit < 0 || textureUnit > MAXIMUM_TEXTURE_UNITS) {
            throw new Error('Invalid texture unit id.');
        }

        // TODO: Still undecided on this implementation.

        if (this._textureUnits[textureUnit].type !== this._gl.TEXTURE_2D || this._textureUnits[textureUnit].texture !== textureId) {
            this._gl.bindTexture(this._gl.TEXTURE_2D + textureUnit, textureId);
            this._textureUnits[textureUnit].type = this._gl.TEXTURE_2D;
            this._textureUnits[textureUnit].texture = textureId;
        }
    }

    /**
     * Binds a WebGL buffer object to the array buffer.
     * @param {WebGLBuffer} bufferId - The WebGLBuffer to be bound to the array buffer.
     */
    bindArrayBuffer(bufferId) {
        if (this._arrayBuffer !== bufferId) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, bufferId);
            this._arrayBuffer = bufferId;
        }
    }

    /**
     * Binds a WebGL buffer object to the element array buffer.
     * @param {WebGLBuffer} bufferId - The WebGLBuffer to be bound to the element array buffer.
     */
    bindElementArrayBuffer(bufferId) {
        if (this._elementArrayBuffer !== bufferId) {
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, bufferId);
            this._elementArrayBuffer = bufferId;
        }
    }
}
