export const WEBGL_CONTEXT_NAME = 'webgl';
export const WEBGL2_CONTEXT_NAME = 'webgl2';
export const EXPERIMENTAL_WEBGL_CONTEXT_NAME = 'experimental-webgl';

export function detectWebGL(canvas, options) {
    if (!canvas) {
        throw new Error('No canvas object specified for WebGL rendering.');
    }

    if (options.webgl2) {
        const context = canvas.getContext(WEBGL2_CONTEXT_NAME, options);
        if (context && context instanceof WebGL2RenderingContext) {
            return context;
        }
    }

    if (options.webgl) {
        const context = canvas.getContext(WEBGL_CONTEXT_NAME, options) || canvas.getContext(EXPERIMENTAL_WEBGL_CONTEXT_NAME, options);
        if (context && context instanceof WebGLRenderingContext) {
            return context;
        }
    }

    return null;
}
