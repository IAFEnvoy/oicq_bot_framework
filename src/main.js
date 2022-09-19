const oicq = require('oicq');
const pluginloader = require('./pluginLoader.js');
const config = require('./config');
const readline = require('readline');

//初始化
config.load();
const c = config.getConfig();
let pluginManager = new pluginloader.BotPluginManager();
pluginManager.load(c);
let startTime = new Date();
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

const qq = c.qq;
const client = oicq.createClient(qq);
let ops = c.ops;
let about = `冰火的VSCode
Powered by OICQ Bot FrameWork
Code by IAFEnvoy`;

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// process.exit(0);

client.on("system.login.slider", function (e) {
    console.log("输入ticket：")
    process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
});

client.on('system.login.device', async (e) => {
    console.log('收到设备锁，已发送验证码到绑定的手机号');
    client.sendSmsCode();
    rl.question('请输入验证码：', (input) => {
        client.submitSmsCode(input);
        rl.close();
    });
});

client.on("system.login.qrcode", function (e) {
    //扫码后按回车登录
    process.stdin.once("data", () => {
      this.login()
    })
  });

client.on('message.group', async (e) => {
    let message = e.message[0].text;
    if (message == null) return;

    try {
        if (ops.find(op => op == e.sender.user_id) != undefined)
            pluginManager.runManagerEvent(client, e, c);

        if (message == '菜单')
            client.sendGroupMsg(e.group_id, pluginManager.getMenu(e.group_id));
        if (message == '/stats') {
            let now = new Date();
            client.sendGroupMsg(e.group_id, `运行时间：${calDate(startTime, now)}`);
        }
        if (message == '/about')
            client.sendGroupMsg(e.group_id, about);

        pluginManager.call(client, e);
    } catch (err) {
        console.log(err);
    }
});

client.on('notice.group.increase', (e) => {
    // if (e.user_id != qq)
    //     client.sendGroupMsg(e.group_id, '是新人酱欸');
});

//使用MD5登录
client.login(c.passwd);