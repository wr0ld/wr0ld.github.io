---
title: 关于我
layout: page
menu_id: about
---

<div class="about-container">
  <div class="about-section">
    <h2>ℹ️ 博客信息</h2>
    <div class="info-item">
      <span class="label">博客框架：</span>
      <span class="value">Hexo + Stellar</span>
    </div>
    <div class="info-item">
      <span class="label">作者：</span>
      <span class="value">旧世界</span>
    </div>
    <div class="info-item">
      <span class="label">GitHub：</span>
      <span class="value"><a href="https://github.com/wr0ld" target="_blank">github.com/wr0ld</a></span>
    </div>
    <div class="info-item">
      <span class="label">博客园：</span>
      <span class="value"><a href="https://www.cnblogs.com/wrold" target="_blank">cnblogs.com/wrold</a></span>
    </div>
    <div class="info-item">
      <span class="label">公众号：</span>
      <span class="value">弹不出的5h31ll</span>
    </div>
  </div>
</div>

<style>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.about-section {
  background: var(--card, #fff);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border, #e0e0e0);
}

.about-section h2 {
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.info-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px dashed var(--border, #e0e0e0);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: bold;
  color: var(--text-p1);
  min-width: 100px;
}

.info-item .value {
  color: var(--text-p2);
}

.info-item .value a {
  color: var(--accent);
}
</style>
