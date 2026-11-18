
/* =========================================
   WINDLETTER | 晚风邮局
   V2.0 核心游戏系统
   兼容原有 HTML 与 V1.2 存档
========================================= */

const STORAGE_KEY = "windletter_save_v1";

const initialState = {
    gold: 100,
    reputation: 0,
    satisfaction: 100,
    currentPage: "office",
    hasStarted: false,

    firstLetterCompleted: false,
    letterChoice: "",
    completedLetters: 0,

    completedLetterIds: [],
    inventory: [],
    visitedPlaces: [],
    logs: [],
    day: 1,
    deliveries: 0,
    totalIncome: 0,
    settings: {
        compact: false
    }
};

let gameState = structuredClone(initialState);

const homePage = document.getElementById("home-page");
const gamePage = document.getElementById("game-page");

const letters = [
    {
        id: "letter-001",
        number: "001",
        title: "一封迟到了十年的信",
        sender: "一位不愿留下姓名的人",
        description: "一封关于旧车站、约定与遗憾的信。",
        content: [
            "你好：",
            "如果你看到这封信，说明我终于鼓起勇气，把它寄了出去。",
            "十年前，我和一位朋友约好，要在镇上的旧车站再见一面。可那天，我没有赴约。",
            "这些年，我一直想知道，他是否还记得那个约定。",
            "如果可以，请帮我找到他。"
        ],
        choices: [
            {
                text: "A. 去旧车站寻找线索",
                result: "你在车站的长椅下发现了一张泛黄的车票。背面写着一个日期，也许这就是故事的起点。",
                reward: { gold: 30, reputation: 10, satisfaction: 5 },
                item: "泛黄的车票"
            },
            {
                text: "B. 先在镇上打听消息",
                result: "杂货店老板记得十年前确实有一个年轻人常常在车站等人。他还记得，那个人总带着一本旧书。",
                reward: { gold: 20, reputation: 15, satisfaction: 10 },
                item: "旧书线索"
            }
        ]
    },
    {
        id: "letter-002",
        number: "002",
        title: "写给春天的明信片",
        sender: "花店老板林姨",
        description: "一张没有寄出地址的明信片。",
        content: [
            "亲爱的老朋友：",
            "今年的花开得很好，我把你最喜欢的白色雏菊种在了窗边。",
            "你离开以后，我总觉得店里少了些声音。",
            "如果有一天你路过这里，希望你还能认出这扇旧窗户。",
            "春天一直都在，我也一直在。"
        ],
        choices: [
            {
                text: "A. 帮林姨把明信片送到旧街",
                result: "旧街尽头的木门打开了。多年未见的朋友收下明信片，决定在下一个春天回来看看。",
                reward: { gold: 35, reputation: 15, satisfaction: 8 },
                item: "白色雏菊"
            },
            {
                text: "B. 邀请收信人回邮局见面",
                result: "一封简短的回信送回了邮局。字迹有些颤抖，却写着：我也很想念那里。",
                reward: { gold: 25, reputation: 20, satisfaction: 12 },
                item: "春日回信"
            }
        ]
    },
    {
        id: "letter-003",
        number: "003",
        title: "没有署名的生日祝福",
        sender: "镇上的一位陌生人",
        description: "一封写给独居老人的生日信。",
        content: [
            "生日快乐：",
            "不知道你还记不记得我。",
            "小时候，每次下雨，你都会把伞分给路过的孩子。",
            "后来我去了很远的地方，一直没有机会回来。",
            "这次我想告诉你，那把伞，我一直记得。"
        ],
        choices: [
            {
                text: "A. 亲自去拜访老人",
                result: "老人读完信后沉默了很久，最后笑了。他说，原来那些微不足道的小事，也会被人记得这么久。",
                reward: { gold: 40, reputation: 20, satisfaction: 10 },
                item: "旧雨伞"
            },
            {
                text: "B. 邀请镇民一起准备生日惊喜",
                result: "傍晚，邮局门口亮起了灯。老人收到的不只是一封信，还有许多人的祝福。",
                reward: { gold: 30, reputation: 25, satisfaction: 15 },
                item: "生日贺卡"
            }
        ]
    }
];

