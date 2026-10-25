---
title: Docker 内网靶场自建实战：suo5 隧道、socks 多种用法与 vshell 的结合
cover: >-
  https://cdn.nlark.com/yuque/0/2026/png/48488607/1788323376588-289183ce-138f-47d1-8665-800dc2fc274c.png
categories:
  - 安全工具
  - 教程
tags:
  - 内网渗透
  - suo5
  - socks
  - 隧道
  - docker
  - vshell
  - 正向连接
  - 内存马
  - nginx
  - tomcat
abbrlink: c736f3ff
date: 2026-08-24 01:20:00
---

## 目录

- **一、docker 靶场环境自建**
  - docker-compose.yml —— 三容器编排
  - Dockerfile —— 自建 tomcat 镜像
  - index.jsp —— tomcat 首页探针
  - default.conf —— nginx 反代配置
  - index.html —— 内网目标页面
  - 网络拓扑图
- **二、suo5 使用：socks 的多种玩法**
  - 玩法一：yakit 设置 socks 代理发包
  - 玩法二：浏览器插件转发流量
  - 玩法三：代理工具（ProxyBridge）
- **三、vshell：内网正向连接上马**
- **四、总结与注意事项**

---

## 一、docker 靶场环境自建

*整体结构：三个容器 + 两张网络，把"公网 → 边界 → 内网"的距离拉开。*

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788326561963-6ca8cc25-2eaf-40bc-b1d6-fc38e6cba368.png)

### docker-compose.yml —— 三容器编排

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: suo5-nginx
    ports:
      - "127.0.0.1:8070:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - tomcat
    networks:
      - webnet

  tomcat:
    build: ./tomcat
    container_name: suo5-tomcat
    volumes:
      - ./webapps/ROOT:/opt/apache-tomcat-9.0.121/webapps/ROOT
    networks:
      - webnet
      - intranet

  internal:
    image: nginx:alpine
    container_name: suo5-internal
    volumes:
      - ./internal/index.html:/usr/share/nginx/html/index.html:ro
    networks:
      - intranet
    # 不映射任何宿主端口：内网服务只能通过 suo5 隧道访问

networks:
  webnet:
    name: suo5-webnet
    driver: bridge
  intranet:
    name: suo5-intranet
    driver: bridge
    internal: true
```

1. **nginx 服务（docker-compose.yml:2-12）—— 公网入口**

   - `image: nginx:alpine`：不写 Dockerfile，直接用现成镜像，由 Docker 自动从仓库拉取。
   - `ports: "127.0.0.1:8070:80"`：只绑定回环地址，宿主机以外访问不到，是安全的暴露姿势。
   - `volumes: ./nginx/default.conf → /etc/nginx/conf.d/default.conf:ro`：把本地写好的反代配置挂载覆盖进容器，`:ro` 只读，改配置只需重启 nginx 容器，不用重新构建镜像。
   - `depends_on: tomcat`：保证 tomcat 先启动再起 nginx（仅控制顺序，不等就绪）。

2. **tomcat 服务（docker-compose.yml:14-21）—— 边界机，模拟"被攻破的 Web 服务"**

   - `build: ./tomcat`：这是唯一用 Dockerfile 本地构建的服务，没有 image 字段。
   - 挂载 `./webapps/ROOT` 到容器 webapps 目录：suo5.jsp / index.jsp 直接以磁盘文件形式塞进 Tomcat，改页面不用重建镜像。
   - 同时挂 webnet 和 intranet 两个网络：一台机器两张"网卡"——公网能访问它，它又能访问内网，这正是内网横向跳板角色的精髓。

3. **internal 服务（docker-compose.yml:23-30）—— 纯内网靶机**

   - 同样 nginx:alpine，只挂载内部页面，不映射任何宿主端口，仅接入 intranet。宿主机直接访问不到它，只能经 suo5 隧道。

4. **两个网络的精妙处（docker-compose.yml:32-39）**

   ```yaml
   intranet:
     driver: bridge
     internal: true # 关键！
   ```

   `internal: true` 是 Docker 的完全隔离网络：该网段无默认网关、无法出外网、外部也无法直连。所以 internal 这台"内网机器"是真正意义上的内网，只能靠 tomcat 这张 intranet 网卡做跳板，与真实渗透场景完全一致。

> **小知识**：compose 的内置 DNS 只在"同一网络内"生效。nginx 和 tomcat 同在 webnet，所以 nginx 配置里敢直接写 `proxy_pass http://tomcat:8080` 服务名；而 nginx 不在 intranet，它连 internal 的存在都感知不到——内外网从网络层面就是"断"的，只能靠 tomcat 转达。

