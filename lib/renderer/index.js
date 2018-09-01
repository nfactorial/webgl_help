import WebGLState from '../state';
import { PrimitiveType } from '../primitives';
import * as ContextInfo from './context';

const DEFAULT_OPTIONS = {
    webgl2: true,
    webgl: true,
};

/**
 * Core interface wrapper for the WebGL rendering framework.
 */
export default class Renderer {
    constructor() {
        this._gl = null;
        this._glState = new WebGLState();
        this._options = null;

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
        this._glState.dispose();
        this._options = null;
        this._gl = null;
    }

    /**
     * Prepares the WebGL rendering framework for use with the host application.
     * @param {HtmlCanvas} canvas - The canvas element that is to be used for rendering.
     * @param {object} options - The options selected by the application for the rendering device.
     * @returns {boolean} True if the renderer was initialized successfully otherwise false.
     */
    initialize(canvas, options) {
        if (this._gl) {
            throw new Error('WebGL renderer has already been initialized.');
        }

        this._options = Object.assign({}, DEFAULT_OPTIONS, options);
        this._gl = ContextInfo.detectWebGL(canvas, this._options);

        return (this._gl !== null);
    }

    /**
     * Retrieves the WebGLState object that is managing the state of the WebGL context associated with this renderer.
     * @returns {WebGLState}
     */
    get state() {
        return this._glState;
    }

    /**
     * The WebGLRenderingContext associated with the Renderer or null if one is not available.
     * @returns {WebGLRenderingContext|null} The WebGLRendering context associated with the renderer.
     */
    get context() {
        return this._gl;
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
     * @param {PrimitiveType} primitiveType - The type of primitive to be rendered.
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
    }

    /**
     *
     * NOTE: drawIndexedPrimitive uses a constant index type of UNSIGNED_SHORT. It may-be, in the future, the call
     *       is updated to accept the index type as a parameter or an alternative method is supplied.
     *       Just haven't decided yet.
     * @param {PrimitiveType} primitiveType - The type of primitive to be rendered.
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
}
