import WebGLState from '../state';
import { PrimitiveType } from '../primitives';
import * as ContextInfo from './context';
import Extension from '../extensions';

const DEFAULT_OPTIONS = {
    webgl2: true,
    webgl: true,
    alpha: false,
    depth: true,
    antialias: true,
    powerPreference: 'default',
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    disableVAO: false,
    stencil: false,
};

/**
 * Core interface wrapper for the WebGL rendering framework.
 */
export default class Renderer {
    constructor() {
        this._gl = null;
        this._state = new WebGLState();
        this._options = null;
        this._canvas = null;
        this._vaoEnabled = false;
        this._OES_vertex_array_object = null;

        this._drawInformation = [
            {
                drawCalls: 0,
                indexedCalls: 0,
                pointCount: 0,
                lineCount: 0,
                triangleCount: 0,
            },
            {
                drawCalls: 0,
                indexedCalls: 0,
                pointCount: 0,
                lineCount: 0,
                triangleCount: 0,
            },
        ];
    }

    /**
     * Called when the renderer is to terminate its interface with the WebGL context.
     */
    dispose() {
        this._state.dispose();

        this._OES_vertex_array_object = null;
        this._options = null;
        this._gl = null;
    }

    /**
     * Prepares the WebGL rendering framework for use with the host application.
     * @param {HTMLCanvasElement} canvas - The canvas element that is to be used for rendering.
     * @param {object} options - The options selected by the application for the rendering device.
     * @returns {boolean} True if the renderer was initialized successfully otherwise false.
     */
    initialize(canvas, options) {
        if (!canvas) {
            throw new Error('No canvas element supplied for rendering.');
        }

        if (this._gl) {
            throw new Error('WebGL renderer has already been initialized.');
        }

        this._vaoEnabled = false;
        this._options = Object.assign({}, DEFAULT_OPTIONS, options);
        this._gl = ContextInfo.detectWebGL(canvas, this._options);

        if (this._gl) {
            const version = this._gl.getParameter(this._gl.VERSION);
            if (version.indexOf('WebGL 1.0') !== -1) {
                // We only allow disabling of VAO in WebGL1 as it is always present in V2 devices
                if (!options.disableVAO) {
                    this._OES_vertex_array_object = this._gl.getExtension(Extension.OES_vertex_array_object);
                    if (this._OES_vertex_array_object) {
                        this._vaoEnabled = true;
                        this.createVertexArray = this._createVertexArrayOES;
                        this.deleteVertexArray = this._deleteVertexArrayOES;
                    }
                }
            } else {
                this._vaoEnabled = true;
                this.createVertexArray = this._createVertexArray;
                this.deleteVertexArray = this._deleteVertexArray;
            }

            this._canvas = canvas;
            this._state.initialize(this._gl);
            return true;
        }

        return false;
    }

    /**
     * Retrieves the WebGLState object that is managing the state of the WebGL context associated with this renderer.
     * @returns {WebGLState}
     */
    get state() {
        return this._state;
    }

    /**
     * The WebGLRenderingContext associated with the Renderer or null if one is not available.
     * @returns {WebGLRenderingContext|null} The WebGLRendering context associated with the renderer.
     */
    get context() {
        return this._gl;
    }

    /**
     * Determines whether or not Vertex Array Objects (VAO) are supported by the current device.
     * @return {boolean} True if vertex array objects are supported otherwise false.
     */
    get supportsVAO() {
        return this._vaoEnabled;
    }

    /**
     * Retrieves the HTMLCanvasElement the renderer is using.
     * @returns {HTMLCanvasElement|null}
     */
    get canvas() {
        return this._canvas;
    }


    // noinspection JSMethodCanBeStatic
    createVertexArray() { // eslint-disable-line class-methods-use-this
        throw new Error('Not implemented');
    }

    // noinspection JSMethodCanBeStatic
    deleteVertexArray() { // eslint-disable-line class-methods-use-this
        throw new Error('Not implemented');
    }

    /**
     * Retrieves the specified extension object from the rendering context if it is supported.
     * @param {Extension} extension - The extension object to be retrieved.
     * @returns {WebGLObject|null} The requested extension object or null if it is not supported.
     */
    getExtension(extension) {
        return this._gl ? this._gl.getExtension(extension) : null;
    }

