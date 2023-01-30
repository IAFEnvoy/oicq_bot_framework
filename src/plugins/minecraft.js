const serverInfo = require('mc-server-status');
const oicq = require('oicq');
const fs=require("fs");

const onMessage = async (client, event) => {
    if(hypixelBl.indexOf(event.sender.user_id)!=-1||hypixelBl2.indexOf(event.sender.user_id)!=-1) return;
    let message = event.message[0].text;
    let ms = message.split(' ');
    if (ms[0] == '/mcping' && ms.length == 2) {
        try {
            let res = await serverInfo.getStatus(ms[1].split(":")[0], ms[1].split(':')[1]);
            if (res == null) return client.sendGroupMsg(event.group_id, '查询超时！').catch(err => console.log(err));
            let s = `服务器地址：${ms[1]}\n`;
            s += `描述：${res.description.extra == null ? res.description : res.description.extra.reduce((p, c) => p + c.text, '')}\n`;
            s += `版本：${res.version.name}\n`;
            s += `延迟：${res.ping}ms\n`;
            s += `玩家数量：${res.players.online}/${res.players.max}`;
            client.sendGroupMsg(event.group_id, s).catch(err => console.log(err));
        } catch (err) {
            return client.sendGroupMsg(event.group_id, '查询超时！').catch(err => console.log(err));
        }
    }
    if (ms[0] == '/mcskin' && ms.length == 2) {
        try {
            let name = ms[1];
            let a = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`)
                .catch(err => { throw err })
                .then(res => res.json());
            let uuid = a.id;
            client.sendGroupMsg(event.group_id, oicq.segment.image(`https://crafatar.com/renders/body/${uuid}?overlay`)).catch(err => console.log(err));
        } catch (err) {
            event.reply('未找到此玩家，请确认是否拼写错误');
        }
    }
    if (ms[0] == '/mchead' && ms.length == 2) {
        try {
            let name = ms[1];
            let a = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`)
                .catch(err => { throw err })
                .then(res => res.json());
            let uuid = a.id;
            client.sendGroupMsg(event.group_id, oicq.segment.image(`https://crafatar.com/renders/head/${uuid}?overlay`)).catch(err => console.log(err));
        } catch (err) {
            event.reply('未找到此玩家，请确认是否拼写错误');
        }
    }
    if (ms[0] == '/mcavatar' && ms.length == 2) {
        try {
            let name = ms[1];
            let a = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`)
                .catch(err => { throw err })
                .then(res => res.json());
            let uuid = a.id;
            client.sendGroupMsg(event.group_id, oicq.segment.image(`https://crafatar.com/avatars/${uuid}?overlay`)).catch(err => console.log(err));
        } catch (err) {
            event.reply('未找到此玩家，请确认是否拼写错误');
        }
    }
}

let hypixelBl,hypixelBl2;

const loadBlConfig = () => {
  if (fs.existsSync('./config/hypixelBl.json'))
    hypixelBl = JSON.parse(fs.readFileSync('./config/hypixelBl.json', 'utf8'));
  if (fs.existsSync('./config/hypixelBl2.json'))
    hypixelBl2 = JSON.parse(fs.readFileSync('./config/hypixelBl2.json', 'utf8'));
}

const onLoad=()=>loadBlConfig();

const config = {
    id: 'minecraft',//必选
    name: 'MC工具箱',//必选
    menu: '/mcping <ip> 查服'
};

module.exports = { config, onMessage,onLoad };