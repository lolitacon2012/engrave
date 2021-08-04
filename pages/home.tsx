import Container from "cafe-ui/pageContainer";
import styles from "./home.module.css";
import { useRouter } from 'next/router'
import client from 'cafe-utils/client';
import React, { useContext, useEffect, useState } from 'react';
import { RPC } from 'cafe-rpc/rpc';
import { GlobalStoreContext } from "cafe-store/index";
import { Deck } from "cafe-types/set";
import DeckCard from "cafe-components/deckCard";
import useAuthGuard from "hooks/useAuthGuard";

export default function Home() {
    const router = useRouter();
    const store = useContext(GlobalStoreContext);
    useAuthGuard();
    const hasAuthenticated = (store.authenticatingInProgress === false);
    const [decks, setDecks] = useState<Deck[]>([]);
    const createDeck = (fullDeck?: string) => {
        const words = (fullDeck || '').split('========').map((w: string) => {
            const ww = w.split('--------')[0];
            const meaning = w.split('--------')[1];
            return {
                content: {
                    word: ww,
                    meaning: meaning,
                    customized_fields: []
                }
            }
        })
        const newDeck = {
            name: "O'zbek tili",
            avatar: "Uz",
            color: "#73A0A4",
        }
        client.callRPC({
            rpc: RPC.RPC_CREATE_DECK, data: {
                deck: newDeck, words: words
            }
        });
    }
    const createEmpty = () => {
        const newDeck = {
            name: "Empty Deck Name",
            avatar: "ED",
            color: "#73A000",
        }
        client.callRPC({
            rpc: RPC.RPC_CREATE_DECK, data: {
                deck: newDeck, words: [{
                    content: {
                        word: "Qahva",
                        meaning: "☕",
                        customized_fields: []
                    }
                }]
            }
        });
    }
    useEffect(() => {
        // Fetch all decks and progress
        const allDecks = [...store.user?.studyingSetIds || [], ...store.user?.owningSetIds || []];
        if (allDecks.length > 0) {
            client.callRPC({
                rpc: RPC.RPC_GET_DECK_BY_IDS, data: {
                    ids: allDecks
                }
            }, `RPC_GET_DECK_BY_IDS[${allDecks.join(',')}]`, ((result: Deck[]) => {
                setDecks(result);
            })).then((result: Deck[]) => {
                setDecks(result);
            })
        }
    }, [store.user])
    const renderDeckCard = () => {
        return decks.map((deck) =>
            <DeckCard shadow={"NORMAL"} key={`deck_card_${deck?.id}`} deck={deck} onClick={() => {
                deck && router.push(`/deck/${deck.id}`)
            }} />
        )
    }
    return hasAuthenticated && (
        <>
            <Container>
                <h2>Currently Learning</h2><button onClick={() => {
                    createDeck(`Assalomu alaykum--------您好========Vaalaykum assalom--------（回应）您好========u--------那是；她、他、它========bu--------这是========bobo--------爷爷，祖父；祖辈========bir--------一========ip--------线========pul--------钱========papka--------文件夹========opa--------姐姐========dada--------爸爸========do'ppi--------民族式花帽========odatda--------通常，一般========it--------狗========ota--------父亲========talaba--------大学生========Xayr--------再见========Ko'rishguncha xayr--------明天见========gap--------话，言========gul--------花========aka--------哥哥========uka--------弟弟========kim--------谁========kitob--------书========katta--------大的========men--------我========odam--------人========pomidor--------西红柿========non--------馕========nima--------什么========ana--------那是========mana--------这是========matn--------文章；作文========ona--------母亲========maktab--------学校========bank--------银行========band--------繁忙的========do'kon--------商店========gamburger--------汉堡包========mana bu--------这就是========taom--------饭菜========nok--------梨========Pekin--------北京========Salom--------你好========Yaxshimisiz--------你好吗？========Rahmat--------谢谢========biz--------我们========sen--------你========siz--------您========ular--------他们========qanday--------如何，怎么样========va--------和========vatan--------祖国========buva--------爷爷，祖父========buvi--------奶奶，祖母========sinf--------教室，年级========fizika--------物理========gazeta--------报纸========esa--------而========so'z--------词语，句子========ism--------名子========suv--------水========meva--------水果========uzum--------葡萄========vokzal--------火车站========ha--------是的========daftar--------本子========vaza--------花瓶========sut--------牛奶========do'st--------朋友========avtobus--------公交车========osh--------饭，饭菜，抓饭========bosh--------头，首领========shifokor--------医生========mashina--------汽车，机器========uch--------三========soch--------头发========kecha--------昨天========ko'cha--------大街，马路，街道========to'pchi--------球员========juda--------非常========jo'ja--------小鸡========jurnal--------杂志========masjid--------清真寺========lola--------郁金香========bola--------孩子========olma--------苹果========limon--------柠檬========taksi--------出租车========oila--------家庭========suzuvchi--------游泳运动员========velosiped--------自行车========stul--------椅子========somsa--------烤包子========banan--------香蕉========bular--------这些========ishchi--------工人========mushuk--------猫========amma--------姑姑========stakan--------杯子========klub--------俱乐部========Toshkent--------塔什干========bilan--------with========xursand--------开心========chiroyli--------美丽，漂亮========Xitoy--------中国========qiyin--------adj 困难========kutubxona--------图书馆========yoki--------或者========kiyim--------衣服========uy--------房子========xat--------信========xona--------房间========yaxshi--------好========daraxt--------树========ham--------也========hozir--------现在========bahor--------春天========oromgoh--------公园，休憩所========xola--------阿姨，婶婶========tuxum--------鸡蛋========oshxona--------厨房========paxta--------棉花========shaxmat--------象棋========tarix--------历史========havo--------天气========haydovchi--------司机========muhandis--------工程师========shahar--------城市========muhim--------重要的========universitet--------大学========mening--------我的========sening--------你的========uning--------他的========bizning--------我们的========sizning--------您的；你们的========ularning--------他们的========o'zbekcha--------用乌兹别克语；乌兹别克的========xitoycha--------用汉语；中国的========ruscha--------用俄语；俄罗斯的========bor--------有========Buxoro--------布哈拉========qahva--------咖啡========qiz--------女孩；女儿========qush--------鸟========qish--------冬天========qor--------雪========chiroq--------灯========bog'--------公园；花园========tog'--------山========g'oz--------鹅========muzey--------博物馆========o'g'il--------男孩；儿子========tog'a--------舅舅========singil--------妹妹========ko'ngil--------心灵========dengiz--------大海========jang--------战争========a'lo--------优秀的========ma'no--------意义；意思========va'da--------承诺；诺言========san'at--------艺术========sur'at--------速度========she'r--------诗========e'tibor--------注意力========ta'sir--------影响========jur'at--------勇气========teatr--------剧院========dorixona--------药店========shifoxona--------医院========darsxona--------教室========o'qituvchi--------教师========o'quvchi--------学生========parta--------课桌========lug'at--------词典========deraza--------窗户========dars--------课========qalam--------铅笔========amaki--------叔；伯========oilaviy--------家庭的========Arzimaydi--------不用谢，不客气========rasm--------图片，照片========rais--------主席========sharbat--------果汁========devor--------墙========yana--------又========ruchka--------钢笔========Marhamat--------不客气！（M开头）========sizniki--------您的（名词性代词）========yaqin--------近的========dugona--------女性好友========choy--------茶========tilak--------祝愿，愿望========qishloq--------农村========xalq--------人民========o'rin--------位置========qorin--------肚子========bo'yin--------脖子========bo'g'iz--------喉========og'iz--------嘴========burun--------鼻子========qo'shiq--------歌曲========zavod--------工厂========tarjimon--------翻译========olim--------科学家，学者========boshliq--------领导========xitoylik--------中国人========qayer--------哪里========qayerlik--------哪里人========ajoyib--------令人惊奇的，有趣的========o'zbek--------乌兹别克人，乌兹别克族========tojik--------塔吉克族，塔吉克人========koreys--------朝鲜族人，韩国人========arman--------亚美尼亚人========rus--------俄罗斯人========tatar--------塔塔尔人========O'zbekiston--------乌兹别克斯坦========Qozog'iston--------哈萨克斯坦========Samarqand--------撒马尔罕========Koreya--------韩国========Xiva--------希瓦========Xorazm--------花剌子模========yashaysiz--------您生活，你们生活========yashayman--------我生活========yashaydi--------他生活========ishlaydi--------他工作========kasb--------职业，专业========bugun--------今天========o'qiydi--------他读，他学习========har kuni--------每天========metro--------地铁========ketaman--------我走========yozing--------请写========film--------电影========faqat--------只，ただ========chunki--------因为========ertaga--------明天========qilmoq--------v 做========yashamoq--------v 生活========o'qimoq--------v 学习，读========yozmoq--------v 书写========ketmoq--------v 走，离开========tinglamoq--------v 听========uxlamoq--------v 休息========ishlamoq--------v 工作========shug'ullanmoq--------v 从事========tayyorlamoq--------v 准备========kechqurun--------晚上========dam olmoq--------休息========musiqa--------音乐========sport--------体育========birga--------一起========kelmoq--------来========ovqat--------饭========keng--------宽========bambuk--------竹子========davlat--------国家========kinoteatr--------电影院========supermarket--------超市========do'stlik--------友谊========restoran--------饭店========shu--------这，此========joylashgan--------坐落于========kunduzi--------白天========turli xil--------各种各样的========yonmoq--------（自动词）亮起来========shunda--------这样一来 これで========bo'lmoq--------v 成为，是，なる========yaxshi ko'rmoq--------v 喜欢========kam--------少========ko'p--------多========Shanxay--------上海========Urumchi--------乌鲁木齐========Kechirasiz--------对不起========Hechqisi yo'q--------没关系========gapirmoq--------说========til--------语言========bir oz--------一点点，一些，稍微========o'rganmoq--------学习========uchun--------～にとって，对~而言========allo--------喂？========eshitmoq--------听========mumkin--------可能========so'ramoq--------问========chaqirmoq--------叫，邀请========xo'p--------是，好的========rahmat--------谢谢========mayli--------好吧，就这样========kechroq--------晚些========qo'ng'iroq--------电话，铃========tozalamoq--------打扫========sabzavot--------蔬菜========bilmoq--------知道========qidirmoq--------找========bozor--------市场，巴扎========shokolad--------巧克力========taklif qilmoq--------邀请========tanimoq--------认识========gapiring--------请说========dam olish xonasi--------休息室========televizor--------电视========ko'rmoq--------看========hamma--------所有，大家========yotoqxona--------宿舍========suzmoq--------游泳========suhbatlashmoq--------谈话，交谈========gitara--------吉他========chalmoq--------弹奏========ichmoq--------喝========qaysi--------哪个========tushlik qilmoq--------吃午饭========radio--------收音机========qo'shni--------邻居========o'tqazmoq--------种========futbol--------足球========o'ynamoq--------玩========ochiq--------打开的，晴朗的========maza qilmoq--------享受，享用========behad--------无比========lekin--------但是========yuvmoq--------洗========vannaxona--------浴室========bermoq--------给========oqlamoq--------刷白========sog'-salomat--------健康========ta'til--------假期========sovuq--------冷========yomg'ir--------雨========yog'moq--------下（雨雪）========xafa--------生气，不开心========chiqa olmoq--------能够出去========o'yin--------游戏========hurmat--------敬意========nechta--------几个========o'rta--------中间的，中等的========o'rta maktab--------中学========aqlli--------聪明的========uzoq--------久的，远的========sog'inmoq--------想念========yozgi--------夏季的========-dan keyin--------。。。之后========-dan iborat--------由。。。构成========- bilan to'la--------充满。。。========markaziy--------中央的，中心的========millat--------民族========yer--------土地，地方========yoqmoq--------喜欢，合意========albatta--------当然========bormoq--------去========zamonaviy--------现代的========xonanda--------歌手========ko'proq--------更多========sevib--------喜爱地========eshik--------门========qoshiq--------勺子========pochta--------邮局========yil--------年========mehmon--------客人========kech qolmoq--------迟到========bekat--------站========fabrika--------工厂========sovg'a--------礼物========kelgan--------来的，来た（連体形）========tez-tez--------常常，快速地========kichik--------小的========keyin--------。。。之后，以后========nol--------零========ikki--------二========to'rt--------四========besh--------五========olti--------六========yetti--------七========sakkiz--------八========to'qqiz--------九========o'n--------十========yigirma--------二十========o'ttiz--------三十========qirq--------四十========ellik--------五十========oltmish--------六十========yetmish--------七十========sakson--------八十========to'qson--------九十========yuz--------百========ming--------千========million--------百万========milliard--------十亿========to'p--------球========necha--------多少========yosh--------岁，年轻的========kirmoq--------进========endi--------现在，目前========kishi--------人========iborat--------由。。组成========doim--------经常========baxt--------幸福========to'la--------充满。。。的========dehqonchilik--------农业========vaqt--------时间========dala--------田地========mehribon--------慈祥，慈爱========a'zo--------成员========dehqon--------农民========ba'zan--------有时候========soat--------表；小时========bo'ldi--------是（bo'lmoq的过去形态）========majlis--------会议========boshlanmoq--------开始========bino--------楼房========qavat--------楼层========tush--------中午========qiziqarli--------有趣的========kurs--------大学的年级========mart--------三月========roppa-rosa--------整========yarim--------半========chorak--------刻，15分钟========o'tdi--------过了（过去式）========daqiqa--------分钟========soniya--------秒========kino--------电影========qachon--------什么时候========qaytmoq--------回，返========yuvinmoq--------洗澡（自反态）========kiyinmoq--------穿，戴（自反态）========tayyorlanmoq--------准备（自反态）========ertalab--------早上========fevral--------二月========oy--------月亮，月份========old--------前========yig'ilmoq--------聚集，集合========tong--------黎明，清晨========uyg'onmoq--------醒========nonushta--------早餐========yangi--------新的========mashq--------练习，锻炼========tarjima qilmoq--------翻译========tanaffus--------课间========davom etmoq--------继续========tugamoq--------结束========kechki--------晚上的========payt--------时刻，时候========mustaqil--------独立的========bo'sh--------空的，闲的========charchamoq--------累========yotmoq--------躺========institute--------学院========dam olish kuni--------休息日========Xayrli tong--------早安========Xayrli tun--------晚安========shirin--------甜的，美味的========sal--------稍========sal yaxshi--------稍好的，更好的========xiyol--------XXX一点儿========xiyol novcha--------高一点========mazali--------好吃的，津津有味的========turli--------異なる，不同的========bitta--------一个========yonida--------在旁边，在附近========konfet--------糖========kilo--------公斤========so'm--------苏姆（乌兹别克斯坦货币）========kerak--------需要========dona--------个========qancha--------多少========Yaxshi qoling--------保重========Qalaysan--------你好吗？========Xudoga shukur--------感谢真主========tug'ilgan kun--------生日========sariq--------黄========menimcha--------我认为========qizil--------红========rang--------颜色========urf--------流行========yashil--------绿========shunday--------这样========unda--------那样一来========semiz--------胖的========issiq--------热的========boy--------富有的========baland--------高大的========arzon--------便宜的========yomon--------坏的，不好的========qisqa--------短的========eski--------旧的，老的========kelin--------媳妇，新娘========novcha--------高的========yigit--------小伙子，年轻人========ozg'in--------瘦的========tor--------窄的========samimiy--------亲切的========hikoya--------故事========oson--------简单的，容易的========kambag'al--------穷的========qimmat--------贵的========ahmoq--------傻的，笨的========yanvar--------一月========tug'ilmoq--------出生========aprel--------四月========may--------五月========iyun--------六月========iyul--------七月========avgust--------八月========sentyabr--------九月========oktyabr--------十月========noyabr--------十一月========dekabr--------十二月========sana--------日期========raqsga tushmoq--------跳舞========mashhur--------有名的，著名的========tashkil etilmoq--------成立========fakultet--------系========mavjud--------存在========chet--------外边的，外国的========o'quv--------学习 n========toza--------干净的========qulay--------方便的========xuddi--------如同。。一般========o'xshamoq--------像========o'smoq--------生长，成长========markaz--------中心========atrof--------周围========narsa--------东西========qarshi--------对面========o'ng--------右========tomon--------边，面========chap--------左========dushanba--------星期一========shuning uchun--------因此========shovqin-suronli--------喧哗吵闹的========kutmoq--------等待========ko'pchilik--------多数人，大家========savdo-sotiq--------买卖========ich--------里，内========nima uchun--------为什么========-dan biri--------。。。之中========-da - mavjud--------在xx存在xxx========-ga o'xshaydi--------像xxx========mahalla--------街道，小区========tartib--------秩序========yurmoq--------通行========o'zgarmoq--------变化========avvalgiday--------像之前那样========ko'chmoq--------搬家========ilgari--------之前========yanada--------更加地========chiqmoq--------离开，出去`)
                }}>Create Testing Deck</button>
                <button onClick={() => {
                    createEmpty()
                }}>Create Empty Deck</button>
                <div className={styles.deckCardsRow}>
                    {renderDeckCard()}
                </div>
            </Container>
        </>
    )
};