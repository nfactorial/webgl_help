export const WebGL_ContextName = 'webgl';
export const WebGL2_ContextName = 'webgl';
export const ExperimentalWebGL_ContextName = 'experimental-webgl';

export function detectWebGL(canvas, options) {
    if (!canvas) {
        throw new Error('No canvas object specified for WebGL rendering.');
    }

    if (options.webgl2) {
        const context = canvas.getContext(WebGL2_ContextName);
        if (context && context instanceof WebGL2RenderingContext) {
            return context;
        }
    }

    if (options.webgl) {
        const context = canvas.getContext(WebGL_ContextName) || canvas.getContext(ExperimentalWebGL_ContextName);
        if (context && context instanceof WebGLRenderingContext) {
            return context;
        }
    }

    return null;
}
