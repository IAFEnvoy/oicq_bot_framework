const oicq = require('oicq');
const mcServerInfo = require('mc-server-status');

const onMessage = (client, e) => {
    let message = e.message[0].text;
    if (message == '牛腩萝莉是谁') {
        client.sendGroupMsg(e.group_id, oicq.segment.image('./src/img/萝莉.jpg'));
    }
    if (message == '牛腩五大萝莉是谁') {
        client.sendGroupMsg(e.group_id, oicq.segment.image('./src/img/五大萝莉.jpg'));
    }
    if (message == '牛腩九大萝莉是谁') {
        client.sendGroupMsg(e.group_id, oicq.segment.image('./src/img/九大萝莉.jpg'));
    }
    if (message == '牛腩御姐是谁') {
        client.sendGroupMsg(e.group_id, 'Minecraft_Player');
    }
    if (message == '牛腩地铁怎么坐' || message == '牛腩城际怎么坐' || message == '牛腩轨交怎么坐' || message == '牛腩轨道交通怎么坐') {
        client.sendGroupMsg(e.group_id, oicq.segment.image('./src/img/轨交.png'));
    }
    if (message == '迫害马星') {
        let r = Math.floor(Math.random() * 4);
        client.sendGroupMsg(e.group_id, oicq.segment.image(`./src/img/马星/${r + 1}.jpg`));
    }
    if (message == '汤哈哈是谁') {
        client.sendGroupMsg(e.group_id, '涩涩蛋');
    }
    if (message == '问卷答完之后怎么做') {
        client.sendGroupMsg(e.group_id, '找任意管理，将100分截图给他');
    }
    if (message.indexOf('冰火服') != -1) {
        getServerStatus(client, e.group_id);
    } if (message == '/dice')
        client.sendGroupMsg(e.group_id, oicq.segment.dice(6))
    if (message == '来张色图' || message == '来张黄图')
        e.reply('爪巴', true);
}

const getServerStatus = async (client, group_id) => {
    try {
        let status = await mcServerInfo.getStatus('minecraft.newnan.city').catch(err => console.log(err));
        if (status == null) return client.sendGroupMsg(group_id, '呜呜，查询超时！是网络太差还是主服关闭了？').catch(err => console.log(err));
        let s = '[牛腩主服]\n';
        s += `版本：${status.version?.name ?? '未知'}\n`;
        s += `延迟：${status.ping}ms\n`;
        s += `在线玩家：[${status.players?.online ?? '?'}/${status.players?.max ?? '?'}]\n`;
        s += (status.players?.sample?.map(player => `- ${player.name}`) ?? []).join('\n');
        if (status.players.sample != null && status.players.sample.length < status.players.online) s += '\n  等玩家';
        client.sendGroupMsg(group_id, s).catch(err => console.log(err));
    } catch (err) {
        console.log(err);
        client.sendGroupMsg(group_id, '呜呜，查询超时！是网络太差还是主服关闭了？').catch(err => console.log(err));
    }
}

const config = {
    id: 'newnanchat',
    name: '牛腩专用自动回复',
    default_permission: false
};

module.exports = { config, onMessage };