const places = [
    {
        id: "station",
        name: "旧车站",
        icon: "🚉",
        desc: "一座很久没有列车停靠的老车站。",
        npc: "车站管理员",
        dialogue: "有些人离开以后，还是会有人在这里等他。"
    },
    {
        id: "flower",
        name: "晚风花店",
        icon: "🌷",
        desc: "窗台上摆满了白色雏菊。",
        npc: "林姨",
        dialogue: "花不一定要送给谁。有人愿意种下它，就已经很好了。"
    },
    {
        id: "shop",
        name: "街角杂货铺",
        icon: "🏡",
        desc: "镇上消息最灵通的地方。",
        npc: "杂货店老板",
        dialogue: "你想打听什么？只要是雾汀镇的事，我大概都知道一点。"
    },
    {
        id: "bridge",
        name: "晚风桥",
        icon: "🌉",
        desc: "傍晚时分，可以看见河面上的落日。",
        npc: "钓鱼的老人",
        dialogue: "年轻的时候总想着去远方，后来才知道，能回来也是一种幸运。"
    },
    {
        id: "library",
        name: "旧书屋",
        icon: "📚",
        desc: "藏着许多被遗忘的故事。",
        npc: "书店店主",
        dialogue: "每一本书，都有自己的读者。每一封信，也一样。"
    },
    {
        id: "square",
        name: "镇中心广场",
        icon: "🌳",
        desc: "镇民们常常在这里聊天。",
        npc: "广场居民",
        dialogue: "最近邮局又热闹起来了。大家都很高兴。"
    }
];

/* ========== 存档与兼容 ========== */

function saveGame() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        const status = document.getElementById("save-status");
        if (status) status.textContent = "已自动保存";
    } catch (error) {
        console.error("存档失败：", error);
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return false;

        const oldState = JSON.parse(saved);
        gameState = {
            ...structuredClone(initialState),
            ...oldState,
            settings: {
                ...initialState.settings,
                ...(oldState.settings || {})
            }
        };

        // 兼容旧版本的第一封信进度
        if (
            gameState.firstLetterCompleted &&
            !gameState.completedLetterIds.includes("letter-001")
        ) {
            gameState.completedLetterIds.push("letter-001");
        }

        gameState.completedLetters =
            gameState.completedLetterIds.length;

        return true;
    } catch (error) {
        console.error("读取存档失败：", error);
        return false;
    }
}

function resetState() {
    gameState = structuredClone(initialState);
}

/* ========== 通用工具 ========== */

