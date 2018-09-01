/**
 * Defines the types of vertex attributes supported.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 */
const AttributeType = {
    Byte: 'byte',
    Short: 'short',
    UnsignedByte: 'ubyte',
    UnsignedShort: 'ushort',
    Float: 'float',
    HalfFloat: 'half'
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} type
 * @returns {number}
 */
export function attributeTypeToWebGL(gl, type) {
    switch (type) {
        case AttributeType.Byte:
            return gl.BYTE;

        case AttributeType.Short:
            return gl.SHORT;

        case AttributeType.Float:
            return gl.FLOAT;

        case AttributeType.HalfFloat:
            return gl.HALF_FLOAT;

        case AttributeType.UnsignedByte:
            return gl.UNSIGNED_BYTE;

        case AttributeType.UnsignedShort:
            return gl.UNSIGNED_SHORT;

        default:
            throw new Error(`Unknown attribute type '${type}'.`);
    }
}

export default AttributeType;
