---
title: Fscan 魔改二开 - 特征消除与功能扩展
cover: https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image3.png
categories:
  - 工具魔改
tags:
  - 工具魔改
  - 免杀
  - 内网扫描
  - fscan
abbrlink: e39557c4
date: 2026-03-22 12:00:00# 🔧 安全工具 | Fscan 魔改二开 · 特征消除与功能扩展

> 📌 原fscan项目地址：https://github.com/shadow1ng/fscan
>
> Fscan 是一款优秀的内网综合扫描工具，方便一键自动化、全方位漏扫扫描。在落地使用过程中，流量及文件不修改的情况下基本被检测查杀，针对这种情况，我们进行了一些基本的参数测试和特征去除，外加功能拓展。

---

## 📋 目录

- [一、环境准备](#一环境准备)
- [二、直接编译测试](#二直接编译测试)
- [三、特征字符串清除](#三特征字符串清除)
- [四、编译层混淆（garble）](#四编译层混淆garble)
- [五、DLL 加载免杀](#五dll-加载免杀)
- [六、功能扩展 · 添加新插件](#六功能扩展--添加新插件)
- [七、功能扩展 · 自定义 POC](#七功能扩展--自定义-poc)
- [八、效果汇总](#八效果汇总)

---

## 一、环境准备

下载慢的可以配置国内加速镜像：

```powershell
$env:GO111MODULE = "on"
$env:GOPROXY = "https://goproxy.cn,direct"
```

---

## 二、直接编译测试

> 先不做任何修改，直接编译测一下各杀软的检测情况，作为改造前的基准对照。

### 原版编译

```bash
go build -ldflags="-s -w" -trimpath main.go
```

加上系统信息的详细版：

```powershell
$env:GOOS="windows"; $env:GOARCH="amd64"; go build -ldflags="-s -w" -trimpath main.go
```

无窗口模式（适合上线后台运行）：

```bash
go build -ldflags="-s -w -H=windowsgui" -trimpath -o fscan_no_window.exe main.go
```

配合输出到文件：

```bash
.\fscan_no_window.exe -h 192.168.1.1/24 -o result.txt
```

> ⚠️ 测试结果：只改变编译模式，火绒直接杀了，说明单纯去符号表不够用。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image1.png)

---

## 三、特征字符串清除

原版二进制里包含大量明显特征，杀软直接按字符串匹配就能识别，需要逐一清除。

### 3.1 修改包名

**第一步：改 `go.mod`**

打开 `go.mod`，第一行是：

```
module github.com/shadow1ng/fscan
```

改成随便一个名字，比如：

```
module scanner/core
```

**第二步：批量替换所有 import 路径**

所有 `.go` 文件里的 `github.com/shadow1ng/fscan` 都要同步改，Windows 上用 PowerShell 批量替换：

```powershell
Get-ChildItem -Recurse -Filter "*.go" | ForEach-Object {
    (Get-Content $_.FullName) -replace 'github.com/shadow1ng/fscan', 'scanner/core' | Set-Content $_.FullName
}
```

**第三步：改 `Flag.go` 里的版本号字符串**

```powershell
grep -r "Fscan Version" . --include="*.go"
```

把 `Fscan Version` 改成别的，比如 `Scanner Version`，这也是特征字符串。

### 3.2 清除残留字符串

**`Common/Output.go`**：

```go
// 把
Outputfile = filepath.Join(dir, "fscanapi.csv")
// 改成
Outputfile = filepath.Join(dir, "scannerapi.csv")
```

**`Plugins/MiniDump.go`**：

```go
// 把
fmt.Sprintf("fscan-%d.dmp", pid)
// 改成
fmt.Sprintf("scanner-%d.dmp", pid)
```

### 3.3 修改 ASCII 艺术字

`Common/Flag.go` 里有启动时打印的 ASCII 艺术字，拼出来就是 "fscan"，杀软能直接识别这个图案，直接清空：

```go
lines := []string{
    "  [*] Scanner Starting...",
}
```

### 3.4 重新编译

```bash
go build -o scanner.exe main.go
```

> ✅ 火绒过

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image2.png)

> ✅ 360 静态过、杀毒、安全卫士、核晶体全过？？？？？？？？？

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image3.png)

> 动态也能过？？？？？？？？

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image4.png)

> Defender 动态也能过？？？？？？？？

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image5.png)

> ❌ 卡巴斯基静态被杀

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image6.png)

---

## 四、编译层混淆（garble）

> 单纯清字符串对卡巴斯基这类引擎不够，它会分析代码结构。garble 能把函数名、变量名、字符串全部随机化，让杀软看不出来是什么工具。

前面一直用的是直接编译，这次换一下：

```bash
go build -ldflags="-s -w" -o scanner.exe main.go
```

> ❌ 结果：卡巴斯基依然杀，火绒也杀了，加 `-ldflags` 反而触发了启发式规则，效果更差。

### 4.1 安装 garble

```bash
go env -w GOPROXY=https://goproxy.cn,direct
go install mvdan.cc/garble@latest
go mod tidy
```

> 💡 garble 对 Go 版本有严格要求，目前支持 go1.25.x，太新或太旧都会报错。

### 4.2 基础混淆

```bash
garble -seed=random build -o scanner.exe main.go
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image7.png)

> ✅ 火绒能过

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image8.png)

> ❌ 卡巴斯基依旧被杀

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image9.png)

### 4.3 试 UPX 加壳

下载地址：https://github.com/upx/upx/releases

```bash
upx --best scanner.exe -o scanner_upx.exe
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image10.png)

> ❌ 卡巴斯基依旧被杀，然后 Defender 也杀了，加壳反而不行，过了段时间 360 也报了。**加壳适得其反，不建议使用。**

### 4.4 PE 资源伪装

使用 **Restorator.exe** 修改 PE 资源信息，添加图标、版本号、公司名等，伪装成正常软件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image11.png)

