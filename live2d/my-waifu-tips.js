!(function () {
    class Model {
        constructor(config) {
            let { apiPath, cdnPath } = config;
            let useCDN = false;
            if (typeof cdnPath === "string") {
                useCDN = true;
                if (!cdnPath.endsWith("/")) cdnPath += "/";
            } else if (typeof apiPath === "string") {
                if (!apiPath.endsWith("/")) apiPath += "/";
            } else {
                throw "Invalid initWidget argument!";
            }
            this.useCDN = useCDN;
            this.apiPath = apiPath;
            this.cdnPath = cdnPath;
        }

        async loadModelList() {
            const response = await fetch(`${this.cdnPath}model_list.json`);
            this.modelList = await response.json();
        }

        async loadModel(modelId, modelTexturesId, message) {
            localStorage.setItem("modelId", modelId);
            localStorage.setItem("modelTexturesId", modelTexturesId);
            showMessage(message, 4000, 10);
            if (this.useCDN) {
                if (!this.modelList) await this.loadModelList();
                const target = this.modelList.models[modelId][modelTexturesId];
                loadlive2d("live2d", `${this.cdnPath}model/${target}/index.json`);
            } else {
                loadlive2d("live2d", `${this.apiPath}get/?id=${modelId}-${modelTexturesId}`);
                console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`);
            }
        }

        async loadRandModel() {
            const modelId = localStorage.getItem("modelId"),
                modelTexturesId = localStorage.getItem("modelTexturesId");
            if (this.useCDN) {
                if (!this.modelList) await this.loadModelList();
                const modelResult = orderSelection(this.modelList.models[modelId], parseInt(modelTexturesId));
                localStorage.setItem("modelTexturesId", modelResult.nextIdx)
                const target = modelResult.obj;
                loadlive2d("live2d", `${this.cdnPath}model/${target}/index.json`);
                showMessage("我的新衣服好看嘛？", 4000, 10);
            } else {
                // 可选 "rand"(随机), "switch"(顺序)
                fetch(`${this.apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
                    .then(response => response.json())
                    .then(result => {
                        if (result.textures.id === 1 && (modelTexturesId === 1 || modelTexturesId === 0)) showMessage("我还没有其他衣服呢！", 4000, 10);
                        else this.loadModel(modelId, result.textures.id, "我的新衣服好看嘛？");
                    });
            }
        }

        async loadOtherModel() {
            let modelId = localStorage.getItem("modelId");
            if (this.useCDN) {
                if (!this.modelList) await this.loadModelList();
                const index = (++modelId >= this.modelList.models.length) ? 0 : modelId;
                this.loadModel(index, 0, this.modelList.messages[index]);
            } else {
                fetch(`${this.apiPath}switch/?id=${modelId}`)
                    .then(response => response.json())
                    .then(result => {
                        this.loadModel(result.model.id, 0, result.model.message);
                    });
            }
        }
    }

    const svg = {
        hitokoto: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\x3c!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --\x3e<path d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/></svg>',
        asteroids: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\x3c!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --\x3e<path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L277.3 424.9l-40.1 74.5c-5.2 9.7-16.3 14.6-27 11.9S192 499 192 488V392c0-5.3 1.8-10.5 5.1-14.7L362.4 164.7c2.5-7.1-6.5-14.3-13-8.4L170.4 318.2l-32 28.9 0 0c-9.2 8.3-22.3 10.6-33.8 5.8l-85-35.4C8.4 312.8 .8 302.2 .1 290s5.5-23.7 16.1-29.8l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg>',
        switchModel: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\x3c!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --\x3e<path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM256 272c39.8 0 72-32.2 72-72s-32.2-72-72-72s-72 32.2-72 72s32.2 72 72 72z"/></svg>',
        switchTexture: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\x3c!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --\x3e<path d="M320 64c0-35.3-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32V224c0-35.3-28.7-64-64-64H224zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z"/></svg>',
        photo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\x3c!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --\x3e<path d="M220.6 121.2L271.1 96 448 96v96H333.2c-21.9-15.1-48.5-24-77.2-24s-55.2 8.9-77.2 24H64V128H192c9.9 0 19.7-2.3 28.6-6.8zM0 128V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H271.1c-9.9 0-19.7 2.3-28.6 6.8L192 64H160V48c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16l0 16C28.7 64 0 92.7 0 128zM344 304c0 48.6-39.4 88-88 88s-88-39.4-88-88s39.4-88 88-88s88 39.4 88 88z"/></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\x3c!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --\x3e<path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"/></svg>',
        quit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">\x3c!--! Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --\x3e<path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>'
    }
    let asteroidsPath;
    const tools = {
        "hitokoto": {
            icon: svg.hitokoto,
            callback: showHitokoto
        },
        "asteroids": {
            icon: svg.asteroids,
            callback: () => {
                if (window.Asteroids) {
                    if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
                    window.ASTEROIDSPLAYERS.push(new Asteroids());
                } else {
                    const script = document.createElement("script");
                    script.src = asteroidsPath;
                    document.head.appendChild(script);
                }
            }
        },
        "switch-model": {
            icon: svg.switchModel,
            callback: () => {}
        },
        "switch-texture": {
            icon: svg.switchTexture,
            callback: () => {}
        },
        "photo": {
            icon: svg.photo,
            callback: () => {
                showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
                Live2D.captureName = "photo.png";
                Live2D.captureFrame = true;
            }
        },
        "info": {
            icon: svg.info,
            callback: () => {
                open("https://github.com/stevenjoezhang/live2d-widget");
            }
        },
        "quit": {
            icon: svg.quit,
            callback: () => {
                localStorage.setItem("waifu-display", Date.now());
                showMessage("愿你有一天能与重要的人重逢。", 2000, 11);
                document.getElementById("waifu").style.bottom = "-500px";
                setTimeout(() => {
                    document.getElementById("waifu").style.display = "none";
                    document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
                }, 3000);
            }
        }
    };

    /**
     * 随机选择模型
     * @param obj
     * @returns {*}
     */
    function randomSelection(obj) {
        return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
    }

    /**
     * 按顺序选择数据
     * @param obj 数据
     * @param currentIdx 当前序号
     * @returns {{obj: *, nextIdx: number}|{obj, nextIdx: number}}
     */
    function orderSelection(obj, currentIdx) {
        if (Array.isArray(obj)) {
            const nextIdx = (currentIdx + 1) % obj.length;
            return {
                obj: obj[nextIdx],
                nextIdx: nextIdx
            }
        } else {
            return {
                obj: obj,
                nextIdx: 0
            }
        }
    }

    function showMessageCoverOrNot(text, timeout, priority, isCover) {
        let currentPriority = sessionStorage.getItem("waifu-text");
        if (!text || (currentPriority && currentPriority > priority)) return;
        if (currentPriority && parseInt(currentPriority) === priority && !isCover) {
            return;
        }
        if (messageTimer) {
            clearTimeout(messageTimer);
            messageTimer = null;
        }
        text = randomSelection(text);
        sessionStorage.setItem("waifu-text", priority);
        const tips = document.getElementById("waifu-tips");
        tips.innerHTML = text;
        tips.classList.add("waifu-tips-active");
        messageTimer = setTimeout(() => {
            sessionStorage.removeItem("waifu-text");
            tips.classList.remove("waifu-tips-active");
        }, timeout);
    }

    let messageTimer;
    function showMessage(text, timeout, priority) {
        showMessageCoverOrNot(text, timeout, priority, true);
    }

    /**
     * 展示一言
     */
    function showHitokoto() {
        // 增加 hitokoto.cn 的 API
        fetch("https://v1.hitokoto.cn")
            .then(response => response.json())
            .then(result => {
                const text = `这句一言来自 <span>「${result.from}」</span>，是 <span>${result.creator}</span> 在 hitokoto.cn 投稿的。`;
                showMessage(result.hitokoto, 6000, 9);
                setTimeout(() => {
                    showMessage(text, 4000, 9);
                }, 6000);
            });
    }

    let jsonData;
    /**
     * 加载组件
     * @param config 配置
     */
    function loadWidget(config) {
        const model = new Model(config);
        localStorage.removeItem("waifu-display");
        sessionStorage.removeItem("waifu-text");
        document.body.insertAdjacentHTML("beforeend", `<div id="waifu">
            <div id="waifu-tips"></div>
            <canvas id="live2d" width="800" height="800"></canvas>
            <div id="waifu-tool"></div>
        </div>`);
        // https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
        setTimeout(() => {
            document.getElementById("waifu").style.bottom = 0;
        }, 0);

        (function registerTools() {
            tools["switch-model"].callback = () => model.loadOtherModel();
            tools["switch-texture"].callback = () => model.loadRandModel();
            if (!Array.isArray(config.tools)) {
                config.tools = Object.keys(tools);
            }
            for (let tool of config.tools) {
                if (tools[tool]) {
                    const { icon, callback } = tools[tool];
                    document.getElementById("waifu-tool").insertAdjacentHTML("beforeend", `<span id="waifu-tool-${tool}">${icon}</span>`);
                    document.getElementById(`waifu-tool-${tool}`).addEventListener("click", callback);
                }
            }
        })();

        function registerEventListener(result) {
            // json数据赋值
            jsonData = result;
            // 检测用户活动状态，并在空闲时显示消息
            let userAction = false,
                userActionTimer,
                messageArray = result.message.default,
                lastHoverElement;
            window.addEventListener("mousemove", () => userAction = true);
            window.addEventListener("keydown", () => userAction = true);
            setInterval(() => {
                if (userAction) {
                    userAction = false;
                    clearInterval(userActionTimer);
                    userActionTimer = null;
                } else if (!userActionTimer) {
                    userActionTimer = setInterval(() => {
                        showMessage(messageArray, 6000, 9);
                    }, 20000);
                }
            }, 1000);
            showWaifuWelcome();
            window.addEventListener("mouseover", event => {
                for (let { selector, text } of result.mouseover) {
                    if (event.target.matches(selector)) {
                        // 音乐播放器特殊处理
                        if (selector === '.aplayer-pic') {
                            text = ap.paused ? text[0] : text[1];
                            text = randomSelection(text);
                            showMessageCoverOrNot(text, 4000, 9, false);
                            return;
                        }
                        text = randomSelection(text);
                        text = text.replace("{text}", event.target.innerText);
                        showMessage(text, 4000, 8);
                        return;
                    }
                }
            });
            window.addEventListener("click", event => {
                for (let { selector, text } of result.click) {
                    if (!event.target.closest(selector)) continue;
                    text = randomSelection(text);
                    text = text.replace("{text}", event.target.innerText);
                    showMessage(text, 4000, 8);
                    return;
                }
            });
            result.seasons.forEach(({ date, text }) => {
                const now = new Date(),
                    after = date.split("-")[0],
                    before = date.split("-")[1] || after;
                if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
                    text = randomSelection(text);
                    text = text.replace("{year}", now.getFullYear());
                    console.log(123456)
                    messageArray.push(text);
                }
            });

            const devtools = () => { };
            console.log("%c", devtools);
            devtools.toString = () => {
                showMessage(result.message.console, 6000, 9);
            };
            window.addEventListener("copy", () => {
                showMessage(result.message.copy, 6000, 9);
            });
            window.addEventListener("visibilitychange", () => {
                if (!document.hidden) showMessage(result.message.visibilitychange, 6000, 9);
            });
        }

        /**
         * live2d鼠标监听事件初始化
         */
        function initWaifuMouseEvent() {
            let waifu = document.getElementById("waifu");
            let isDown = false;
            let waifuLeft;
            let mouseLeft;
            let waifuTop;
            let mouseTop;
            // 鼠标点击监听
            waifu.onmousedown = function (e) {
                isDown = true;
                // 记录x轴
                waifuLeft = waifu.offsetLeft;
                mouseLeft = e.clientX;
                // 记录y轴
                waifuTop = waifu.offsetTop;
                mouseTop = e.clientY;
            }
            // 鼠标移动监听
            window.onmousemove = function (e) {
                if (!isDown) {
                    return;
                }
                // x轴移动
                let currentLeft = waifuLeft + (e.clientX - mouseLeft);
                if (currentLeft < 0) {
                    currentLeft = 0;
                } else if (currentLeft > window.innerWidth - 300) {
                    currentLeft = window.innerWidth - 300;
                }
                waifu.style.left = currentLeft  + "px";
                // y轴移动
                // let currentTop = waifuTop + (e.clientY - mouseTop);
                // if (currentTop < 30) {
                //     currentTop = 30
                // } else if (currentTop > window.innerHeight - 290) {
                //     currentTop = window.innerHeight - 290
                // }
                // waifu.style.top = currentTop + "px";
            }
            // 鼠标点击松开监听
            window.onmouseup = function (e) {
                isDown = false;
            }
        }

        (function initModel() {
            let modelId = localStorage.getItem("modelId"),
                modelTexturesId = localStorage.getItem("modelTexturesId");
            if (modelId === null) {
                // 首次访问加载 指定模型 的 指定材质
                modelId = 0; // 模型 ID
                modelTexturesId = 0; // 材质 ID
            }
            console.log()
            model.loadModel(modelId, modelTexturesId);
            fetch(config.waifuPath)
                .then(response => response.json())
                .then(registerEventListener)
                .then(initWaifuMouseEvent);
        })();
    }

    /**
     * 初始化组件
     * @param config
     * @param apiPath
     */
    function initWidget(config, apiPath) {
        asteroidsPath = config.gamePath;
        if (typeof config === "string") {
            config = {
                waifuPath: config,
                apiPath
            };
        }
        document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
            <span>看板娘</span>
        </div>`);
        const toggle = document.getElementById("waifu-toggle");
        toggle.addEventListener("click", () => {
            toggle.classList.remove("waifu-toggle-active");
            if (toggle.getAttribute("first-time")) {
                loadWidget(config);
                toggle.removeAttribute("first-time");
            } else {
                localStorage.removeItem("waifu-display");
                document.getElementById("waifu").style.display = "";
                setTimeout(() => {
                    document.getElementById("waifu").style.bottom = 0;
                }, 0);
            }
        });
        if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
            toggle.setAttribute("first-time", true);
            setTimeout(() => {
                toggle.classList.add("waifu-toggle-active");
            }, 0);
        } else {
            loadWidget(config);
        }
    }

    /**
     * 获取欢迎信息
     * @returns {*|string} 欢迎信息文本
     */
    function getWaifuWelcome() {
        // 主页：展示时间相关文本
        if (location.pathname === "/hugo-stack/") {
            for (let { hour, text } of jsonData.time) {
                const now = new Date(),
                    after = hour.split("-")[0],
                    before = hour.split("-")[1] || after;
                if (after <= now.getHours() && now.getHours() <= before) {
                    return text;
                }
            }
        }
        // 其他页面：展示欢迎阅读文本
        const text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
        // 存在来源，文本拼接来源地址
        let from;
        if (document.referrer !== "") {
            const referrer = new URL(document.referrer),
                domain = referrer.hostname.split(".")[1];
            const domains = {
                "baidu": "百度",
                "so": "360搜索",
                "google": "谷歌搜索",
                "bing": "edge搜索"
            };
            if (location.hostname === referrer.hostname) return text;

            if (domain in domains) from = domains[domain];
            else from = referrer.hostname;
            return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
        }
        return text;
    }

    /**
     * 展示欢迎信息
     */
    function showWaifuWelcome() {
        showMessage(getWaifuWelcome(), 7000, 11);
    }

    window.initWidget = initWidget;
    window.showWaifuWelcome = showWaifuWelcome;
})()


