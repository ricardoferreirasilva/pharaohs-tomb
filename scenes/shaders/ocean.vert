attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
uniform sampler2D colormap;


uniform float factor;

vec4 getNoise(vec2 uv){
    vec2 uv0 = (uv/103.0)+vec2(factor/17.0, factor/29.0);
    vec2 uv1 = uv/107.0-vec2(factor/-19.0, factor/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(factor/101.0, factor/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(factor/109.0, factor/-113.0);
    vec4 noise = (texture2D(colormap, uv0)) +
                 (texture2D(colormap, uv1)) +
                 (texture2D(colormap, uv2)) +
                 (texture2D(colormap, uv3));
    return noise*0.5-1.0;
}
void main() {
	vec3 offset=vec3(0.0,0.0,0.0);
	vTextureCoord = aTextureCoord;
    offset = aVertexNormal*10.0*(getNoise(aTextureCoord).b/10.0);
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}

