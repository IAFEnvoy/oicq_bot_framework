const serverInfo = require('mc-server-status');

const onMessage = async (client, event) => {
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
}

const config = {
    id: 'minecraft',//必选
    name: 'MC工具箱',//必选
    menu: '/mcping <ip> 查服'
};

module.exports = { config, onMessage };