let startTime;

const calDate = (faultDate, completeTime) => {
    var stime = Date.parse(new Date(faultDate));
    var etime = Date.parse(new Date(completeTime));
    var usedTime = etime - stime;
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
    var leave1 = usedTime % (24 * 3600 * 1000);
    var hours = Math.floor(leave1 / (3600 * 1000));
    var leave2 = leave1 % (3600 * 1000);
    var minutes = Math.floor(leave2 / (60 * 1000));
    var time = days + "天" + hours + "时" + minutes + "分";
    return time;
}

const execute = (message, client, e) => {
    if (message == '/stats') {
        let now = new Date();
        client.sendGroupMsg(e.group_id, `运行时间：${calDate(startTime, now)}`);
    }
}

const init = (config) => startTime = new Date();

const config = {
    id: 'core',
    name: '核心插件',
    default_permission: true
};

module.exports = { config, execute, init };