> ⚠️ 没有效果。PE 资源伪装主要对付人眼识别，对杀软引擎的启发式检测基本没用。

### 4.5 garble 加上 `-literals` 字符串加密

```bash
garble -seed=random -literals build -o scanner.exe main.go
```

区别是：
- 之前：只混淆函数名、变量名
- 现在：额外把所有字符串加密，运行时动态解密

编译后体积会增大（约 90MB），但效果更好。

> ✅ 结果：卡巴斯基静态能过，Defender 被检测但只是禁止运行没有删除，应该是被 AMSI 检测了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image12.png)

> ⚠️ 卡巴斯基动态运行一半就被杀了，检测到 POC 加载触发了，如果没扫到 POC 应该还是能稳一下的。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image13.png)

---

## 五、DLL 加载免杀

### 5.1 思路

把 fscan 编译成 DLL，再用一个 C 写的 loader 去加载它。**杀软扫 loader 本身看不出是 fscan**，从而绕过动态检测。

```
scanner_loader.exe（C语言，干净）
      ↓ 加载
fscan.dll（实际功能）
```

### 5.2 修改 main.go

`main.go` 只保留一行：

```go
package main
```

### 5.3 新建 main-c.go，导出 Run 函数

```go
package main

import "C"
import (
    "fmt"
    "os"
    "scanner/core/Common"
    "scanner/core/Core"
)

//export Run
func Run() {
    Common.InitLogger()

    var Info Common.HostInfo
    Common.Flag(&Info)

    if err := Common.Parse(&Info); err != nil {
        os.Exit(1)
    }

    if err := Common.InitOutput(); err != nil {
        Common.LogError(fmt.Sprintf("初始化输出系统失败: %v", err))
        os.Exit(1)
    }
    defer Common.CloseOutput()

    Core.Scan(Info)
}

func main() {}
```

### 5.4 编译 DLL

```powershell
set CGO_ENABLED=1
set GOARCH=amd64
set GOOS=windows
go build -buildmode=c-shared -ldflags="-s -w" -o fscan.dll .
```

### 5.5 编写 C loader（main.c）

```c
#include <windows.h>
#include <stdio.h>

typedef void (*RunFunc)();

int main(int argc, char *argv[]) {
    HMODULE h = LoadLibraryA("fscan.dll");
    if (h == NULL) {
        printf("加载DLL失败: %d\n", GetLastError());
        return 1;
    }

    RunFunc run = (RunFunc)GetProcAddress(h, "Run");
    if (run == NULL) {
        printf("找不到Run函数: %d\n", GetLastError());
        return 1;
    }

    run();
    return 0;
}
```

### 5.6 编译 loader

```bash
x86_64-w64-mingw32-gcc -o scanner_loader.exe main.c -static
```

### 5.7 运行测试

将 `scanner_loader.exe` 和 `fscan.dll` 放在同一目录：