### Dockerfile —— 自建 tomcat 镜像

```dockerfile
FROM eclipse-temurin:8-jdk

ENV CATALINA_HOME=/opt/apache-tomcat-9.0.121
ENV PATH=${CATALINA_HOME}/bin:${PATH}

ADD apache-tomcat-9.0.121.tar.gz /opt/

EXPOSE 8080

CMD ["/opt/apache-tomcat-9.0.121/bin/catalina.sh", "run"]
```

带注释版本：

```dockerfile
FROM eclipse-temurin:8-jdk # 拉取官方 Java 8 JDK 基础镜像（符合 jsp 老漏洞环境）
ENV CATALINA_HOME=... # 定义环境变量，供 PATH 使用
ADD apache-tomcat-9.0.121.tar.gz /opt/ # ADD 会自动解压 tar.gz，一步到位
EXPOSE 8080
CMD [".../catalina.sh", "run"] # 前台启动！容器存活必须前台进程
```

技巧点：用 `ADD ...tar.gz` 解压而非手动 `tar -xf`，镜像层数更少、写法更简。

### index.jsp —— tomcat 首页探针

```jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head><meta charset="utf-8"><title>Tomcat OK</title></head>
<body>
<h1>Tomcat 运行正常</h1>
<p>Server: <%= application.getServerInfo() %></p>
<p>suo5.jsp 位于 <a href="suo5.jsp">suo5.jsp</a></p>
</body>
</html>
```

### default.conf —— nginx 反代配置

```nginx
server {
    listen 80;
    server_name _;
    client_max_body_size 100m;

    location /suo5.jsp {
        proxy_pass http://tomcat:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location / {
        proxy_pass http://tomcat:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

几个关键点：

- `proxy_pass http://tomcat:8080`：直接写 compose 服务名当 DNS，Docker 自动解析到 webnet 里 tomcat 的 IP，无需手填 172.18.x.x（拓扑图里写死了反而易错）。
- `proxy_buffering off` + `proxy_read_timeout 3600s`：suo5 是双向长连接隧道，Nginx 默认的缓冲和 60 秒超时会掐断隧道，这两个必须关/拉长。
- `proxy_set_header Connection ""` + `proxy_http_version 1.1`：关闭 Nginx 默认的 `Connection: close` 语义，允许上游 HTTP/1.1 keep-alive 复用连接——隧道密集发包全靠它。

### index.html —— 内网目标页面

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>内网目标</title></head>
<body>
<h1>内网测试服务</h1>
<p>这个页面只能通过 suo5 隧道访问。</p>
</body>
</html>
```

### 网络拓扑图

进入 `suo5-lab/` 目录，一条命令拉起环境：

```powershell
docker compose up -d --build
```

> **小知识**：首次启动时，`nginx:alpine` 和 `eclipse-temurin:8-jdk` 会从 Docker Hub 自动拉取（同 tag 多处引用只拉一次），tomcat 镜像则走本地 Dockerfile 构建；`--build` 表示每次都重新构建，平时纯启动可去掉。国内拉不动镜像的话，可以在 Docker 引擎配置里加 registry-mirrors 加速源再重试。

跑起来后整条链路：

```text
Windows 宿主机
 │
 ▼ http://127.0.0.1:8070/suo5.jsp
suo5-nginx (172.18.0.3)
 │
 ▼
suo5-tomcat (172.18.0.2 webnet / 172.19.0.2 intranet) ← suo5.jsp
 │
 ▼ http://internal/
