const fs = require('fs');
const util = require("./util.cjs");

let frequencyConfig = {};
let hypixelBl = [];
let lastGetTime = {};

let playerDataJson = {};
let playerUUID = {};

let guildJson = null;
let guildUUID = null;

let apikey = null;

const loadPlayer = async (playername) => {
    if (playerUUID[playername] == null || new Date().getTime() - playerUUID[playername].time > 24 * 60 * 60 * 1000) {
        const a = await util.downloadAssets(`https://api.mojang.com/users/profiles/minecraft/${playername}`);
        playerUUID[playername] = { uuid: a.id, time: new Date().getTime() };
    }
    if (playerUUID[playername].uuid == null)
        return '未找到该玩家，请确认是否拼写有误';
    const b = await util.downloadAssets(`https://api.hypixel.net/player?key=${apikey}&uuid=${playerUUID[playername].uuid}`);
    if (!b.success)
        return b.cause;
    if (b.player == null) return '此玩家从未进入服务器';
    playerDataJson[playerUUID[playername].uuid] = { player: b.player, time: new Date().getTime() };
    return null;
}

const getRank = (api) => {
    let rank = api.packageRank;
    if (rank == null)
        rank = api.newPackageRank;
    let plus = api.rankPlusColor;
    if (plus != undefined)
        plus = util.formatColorFromString(plus);
    else plus = '§c';
    if (api.rank != undefined)
        if (api.rank == 'YOUTUBER') return `§c[§fYT§c]`;
        else if (api.rank == 'ADMIN') return `§4[ADMIN]`;
        else if (api.rank == 'MODERATOR') return `§2[MOD]`;
        else if (api.rank == 'HELPER') return `§9[HELP]`;
    if (rank == 'MVP_PLUS') {
        if (api.monthlyPackageRank == 'NONE' || !api.hasOwnProperty('monthlyPackageRank')) return `§b[MVP${plus}+§b]`;
        else return `§6[MVP${plus}++§6]`;
    } else if (rank == 'MVP') return `§b[MVP]`;
    else if (rank == 'VIP_PLUS') return `§a[VIP§6+§a]`;
    else if (rank == 'VIP') return `§a[VIP]`;
    else return `§7`;
}

const getLocalTag = (uuid) => {
    if (uuid == '40dff9cbb87b473f946b4dc9776949cc' || uuid == 'f1f464287e894024a5554610d635fa55') return '[开发]';
    return '';
}

const getName = (api) => util.formatColor(getLocalTag(api.uuid) + getRank(api) + api.displayname);

const getGuildLevel = (exp) => {
    let guildLevelTables = [100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 2500000, 2500000, 2500000, 2500000, 3000000];
    let level = 0;
    for (let i = 0; ; i++) {
        need = i >= guildLevelTables.length ? guildLevelTables[guildLevelTables.length - 1] : guildLevelTables[i];
        exp -= need;
        level++;
        if (exp < 0) return level + exp / need;
    }
}

const downloadGuildJson = async (apikey, uuid) => {
    const b = await util.downloadAssets(`https://api.hypixel.net/guild?key=${apikey}&player=${uuid}`);
    if (!b.success)
        return b.cause;
    guildJson = b.guild;
}

const loadGuild = async (api, uuid) => {
    await downloadGuildJson(apikey, uuid);
    if (guildJson == null)
        return `${getName(api)}的公会信息\n无公会`;
    let data = `${getName(api)}的公会信息\n公会名：${guildJson.name}
等级：${getGuildLevel(guildJson.exp).toFixed(2)}
玩家数：${guildJson.members.length}\n`
    let playerGuildJson = guildJson.members.find(member => member.uuid == uuid);
    let rankJson = guildJson.ranks.find(rank => rank.name == playerGuildJson.rank);
    if (playerGuildJson == null || rankJson == null) return data;
    return data + `加入时间：${util.formatDateTime(playerGuildJson.joined)}
地位：${playerGuildJson.rank} (${'[' + rankJson.tag + ']'})`;
}

const loadStatus = async (api, uuid) => {
    const b = await util.downloadAssets(`https://api.hypixel.net/status?key=${apikey}&uuid=${uuid}`);
    if (!b.success)
        return document.getElementById('status').innerHTML = b.cause;
    statusJson = b.session;
    if (statusJson.online)
        if (statusJson.map != null)
            return `${getName(api)}的当前在线状态\n状态：在线\n游戏类型：${util.formatNameString(statusJson.gameType)}\n模式：${util.formatNameString(statusJson.mode)}\n地图：${statusJson.map}`;
        else
            return `${getName(api)}的当前在线状态\n状态：在线\n游戏类型 ：${util.formatNameString(statusJson.gameType)}\n模式：${util.formatNameString(statusJson.mode)}`;
    else
        return `${getName(api)}的当前在线状态\n状态：离线`;
}