```bash
.\scanner_loader.exe -h 192.168.168.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image14.png)

> ✅ 可以正常运行，扫描结果完整输出。

> ✅ 360 正常都能过

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image15.png)

> ✅ Defender 都能过

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image16.png)

> ❌ 卡巴斯基静态把 DLL 删了

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image17.png)

> 💡 卡巴删的是 DLL，说明检测的是 DLL 内的 POC 行为特征，不是 loader。进一步绕过方向：内存加载 DLL（后续文章）。

---

## 六、功能扩展 · 添加新插件

fscan 2.0 的插件都在 `Core/Registry.go` 里统一注册，添加新插件分三步。

以 **Zookeeper 未授权访问检测** 为例（默认端口 2181）：

> 💡 Zookeeper 是分布式协调服务，Kafka、Hadoop 等大数据组件都依赖它。默认没有认证机制，内网里很常见，是高频未授权访问漏洞。

### 6.1 安装依赖

```bash
go get github.com/samuel/go-zookeeper/zk
```

### 6.2 新建 `Plugins/Zookeeper.go`

```go
package Plugins

import (
    "fmt"
    "github.com/samuel/go-zookeeper/zk"
    "scanner/core/Common"
    "time"
)

func ZookeeperScan(info *Common.HostInfo) error {
    addr := fmt.Sprintf("%s:%v", info.Host, info.Ports)
    conn, _, err := zk.Connect([]string{addr}, time.Second*5)
    if err != nil {
        return err
    }
    defer conn.Close()
    Common.LogSuccess(fmt.Sprintf("未授权访问 Zookeeper %s:%v", info.Host, info.Ports))
    return nil
}
```

### 6.3 在 `Core/Registry.go` 里注册

在 `init()` 末尾加上：

```go
Common.RegisterPlugin("zookeeper", Common.ScanPlugin{
    Name:     "Zookeeper",
    Ports:    []int{2181},
    ScanFunc: Plugins.ZookeeperScan,
    Types:    []string{Common.PluginTypeService},
})
```

### 6.4 重新编译测试

```bash
go build -o scanner.exe main.go
.\scanner.exe -h 192.168.168.128 -p 2181
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/fscan_image18.png)

> ✅ 成功检测到 Zookeeper 未授权访问，插件列表里也能看到 `zookeeper` 已注册。

---

## 七、功能扩展 · 自定义 POC

fscan 支持在 `pocs/` 目录下放 YAML 格式的 POC，扫到 Web 服务时自动加载检测，**不需要重新编译**。

### YAML POC 格式

```yaml
name: poc-yaml-CVE-2022-22947
rules:
  - method: POST
    path: /actuator/gateway/routes/hacktest
    headers:
      Content-Type: application/json
    body: |
      {
        "id": "hacktest",
        "filters": [{"name": "AddResponseHeader", "args": {"name": "Result", "value": "#{...}"}}],
        "uri": "http://example.com"
      }
    expression: response.status == 201
detail:
  author: xiaodisec
  links:
    - https://www.xiaodi8.com
```

逻辑很直观：发一个指定的请求，匹配返回结果，命中就判定漏洞存在。

### 使用方法

把 YAML 文件放到 `pocs/` 目录下即可：

```
scanner.exe
pocs/
  ├── CVE-2022-22947-spring-cloud-gateway.yml
  ├── CVE-2021-21972-vmcenter.yml
  └── ...
```

> ⚠️ `pocs/` 目录要和 `scanner.exe` 放在同一目录才能读取，单独带走 exe 时记得把 `pocs/` 一起打包。

---

## 八、效果汇总

### 各阶段免杀效果对比

| 阶段 | 操作 | 360 | 火绒 | Defender | 卡巴斯基 |
|------|------|:---:|:----:|:--------:|:-------:|
| 原版 | 无修改 | ❌ | ❌ | ❌ | ❌ |
| 第一轮 | 包名替换 + 字符串清除 | ✅ | ✅ | ✅ | ❌ |
| 第二轮 | garble 基础混淆 | ✅ | ✅ | ✅ | ❌ |
| UPX 加壳 | 加壳 | ❌ | ❌ | ❌ | ❌ |
| 第三轮 | garble -literals | ✅ | ✅ | 静态✅ 动态❌ | 静态✅ |
| DLL 加载 | loader + dll | ✅ | ✅ | ✅ | dll被删 |

### 功能扩展汇总

| 功能 | 方式 | 说明 |
|------|------|------|
| Zookeeper 未授权 | Go 插件 | 检测 2181 端口未授权访问，需要重新打包 |
| 自定义 Web POC | YAML | pocs/ 目录下放 yml 文件即可，不需要 |

---

> 📝不是全部组合测试

---

*系列下一篇：FScan 魔改二开 · 流量特征规避与指纹修改*