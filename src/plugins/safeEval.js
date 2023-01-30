const { spawn } = require('child_process');
const fs = require('fs');

const onMessage = (client, e) => {
    let message = e.message[0].text;
    let ms = message.split(' ');
    if (ms[0] == '/js' && ms.length >= 2) {
        let text = "";
        try {
            err = null;
            for (var i = 1; i < ms.length; i++) {
                if (i != 1) text += ' ';
                text += ms[i];
            }

            let ret = [];
            const childProcess = spawn('node', ['-e', text]);
            childProcess.stdout.on('data', (data) => ret.push(data));
            childProcess.stderr.on('data', (data) => ret.push(`ERROR! ${data}`));
            childProcess.on("exit", (code) => {
                ret.push(`进程已结束，返回值为 ${code}`);
                client.sendGroupMsg(e.group_id, ret.join('')).catch(err => console.log(err));
            });
            setTimeout(() => {
                if (childProcess.exitCode == null) {
                    childProcess.kill();
                    client.sendGroupMsg(e.group_id, '错误：运行超时').catch(err => console.log(err));
                }
            }, 1000);
        } catch (err) {
            console.log(err);
        }
    }
    if (ms[0] == '/py' && ms.length >= 2) {
        let text = "";
        try {
            err = null;
            for (var i = 1; i < ms.length; i++) {
                if (i != 1) text += ' ';
                text += ms[i];
            }

            let ret = [];
            fs.writeFileSync('./temp/temp.py', text);
            const childProcess = spawn('python3', ['temp/temp.py']);
            childProcess.stdout.on('data', (data) => ret.push(data));
            childProcess.stderr.on('data', (data) => ret.push(`ERROR! ${data}`));
            childProcess.on("exit", (code) => {
                ret.push(`进程已结束，返回值为 ${code}`);
                client.sendGroupMsg(e.group_id, ret.join('')).catch(err => console.log(err));
            });
            setTimeout(() => {
                if (childProcess.exitCode == null) {
                    childProcess.kill();
                    client.sendGroupMsg(e.group_id, '错误：运行超时').catch(err => console.log(err));
                }
            }, 1000);
        } catch (err) {
            console.log(err);
        }
    }
}

const config = {
    id: 'run',
    name: '代码简易运行',
    menu: '/js <cmd> 执行一段js代码\n/py <cmd> 执行一段python代码',
    default_permission: false
};

module.exports = { config, onMessage };