// 在等级 10 * k 至 10 * (k + 1) 时, 升一级所需经验
const expReqPhased = [15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500];
// 在精通 k 时, 升一级所需经验需要乘以的倍数
const presMultipl = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 45, 50, 75, 100, 101, 101, 101, 101, 101];
const getThePitLevel = (pitProfile) => {
    level = 0;
    let xp = pitProfile.xp ?? 0;
    for (let i = 0; i < presMultipl.length; i++)
        for (let j = 0; j < expReqPhased.length; j++)
            for (let k = 0; k < 10; k++) {
                if (xp < expReqPhased[j] * presMultipl[i]) return level % 120;
                xp -= expReqPhased[j] * presMultipl[i];
                level++;
            }
}

const modeList = ['ov', 'g', 'now', 'bw', 'sw', 'mm', 'duel', 'uhc', 'mw', 'bb', 'pit', 'bsg'];

const getData = {
    "ov": (api) => {
        achievements = api.achievements ?? {};
        return `${getName(api)}的Hypixel信息：
等级：${(api.networkExp ?? 0) < 0 ? 1 : (1 - 3.5 + Math.sqrt(12.25 + 0.0008 * (api.networkExp ?? 0))).toFixed(2)} | 人品：${api.karma ?? 0}
成就点数：${api.achievementPoints ?? 0}
完成任务：${achievements.general_quest_master ?? 0} | 完成挑战：${achievements.general_challenger ?? 0}
语言：${util.formatNameString(api.userLanguage ?? 'ENGLISH')} | Rank赠送：${api?.giftingMeta?.ranksGiven ?? 0}
首次登入：${util.formatDateTime(api.firstLogin)}
上次登入：${util.formatDateTime(api.lastLogin)}
上次登出：${util.formatDateTime(api.lastLogout)}`;
    },
    "bw": (api) => {
        achievements = api.achievements ?? {};
        bedwar = api.stats?.Bedwars ?? {};
        return `${getName(api)}的Hypixel起床战争统计信息：
等级：${achievements.bedwars_level ?? 0} | 硬币：${bedwar.coins ?? 0}
连胜：${bedwar.winstreak ?? 0}
破坏床数：${bedwar.beds_broken_bedwars ?? 0} | 被破坏床数：${bedwar.beds_lost_bedwars ?? 0}
胜场：${bedwar.wins_bedwars ?? 0} | 败场：${bedwar.losses_bedwars ?? 0} | W/L：${((bedwar.wins_bedwars ?? 0) / (bedwar.losses_bedwars ?? 0)).toFixed(2)}
击杀：${bedwar.kills_bedwars ?? 0} | 死亡：${bedwar.deaths_bedwars ?? 0} | K/D：${((bedwar.kills_bedwars ?? 0) / (bedwar.deaths_bedwars ?? 0)).toFixed(2)}
最终击杀：${bedwar.final_kills_bedwars ?? 0} | 最终死亡：${bedwar.final_deaths_bedwars ?? 0} | FKDR：${((bedwar.final_kills_bedwars ?? 0) / (bedwar.final_deaths_bedwars ?? 0)).toFixed(2)}
铁锭收集：${bedwar.iron_resources_collected_bedwars ?? 0} | 金锭收集：${bedwar.gold_resources_collected_bedwars ?? 0}
钻石收集：${bedwar.diamond_resources_collected_bedwars ?? 0} | 绿宝石收集：${bedwar.emerald_resources_collected_bedwars ?? 0}
INDEX：${(achievements.bedwars_level ?? 0) * Math.pow((bedwar.final_kills_bedwars ?? 0) / (bedwar.final_deaths_bedwars ?? 0), 2)} (Star*FKDR^2)`;
    },
    "sw": (api) => {
        skywar = api.stats?.SkyWars ?? {};
        return `${getName(api)}的Hypixel空岛战争统计信息：
等级：${util.formatColor(skywar.levelFormatted)} | 灵魂：${skywar.souls ?? 0}
硬币：${skywar.coins ?? 0} | 助攻：${skywar.assists ?? 0}
击杀：${skywar.kills ?? 0} | 死亡：${skywar.deaths ?? 0} | K/D：${((skywar.kills ?? 0) / (skywar.deaths ?? 0)).toFixed(2)}
胜场：${skywar.wins ?? 0} | 败场：${skywar.losses ?? 0} | W/L：${((skywar.wins ?? 0) / (skywar.losses ?? 0)).toFixed(2)}`;
    },
    "mm": (api) => {
        mm = api.stats?.MurderMystery ?? {};
        return `${getName(api)}的Hypixel密室杀手统计信息：
硬币：${mm.coins ?? 0} | 金锭收集：${mm.coins_pickedup ?? 0}
杀手概率：${mm.murderer_chance ?? 0}% | 侦探概率：${mm.detective_chance ?? 0}%
胜场：${mm.wins ?? 0} | 胜率：${(100 * (mm.wins ?? 0) / (mm.games ?? 0)).toFixed(2)}%
击杀：${mm.kills ?? 0} | 死亡：${mm.deaths ?? 0}
飞刀击杀：${mm.knife_kills ?? 0} | 弓箭击杀：${mm.bow_kills ?? 0}
作为杀手击杀：${mm.kills_as_murderer ?? 0} | 英雄：${mm.was_hero ?? 0}
作为感染者击杀：${mm.kills_as_infected ?? 0} | 作为幸存者击杀：${mm.kills_as_survivor ?? 0}
最长存活时间：${mm.longest_time_as_survivor_seconds ?? 0}s | 母体概率：${mm.alpha_chance ?? 0}%`
    },
    "duel": (api) => {
        duel = api.stats?.Duels ?? {};
        return `${getName(api)}的Hypixel决斗游戏统计信息：
硬币：${duel.coins ?? 0} | Ping偏好：${duel.pingPreference ?? 0}ms
胜场：${duel.wins ?? 0} | 败场：${duel.losses} | W/L：${((duel.wins ?? 0) / (duel.losses ?? 0)).toFixed(2)}
最佳连胜：${duel.best_all_modes_winstreak ?? '?'} | 目前连胜：${duel.current_winstreak ?? '?'}
击杀：${duel.kills ?? 0} | 死亡：${duel.deaths ?? 0} | K/D：${((duel.kills ?? 0) / (duel.deaths ?? 0)).toFixed(2)}`
    },
    "uhc": (api) => {
        uhc = api.stats?.UHC ?? {};
        return `${getName(api)}的Hypixel极限生存冠军统计信息：
分数：${uhc.score ?? 0} | 硬币：${uhc.coins ?? 0} | 胜场：${uhc.wins ?? 0}
击杀：${uhc.kills ?? 0} | 死亡：${uhc.deaths ?? 0} | K/D：${((uhc.kills ?? 0) / (uhc.deaths ?? 0)).toFixed(2)}`
    },
    "mw": (api) => {
        mw = api.stats?.Walls3 ?? {};
        return `${getName(api)}的Hypixel超级战墙统计信息：
硬币：${mw.coins ?? 0} | 凋零伤害${mw.wither_damage ?? 0}
职业：${util.formatNameString(mw.chosen_class ?? 'None')}
胜场：${mw.wins ?? 0} | 败场：${mw.losses ?? 0} | W/L：${((mw.wins ?? 0) / (mw.losses ?? 0)).toFixed(2)}
击杀：${mw.kills ?? 0} | 死亡：${mw.deaths ?? 0}
K/D：${((mw.kills ?? 0) / (mw.deaths ?? 0)).toFixed(2)} | 助攻：${mw.assists ?? 0}
最终击杀：${mw.final_kills ?? 0} | 最终死亡：${mw.final_deaths ?? 0}
FKDR：${((mw.final_kills ?? 0) / (mw.final_deaths ?? 0)).toFixed(2)} | 最终助攻：${mw.final_assists ?? 0}`
    },
    "bb": (api) => {
        bb = api.stats?.BuildBattle ?? {};
        return `${getName(api)}的Hypixel建筑大师统计信息：
游玩次数：${bb.games_played ?? 0} | 分数：${bb.score ?? 0} | 胜场：${bb.wins ?? 0}
单人模式胜场：${(bb.wins_solo_normal ?? 0) + (bb.wins_solo_normal_latest ?? 0)} | 团队模式胜场：${bb.wins_teams_normal ?? 0}
高手模式胜场：${bb.wins_solo_pro ?? 0} | 建筑猜猜乐胜场：${bb.wins_guess_the_build ?? 0}`
    },
    "pit": (api) => {
        profile = api.stats?.Pit?.profile ?? {};
        pit_stats_ptl = api.stats?.Pit?.pit_stats_ptl ?? {};
        return `${getName(api)}的Hypixel天坑乱斗统计信息：
等级：${getThePitLevel(profile) ?? 0} | 精通：${profile.prestiges ?? ['None']}
击杀：${pit_stats_ptl.kills ?? 0} | 死亡：${pit_stats_ptl.deaths ?? 0}
助攻：${pit_stats_ptl.assists ?? 0} | 最大连续击杀：${pit_stats_ptl.max_streak ?? 0}
K/D：${((pit_stats_ptl.kills ?? 0) / (pit_stats_ptl.deaths ?? 0)).toFixed(2)} | 
K+A/D：${(((pit_stats_ptl.kills ?? 0) + (pit_stats_ptl.assists ?? 0)) / (pit_stats_ptl.deaths ?? 0)).toFixed(2)}`
    },
    "bsg": (api) => {
        bsg = api.stats?.Blitz ?? {};
        return `${getName(api)}的Hypixel闪电饥饿游戏统计信息：
硬币：${bsg.coins ?? 0} | 打开箱子数：${bsg.chests_opened ?? 0}
游玩次数：${bsg.games_played ?? 0} | 胜场：${bsg.wins ?? 0}
击杀：${bsg.kills ?? 0} | 死亡：${bsg.deaths ?? 0} | K/D：${((bsg.kills ?? 0) / (bsg.deaths ?? 0)).toFixed(2)}`
    }
};

