import { InvalidBufferId } from '../buffer';
import { InvalidProgramId } from '../program';
import { InvalidFrameBufferId } from '../frame_buffer';

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
        this._frameBuffer = InvalidFrameBufferId;

        this._cullEnabled = {
            isSet: false,
            value: false,
        };

        this._cullMode = {
            isSet: false,
            value: 0,
        };

        this._depthRead = {
            isSet: false,
            isEnabled: true,
        };

        this._depthWrite = {
            isSet: false,
            isEnabled: true,
        };

        this._arrayBuffer = InvalidBufferId;
        this._elementArrayBuffer = InvalidBufferId;

        for (let loop = 0; loop < MAXIMUM_TEXTURE_UNITS; ++loop) {
            this._textureUnits[loop] = {
                type: 0,        // InvalidTextureType
                texture: null,  // InvalidTextureId
            };
        }
    }

    /**
     * Invalidates the current state of the state manager.
     */
    invalidate() {
        this._activeProgram = InvalidProgramId;
        this._arrayBuffer = InvalidBufferId;
        this._frameBuffer = InvalidFrameBufferId;
        this._elementArrayBuffer = InvalidBufferId;

        this._cullMode.isSet = false;
        this._cullEnabled.isSet = false;

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
     * Retrieves the WebGL context associated with this state manager.
     * @returns {WebGLRenderingContext|null} The WebGLRenderingContext associated with this object.
     */
    get context() {
        return this._gl;
    }

    /**
     * Retrieves the Program object currently in use by the state.
     * @returns {WebGLProgram} The WebGLProgram instance currently in use by the gl state.
     */
    get program() {
        return this._activeProgram;
    }

    /**
     * Retrieves the current frame buffer object bound to the WebGL device.
     * @returns {WebGLFramebuffer|null} The WebGLFrameBuffer currently bound to the WebGL context.
     */
    get frameBuffer() {
        return this._frameBuffer;
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
        if (this._gl && (!this._depthRead.isSet || value !== this._depthRead.isEnabled)) {
            this._depthRead.isSet = true;
            this._depthRead.isEnabled = value;

            if (value) {
                this._gl.enable(this._gl.DEPTH_TEST);
            } else {
                this._gl.disable(this._gl.DEPTH_TEST);
            }
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
        if (this._gl && (!this._depthWrite.isSet || value !== this._depthWrite.isEnabled)) {
            this._depthWrite.isSet = true;
            this._depthWrite.isEnabled = value;

            this._gl.depthMask(value);
        }
    }

    /**
     *
     * @return
     */
    get cullMode() {
        return this._cullMode.isSet ? this._cullMode.value : this._gl.BACK;
    }

    /**
     * Determines whether or not face culling is currently enabled.
     * @return {boolean} True if face culling is enabled otherwise false.
     */
    get cullEnabled() {
        return this._cullEnabled.isSet ? this._cullEnabled.value : false;
    }

    /**
     * Enables or disables face culling and applies the appropriate culling mode.
     * @param {boolean} enabled - True to enable face culling or false to disable.
     * @param {number=} mode - Optional face culling mode to be applied to rendered geometry.
     */
    setCullMode(enabled, mode) {
        if (!this._cullEnabled.isSet || enabled !== this._cullEnabled.value) {
            this._cullEnabled.isSet = true;
            this._cullEnabled.value = enabled;

            if (enabled) {
                this._gl.enable(this._gl.CULL_FACE);
            } else {
                this._gl.disable(this._gl.CULL_FACE);
            }
        }

        if (mode && (!this._cullMode.isSet || mode !== this._cullMode.value)) {
            this._cullMode.isSet = true;
            this._cullMode.value = mode;

            this._gl.cullFace(mode);
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
        // TODO: have caller specify texture type as a parameter
        // TODO: for example: bindTexture(gl.TEXTURE_2D, textureUnit, textureId)
        if (textureUnit < 0 || textureUnit > MAXIMUM_TEXTURE_UNITS) {
            throw new Error('Invalid texture unit id.');
        }

        // TODO: Still undecided on this implementation.

        if (   this._textureUnits[textureUnit].type !== this._gl.TEXTURE_2D
            || this._textureUnits[textureUnit].texture !== textureId) {
            this._gl.bindTexture(this._gl.TEXTURE_2D + textureUnit, textureId);
            this._textureUnits[textureUnit].type = this._gl.TEXTURE_2D;
            this._textureUnits[textureUnit].texture = textureId;
        }
    }

    /**
     * Binds a frame buffer to the current WebGL context.
     * @param {WebGLFramebuffer} frameBuffer - The WebGL frame buffer object to be bound to the context.
     */
    bindFrameBuffer(frameBuffer) {
        if (frameBuffer !== this._frameBuffer) {
            this._frameBuffer = frameBuffer;
            this._gl.bindFrameBuffer(frameBuffer);
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