suo5-internal (172.19.0.3) ← 内网测试目标
```

> tomcat 同时出现在 172.18 / 172.19 两个网段，正是接了 webnet、intranet 两块网卡；容器 IP 是启动时动态分配的，以实际 `docker inspect` 结果为准。

---

## 二、suo5 使用：socks 的多种玩法

把 suo5.jsp 放进挂载目录 `webapps/ROOT`，Tomcat 自动加载，内存马就位：

[http://127.0.0.1:8070/suo5.jsp](http://127.0.0.1:8070/suo5.jsp)（suo5 的内存马）

127.0.0.1:1080 监听本地 socks 代理端口

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788321988595-fb4c808f-99f4-44e6-aa27-2ed325951208.png)

### 玩法一：使用 yakit 设置 socks 代理发包，收到内网回显

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788321951992-8c641432-e101-49cf-b07c-1a6d701c7bc4.png)

### 玩法二：通过浏览器插件转发流量

配置代理

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788321858003-183abcd7-3fce-4fb1-97f1-127049e1d57f.png)

选择 socks 代理，成功访问内网

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788321818106-24d5ecb1-0c23-491b-b427-e1eb2d01487d.png)

### 玩法三：通过代理工具

例如 ProxyBridge

设置代理

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788322256265-d3f34d8f-1d4b-447d-a55f-3eeabd149770.png)

设置连接规则

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788322276189-703773c1-75b2-49b4-a4ba-abb23740cf92.png)

代理生效

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788322239064-3d8591a6-cbf0-44a5-beea-074aa5936b5f.png)

选择默认系统代理即可访问内网

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788322218662-70d2cd55-5e90-4866-89f1-d43225970d57.png)

---

## 三、vshell：内网正向连接上马

内网使用正向连接

新建正向监听器的载荷

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788323376588-289183ce-138f-47d1-8665-800dc2fc274c.png)

不出意外被杀

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788322911382-7b62efa5-ad2a-4229-af02-fb441e3a17f6.png)

> **思路**：载荷落地被查杀拦了——真实环境里这就是免杀对抗的起点。靶场里先换一种"落地"方式验证后面的链路：用 docker 命令直接把二进制送进内网容器，模拟文件上传成功后的状态（真实攻击中这一步通常由文件上传漏洞或命令执行完成），落地后的操作逻辑是一致的。

使用 docker 命令直接上传运行，模拟文件上传和开启监听：

1. 复制进容器

   ```bash
   docker cp 'D:\Backup\桌面\tcp_linux_amd64' suo5-internal:/tmp/tcp_linux_amd64
   ```

2. 加执行权限并后台运行

   ```bash
   docker exec -d suo5-internal sh -c "chmod +x /tmp/tcp_linux_amd64 && /tmp/tcp_linux_amd64"
   ```

3. 验证是否成功监听

   ```bash
   docker exec suo5-internal sh -c "ps -ef | grep tcp_linux | grep -v grep; netstat -tlnp 2>/dev/null"
   ```

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788323487734-b42ff627-a1a0-4d3d-bd3a-2667e2a93951.png)

内网开启监听端口，使用 vshell 连接时需要通过 suo5 的 socks 代理才能访问内网，因此要保持代理工具的开启（不建议使用浏览器插件，不稳定，大流量也容易崩）。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788324874267-c9fe4b97-b201-4f3e-9bcd-c1b2e4c50e24.png)

vshell 开启连接

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788324688437-0a87e985-fed2-4e66-ba7e-aa1de8a29b0a.png)

成功上马内网

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1788324894505-e1351b95-0ee5-4cdf-b593-25683526466e.png)

---

## 四、总结与注意事项

- **主线**：docker compose 拉起"nginx 入口 + tomcat 双网卡跳板 + internal 隔离内网"，`internal: true` 网络把内网从路由层面真正隔断。
- **隧道可达性**：suo5 内存马部署在 tomcat，隧道建立后本机 1080 出现 socks 代理，yakit、浏览器插件、ProxyBridge 三种方式均成功访问内网。
- **载荷落地**：vshell 正向监听载荷首次落地被杀，改用 docker 命令模拟文件上传后成功运行监听，vshell 经 socks 代理连入，内网上马成功。

几个值得记住的点：

1. **拓扑即攻防**：compose 的双网络写法（webnet + intranet）天然复现了"边界机双网卡"的经典内网结构，`internal: true` 是精髓；
2. **服务名即 DNS**：同网络内容器可用服务名互相访问，跨网络则完全不可见，配置里手写 IP 反而容易翻车；
3. **代理工具选型**：看页面用浏览器插件最方便，跑 vshell 这类大流量、长连接操作还是系统级代理工具更稳；
4. **正向连接场景**：内网出网受限时，"内网开监听 + 隧道够得着"的正向思路往往比反向回连更实用。
