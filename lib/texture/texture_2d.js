import BaseTexture from './index';

function isPow2(value) {
    return (value & (value - 1)) === 0;
}

/**
 *
 */
export default class Texture2D extends BaseTexture {
    constructor() {
        super();
    }

    /**
     *
     * @param {WebGLState} state
     * @param {string} url
     * @param {function} cb
     * @returns {Promise<void>}
     */
    static load(state, url, cb) {
        // Original code taken from:
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
        // Will be improved on in the future

        const level = 0;
        const internalFormat = state.context.RGBA;
        const srcFormat = state.context.RGBA;
        const srcType = state.context.UNSIGNED_BYTE;

        const image = new Image();
        image.onload = function() {
            const texture = new Texture2D();

            texture.initialize(state.context);
            state.bindTexture2D(0, texture.id);
            state.context.texImage2D(
                state.context.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image
            );

            // TODO: Add error handling

            // TODO: We should allow the caller to specify whether or not mip maps are generated
            if (isPow2(image.width) && isPow2(image.height)) {
                state.context.generateMipmap(state.context.TEXTURE_2D);
            } else {
                state.context.texParameteri(
                    state.context.TEXTURE_2D,
                    state.context.TEXTURE_WRAP_S,
                    state.context.CLAMP_TO_EDGE
                );
                state.context.texParameteri(
                    state.context.TEXTURE_2D,
                    state.context.TEXTURE_WRAP_T,
                    state.context.CLAMP_TO_EDGE
                );
                state.context.texParameteri(
                    state.context.TEXTURE_2D,
                    state.context.TEXTURE_MIN_FILTER,
                    state.context.LINEAR
                );
            }

            cb(null, texture);
        };

        image.src = url;
    }
}
