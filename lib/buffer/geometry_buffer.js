import ArrayBuffer from './array_buffer';
import { createAttributeBuffer } from '../attributes';

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
     * @param {number} drawType
     */
    initialize(renderer, attributes, drawType) {
        if (!renderer) {
            throw new Error('Renderer must be supplied');
        }

        if (!attributes) {
            throw new Error('Attribute buffer must be supplied');
        }

        this.renderer = renderer;
        this.vao = renderer.createVertexArray();
        this.arrayBuffer.initialize(renderer.context, drawType);
        this.attributeBuffer = createAttributeBuffer(renderer.context, attributes);

        renderer.state.initializeGeometryBuffer(this);

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
