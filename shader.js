const shader = `
  precision mediump float;
  uniform int u_viewType; // 视图类型
  uniform sampler2D u_texture; // 多视点图当贴图传入
  varying vec2 v_texcoord;
  const float pitch    = ${cfg.pitch};
  const float tilt     = ${cfg.tilt};
  const float center   = ${cfg.calibration.center.value};
  const float invView  = ${cfg.calibration.invView.value};
  const float flipX    = ${cfg.calibration.flipImageX.value};
  const float flipY    = ${cfg.calibration.flipImageY.value};
  const float subp     = ${cfg.subp};
  const float numViews = ${cfg.numViews};
  const float tilesX   = ${cfg.quiltWidth};
  const float tilesY   = ${cfg.quiltHeight};
  const vec2 quiltViewPortion = vec2(
    ${cfg.quiltWidth * cfg.tileWidth / cfg.framebufferWidth},
    ${cfg.quiltHeight * cfg.tileHeight / cfg.framebufferHeight});
  vec2 texArr(vec3 uvz) {
    float z = floor(uvz.z * numViews);
    float x = (mod(z, tilesX) + uvz.x) / tilesX;
    float y = (floor(z / tilesX) + uvz.y) / tilesY;
    return vec2(x, y) * quiltViewPortion;
  }
  float remap(float value, float from1, float to1, float from2, float to2) {
    return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
  }
  void main() {
    if (u_viewType == 2) { // 多视点
      gl_FragColor = texture2D(u_texture, v_texcoord);
      return;
    }
    if (u_viewType == 1) { // 中间视点
      gl_FragColor = texture2D(u_texture, texArr(vec3(v_texcoord.x, v_texcoord.y, 0.5)));
      return;
    }

    // 交织图
    vec4 rgb[3];
    vec3 nuv = vec3(v_texcoord.xy, 0.0);
    // Flip UVs if necessary
    nuv.x = (1.0 - flipX) * nuv.x + flipX * (1.0 - nuv.x);
    nuv.y = (1.0 - flipY) * nuv.y + flipY * (1.0 - nuv.y);
    for (int i = 0; i < 3; i++) {
      nuv.z = (v_texcoord.x + float(i) * subp + v_texcoord.y * tilt) * pitch - center;
      nuv.z = mod(nuv.z + ceil(abs(nuv.z)), 1.0);
      nuv.z = (1.0 - invView) * nuv.z + invView * (1.0 - nuv.z);
      rgb[i] = texture2D(u_texture, texArr(vec3(v_texcoord.x, v_texcoord.y, nuv.z)));
    }
    gl_FragColor = vec4(rgb[0].r, rgb[1].g, rgb[2].b, 1);
  }
`