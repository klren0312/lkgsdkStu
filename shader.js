const shader = `
  precision mediump float;
  uniform int u_viewType; // 视图类型
  uniform sampler2D u_texture; // 多视点图当贴图传入
  varying vec2 v_texcoord;
  const float pitch    = ${cfg.pitch}; // 间距
  const float tilt     = ${cfg.tilt}; // 倾角
  const float center   = ${cfg.calibration.center.value};
  const float invView  = ${cfg.calibration.invView.value};
  const float flipX    = ${cfg.calibration.flipImageX.value}; // x轴翻转
  const float flipY    = ${cfg.calibration.flipImageY.value}; // y轴翻转
  const float subp     = ${cfg.subp}; // 采样倍率
  const float numViews = ${cfg.numViews}; // 视点数
  const float tilesX   = ${cfg.quiltWidth}; // 多视点图宽度
  const float tilesY   = ${cfg.quiltHeight}; // 多视点图高度
  // 多视点图中单个视点大小占整个帧缓冲区的比例大小
  const vec2 quiltViewPortion = vec2(
    ${cfg.quiltWidth * cfg.tileWidth / cfg.framebufferWidth},
    ${cfg.quiltHeight * cfg.tileHeight / cfg.framebufferHeight});
  
  // 根据uvz坐标返回纹理坐标
  vec2 texArr(vec3 uvz) {
    float z = floor(uvz.z * numViews); // 
    float x = (mod(z, tilesX) + uvz.x) / tilesX;
    float y = (floor(z / tilesX) + uvz.y) / tilesY;
    return vec2(x, y) * quiltViewPortion;
  }
  // 重新映射
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
    // 如果必要的话, 翻转uv坐标
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
