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
