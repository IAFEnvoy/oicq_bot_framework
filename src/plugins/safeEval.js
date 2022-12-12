const { spawn } = require('child_process');

const blWords = ['import', 'require', 'stop', 'rm', 'kill']
const safeEval = (cmd) => blWords.find(item => cmd.search(item) != -1) == undefined ? eval(cmd) : '检测到黑名单字符，无法执行';

let error = null;

const onMessage = (client, e) => {
    let message = e.message[0].text;
    let ms = message.split(' ');
    if (ms[0] == 'run' && ms.length >= 2) {
        let text = "";
        try {
            err = null;
            for (var i = 1; i < ms.length; i++) {
                if (i != 1) text += ' ';
                text += ms[i];
            }

            const childProcess = spawn('node', ['-e', text], { timeout: 10 * 1000 });
            let ret = [];
            childProcess.stdout.on('data', (data) => ret.push(data));
            childProcess.stderr.on('data', (data) => ret.push(`ERROR! ${data}`));
            childProcess.on("exit", (code) => {
                ret.push(`进程已结束，返回值为 ${code}`);
                client.sendGroupMsg(e.group_id, ret.join('')).catch(err => console.log(err));
            });
        } catch (err) {
            console.log(err);
            error = err;
            client.sendGroupMsg(e.group_id, `无法执行此代码\n输入“run error”查看错误`);
        }
    }
}

const config = {
    id: 'run',
    name: 'JavaScript简易运行',
    menu: 'run <cmd> 执行一段js代码',
    default_permission: false
};

module.exports = { config, onMessage };