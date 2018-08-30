import { InvalidBufferId } from '../buffer';
import { InvalidProgramId } from '../program';
import { InvalidFrameBufferId } from '../frame_buffer';
import { DepthCompare } from '../primitives';

const MAXIMUM_TEXTURE_UNITS = 32;
const MAXIMUM_ATTRIBUTES = 32;

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

        this._depthCompare = {
            isSet: false,
            value: false,
        };

        this._depthTest = {
            isSet: false,
            value: false,
        };

        this._depthWrite = {
            isSet: false,
            value: true,
        };

        this.attributeCount = 0;        // Number of attributes currently enabled
        this.attributeBufferId = -1;

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

        this._depthTest.isSet = false;
        this._depthCompare.isSet = false;
        this._depthWrite.isSet = false;

        // We always leave the first one enabled "Always have vertex attrib 0 array enabled"
        // See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
        for (let loop = 1; loop < this.attributeCount; ++loop) {
            this._gl.disableVertexAttribArray(loop);
        }
        this.attributeCount = 0;
        this.attributeBufferId = -1;

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
     * Determines whether or not depth testing is currently enabled.
     * @return {boolean} True if depth testing is enabled otherwise false.
     */
    get depthTest() {
        return this._depthTest.isSet ? this._depthTest.value : false;
    }

    /**
     * Retrieves the current depth compare operation applied to the rendering pipeline.
     * @return {number} WebGL comparison operation for the rendering pipeline.
     */
    get depthCompare() {
        return this._depthCompare.isSet ? this._depthCompare.value : this._gl.LESS;
    }

    /**
     * Determines whether or not writing to the depth buffer is currently enabled.
     * @returns {boolean} True if writing to the depth buffer is enabled otherwise false.
     */
    get depthWrite() {
        return this._depthWrite.value;
    }

    /**
     * Enables or disables writing to the depth buffer.
     * @param {boolean} value - True if writing to the depth buffer should be enabled otherwise false.
     */
    set depthWrite(value) {
        if (this._gl && (!this._depthWrite.isSet || value !== this._depthWrite.isEnabled)) {
            this._depthWrite.isSet = true;
            this._depthWrite.value = value;

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
     * Sets the depth test state of the rendering context using a native comparison value.
     * If you wish to supply the depth comparison using the DepthCompare enumeration, please use setDepthTest.
     * @param {boolean} enabled - True if depth testing should be enabled otherwise false.
     * @param {number=} compare - Optional, WebGL depth comparison.
     */
    setDepthTestNative(enabled, compare) {
        if (!this._depthTest.isSet || enabled !== this._depthTest.value) {
            this._depthTest.isSet = true;
            this._depthTest.value = enabled;

            if (enabled) {
                this._gl.enable(this._gl.DEPTH_TEST);
            } else {
                this._gl.disable(this._gl.DEPTH_TEST);
            }
        }

        if (compare && (!this._depthCompare.isSet || compare !== this._depthCompare.value)) {
            this._depthCompare.isSet = true;
            this._depthCompare.value = compare;

            this._gl.depthFunc(compare);
        }
    }

    /**
     * Sets the depth test state of the rendering context using the DepthCompare enumerated value.
     * If you wish to supply the depth comparison using native WebGL values, please use setDepthTestNative.
     * @param {boolean} enabled - True if depth testing should be enabled otherwise false.
     * @param {DepthCompare=} compare - Optional, comparison operation to be used.
     */
    setDepthTest(enabled, compare) {
        if (compare) {
            switch (compare) {
                case DepthCompare.Never:
                    this.setDepthTestNative(enabled, this._gl.NEVER);
                    break;

                case DepthCompare.Less:
                    this.setDepthTestNative(enabled, this._gl.LESS);
                    break;

                case DepthCompare.Equal:
                    this.setDepthTestNative(enabled, this._gl.EQUAL);
                    break;

                case DepthCompare.NotEqual:
                    this.setDepthTestNative(enabled, this._gl.NOTEQUAL);
                    break;

                case DepthCompare.LessEqual:
                    this.setDepthTestNative(enabled, this._gl.LEQUAL);
                    break;

                case DepthCompare.Greater:
                    this.setDepthTestNative(enabled, this._gl.GREATER);
                    break;

                case DepthCompare.GreaterEqual:
                    this.setDepthTestNative(enabled, this._gl.GEQUAL);
                    break;

                case DepthCompare.Always:
                    this.setDepthTestNative(enabled, this._gl.ALWAYS);
                    break;

                default:
                    throw new Error('Unknown depth comparison.');
            }
        } else {
            this.setDepthTestNative(enabled);
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
     * Binds a WebGL buffer object to the array buffer. This is usually used for vertex data.
     * See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
     * @param {WebGLBuffer} bufferId - The WebGLBuffer to be bound to the array buffer.
     */
    bindArrayBuffer(bufferId) {
        if (this._arrayBuffer !== bufferId) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, bufferId);
            this._arrayBuffer = bufferId;
        }
    }

    /**
     * Binds a WebGL buffer object to the element array buffer. This is usually used for indices.
     * See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
     * @param {WebGLBuffer} bufferId - The WebGLBuffer to be bound to the element array buffer.
     */
    bindElementArrayBuffer(bufferId) {
        if (this._elementArrayBuffer !== bufferId) {
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, bufferId);
            this._elementArrayBuffer = bufferId;
        }
    }

    /**
     * Enables the specified attribute buffer on the current device.
     * @param {AttributeBuffer} attributeBuffer - The attribute buffer to be enabled on the device.
     * @param {locations
     */
    enableAttributes(attributeBuffer) {
        if (!attributeBuffer) {
            throw new Error('No attribute buffer supplied.');
        }

        if (attributeBuffer.id !== this.attributeBufferId) {
            const count = attributeBuffer.length;
            const oldEnabled = this.attributeCount;

            let attributeIndex = 0;
            while (attributeIndex < count) {
                const attribute = attributeBuffer.attributes[attributeIndex];

                if (attributeIndex >= oldEnabled) {
                    this._gl.enableVertexAttribArray(attributeIndex);
                }

                this._gl.vertexAttribPointer(
                    attribute.location,
                    attribute.size,
                    attribute.type,
                    attribute.normalized,
                    attribute.stride,
                    attribute.offset
                );

                attributeIndex++;
            }

            // We always leave the first one enabled "Always have vertex attrib 0 array enabled"
            // See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
            attributeIndex = Math.max(1, attributeIndex);

            for (; attributeIndex < oldEnabled; attributeIndex++) {
                this._gl.disableVertexAttribArray(attributeIndex);
            }

            this.attributeCount = count;
            this.attributeBufferId = attributeBuffer.id;
        }
    }
}
