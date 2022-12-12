const fs = require('fs');
const oicq = require('oicq');

let memeList = [];
let cooldown = {};

const onMessage = (client, event) => {
    if (event.message[0].text == '来张梗图') {
        let date = new Date().getTime();
        if (date - (cooldown[event.group_id] ?? 0) < 20 * 1000) return client.sendGroupMsg(event.group_id, `技能冷却中(～￣▽￣)～[${20 - Math.round((date - cooldown[event.group_id] ?? 0) / 1000)}s]`);
        cooldown[event.group_id] = date;
        let s = memeList[Math.floor(Math.random() * memeList.length)];
        console.log(s);
        client.sendGroupMsg(event.group_id, oicq.segment.image('./src/img/meme/' + s)).catch(err => console.log(err));
    }
}

const onLoad = (config, client) => {
    memeList = [];
    fs.readdir('./src/img/meme', (err, files) => {
        if (err)
            return console.log(err);
        memeList = files;
    });
}

const config = {
    id: 'meme',//必选
    name: '梗图',//必选
    menu: '来张梗图 发送一张图'
};

module.exports = { config, onMessage, onLoad };