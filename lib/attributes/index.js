const registered = [];

import AttributeBuffer from './attribute_buffer';

/**
 * @typedef {object} AttributeDesc
 * @property {number} size - Number of components in the attribute
 * @property {number} type - The type of the attribute.
 * @property {boolean} normalized - True if the data is normalized otherwise false.
 * @property {number} stride - Number of bytes to move to the next vertex
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
