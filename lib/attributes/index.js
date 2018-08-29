/**
 * This file contains methods associated with managing vertex shader attributes.
 * NOTE: I think the functionality contained in here is a little higher level than is intended for this library.
 *       So this may be extracted into another library.
 */

const registered = [];

import AttributeBuffer from './attribute_buffer';

/**
 * @typedef {object} AttributeDesc
 * @property {number} size - Number of components in the attribute
 * @property {number} type - The type of the attribute.
 * @property {boolean} normalized - True if the data is normalized otherwise false.
 * @property {number} stride - Number of bytes to move to the next vertex
 * @property {number} offset -
 */

/**
 * Creates a new attribute buffer based on the supplied attribute description.
 * @param {AttributeDesc[]} desc - Array of attribute descriptions that defines the attribute buffer to be created.
 * @returns {AttributeBuffer} The attribute buffer that represents the supplied description.
 */
export function createAttributeBuffer(desc) {
    const count = registered.length;
    for (let loop = 0; loop < count; loop++) {
        if (registered[loop].definitionEqual(desc)) {
            return registered[loop];
        }
    }

    const buffer = AttributeBuffer.fromDesc(desc);
    registered.push(buffer);
    return buffer;
}

/**
 * Determines the byte size of an vertex attribute data type.
 * @param {WebGLRenderingContext} gl - The rendering context being used.
 * @param {number} type - The attribute type whose size is to be determined.
 * @returns {number} The size (in bytes) of the specified attribute type.
 */
export function sizeofAttribute(gl, type) {
    switch (type) {
        case gl.BYTE:
            return 1;

        case gl.SHORT:
            return 2;

        case gl.UNSIGNED_BYTE:
            return 1;

        case gl.UNSIGNED_SHORT:
            return 2;

        case gl.FLOAT:
            return 4;

        case gl.HALF_FLOAT:
            return 2;

        default:
            throw new Error('Unknown attribute type.');
    }
}
