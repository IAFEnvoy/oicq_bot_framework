/**
 * 获取一段营销号文字
 * @param {String} obj 想要讲述的对象
 * @param {String} des1 讲述对象的特点
 * @param {String} des2 这个特点的另一种说法
 * @param {String} aut 作者（可选项）
 */
const getNewYxhText = (obj, des1, des2, aut) => g(obj, des1, des2, aut);

//get
const g = (a, b, c, d) => {
    let s = ``;
    s += t(a, b, c, d);
    s += e(a, b, c, d);
    s += u(a, b, c, d);
    s += e(a, b, c, d);
    for (let f = 0; f < m.length; f++)
        s += m[f](a, b, c, d);
    return s;
}

//random 
const r = (arr) => arr[Math.floor(Math.random() * arr.length)];

//enter
const e = (a, b, c, d) => '\n';

//title
const t = (a, b, c, d) => r([
    `${a}竟然${b}！背后原因令人震惊`,
    `震惊！${a}竟然会${b}`,
    `速转！研究发现${a}${b}！99%的人都不知道！`,
    `${r(['英国', '美国', '法国', '日本', '俄国'])}科学家发现${a}竟然${b}！多国专家表示不可思议`,
    `为什么${a}${b}？${r([`业内专家`, `内部人员`, `干了一辈子的老人`])}说出真相`,
    `面试官：如何让${a}${b}？你该怎么做？`
]);

//author
const u = (a, b, c, d) => d != undefined ? d : r([
    `瑶瑶看世界`,
    `全球趣闻`,
    `老吴侃车`
])

//main text
const m = [
    (a, b, c, d) => r([
        `${a}${b}是怎么回事呢？`,
        `${a}相信大家都很熟悉，但是${a}${b}是怎么回事呢？`,
        `在近日，发生了${a}${b}的事情，这是怎么回事呢？`
    ]),
    (a, b, c, d) => r([
        `下面就让小编带大家一起了解吧。`,
        `下面就让小编带大家了解一下吧。`
    ]),
    (a, b, c, d) => `\n`,
    (a, b, c, d) => r([
        `众所周知，${a}${b}其实就是${c}。`,
        `${a}${b}，其实就是${c}。`,
        `${b}，也叫做${c}。`,
        `其实${b}和${c}没啥区别。`
    ]),
    (a, b, c, d) => r([
        `大家可能会很惊讶${a}怎么会${r([b, c])}呢？`,
        `有人就会问，为什么${b}和${c}是一个东西呢？`,
        `那么为什么${a}会${b}呢？`
    ]),
    (a, b, c, d) => r([
        `但事实就是这样，小编也感到非常惊讶。`,
        `但事实就是这样，小编也不知道${r(['为什么呢', ''])}。`
    ]),
    (a, b, c, d) => `\n`,
    (a, b, c, d) => r([
        `这就是关于${a}${b}的事情了。`
    ]),
    (a, b, c, d) => r([
        `大家有什么想法，欢迎在评论区和小编一起讨论哦！`
    ])
]

const onMessage = (message, client, e) => {
    let ms = message.split(' ');
    if (ms[0] == '/yxh' && ms.length >= 3) {
        try {
            let obj = ms[1];
            let des1 = ms[2];
            let des2 = ms.length >= 4 ? ms[3] : des1;
            let aut = ms.length >= 5 ? ms[4] : undefined;
            client.sendGroupMsg(e.group_id, getNewYxhText(obj, des1, des2, aut));
        } catch (err) {
            console.log(err);
        }
    }
}

const config = {
    id: 'yxh',
    name: '营销号文章生成器',
    menu: '/yxh <名字> <事件> (<原因>) (<作者>) 获取一段营销号文字',
    default_permission: true
};

module.exports = { config, onMessage };