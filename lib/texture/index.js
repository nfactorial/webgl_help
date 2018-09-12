export const InvalidTextureId = null;

export default class BaseTexture {
    constructor() {
        this._gl = null;
        this._id = InvalidTextureId;
    }

    /**
     * Retrieves the WebGL identifier of this texture.
     * @returns {WebGLTexture} Raw WebGL texture identifier.
     */
    get id() {
        return this._id;
    }

    dispose() {
        if (this._id !== InvalidTextureId) {
            this._gl.deleteTexture(this._id);
            this._id = InvalidTextureId;

            this._gl = null;
        }
    }

    initialize(gl) {
        if (this._id) {
            throw new Error('Texture has already been initialized.');
        }

        this._id = gl.createTexture();

        return this;
    }
}
