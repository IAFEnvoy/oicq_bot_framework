const fs = require('fs');
const oicq = require('oicq');
const util = require("./util.cjs");

let players = {};//key=id, value=qq
let guild = [];

const onMessage = async (client, event) => {
    if (event.message[0].text == null) return;
    let m = event.message[0].text.split(' ');
    if (m[0] == '/绑定') {
        if (m.length == 1) return sendMessage(client, event.group_id, '缺少玩家游戏id参数');
        if (!/^[A-Za-z0-9_]{1,20}$/.test(m[1])) return sendMessage(client, event.group_id, '不合法的游戏id！');
        const a = await util.downloadAssets(`https://api.mojang.com/users/profiles/minecraft/${m[1]}`);
        if (a.id == null)
            return sendMessage(client, event.group_id, '玩家未找到！');
        let uuid = a.id;
        if (guild.indexOf(uuid) == -1) sendMessage(client, event.group_id, '此玩家不在公会中');
        let old = Object.keys(players).find(x => players[x] == event.sender.user_id);
        if (players[uuid] != null) {
            if (players[uuid] == event.sender.user_id) return sendMessage(client, event.group_id, '新旧id相同');
            else return sendMessage(client, event.group_id, `此id已被${players[uuid]}绑定`);
        }
        if (old != null) {
            sendMessage(client, event.group_id, `已成功换绑id：${m[1]}`);
            delete players[old];
        }
        else
            sendMessage(client, event.group_id, `已成功绑定id：${m[1]}`);
        players[uuid] = event.sender.user_id;
        fs.writeFileSync('./config/bind.json', JSON.stringify(players), 'utf-8');
        return;
    }
    if (m[0] == '/查询' && (event.sender.role != 'member' || event.sender.user_id == 1662544426)) {
        if (m.length == 1) return sendMessage(client, event.group_id, '缺少玩家游戏id参数');
        if (m[1] == '未绑定') {
            let members = await client.pickGroup(event.group_id).getMemberMap();
            let notQQ = [];
            members.forEach((v, k) => {
                if (Object.keys(players).find(x => players[x] == k) == null) notQQ.push(k);
            });
            sendMessage(client, event.group_id, `以下玩家未绑定：\n${notQQ}`);
            return;
        }
        if (m[1] == '不在公会') {
            await downloadGuildMember();
            let notIn = Object.keys(players).reduce((p, c) => {
                if (guild.indexOf(c) == -1) p.push(c);
                return p;
            }, []);
            let notInName = [];
            for (let uuid of notIn) {
                try {
                    const a = await util.downloadAssets(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
                    notInName.push(a.name);
                } catch (err) {
                    console.log(err);
                }
            }
            sendMessage(client, event.group_id, `以下玩家不在公会中：${notInName}`);
            return;
        }
        if (m[1] == '所有') {
            let page = new Number(m[2]);
            if (page.toString() == 'NaN') page = 1;
            let data = Object.keys(players).slice((page - 1) * 10, page * 10);
            if (data.length == 0) return sendMessage(client, event.group_id, '页码超出范围');
            let names = [];
            for (let uuid of data) {
                const a = await util.downloadAssets(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
                names.push({ name: a.name, uuid: uuid, in: guild.indexOf(uuid) != -1 });
            }
            sendMessage(client, event.group_id, `绑定列表(${page}/${Math.floor((Object.keys(players).length - 1) / 10) + 1}页)${names.reduce((p, c) => `${p}\n${c.in ? '' : '*'}${c.name} - ${players[c.uuid]}`, '')}`);
            return;
        }
        if (!/^[A-Za-z0-9_]{1,20}$/.test(m[1])) return sendMessage(client, event.group_id, '不合法的游戏id！');
        const a = await util.downloadAssets(`https://api.mojang.com/users/profiles/minecraft/${m[1]}`);
        if (a.id == null)
            return sendMessage(client, event.group_id, '玩家未找到！');
        let uuid = a.id;
        if (players[uuid] == null)
            return sendMessage(client, event.group_id, '此玩家未绑定');
        return sendMessage(client, event.group_id, `此玩家绑定的qq为：${players[uuid]}`);
    }
    if (m[0] == '/查询qq') {
        if (m.length == 1 && !(event.message[1] != null && event.message[1].type == 'at')) return sendMessage(client, event.group_id, '缺少qq参数');
        let qq = 0;
        if (m.length > 1) qq = m[1];
        else qq = event.message[1].qq;
        if (new Number(qq) == NaN) return sendMessage(client, event.group_id, '不合法的qq号');
        try {
            let uuid = Object.keys(players).find(x => players[x] == qq);
            const a = await util.downloadAssets(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
            let id = a.name;
            if (id == null) return sendMessage(client, event.group_id, `此qq未绑定`);
            sendMessage(client, event.group_id, `此qq绑定的id为：${id}`);
        } catch (err) {
            console.log(err);
        }
        return;
    }
    if (m[0] == '/解绑') {
        if (m.length == 1) {
            try {
                let uuid = Object.keys(players).find(x => players[x] == event.sender.user_id);
                if (uuid == null) return sendMessage(client, event.group_id, `你未绑定id`);
                const a = await util.downloadAssets(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
                let id = a.name;
                sendMessage(client, event.group_id, `已成功解绑：${id}`);
                delete players[uuid];
                fs.writeFileSync('./config/bind.json', JSON.stringify(players), 'utf-8');
                return;
            } catch (err) {
                console.log(err);
            }
        } else if (event.sender.role != 'member' || event.sender.user_id == 1662544426) {
            if (!/^[A-Za-z0-9_]{1,20}$/.test(m[1])) return sendMessage(client, event.group_id, '不合法的游戏id！');
            const a = await util.downloadAssets(`https://api.mojang.com/users/profiles/minecraft/${m[1]}`);
            if (a.id == null)
                return sendMessage(client, event.group_id, '玩家未找到！');
            let uuid = a.id;
            if (players[uuid] == null) return sendMessage(client, event.group_id, `此id未被绑定`);
            sendMessage(client, event.group_id, `已成功解绑：${m[1]}`);
            delete players[uuid];
            return;
        }
    }
    if (m[0] == '/帮助') {
        let s = '/绑定 <IGN> 绑定或者换绑你的IGN\n/解绑 解绑你的IGN\n/查询qq <qq/at> 查询qq绑定的IGN\n';
        s += '管理员指令：\n/查询 <IGN> 查询IGN绑定的qq\n/查询 未绑定 打印群内未绑定人的qq\n/查询 不在公会 打印所有已绑定IGN中不在公会的IGN\n/查询 所有 (<页码>) 查询所有绑定的IGN，十个一页';
        sendMessage(client, event.group_id, s);
    }
}

const downloadGuildMember = async () => {
    guild = [];
    //一会
    const a = await util.downloadAssets(`https://api.hypixel.net/guild?name=HelloChina&key=47243deb-ad0b-45c7-8367-c9320a26f2c4`);
    for (let { uuid } of a.guild.members)
        guild.push(uuid);
    //二会
    const b = await util.downloadAssets(`https://api.hypixel.net/guild?name=HCNLyaa&key=47243deb-ad0b-45c7-8367-c9320a26f2c4`);
    for (let { uuid } of b.guild.members)
        guild.push(uuid);
}

const sendMessage = (client, group_id, text) => {
    client.sendGroupMsg(group_id, text).catch(err => console.log(err));
}

const onLoad = (config, client) => {
    if (fs.existsSync('./config/bind.json'))
        players = JSON.parse(fs.readFileSync('./config/bind.json', 'utf8'));
    downloadGuildMember();
}

const config = {
    id: 'hcnbind',//必选
    name: '绑定插件',//必选
    menu: '/绑定 <你的游戏id> 绑定你的id'//可选，如不定义则没有菜单项
};

module.exports = { config, onMessage, onLoad };//onLoad可省略