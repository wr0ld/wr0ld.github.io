---
title: 设置
layout: page
---

<div class="settings">

  <section class="set-block">
    <h2>外观</h2>
    <div class="set-row">
      <span class="set-label">配色</span>
      <div class="set-opts">
        <button type="button" data-mode="light">浅色</button>
        <button type="button" data-mode="dark">深色</button>
        <button type="button" data-mode="system">跟随系统</button>
      </div>
    </div>
    <div class="set-row">
      <span class="set-label">正文字号</span>
      <div class="set-opts">
        <button type="button" data-fs-val="s">小</button>
        <button type="button" data-fs-val="m">标准</button>
        <button type="button" data-fs-val="l">大</button>
        <button type="button" data-fs-val="xl">特大</button>
      </div>
    </div>
  </section>

  <section class="set-block">
    <h2>快捷键</h2>
    <dl class="about-list">
      <dt><kbd>Ctrl</kbd> <kbd>K</kbd></dt>
      <dd>聚焦顶部搜索框（在任何页面都能用）</dd>
      <dt><kbd>Enter</kbd></dt>
      <dd>搜索结果里打开高亮的那一条</dd>
      <dt><kbd>Esc</kbd></dt>
      <dd>收起搜索结果</dd>
    </dl>
  </section>

  <section class="set-block">
    <h2>工具</h2>
    <dl class="about-list">
      <dt>测试工具</dt>
      <dd><a href="/srk-toolbox/">SRK Toolbox</a> · <a href="/payloader/">Payloader</a></dd>
      <dt>小工具</dt>
      <dd><a href="/divination/">占卜</a> · <a href="/calculator/">计算器</a> · <a href="/vault/">金库</a></dd>
      <dt>浏览</dt>
      <dd><a href="/archives/">归档</a> · <a href="/categories/">分类</a> · <a href="/tags/">标签</a> · <a href="/lab/">实验室</a></dd>
    </dl>
  </section>

  <section class="set-block">
    <h2>数据</h2>
    <div id="setRank" class="rank"></div>
    <div class="set-row set-row-end">
      <span class="set-label">本地记录</span>
      <div class="set-opts">
        <button type="button" id="resetPrefs">清空本地偏好</button>
      </div>
    </div>
  </section>

  <section class="set-block">
    <h2>彩蛋</h2>
    <div class="set-row">
      <span class="set-label">看板娘</span>
      <div class="set-opts">
        <button type="button" data-waifu="on">开启</button>
        <button type="button" data-waifu="off">关闭</button>
      </div>
    </div>
    <div class="set-row">
      <span class="set-label">右键菜单</span>
      <div class="set-opts">
        <button type="button" data-ctx="on">开启</button>
        <button type="button" data-ctx="off">关闭</button>
      </div>
    </div>
    <div class="set-row">
      <span class="set-label">成就卡牌</span>
      <div class="set-opts">
        <button type="button" id="openCards">打开卡牌墙</button>
      </div>
    </div>
    <div class="set-row">
      <span class="set-label">音乐播放器</span>
      <div class="set-opts">
        <button type="button" data-music="on">开启</button>
        <button type="button" data-music="off">关闭</button>
      </div>
    </div>
    <div class="set-row set-row-col">
      <span class="set-label">添加歌曲</span>
      <div class="song-form">
        <input id="songName" type="text" placeholder="歌名" autocomplete="off">
        <input id="songUrl" type="text" placeholder="音频直链（mp3 / ogg）" autocomplete="off">
        <button type="button" id="songAdd">添加</button>
      </div>
    </div>
    <div class="set-row set-row-col">
      <span class="set-label">曲目</span>
      <ul class="song-list" id="songList"></ul>
    </div>
  </section>

</div>
