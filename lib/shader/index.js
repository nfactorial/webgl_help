
export const InvalidShader = null;

export default class Shader {
    constructor() {
        this._gl = null;
        this._id = InvalidShader;
        this._type = 0;
    }

    initialize(gl, type, source) {
        if (!gl) {
            throw new Error('Shader.initialize - No WebGL context was specified.');
        }

        if (this._gl) {
            throw new Error('Shader.initialize - Shader has already been initialized.');
        }

        this._type = type;
        this._id = gl.createShader(type);
        this._gl = gl;

        gl.shaderSource(this._id, source);
        gl.compileShader(this._id);

        if (gl.getShaderParameter(this._id, gl.COMPILE_STATUS) === false) {
            console.error('Failed to compile shader.');

            const err = gl.getShaderInfoLog(this._id);
            if (err) {
                console.error(err);
            }

            throw new Error('Shader.initialize - Failed to compile shader.');
        }
    }

    /**
     * Releases any GPU resources currently referenced by this object.
     */
    dispose() {
        if (this._gl) {
            this._gl.deleteShader(this._id);

            this._id = InvalidShader;
            this._gl = null;
            this._type = 0;
        }
    }

    /**
     * Gets the type of shader represented by this Shader object.
     * @returns {*}
     */
    get type() {
        return this._type;
    }

    /**
     * Retrieves the raw WebGL identifier of the shader object.
     * @returns {WebGLShader}
     */
    get id() {
        return this._id;
    }
}
