const serverInfo = require('mc-server-status');

const onMessage = async (client, event) => {
    let message = event.message[0].text;
    if (message == '/list') {
        try {
            let survival = await serverInfo.getStatus('xplus.plus', 17565);
            let creative = await serverInfo.getStatus('temp.cherry.social');
            if (survival == null) return client.sendGroupMsg(event.group_id, '查询超时！').catch(err => console.log(err));
            let s = '';
            if (survival != null) {
                s += `生存服当前在线：`;
                s += (survival.players?.sample?.map(player => player.name) ?? []).join(',');
                if (survival.players.sample != null && survival.players.sample.length < survival.players.online) s += '等玩家';
            } else
                s += '生存服查询超时';
            s += '\n';
            if (creative != null) {
                s += `创造服当前在线：`;
                s += (creative.players?.sample?.map(player => player.name) ?? []).join(',');
                if (creative.players.sample != null && creative.players.sample.length < creative.players.online) s += '等玩家';
            } else
                s += '创造服查询超时';
            client.sendGroupMsg(event.group_id, s).catch(err => console.log(err));
        } catch (err) {
            console.log(err);
            return client.sendGroupMsg(event.group_id, '查询超时！').catch(err => console.log(err));
        }
    }
}

const config = {
    id: 'cherry',//必选
    name: 'Cherry Server插件',//必选
    menu: '/list 查询服务器状态'
};

module.exports = { config, onMessage };