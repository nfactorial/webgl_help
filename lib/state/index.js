import { InvalidBufferId } from '../buffer';
import { DepthCompare } from '../primitives';
import { InvalidProgramId } from '../program';
import { InvalidTextureId } from '../texture';
import { InvalidFrameBufferId } from '../frame_buffer';
import Extension from '../extensions';

const MAXIMUM_TEXTURE_UNITS = 32;

const INVALID_COLOR_VALUE = -1;
const INVALID_DEPTH_VALUE = -1000;
const INVALID_STENCIL_VALUE = -1;

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
            value: -1,
        };

        this._depthCompare = {
            isSet: false,
            value: -1,
        };

        this._depthTest = {
            isSet: false,
            value: false,
        };

        this._depthWrite = {
            isSet: false,
            value: true,
        };

        this._clearColor = {
            r: INVALID_COLOR_VALUE,
            g: INVALID_COLOR_VALUE,
            b: INVALID_COLOR_VALUE,
            a: INVALID_COLOR_VALUE,
        };

        this._clearDepth = INVALID_DEPTH_VALUE;
        this._clearStencil = INVALID_STENCIL_VALUE;

        this.attributeCount = 0; // Number of attributes currently enabled
        this.attributeBufferId = -1;

        this._arrayBuffer = InvalidBufferId;
        this._OES_vertex_array_object = null;
        this._elementArrayBuffer = InvalidBufferId;

        for (let loop = 0; loop < MAXIMUM_TEXTURE_UNITS; ++loop) {
            this._textureUnits[loop] = {
                type: 0, // InvalidTextureType
                texture: InvalidTextureId,
            };
        }
    }

    /**
     * Prepares the state manager for use with the application.
     * @param {WebGLRenderingContext} gl - The WebGL context we are to be associated with.
     */
    initialize(gl) {
        if (!gl) {
            throw new Error('Cannot initialize state without context.');
        }

        this._gl = gl;

        const version = gl.getParameter(gl.VERSION);
        if (version.indexOf('WebGL 1.0') !== -1) {
            this.bindVertexArray = this._bindVertexArrayOES;
            this._OES_vertex_array_object = gl.getExtension(Extension.OES_vertex_array_object);
        } else {
            this.bindVertexArray = this._bindVertexArray;
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

        this._clearColor.r = INVALID_COLOR_VALUE;
        this._clearColor.g = INVALID_COLOR_VALUE;
        this._clearColor.b = INVALID_COLOR_VALUE;
        this._clearColor.a = INVALID_COLOR_VALUE;
        this._clearDepth = INVALID_DEPTH_VALUE;
        this._clearStencil = INVALID_STENCIL_VALUE;

        // We always leave the first one enabled "Always have vertex attrib 0 array enabled"
        // See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
        for (let loop = 1; loop < this.attributeCount; ++loop) {
            this._gl.disableVertexAttribArray(loop);
        }
        this.attributeCount = 0;
        this.attributeBufferId = -1;

        for (let loop = 0; loop < MAXIMUM_TEXTURE_UNITS; ++loop) {
            this._textureUnits[loop].type = 0; // InvalidTextureType
            this._textureUnits[loop].texture = InvalidTextureId;
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
     * Sets the color a surface will be cleared to.
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     */
    setClearColor(r, g, b, a) {
        if (r !== this._clearColor.r
            || g !== this._clearColor.g
            || b !== this._clearColor.b
            || a !== this._clearColor.a
        ) {
            this._clearColor.r = r;
            this._clearColor.g = g;
            this._clearColor.b = b;
            this._clearColor.a = a;

            this._gl.clearColor(r, g, b, a);
        }
    }

    /**
     * Sets the value the depth buffer will be cleared to.
     * @param {number} value - The value applied to the depth buffer when it is cleared.
     */
    set clearDepth(value) {
        if (value !== this._clearDepth) {
            this._clearDepth = value;
            this._gl.clearDepth(value);
        }
    }

    /**
     * Sets the value the stencil buffer will be cleared to.
     * @param {number} value - The value applied to the stencil buffer when it is cleared.
     */
    set clearStencil(value) {
        if (value !== this._clearStencil) {
            this._clearStencil = value;
            this._gl.clearStencil(value);
        }
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

        if (compare !== undefined && (!this._depthCompare.isSet || compare !== this._depthCompare.value)) {
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
     * If this method returns false, then the specified program was already active.
     * @param {WebGLProgram} programId - The WebGLProgram to be enabled on the device.
     * @returns {boolean} True if the program was changed otherwise false.
     */
    useProgram(programId) {
        if (this._activeProgram !== programId) {
            this._gl.useProgram(programId);
            this._activeProgram = programId;
            return true;
        }

        return false;
    }

    /**
     *
     * If this method returns false, then the specified texture was already bound to the texture unit.
     * @param {number} textureUnit
     * @param {WebGLTexture} textureId - The WebGL texture to be bound to the specified texture.
     * @returns {boolean} True if the texture was changed otherwise false.
     */
    bindTexture2D(textureUnit, textureId) {
        // TODO: Not sure whether to split bindTexture into bindTexture2D/bindTexture3D etc. or
        // TODO: have caller specify texture type as a parameter
        // TODO: for example: bindTexture(gl.TEXTURE_2D, textureUnit, textureId)
        if (textureUnit < 0 || textureUnit > MAXIMUM_TEXTURE_UNITS) {
            throw new Error('Invalid texture unit id.');
        }

        // TODO: Still undecided on this implementation.

        if (this._textureUnits[textureUnit].type !== this._gl.TEXTURE_2D
            || this._textureUnits[textureUnit].texture !== textureId) {
            this._gl.bindTexture(this._gl.TEXTURE_2D + textureUnit, textureId);
            this._textureUnits[textureUnit].type = this._gl.TEXTURE_2D;
            this._textureUnits[textureUnit].texture = textureId;
            return true;
        }

        return false;
    }

    /**
     * Binds a frame buffer to the current WebGL context.
     * If this method returns false, then the frame buffer was already bound.
     * @param {WebGLFramebuffer} frameBuffer - The WebGL frame buffer object to be bound to the context.
     * @returns {boolean} True if the frame buffer was changed otherwise false.
     */
    bindFrameBuffer(frameBuffer) {
        if (frameBuffer !== this._frameBuffer) {
            this._frameBuffer = frameBuffer;
            this._gl.bindFrameBuffer(frameBuffer);
            return true;
        }

        return false;
    }

    /**
     * This method is replaced at run-time with the correct implementation based on support by the device.
     * @param {WebGLVertexArrayObject} id
     */
    bindVertexArray(id) {
        throw new Error('Not implemented.');
    }

    /**
     * Given a GeometryBuffer instance, this method enables it for rendering on the current device.
     * @param {GeometryBuffer} geometryBuffer The geometry buffer to be rendered.
     */
    bindGeometryBuffer(geometryBuffer) {
        if (geometryBuffer.vao) {
            this.bindVertexArray(geometryBuffer.vao);
        } else {
            this.bindArrayBuffer(geometryBuffer.arrayBuffer.id);
            this.enableAttributes(geometryBuffer.attributeBuffer);
        }
    }

    /**
     * Binds a WebGL buffer object to the array buffer. This is usually used for vertex data.
     * If this method returns false then the array buffer was already bound.
     * See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
     * @param {WebGLBuffer} bufferId - The WebGLBuffer to be bound to the array buffer.
     * @returns {boolean} True if the array buffer was changed otherwise false.
     */
    bindArrayBuffer(bufferId) {
        if (this._arrayBuffer !== bufferId) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, bufferId);
            this._arrayBuffer = bufferId;
            return true;
        }

        return false;
    }

    /**
     * Binds a WebGL buffer object to the element array buffer. This is usually used for indices.
     * If this method returns false, then the element array buffer was already bound.
     * See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
     * @param {WebGLBuffer} bufferId - The WebGLBuffer to be bound to the element array buffer.
     * @returns {boolean} True if the element array buffer was changed otherwise false.
     */
    bindElementArrayBuffer(bufferId) {
        if (this._elementArrayBuffer !== bufferId) {
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, bufferId);
            this._elementArrayBuffer = bufferId;
            return true;
        }

        return false;
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

        //if (attributeBuffer.id !== this.attributeBufferId) {
            const count = attributeBuffer.length;
            const oldEnabled = this.attributeCount;

            if (count < oldEnabled) {
                // TODO: Always leave the first one enabled "Always have vertex attrib 0 array enabled"
                // See: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
                for (let loop = count; loop < oldEnabled; loop++) {
                    this._gl.disableVertexAttribArray(loop);
                }
            } else if (count > oldEnabled) {
                for (let loop = oldEnabled; loop < count; loop++) {
                    this._gl.enableVertexAttribArray(loop);
                }
            }

            for (let attributeIndex = 0; attributeIndex < count; attributeIndex++) {
                const attribute = attributeBuffer.attributes[attributeIndex];

                this._gl.vertexAttribPointer(
                    attribute.location,
                    attribute.size,
                    attribute.type,
                    attribute.normalized,
                    attribute.stride,
                    attribute.offset,
                );
            }

            this.attributeCount = count;
            this.attributeBufferId = attributeBuffer.id;
        //}
    }

    /**
     *
     * @param {WebGLVertexArrayObject} id - Identifier of the vertex array object to be applied.
     * @returns {boolean} True if the vertex array object was applied otherwise false.
     * @private
     */
    _bindVertexArrayOES(id) {
        if (id !== this.vaoId) {
            this._OES_vertex_array_object.bindVertexArrayOES(id);
            this.vaoId = id;
            return true;
        }

        return false;
    }

    /**
     *
     * @param {WebGLVertexArrayObject} id - Identifier of the vertex array object to be applied.
     * @returns {boolean} True if the vertex array object was applied otherwise false.
     * @private
     */
    _bindVertexArray(id) {
        if (id !== this.vaoId) {
            this._gl.bindVertexArray(id);
            this.vaoId = id;
        }

        return false;
    }
}
