const util = require("./util.cjs");
const oicq = require("oicq");

let live_status = [];

class BilibiliLiveObject {
    constructor(room_id, target_group_id, up_nick_name) {
        this.room_id = room_id;
        this.target_group_id = target_group_id;
        this.up_nick_name = up_nick_name;
        this.live_status = 0;
        this.loadLiveStatus();
    }
    async loadLiveStatus() {
        let json=await this.getJson();
        this.live_status = json.data.room_info.live_status;
    }
    async getJson() {
        return await util.downloadAssets(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${this.room_id}`);
    }
    async tick(client) {
        try{
            let json = await this.getJson();
            let status = json.data.room_info.live_status;
            if (this.live_status == 0 && status == 1) //说明开播
                this.target_group_id.forEach(id => client.sendGroupMsg(id, [oicq.segment.at('all'), `${this.up_nick_name}开播啦！\n${json.data.room_info.title}\n`, oicq.segment.image(json.data.room_info.cover), `\nhttps://live.bilibili.com/${this.room_id}`]).catch(reason => { console.log(reason) }));
            if (this.live_status == 1 && status == 0) //说明下播
                this.target_group_id.forEach(id => client.sendGroupMsg(id, `${this.up_nick_name}下播了`).catch(reason => { console.log(reason) }));
            this.live_status = status;
        }catch(e){
            console.log(e);
        }
    }
}

let time = 0;

const onTick = (client) => {
    time++;
    if (time == 30) {
        time = 0;
        live_status.forEach(o => o.tick(client));
        console.log(live_status.reduce((p, c) => `${p} ${c.room_id}(${c.up_nick_name}):${c.live_status}`, ''));
    }
}

const onLoad = (config, client) => {
    live_status.push(new BilibiliLiveObject(22955787, [948946493, 698256895], '梦妈'));
    live_status.push(new BilibiliLiveObject(4721253, [895775308], 'KZ'));
    live_status.push(new BilibiliLiveObject(7943407, [895775308], 'hb'));
}

const config = {
    id: 'blive',
    name: 'b站直播辅助插件'
};

module.exports = { config, onLoad, onTick };