const onMessage = async (client, e) => {
    let message = e.message[0].text;
    let ms = message.split(' ');
    if ((ms[0] == '/hyp' || modeList.indexOf(ms[0].substring(1)) != -1 && ms[0].startsWith('/')) && ms.length >= 2) {
        let now = new Date().getTime();//查询冷却逻辑
        if (lastGetTime[e.group_id] != null) {
            let last = lastGetTime[e.group_id];
            let delta = frequencyConfig[e.group_id];
            if (now - last < delta * 1000) return;
        }
        lastGetTime[e.group_id] = now;

        //判断是否是合法id
        if (!/^[A-Za-z0-9_]{1,20}$/.test(ms[1]))
            return client.sendGroupMsg(e.group_id, `不合法的id`).catch(err => console.log(err));

        let player = ms[1];
        let cat = '';
        if (ms.length == 2)
            cat = ms[0].substring(1);
        else
            cat = ms[2];
        if (cat == 'hyp') cat = 'ov';
        try {
            if (playerDataJson[player] == null || playerDataJson[player].player == null || new Date().getTime() - playerDataJson[player].time > 60 * 1000) {
                let error = await loadPlayer(player);
                if (error != null)
                    return client.sendGroupMsg(e.group_id, error);
            }
            let text = '';
            if (cat == 'now')
                text += await loadStatus(playerDataJson[playerUUID[player].uuid].player, playerUUID[player].uuid);
            else if (cat == 'g')
                text += await loadGuild(playerDataJson[playerUUID[player].uuid].player, playerUUID[player].uuid);
            else
                text += getData[cat](playerDataJson[playerUUID[player].uuid].player);
            text += '\n桌面版下载：https://www.iafenvoy.net/dl/StarburstOverlay（附带实时查询）'
            client.sendGroupMsg(e.group_id, text);
        } catch (err) {
            console.log(err);
            if (err.message.indexOf('is not a function') != -1)
                client.sendGroupMsg(e.group_id, `未知的分类，当前支持的分类：${modeList}`)
            else
                client.sendGroupMsg(e.group_id, '网络错误，请稍后再试');
        }
    }
    if ((ms[0] == '/hyp' || modeList.indexOf(ms[0].substring(1)) != -1) && ms.length == 1) {
        client.sendGroupMsg(e.group_id, `当前支持的分类：${modeList}\n使用/hyp xxx bw或者/bw xxx都可以\n查询特殊id或者YT会被拉黑`);
    }
    if (ms[0] == '/hypfrequency' && ms.length >= 2) {
        if (e.sender.role == 'member' && e.sender.user_id != 1662544426) return;
        let delta = ms[1];
        if (delta == 0) {
            delete frequencyConfig[e.group_id];
            client.sendGroupMsg(e.group_id, '已移除本群查询限制');
        }
        else if (delta > 0) {
            frequencyConfig[e.group_id] = delta;
            client.sendGroupMsg(e.group_id, '已设置本群查询限制为' + delta + 's，如果需要大量查询请使用客户端！');
        }
        else
            client.sendGroupMsg(e.group_id, '不合法的时间间隔！');
        saveFrequencyConfig();
    }
}

const loadFrequencyConfig = () => {
    if (fs.existsSync('./config/hypixelFrequency.json'))
        frequencyConfig = JSON.parse(fs.readFileSync('./config/hypixelFrequency.json', 'utf8'));
}

const saveFrequencyConfig = () => {
    fs.writeFileSync('./config/hypixelFrequency.json', JSON.stringify(frequencyConfig));
}

const onLoad = (c, client) => {
    if (c.hypixelApiKey == null)
        throw new ReferenceError('未在main.json中找到hypixelApiKey键值');
    apikey = c.hypixelApiKey;
    loadFrequencyConfig();
}

const config = {
    id: 'hypixel',
    name: 'Hypixel数据查询',
    menu: '/hyp <playername> (<type>) Hypixel数据查询',
    default_permission: false
};

module.exports = { config, onMessage, onLoad };