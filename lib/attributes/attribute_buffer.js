import { attributeTypeToWebGL } from './type';

let nextId = 0;

/**
 * Determines whether two attribute descriptions are the same.
 * @param {AttributeDesc} a - The first attribute to be compared.
 * @param {AttributeDesc} b - The second attribute to be compared.
 */
function attributeEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }

    if (a.type !== b.type) {
        return false;
    }

    if (a.normalized !== b.normalized) {
        return false;
    }

    return (a.stride === b.stride);
}

/**
 * An attribute buffer contains a list of vertex shader attributes and how they are mapped to values outside the
 * shader program.
 */
export default class AttributeBuffer {
    constructor() {
        this._id = ++nextId;
        this.attributes = [];
    }

    /**
     * Retrieves the identifier associated with this instance of AttributeBuffer.
     * @returns {number} The identifier associated with this AttributeBuffer.
     */
    get id() {
        return this._id;
    }

    /**
     * Determines whether or not the supplied attribute definitions matches the contents of this attribute buffer.
     * @param {AttributeDesc[]} attributes - List of attributes to be compared with.
     */
    definitionEqual(attributes) {
        if (!attributes) {
            throw new Error('No attributes specified.');
        }

        if (attributes.length !== this.attributes.length) {
            return false;
        }

        const count = attributes.length;
        for (let loop = 0; loop < count; loop++) {
            if (!attributeEqual(this.attributes[loop], attributes[loop])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Retrieves the number of attributes contained within the buffer.
     * @returns {number}
     */
    get length() {
        return this.attributes.length;
    }

    /**
     * Creates a new instance of an AttributeBuffer with the supplied list of attributes.
     * @param {WebGLRenderingContext} gl - The rendering context.
     * @param {AttributeDesc[]} attributes
     */
    static fromDesc(gl, attributes) {
        if (!attributes) {
            throw new Error('No attributes supplied.');
        }

        const buffer = new AttributeBuffer();

        buffer.attributes.push(...attributes);

        for (const attr of buffer.attributes) {
            attr.glType = attributeTypeToWebGL(gl, attr.type);
        }

        return buffer;
    }
}