    /**
     *
     * https://docs.microsoft.com/en-us/windows/desktop/direct3d9/rendering-from-vertex-and-index-buffers
     * https://docs.microsoft.com/en-us/windows/desktop/direct3d11/d3d10-graphics-programming-guide-primitive-topologies
     *
     * @param {number} primitiveType - The type of primitive to be rendered.
     * @param {number} primitiveCount - The number of primitives to be rendered.
     * @param {number} startVertex - Index of the first vertex to be rendered.
     */
    drawPrimitive(primitiveType, startVertex, primitiveCount) {
        this._drawInformation.drawCalls++;

        switch (primitiveType) {
            case PrimitiveType.PointList:
                this._drawInformation.pointCount += primitiveCount;
                this._gl.drawArrays(this._gl.POINTS, startVertex, primitiveCount);
                break;

            case PrimitiveType.LineList:
                this._drawInformation.lineCount += primitiveCount;
                this._gl.drawArrays(this._gl.LINES, startVertex, primitiveCount * 2);
                break;

            case PrimitiveType.LineStrip:
                this._drawInformation.lineCount += primitiveCount;
                this._gl.drawArrays(this._gl.LINE_STRIP, startVertex, primitiveCount + 1);
                break;

            case PrimitiveType.TriangleList:
                this._drawInformation.triangleCount += primitiveCount;
                this._gl.drawArrays(this._gl.TRIANGLES, startVertex, primitiveCount * 3);
                break;

            case PrimitiveType.TriangleStrip:
                this._drawInformation.lineCount += primitiveCount;
                this._gl.drawArrays(this._gl.TRIANGLE_STRIP, startVertex, primitiveCount + 2);
                break;

            default:
                throw new Error('Unknown primitive type.');
        }

        if (this._gl.getError() !== this._gl.NO_ERROR) {
            throw new Error('drawArrays failed.');
        }
    }

    /**
     *
     * NOTE: drawIndexedPrimitive uses a constant index type of UNSIGNED_SHORT. It may be, in the future, the call
     *       is updated to accept the index type as a parameter or an alternative method is supplied.
     *       Just haven't decided yet.
     * @param {number} primitiveType - The type of primitive to be rendered.
     * @param {number} primitiveCount - The number of primitives to be rendered.
     * @param {number} startIndex - The first index in the element array buffer to be used.
     */
    drawIndexedPrimitive(primitiveType, primitiveCount, startIndex) {
        this._drawInformation.drawCalls++;
        this._drawInformation.indexedCalls++;

        switch (primitiveType) {
            case PrimitiveType.PointList:
                this._drawInformation.pointCount += primitiveCount;
                this._gl.drawElements(
                    this._gl.POINTS,
                    primitiveCount,
                    this._gl.UNSIGNED_SHORT,
                    startIndex * 2,
                );
                break;

            case PrimitiveType.LineList:
                this._drawInformation.lineCount += primitiveCount;
                this._gl.drawElements(
                    this._gl.LINES,
                    primitiveCount * 2,
                    this._gl.UNSIGNED_SHORT,
                    startIndex * 2,
                );
                break;

            case PrimitiveType.LineStrip:
                this._drawInformation.lineCount += primitiveCount;
                this._gl.drawElements(
                    this._gl.LINE_STRIP,
                    primitiveCount + 1,
                    this._gl.UNSIGNED_SHORT,
                    startIndex * 2,
                );
                break;

            case PrimitiveType.TriangleList:
                this._drawInformation.triangleCount += primitiveCount;
                this._gl.drawElements(
                    this._gl.TRIANGLES,
                    primitiveCount * 3,
                    this._gl.UNSIGNED_SHORT,
                    startIndex * 2,
                );
                break;

            case PrimitiveType.TriangleStrip:
                this._drawInformation.lineCount += primitiveCount;
                this._gl.drawElements(
                    this._gl.TRIANGLE_STRIP,
                    primitiveCount + 2,
                    this._gl.UNSIGNED_SHORT,
                    startIndex * 2,
                );
                break;

            default:
                throw new Error('Unknown primitive type.');
        }
    }

    /**
     * Implementation of deleteVertexArray for devices that provide the OES extension.
     * @param id - Identifier of the vertex array to be deleted.
     * @private
     */
    _deleteVertexArrayOES(id) {
        if (id) {
            this._OES_vertex_array_object.deleteVertexArrayOES(id);
        }
    }

    /**
     * Implementation of deleteVertexArray for WebGL2 devices.
     * @param id - Identifier of the vertex array to be deleted.
     * @private
     */
    _deleteVertexArray(id) {
        if (id) {
            this._gl.deleteVertexArray(id);
        }
    }

    /**
     * Implementation of the createVertexArray method for devices that support the OES extension.
     * @returns {object} The vertex array object that was created.
     * @private
     */
    _createVertexArrayOES() {
        return this._OES_vertex_array_object.createVertexArrayOES();
    }

    /**
     * Implementation of the createVertexArray method for WebGL2 devices.
     * @returns {object} The vertex array object that was created.
     * @private
     */
    _createVertexArray() {
        return this._gl.createVertexArray();
    }
}
