import ArrayBuffer from './array_buffer';
import ElementArrayBuffer from './element_array_buffer';
import { createAttributeBuffer } from '../attributes';

const EMPTY_DATA = new Float32Array(1);

/**
 * Contains the rendering information for a block of geometry.
 *
 * TODO: Add support for using raw array buffers, if the system doesn't support VAO.
 * TODO: Most do support VAO, but for older devices we can just go the long way around and apply everything.
 */
export default class GeometryBuffer {
    constructor() {
        this.vao = null;
        this.renderer = null;
        this.arrayBuffer = new ArrayBuffer();
        this.elementBuffer = new ElementArrayBuffer();
        this.attributeBuffer = null;
    }

    /**
     * Retrieves the resource identifier associated with this buffer.
     * @return {null|*}
     */
    get id() {
        return this.vao;
    }

    /**
     * Releases all resources referenced by this object.
     */
    dispose() {
        if (this.vao) {
            this.renderer.deleteVertexArray(this.vao);
            this.vao = null;
        }

        this.arrayBuffer.dispose();

        this.renderer = null;
    }

    /**
     *
     * @param {Renderer} renderer
     * @param {AttributeDesc[]} attributes
     * @param {ArrayLike} data
     * @param {number} drawType
     */
    initialize(renderer, attributes, data, drawType) {
        if (!renderer) {
            throw new Error('Renderer must be supplied');
        }

        if (!attributes) {
            throw new Error('Attribute buffer must be supplied');
        }

        this.renderer = renderer;

        this.arrayBuffer.initialize(renderer.context, drawType);
        this.attributeBuffer = createAttributeBuffer(renderer.context, attributes);

        if (renderer.supportsVAO) {
            this.vao = renderer.createVertexArray();

            // We go directly to the WebGL context here, as we don't need the state to be maintained
            renderer.state.OES_vertex_array_object.bindVertexArray(this.vao);
            renderer.context.bindBuffer(renderer.context.ARRAY_BUFFER, this.arrayBuffer.id);
            this.arrayBuffer.bufferData(data);
            renderer.state.enableAttributes(this.attributeBuffer);

            renderer.state.OES_vertex_array_object.bindVertexArray(null);
        } else {
            renderer.context.bindBuffer(renderer.context.ARRAY_BUFFER, this.arrayBuffer.id);
            this.arrayBuffer.bufferData(data);
        }

        return this;
    }

    /**
     * Copies the specified data into the geometry buffers storage.
     * @param {ArrayLike} data The data to be copied into the geometry buffer.
     */
    bufferData(data) {
        this.renderer.state.bindVertexArray(this.vao);
        this.arrayBuffer.bufferData(data);
    }
}
