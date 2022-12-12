const fs = require('fs');
const oicq = require('oicq');
const xlsx = require('node-xlsx');
const util = require("./util.cjs");

let players = {};

const onMessage = async (client, event) => {
    let m = event.message[0].text.split(' ');
    if (m[0] == '/bind') {
        if (m.length == 1) return sendMessage(client, event.group_id, '缺少玩家游戏id参数');
        if (!/^[A-Za-z0-9_]{1,20}$/.test(m[1])) return sendMessage(client, event.group_id, '不合法的游戏id！');
        const a = await util.downloadAssets(`https://api.mojang.com/users/profiles/minecraft/${m[1]}`);
        if (a.id == null)
            return sendMessage(client, event.group_id, '玩家未找到！');
        let old = Object.keys(players).find(x => players[x].id.toLowerCase() == m[1].toLowerCase());
        if (old != null) {
            if (old == event.sender.user_id)
                return sendMessage(client, event.group_id, [oicq.segment.at(event.sender.user_id), `新旧id相同`]);
            return sendMessage(client, event.group_id, [oicq.segment.at(event.sender.user_id), `此id已被${old}绑定！`]);
        }
        let p = players[event.sender.user_id]?.id ?? null;
        players[event.sender.user_id] = { id: m[1], time: new Date().toLocaleString() };
        if (p == null)
            sendMessage(client, event.group_id, [oicq.segment.at(event.sender.user_id), `已成功绑定游戏id：${m[1]}`]);
        else
            sendMessage(client, event.group_id, [oicq.segment.at(event.sender.user_id), `已成功换绑游戏id：${m[1]}`]);
        fs.writeFileSync('./config/bind.json', JSON.stringify(players));
    }
    if (m[0] == '/rebind' && event.sender.role != 'member') {
        if (m.length == 1 || new Number(m[1]) == NaN) return sendMessage(client, event.group_id, '缺少用户qq');
        if (m.length == 2) return sendMessage(client, event.group_id, '缺少玩家id');
        if (!/^[A-Za-z0-9_]{1,20}$/.test(m[2])) return sendMessage(client, event.group_id, '不合法的游戏id！');
        const a = await util.downloadAssets(`https://api.mojang.com/users/profiles/minecraft/${m[2]}`);
        if (a.id == null)
            return sendMessage(client, event.group_id, '玩家未找到！');
        players[m[1]] = { id: m[2], time: new Date().toLocaleString() };
        sendMessage(client, event.group_id, `已成功为${m[1]}修改游戏id：${m[2]}`);
        fs.writeFileSync('./config/bind.json', JSON.stringify(players));
    }
}

let time = 0;
const onTick = (client) => {
    time++;
    if (time == 60) {
        time = 0;
        let data = [['编号', '时间', 'QQ', '游戏名']];
        let index = 1;
        Object.keys(players).forEach(i => data.push([index++, players[i].time, i, players[i].id]));
        let buffer = xlsx.build([{ name: 'Sheet1', data: data }]);
        fs.writeFile('./players.xlsx', buffer, (err) => {
            if (err) {
                console.log("Write failed: " + err);
                return;
            }
        });
    }
}

const sendMessage = (client, group_id, text) => {
    client.sendGroupMsg(group_id, text).catch(err => console.log(err));
}

const onLoad = (config, client) => {
    if (fs.existsSync('./config/bind.json'))
        players = JSON.parse(fs.readFileSync('./config/bind.json', 'utf8'));
}

const config = {
    id: 'bind',//必选
    name: '',//必选
    menu: '/bind <你的游戏id> 绑定你的id'//可选，如不定义则没有菜单项
};

module.exports = { config, onMessage, onLoad, onTick };//onLoad可省略