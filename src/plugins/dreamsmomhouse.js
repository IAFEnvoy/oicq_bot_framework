const util = require("./util.cjs")

let houseData = [];

const onMessage = (client, e) => {
    let message = e.message[0].text;
    let ms = message.split(' ');
    if (ms[0] == '/house' && ms.length >= 2) {
        let room = houseData.find(obj => obj.location == ms[1]);
        let force = ms[2] == '-f';
        if (room == null || (room.del != null && !force))
            client.sendGroupMsg(e.group_id, '未查询到指定群');
        else
            client.sendGroupMsg(e.group_id, `群名：${room.name}\n群号：${room.stats}\n所在层：${room.floor}\n状态：${room.allow}`);
    }
}

const onLoad = async (config, client) => {
    houseData = [];
    const json = await util.downloadAssets(config.house_path);
    for (let i = 0; i < json.length; i++) {
        let data = json[i].data;
        for (let j = 0; j < data.length; j++)
            houseData.push({
                name: data[j].name,
                stats: data[j].stats,
                floor: json[i].floor_name + ' ' + json[i].floor_util,
                location: data[j].location,
                allow: data[j].allow,
                del: data[j].del
            });
    }
}

const config = {
    id: 'dmh',
    name: '梦妈の快乐小屋',
    menu: '/house <id> 查小屋里的群'
};

module.exports = { config, onMessage, onLoad };