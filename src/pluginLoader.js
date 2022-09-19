const fs = require('fs');
const permission = require('./permission');

class BotPluginManager {
    constructor() {
        this.plugins = [];
        this.folder = './src/plugins';
        this.permissionManager = new permission.PermissionManager();
    }
    clear() {
        for (let i = 0; i < this.plugins.length; i++)
            delete require.cache[require.resolve('./plugins/' + this.plugins[i].filename)];
        this.plugins = [];
    }
    call(client, event) {
        this.plugins.forEach(plugin => {
            try {
                if (this.permissionManager.hasPermission(plugin.id, event.group_id))
                    plugin.callback(event.message[0].text, client, event);
            } catch (err) {
                console.log('运行插件' + plugin.name + '时出错');
                console.log(err);
            }
        });
    }
    load(config) {
        let files = fs.readdirSync(this.folder, 'utf-8');
        let cjsModule = files.reduce((p, c) => {
            if (c.endsWith('.js'))
                p.push(c);
            return p;
        }, []);
        console.log('检测到插件：');
        console.log(cjsModule);
        cjsModule.forEach(name => {
            try {
                const plugin = require('./plugins/' + name);
                if (plugin.init != null)
                    plugin.init(config);
                this.plugins.push(new BotPlugin(plugin.config, name, plugin.execute));
            } catch (err) {
                console.log('加载插件文件' + name + '时出错');
                console.log(err);
            }
        })
        console.log('已成功加载插件：');
        console.log(this.getPlugins());
        console.log('插件配置信息：');
        this.plugins.forEach(p => console.log(`插件id：${p.id}，插件名称：${p.name}，插件菜单项：${p.menu == null ? '无' : p.menu}`));
        this.permissionManager.load();
        console.log('已成功加载权限文件');
    }
    getPlugins() {
        return this.plugins.reduce((p, c) => {
            p.push(c.name);
            return p;
        }, []);
    }
    getPluginsId() {
        return this.plugins.reduce((p, c) => {
            p.push(c.id);
            return p;
        }, []);
    }
    getMenu(group_id) { return this.plugins.reduce((p, c) => (!this.permissionManager.hasPermission(c.id, group_id) || c.menu == undefined) ? p : p + '\n' + c.menu, '菜单：'); }
    runManagerEvent(client, e, config) {
        let message = e.message[0].text;
        if (message == '/plugin reload') {
            this.clear();
            this.load(config);
            client.sendGroupMsg(e.group_id, '已成功重载插件');
            client.sendGroupMsg(e.group_id, '已安装插件：' + this.getPlugins());
        }
        if (message == '/plugin id')
            client.sendGroupMsg(e.group_id, '插件ID列表：' + this.getPluginsId());
        if (message == '/plugin name')
            client.sendGroupMsg(e.group_id, '插件列表：' + this.getPlugins());
        if (message == '/plugin enabled')
            client.sendGroupMsg(e.group_id, '已启用插件：' + this.plugins.reduce((p, c) => {
                if (this.permissionManager.hasPermission(c.id, e.group_id))
                    p.push(c.name);
                return p;
            }, []));
        if (message == '/permission reload') {
            this.permissionManager.load();
            client.sendGroupMsg(e.group_id, '已成功重载权限文件');
        }
        let ms = message.split(' ');
        if (ms[0] == '/enable' && ms.length == 2) {
            let p = this.plugins.find(p => p.id == ms[1] || p.name == ms[1]);
            if (p == null)
                client.sendGroupMsg(e.group_id, '未找到指定插件！');
            else {
                this.permissionManager.addPermission(p.id, e.group_id);
                client.sendGroupMsg(e.group_id, `成功启用插件：${p.name}`);
            }
        }
        if (ms[0] == '/disable' && ms.length == 2) {
            let p = this.plugins.find(p => p.id == ms[1] || p.name == ms[1]);
            if (p == null)
                client.sendGroupMsg(e.group_id, '未找到指定插件！');
            else {
                this.permissionManager.removePermission(p.id, e.group_id);
                client.sendGroupMsg(e.group_id, `成功禁用插件：${p.name}`);
            }
        }
    }
}

class BotPlugin {
    constructor(config, filename, callback) {
        this.id = config.id;
        this.name = config.name;
        this.filename = filename;
        this.callback = callback;
        this.menu = config.menu;
    }
}

module.exports = { BotPluginManager };