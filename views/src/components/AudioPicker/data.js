const data = [
    ["小云","xiaoyun","标准女声","通用场景"],
    ["小刚","xiaogang","标准男声","通用场景"],
    ["若兮","ruoxi","温柔女声","通用场景"],
    ["思琪","siqi","温柔女声","通用场景"],
    ["思佳","sijia","标准女声","通用场景"],
    ["思诚","sicheng","标准男声","通用场景"],
    ["艾琪","aiqi","温柔女声","通用场景"],
    ["艾佳","aijia","标准女声","通用场景"],
    ["艾诚","aicheng","标准男声","通用场景"],
    ["艾达","aida","标准男声","通用场景"],
    ["宁儿","ninger","标准女声","通用场景"],
    ["瑞琳","ruilin","标准女声","通用场景"],
    ["思悦","siyue","温柔女声","客服场景"],
    ["艾雅","aiya","严厉女声","客服场景"],
    ["艾夏","aixia","亲和女声","客服场景"],
    ["艾美","aimei","甜美女声","客服场景"],
    ["艾雨","aiyu","自然女声","客服场景"],
    ["艾悦","aiyue","温柔女声","客服场景"],
    ["艾婧","aijing","严厉女声","客服场景"],
    ["小美","xiaomei","甜美女声","客服场景"],
    ["艾娜","aina","浙普女声","客服场景"],
    ["伊娜","yina","浙普女声","客服场景"],
    ["思婧","sijing","严厉女声","客服场景"],
    ["艾硕","aishuo","自然男声","客服场景"],
    ["思彤","sitong","儿童音女","童声场景"],
    ["小北","xiaobei","萝莉女声","童声场景"],
    ["艾彤","aitong","儿童音女","童声场景"],
    ["艾薇","aiwei","萝莉女声","童声场景"],
    ["艾宝","aibao","萝莉女声","童声场景"],
    ["杰力豆","jielidou","治愈童声","童声场景"],
    // ["Harry","harry","英音男声","英文场景"],
    // ["Abby","abby","美音女声","英文场景"],
    // ["Andy","andy","美音男声","英文场景"],
    // ["Eric","eric","英音男声","英文场景"],
    // ["Emily","emily","英音女声","英文场景"],
    // ["Luna","luna","英音女声","英文场景"],
    // ["Luca","luca","英音男声","英文场景"],
    // ["Wendy","wendy","英音女声","英文场景"],
    // ["William","william","英音男声","英文场景"],
    // ["Olivia","olivia","英音女声","英文场景"],
    // ["Lydia","lydia","英中双语女声","英文场景"],
     // ["Annie","annie","美语女声","英文场景"],
    // ["ava","ava","美语女声","英文场景"],
    ["姗姗","shanshan","粤语女声","方言场景"],
    ["小玥","chuangirl","四川话女声","方言场景"],
    ["青青","qingqing","台湾话女声","方言场景"],
    ["翠姐","cuijie","东北话女声","方言场景"],
    ["小泽","xiaoze","湖南重口音男声","方言场景"],
    // ["智香","tomoka","日语女声","多语种场景"],
    // ["智也","tomoya","日语男声","多语种场景"],
    ["佳佳","jiajia","粤语女声","方言场景"],
    // ["Indah","indah","印尼语女声","多语种场景"],
    ["桃子","taozi","粤语女声","方言场景"],
    ["柜姐","guijie","亲切女声","通用场景"],
    ["Stella","stella","知性女声","通用场景"],
    ["Stanley","stanley","沉稳男声","通用场景"],
    ["Kenny","kenny","沉稳男声","通用场景"],
    ["Rosa","rosa","自然女声","通用场景"],
    // ["Farah","farah","马来语女声","多语种场景"],
    ["马树","mashu","儿童剧男声","通用场景"],
    ["小仙","xiaoxian","亲切女声","直播场景"],
    ["悦儿","yuer","儿童剧女声","通用场景"],
    ["猫小美","maoxiaomei","活力女声","直播场景"],
    ["艾飞","aifei","激昂解说","直播场景"],
    ["亚群","yaqun","卖场广播","直播场景"],
    ["巧薇","qiaowei","卖场广播女","直播场景"],
    ["大虎","dahu","东北话男声","方言场景"],
    ["艾伦","ailun","悬疑解说","直播场景"],
    ["老铁","laotie","东北老铁","直播场景"],
    ["老妹","laomei","吆喝女声","直播场景"],
    ["艾侃","aikan","天津话男声","方言场景"]
];

function formatData(data) {
    var types = {};

    data.forEach((d) => {
        if (!types[d[3]]) {
            types[d[3]] = [];
        }
        types[d[3]].push({
            type: d[3],
            voice: d[1],
            nickname: d[0],
            desc: d[2].replace('声', ''),
            sex: d[2].indexOf('女') >= 0 ? '女' : '男',
        });
    });

    Object.keys(types).forEach((type) => {
        types[type] = types[type].sort((d) => {
            return d.sex === '女' ? 1 : -1;
        });
    });

    return types;
}

export default formatData(data);
