const fs = require('fs');
const FILE_PATH = './permission.json';
let config = {};

//获取元素在数组的下标
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++)
        if (this[i] == val)
            return i;
    return -1;
};
//根据数组的下标，删除该下标的元素
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1)
        this.splice(index, 1);
};

class PermissionManager {
    constructor() {

    }
    load() {
        if (fs.existsSync(FILE_PATH))
            config = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
        else
            this.save();
    }
    save() {
        fs.writeFileSync(FILE_PATH, JSON.stringify(config), 'utf-8');
    }
    hasPermission(plugin_id, group_id) {
        if (config[plugin_id] == null) return false;
        return config[plugin_id].find(v => v == group_id) != null;
    }
    addPermission(plugin_id, group_id) {
        if (config[plugin_id] == null) this.create(plugin_id);
        config[plugin_id].push(group_id);
        this.save();
    }
    removePermission(plugin_id, group_id) {
        if (config[plugin_id] == null) return;
        config[plugin_id].remove(group_id);
        this.save();
    }
    create(plugin_id) {
        config[plugin_id] = [];
    }
}

module.exports = { PermissionManager };