function addLog(message) {
    gameState.logs.unshift({
        message,
        day: gameState.day,
        time: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    gameState.logs = gameState.logs.slice(0, 30);
}

function addItem(name, description) {
    const existing = gameState.inventory.find(
        item => item.name === name
    );

    if (existing) {
        existing.count += 1;
    } else {
        gameState.inventory.push({
            name,
            description,
            count: 1
        });
    }
}

function hasCompleted(id) {
    return gameState.completedLetterIds.includes(id);
}

function updateStatus() {
    document.getElementById("gold").textContent = gameState.gold;
    document.getElementById("reputation").textContent = gameState.reputation;
    document.getElementById("satisfaction").textContent =
        gameState.satisfaction;
}

/* ========== 页面切换 ========== */

function showGamePage(pageName) {
    document.querySelectorAll(".game-view").forEach(view => {
        view.hidden = true;
    });

    const target = document.getElementById(`${pageName}-view`);
    if (target) target.hidden = false;

    document.querySelectorAll(".game-sidebar button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    gameState.currentPage = pageName;

    switch (pageName) {
        case "office":
            renderOffice();
            break;
        case "letters":
            renderLetters();
            break;
        case "town":
            renderTown();
            break;
        case "inventory":
            renderInventory();
            break;
        case "dashboard":
            renderDashboard();
            break;
    }

    updateStatus();
    saveGame();
}

/* ========== 游戏入口 ========== */

function startNewGame() {
    if (localStorage.getItem(STORAGE_KEY)) {
        if (!confirm("开始新旅程会覆盖旧存档，确定重新开始吗？")) {
            return;
        }
    }

    resetState();
    gameState.hasStarted = true;

    addLog("你接手了雾汀镇的晚风邮局。");
    saveGame();
    enterGame();
}

function continueGame() {
    if (!loadGame() || !gameState.hasStarted) {
        alert("还没有旅程记录，请先开始新游戏。");
        return;
    }

    enterGame();
}

function enterGame() {
    homePage.hidden = true;
    gamePage.hidden = false;
    showGamePage(gameState.currentPage || "office");
}

function returnHome() {
    saveGame();
    gamePage.hidden = true;
    homePage.hidden = false;
}

function openSettings() {
    const old = document.getElementById("settings-dialog");
    if (old) old.remove();

    const dialog = document.createElement("dialog");
    dialog.id = "settings-dialog";
    dialog.innerHTML = `
        <div class="settings-content">
            <p class="eyebrow">WINDLETTER SETTINGS</p>
            <h2>旅程设置</h2>
            <p>你的游戏进度会自动保存在当前浏览器中。</p>
            <div class="settings-actions">
                <button id="setting-save">立即保存</button>
                <button id="setting-home">返回首页</button>
                <button id="setting-reset" class="danger-button">清除存档</button>
                <button id="setting-close">关闭</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    dialog.querySelector("#setting-save").onclick = () => {
        saveGame();
        alert("旅程已保存。");
    };

    dialog.querySelector("#setting-home").onclick = () => {
        dialog.close();
        returnHome();
    };

    dialog.querySelector("#setting-reset").onclick = () => {
        if (confirm("确定清除当前存档吗？此操作无法撤销。")) {
            localStorage.removeItem(STORAGE_KEY);
            dialog.close();
            location.reload();
        }
    };

    dialog.querySelector("#setting-close").onclick = () => dialog.close();
}

/* ========== 邮局主页 ========== */


function renderOffice() {
    const office = document.getElementById("office-view");

    const nextLetter = letters.find(
        letter => !hasCompleted(letter.id)
    );

    office.innerHTML = `
        <div class="office-heading">
            <div>
                <p class="eyebrow">WUTING TOWN · DAY ${gameState.day || 1}</p>
                <h2>雾汀镇 · 晚风邮局</h2>
                <p>今天的风很轻，或许会有新的故事抵达。</p>
            </div>
            <span class="office-weather">☀ 晴朗 · 微风</span>
        </div>

        <div class="office-room">
            <div class="room-window">
                <div class="window-sky"></div>
                <div class="window-hill hill-one"></div>
                <div class="window-hill hill-two"></div>
                <div class="window-sun"></div>
                <div class="window-cross"></div>
            </div>

            <div class="room-clock"> 
                <span>晚风邮局</span>
                <strong>✦</strong>
            </div>

            <button class="room-object letter-shelf"
                data-object="letters" aria-label="信件架">
                <span class="object-icon">✉️</span>
                <span class="object-label">信件架</span>
                <i class="shelf-paper paper-a"></i>
                <i class="shelf-paper paper-b"></i>
                <i class="shelf-paper paper-c"></i>
            </button>

            <button class="room-object plant-object"
                data-object="plant" aria-label="绿植">
                <span class="object-icon">🪴</span>
                <span class="object-label">窗边绿植</span>
            </button>

            <button class="room-object counter-object"
                data-object="counter" aria-label="邮局柜台">
                <span class="counter-top"></span>
                <span class="counter-sign">WINDLETTER</span>
                <span class="counter-stamp">邮</span>
                <span class="object-label">邮局柜台</span>
            </button>

            <button class="room-object clock-object"
                data-object="clock" aria-label="墙上时钟">
                <span class="clock-face">◷</span>
                <span class="object-label">墙上时钟</span>
            </button>

            <button class="room-object mascot-object"
                data-object="mascot" aria-label="小邮差">
                <span class="mascot-sprite">📮</span>
                <span class="mascot-name">小邮差</span>
            </button>

            <div class="room-floor"></div>
            <div class="room-rug"></div>
        </div>

        <div class="office-tip" id="office-tip">
            <span>✦</span>
            <span>点击邮局里的物件，看看有什么发现。</span>
        </div>

        <div class="office-summary">
            <div class="summary-item">
                <span>📮 已完成信件</span>
                <strong>${gameState.completedLetters || 0} 封</strong>
            </div>
            <div class="summary-item">
                <span>🪙 当前金币</span>
                <strong>${gameState.gold}</strong>
            </div>
            <div class="summary-item">
                <span>🌿 邮局声望</span>
                <strong>${gameState.reputation}</strong>
            </div>
        </div>

        <div class="letter-notice">
            <span class="notice-icon">✉</span>
            <div>
                <h3>${nextLetter ? nextLetter.title : "今天的信件都已处理"}</h3>
                <p>${nextLetter ? nextLetter.description : "也许可以去小镇走走，听听居民们的故事。"}</p>
            </div>
        </div>

        <div class="office-actions">
            ${
                nextLetter
                    ? `<button class="primary-action" id="office-open-letter">拆开新信 →</button>`
                    : `<button class="primary-action" id="office-go-town">去小镇看看 →</button>`
            }
            <button class="secondary-action" id="office-rest">结束今天</button>
        </div>
    `;

    const messages = {
        plant: "窗边的绿植长出了新叶。看来今天也有值得期待的事情。",
        counter: "柜台上放着一枚旧邮戳。每一封信，都从这里开始新的旅程。",
        clock: "滴答、滴答……时间走得很慢，故事却一直在发生。",
        mascot: "小邮差：今天也要认真送信哦！每一封信，都有人在等待。",
        letters: "信件架上还有许多等待处理的故事。"
    };

    office.querySelectorAll("[data-object]").forEach(object => {
        object.addEventListener("click", () => {
            const type = object.dataset.object;

            if (type === "letters") {
                showGamePage("letters");
                return;
            }

            if (type === "clock") {
                const tip = document.getElementById("office-tip");
                tip.innerHTML = `<span>🕰</span><span>${messages.clock}</span>`;
                return;
            }

            const tip = document.getElementById("office-tip");
            tip.innerHTML = `<span>✦</span><span>${messages[type]}</span>`;

            object.classList.add("object-active");
            setTimeout(() => object.classList.remove("object-active"), 350);
        });
    });

    const openButton = document.getElementById("office-open-letter");
    if (openButton && nextLetter) {
        openButton.onclick = () => openLetter(nextLetter.id);
    }

    const townButton = document.getElementById("office-go-town");
    if (townButton) {
        townButton.onclick = () => showGamePage("town");
    }

    const restButton = document.getElementById("office-rest");
    if (restButton) {
        restButton.onclick = endDay;
    }
}

/* ========== 信件系统 ========== */

function renderLetters() {
    const list = document.getElementById("letter-list");

    list.innerHTML = `
        <p class="section-intro">每一封信，都藏着一个等待被听见的故事。</p>
        <div class="letter-grid">
            ${letters.map((letter, index) => {
                const completed = hasCompleted(letter.id);
                const unlocked = index === 0 || hasCompleted(letters[index - 1].id);

                return `
                    <article class="letter-card ${completed ? "is-complete" : ""} ${!unlocked ? "is-locked" : ""}">
                        <div class="letter-card-top">
                            <span class="letter-number">NO.${letter.number}</span>
                            <span>${completed ? "✓ 已完成" : unlocked ? "✉ 待开启" : "🔒 未解锁"}</span>
                        </div>
                        <h3>${letter.title}</h3>
                        <p>${unlocked ? letter.description : "完成上一封信件后解锁这个故事。"}</p>
                        ${
                            unlocked
                                ? `<button class="text-action" data-open-letter="${letter.id}">${completed ? "查看故事" : "阅读信件"} →</button>`
                                : ""
                        }
                    </article>
                `;
            }).join("")}
        </div>
    `;

    list.querySelectorAll("[data-open-letter]").forEach(button => {
        button.onclick = () => openLetter(button.dataset.openLetter);
    });
}

function openLetter(id) {
    const letter = letters.find(item => item.id === id);
    if (!letter) return;

    const office = document.getElementById("office-view");
    showGamePage("office");

    const completed = hasCompleted(id);
    const savedChoice = gameState[`choice_${id}`];

    office.innerHTML = `
        <article class="story-paper">
            <div class="story-label">WINDLETTER · LETTER NO.${letter.number}</div>
            <h2>${letter.title}</h2>
            <p class="story-intro">寄件人：${letter.sender}</p>

            <div class="letter-content">
                ${letter.content.map(line => `<p>${line}</p>`).join("")}
                <p class="letter-signature">—— ${letter.sender}</p>
            </div>

            ${
                completed
                    ? `
                        <div class="story-completed">
                            <p>✓ 这封信已经送达。</p>
                            <p>${letter.choices[savedChoice || 0].result}</p>
                            <button class="primary-action" id="story-back">返回信件列表</button>
                        </div>
                    `
                    : `
                        <div class="story-question">
                            <h3>你决定怎么处理这封信？</h3>
                            <p>你的选择将影响故事的走向与获得的线索。</p>
                            ${letter.choices.map((choice, index) => `
                                <button class="choice-button" data-choice="${index}">
                                    ${choice.text}
                                </button>
                            `).join("")}
                        </div>
                    `
            }
        </article>
    `;

    const back = document.getElementById("story-back");
    if (back) back.onclick = () => showGamePage("letters");

    office.querySelectorAll("[data-choice]").forEach(button => {
        button.onclick = () => completeLetter(
            id,
            Number(button.dataset.choice)
        );
    });
}

function completeLetter(id, choiceIndex) {
    if (hasCompleted(id)) return;

    const letter = letters.find(item => item.id === id);
    if (!letter) return;

    const choice = letter.choices[choiceIndex];
    if (!choice) return;

    gameState.completedLetterIds.push(id);
    gameState.completedLetters = gameState.completedLetterIds.length;

    gameState[`choice_${id}`] = choiceIndex;

    gameState.gold += choice.reward.gold;
    gameState.reputation += choice.reward.reputation;
    gameState.satisfaction = Math.min(
        100,
        gameState.satisfaction + choice.reward.satisfaction
    );

    gameState.deliveries += 1;
    gameState.totalIncome += choice.reward.gold;

    addItem(choice.item, `来自《${letter.title}》的故事线索`);
    addLog(`完成信件：《${letter.title}》，获得物品：${choice.item}`);

    if (id === "letter-001") {
        gameState.firstLetterCompleted = true;
        gameState.letterChoice =
            choiceIndex === 0 ? "station" : "town";
    }

    updateStatus();
    saveGame();
    renderLetterResult(letter, choice);
}

function renderLetterResult(letter, choice) {
    const office = document.getElementById("office-view");

    office.innerHTML = `
        <div class="result-paper">
            <div class="result-icon">✧</div>
            <p class="eyebrow">LETTER DELIVERED</p>
            <h2>这封信，终于抵达了。</h2>
            <p>${choice.result}</p>

            <div class="reward-panel">
                <span>金币 +${choice.reward.gold}</span>
                <span>声望 +${choice.reward.reputation}</span>
                <span>满意度 +${choice.reward.satisfaction}</span>
            </div>

            <div class="item-reward">
                <span>获得新物品</span>
                <strong>✦ ${choice.item}</strong>
            </div>

            <button class="primary-action" id="result-continue">继续旅程 →</button>
        </div>
    `;

    document.getElementById("result-continue").onclick = () => {
        showGamePage("letters");
    };
}

/* ========== 小镇探索 ========== */


function renderTown() {
    const map = document.getElementById("town-map");

    map.innerHTML = `
        <div class="town-header">
            <div>
                <p class="eyebrow">WUTING TOWN · EXPLORATION</p>
                <h2>雾汀镇</h2>
                <p>沿着晚风走走，看看今天会遇见谁。</p>
            </div>
            <div class="town-progress">
                <strong>${gameState.visitedPlaces.length}/${places.length}</strong>
                <span>已探索地点</span>
            </div>
        </div>

        <div class="town-map-board">
            <div class="map-river"></div>
            <div class="map-road road-one"></div>
            <div class="map-road road-two"></div>
            <div class="map-road road-three"></div>

            ${places.map((place, index) => `
                <button
                    class="map-location location-${index + 1} ${gameState.visitedPlaces.includes(place.id) ? "visited" : ""}"
                    data-place="${place.id}"
                >
                    <span class="map-location-icon">${place.icon}</span>
                    <span class="map-location-name">${place.name}</span>
                    <span class="map-location-status">
                        ${gameState.visitedPlaces.includes(place.id) ? "✓ 已拜访" : "点击探索"}
                    </span>
                </button>
            `).join("")}

            <div class="map-decoration tree tree-one">🌳</div>
            <div class="map-decoration tree tree-two">🌲</div>
            <div class="map-decoration tree tree-three">🌳</div>
            <div class="map-decoration map-cloud">☁</div>
            <div class="map-town-sign">雾汀镇 · WUTING</div>
        </div>

        <div class="town-bottom">
            <div>
                <h3>镇上的故事</h3>
                <p>每个地点都有一位居民，也许他们正等待有人倾听。</p>
            </div>
            <div class="town-location-list">
                ${places.map(place => `
                    <button class="town-list-item" data-place="${place.id}">
                        <span>${place.icon}</span>
                        <span>${place.name}</span>
                        <span>${gameState.visitedPlaces.includes(place.id) ? "✓" : "→"}</span>
                    </button>
                `).join("")}
            </div>
        </div>
    `;

    map.querySelectorAll("[data-place]").forEach(button => {
        button.addEventListener("click", () => {
            visitPlace(button.dataset.place);
        });
    });
}

function visitPlace(id) {
    const place = places.find(item => item.id === id);
    if (!place) return;

    const firstVisit = !gameState.visitedPlaces.includes(id);

    if (firstVisit) {
        gameState.visitedPlaces.push(id);
        gameState.gold += 5;
        gameState.satisfaction = Math.min(
            100,
            gameState.satisfaction + 2
        );
        gameState.reputation += 1;
        addLog(`第一次探索了${place.name}，认识了${place.npc}。`);
        saveGame();
    }

    const map = document.getElementById("town-map");

    const extraDialogues = {
        station: [
            "最近车站很安静，不过偶尔还是有人来这里等车。",
            "我记得以前有个年轻人，总是在黄昏时分出现。"
        ],
        flower: [
            "今天的花开得不错，要不要带一束回去？",
            "有些花开得很慢，但只要耐心等待，总会等到它的春天。"
        ],
        shop: [
            "邮局最近好像热闹起来了，镇上的人都在谈论你。",
            "如果想打听消息，别忘了多和居民聊聊天。"
        ],
        bridge: [
            "傍晚的河面最漂亮。很多人把心事留在了这里。",
            "风吹过来的时候，好像连烦恼都会轻一点。"
        ],
        library: [
            "书架最里面还有几本旧书，也许你会感兴趣。",
            "你知道吗？有些故事，只有读到最后才知道答案。"
        ],
        square: [
            "大家都希望邮局能一直开下去。",
            "下次有空，可以带着新认识的朋友来广场坐坐。"
        ]
    };

    const dialogues = extraDialogues[id] || [place.dialogue];
    const randomDialogue = dialogues[
        Math.floor(Math.random() * dialogues.length)
    ];

    map.innerHTML = `
        <div class="town-detail">
            <button class="back-action" id="back-town">← 返回地图</button>

            <div class="town-detail-art">
                <span>${place.icon}</span>
                <div class="detail-art-caption">${place.name}</div>
            </div>

            <p class="eyebrow">A LITTLE STORY IN WUTING</p>
            <h2>${place.name}</h2>
            <p class="detail-description">${place.desc}</p>

            <div class="npc-card">
                <div class="npc-avatar">👤</div>
                <div>
                    <span class="npc-name">${place.npc}</span>
                    <p class="npc-speech">“${randomDialogue}”</p>
                </div>
            </div>

            <div class="town-visit-reward">
                ${
                    firstVisit
                        ? "✦ 初次探索奖励：金币 +5 · 声望 +1 · 满意度 +2"
                        : "你再次来到了这里。熟悉的风景依旧温柔。"
                }
            </div>

            <div class="town-detail-actions">
                <button class="primary-action" id="talk-again">再聊几句</button>
                <button class="secondary-action" id="back-town-bottom">返回地图</button>
            </div>
        </div>
    `;

    document.getElementById("back-town").onclick = renderTown;
    document.getElementById("back-town-bottom").onclick = renderTown;

    document.getElementById("talk-again").onclick = () => {
        visitPlace(id);
    };

    updateStatus();
    saveGame();
}

/* ========== 背包系统 ========== */

function renderInventory() {
    const list = document.getElementById("inventory-list");

    if (!gameState.inventory.length) {
        list.innerHTML = `
            <div class="empty-state">
                <div>🎒</div>
                <h3>背包还是空的</h3>
                <p>完成信件、探索小镇，就能收集旅途中的纪念品。</p>
                <button class="primary-action" id="inventory-go-letters">去看看信件</button>
            </div>
        `;

        document.getElementById("inventory-go-letters").onclick =
            () => showGamePage("letters");
        return;
    }

    list.innerHTML = `
        <p class="section-intro">这些小小的物件，记录着你在雾汀镇的旅程。</p>
        <div class="inventory-grid">
            ${gameState.inventory.map(item => `
                <article class="inventory-card">
                    <div class="inventory-item-icon">✦</div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <span>数量：${item.count}</span>
                </article>
            `).join("")}
        </div>
    `;
}

/* ========== 经营数据 ========== */

function renderDashboard() {
    const panel = document.getElementById("analytics-panel");

    // 兼容之前的存档
    if (!gameState.facilities) {
        gameState.facilities = {
            counter: 1,
            mailbox: 1,
            lounge: 1
        };
    }

    if (!gameState.claimedTasks) {
        gameState.claimedTasks = [];
    }

    const facilities = [
        {
            id: "counter",
            name: "信件柜台",
            icon: "📮",
            description: "提高邮局的接待能力。",
            cost: 50
        },
        {
            id: "mailbox",
            name: "复古邮筒",
            icon: "📬",
            description: "让更多信件找到晚风邮局。",
            cost: 60
        },
        {
            id: "lounge",
            name: "休息区",
            icon: "🪴",
            description: "为来访的居民提供舒适空间。",
            cost: 70
        }
    ];

    const tasks = [
        {
            id: "task-letter",
            name: "认真送达",
            description: "完成至少一封信件",
            condition: gameState.completedLetters >= 1,
            reward: 30
        },
        {
            id: "task-explore",
            name: "镇上的新朋友",
            description: "探索至少三个地点",
            condition: gameState.visitedPlaces.length >= 3,
            reward: 25
        },
        {
            id: "task-story",
            name: "故事收藏家",
            description: "完成全部三封信件",
            condition: gameState.completedLetters >= 3,
            reward: 60
        }
    ];

    const level = 1 + Math.floor(
        (gameState.reputation || 0) / 30
    );

    panel.innerHTML = `
        <div class="management-header">
            <p class="eyebrow">WINDLETTER · MANAGEMENT</p>
            <h2>邮局经营中心</h2>
            <p>一点一点，把旧邮局变成镇上最温暖的地方。</p>
        </div>

        <div class="management-level">
            <div>
                <span>当前邮局等级</span>
                <strong>Lv.${level}</strong>
            </div>
            <div>
                <span>升级进度</span>
                <strong>${gameState.reputation % 30}/30 声望</strong>
            </div>
        </div>

        <h3 class="management-title">🏡 邮局设施</h3>
        <div class="facility-grid">
            ${facilities.map(item => {
                const currentLevel = gameState.facilities[item.id];
                const cost = item.cost * currentLevel;

                return `
                    <article class="facility-card">
                        <div class="facility-icon">${item.icon}</div>
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <div class="facility-level">当前等级 Lv.${currentLevel}</div>
                        <button
                            class="facility-upgrade"
                            data-upgrade="${item.id}"
                            ${currentLevel >= 5 || gameState.gold < cost ? "disabled" : ""}
                        >
                            ${
                                currentLevel >= 5
                                    ? "已达到最高等级"
                                    : `升级 · ${cost} 金币`
                            }
                        </button>
                    </article>
                `;
            }).join("")}
        </div>

        <h3 class="management-title">📋 每日经营任务</h3>
        <div class="task-list">
            ${tasks.map(task => {
                const claimed = gameState.claimedTasks.includes(task.id);

                return `
                    <article class="task-card">
                        <div>
                            <h4>${task.name}</h4>
                            <p>${task.description}</p>
                            <span>奖励：🪙 ${task.reward} 金币</span>
                        </div>
                        <button
                            class="task-claim"
                            data-task="${task.id}"
                            ${!task.condition || claimed ? "disabled" : ""}
                        >
                            ${claimed ? "已领取" : task.condition ? "领取奖励" : "未完成"}
                        </button>
                    </article>
                `;
            }).join("")}
        </div>

        <h3 class="management-title">📊 经营概况</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <span>📮 完成信件</span>
                <strong>${gameState.completedLetters}</strong>
            </div>
            <div class="stat-card">
                <span>🪙 当前金币</span>
                <strong>${gameState.gold}</strong>
            </div>
            <div class="stat-card">
                <span>🌿 当前声望</span>
                <strong>${gameState.reputation}</strong>
            </div>
            <div class="stat-card">
                <span>♡ 满意度</span>
                <strong>${gameState.satisfaction}%</strong>
            </div>
            <div class="stat-card">
                <span>🗺 探索地点</span>
                <strong>${gameState.visitedPlaces.length}</strong>
            </div>
            <div class="stat-card">
                <span>💰 累计收入</span>
                <strong>${gameState.totalIncome || 0}</strong>
            </div>
        </div>

        <div class="log-section">
            <h3>📖 旅程记录</h3>
            ${
                gameState.logs.length
                    ? gameState.logs.map(log => `
                        <div class="log-item">
                            <span>第 ${log.day} 天 · ${log.time}</span>
                            <p>${log.message}</p>
                        </div>
                    `).join("")
                    : "<p>你的故事才刚刚开始。</p>"
            }
        </div>
    `;

    panel.querySelectorAll("[data-upgrade]").forEach(button => {
        button.onclick = () => upgradeFacility(button.dataset.upgrade);
    });

    panel.querySelectorAll("[data-task]").forEach(button => {
        button.onclick = () => claimTask(button.dataset.task);
    });
}

/* ========== 设施升级 ========== */

function upgradeFacility(id) {
    if (!gameState.facilities) {
        gameState.facilities = {
            counter: 1,
            mailbox: 1,
            lounge: 1
        };
    }

    const costs = {
        counter: 50,
        mailbox: 60,
        lounge: 70
    };

    if (!costs[id]) return;

    const level = gameState.facilities[id];

    if (level >= 5) {
        alert("这项设施已经达到最高等级。");
        return;
    }

    const cost = costs[id] * level;

    if (gameState.gold < cost) {
        alert(`金币不足，需要 ${cost} 金币。`);
        return;
    }

    gameState.gold -= cost;
    gameState.facilities[id] += 1;

    const names = {
        counter: "信件柜台",
        mailbox: "复古邮筒",
        lounge: "休息区"
    };

    addLog(`${names[id]}升级到了 Lv.${gameState.facilities[id]}。`);

    saveGame();
    updateStatus();
    renderDashboard();
}

/* ========== 任务奖励 ========== */

function claimTask(id) {
    if (!gameState.claimedTasks) {
        gameState.claimedTasks = [];
    }

    if (gameState.claimedTasks.includes(id)) return;

    const taskRewards = {
        "task-letter": {
            condition: gameState.completedLetters >= 1,
            reward: 30,
            name: "认真送达"
        },
        "task-explore": {
            condition: gameState.visitedPlaces.length >= 3,
            reward: 25,
            name: "镇上的新朋友"
        },
        "task-story": {
            condition: gameState.completedLetters >= 3,
            reward: 60,
            name: "故事收藏家"
        }
    };

    const task = taskRewards[id];

    if (!task || !task.condition) return;

    gameState.gold += task.reward;
    gameState.totalIncome = (gameState.totalIncome || 0) + task.reward;
    gameState.claimedTasks.push(id);

    addLog(`完成经营任务：${task.name}，获得 ${task.reward} 金币。`);

    saveGame();
    updateStatus();
    renderDashboard();

    alert(`任务完成！获得 ${task.reward} 金币。`);
}
/* ========== 每日经营 ========== */

function endDay() {
    if (!confirm("结束今天的邮局工作，进入新的一天吗？")) return;

    gameState.day += 1;

    if (gameState.satisfaction < 50) {
        gameState.satisfaction = Math.min(100, gameState.satisfaction + 5);
    }

    addLog(`第 ${gameState.day - 1} 天结束。新的一天开始了。`);
    saveGame();
    renderOffice();
    updateStatus();
}

/* ========== 初始化 ========== */

document.getElementById("new-game-btn").addEventListener(
    "click",
    startNewGame
);

document.getElementById("continue-game-btn").addEventListener(
    "click",
    continueGame
);

document.getElementById("settings-btn").addEventListener(
    "click",
    openSettings
);

document.querySelectorAll(".game-sidebar button").forEach(button => {
    button.addEventListener("click", () => {
        showGamePage(button.dataset.page);
    });
});

const hasSave = loadGame() && gameState.hasStarted;
document.getElementById("continue-game-btn").disabled = !hasSave;

if (hasSave) {
    document.getElementById("continue-game-btn").title = "继续上次的旅程";
}
