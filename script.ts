require('dotenv').config()
const { remote } = require('webdriverio');
const LOGIN_URL = 'https://cloud.qingchengfit.cn/mobile/users/access/?next_url=https%3A//yun.qingchengfit.cn/shop/48560/welcome#/login';
const COURSES_URL = 'https://yun.qingchengfit.cn/shop/48560/m/user/schedules/group/?auto=1';
const TODAY_MID_NIGHT = new Date().toLocaleDateString();
const TODAY_MID_NIGHT_MILI = new Date(TODAY_MID_NIGHT).getTime()
const MILI_1300 = 1000 * 60 * 60 * 11;
const MILI_1830 = 1000 * 60 * 60 * 18.5;
const MILI_2000 = 1000 * 60 * 60 * 20;


const CLASS_MAP = {
  1300: {
    string: '13:00 - ',
    mili: TODAY_MID_NIGHT_MILI + MILI_1300
  },
  1830: {
    string: '18:30 - ',
    mili: TODAY_MID_NIGHT_MILI + MILI_1830
  },
  2000: {
    string: '20:00 - ',
    mili: TODAY_MID_NIGHT_MILI + MILI_2000
  }
};

const [, , ...args] = process.argv;
const classStartTime = args[0]
const phoneNumber = args[1] || process.env.PHONE
const password = args[2] || process.env.PASSWORD
const TARGET = CLASS_MAP[classStartTime];

if (!phoneNumber || !password || !TARGET) {
  console.error('wrong args')
  process.exit()
}

(async () => {
  const browser = await remote({
    capabilities: {
      browserName: 'chrome',
      // "goog:chromeOptions": {
      //   mobileEmulation: {'deviceName': 'iPhone 11'},
        // args: [ '--no-sandbox',
        //         '--disable-gpu',
        //         '--disable-notifications',
        //         '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        // ]
      // }
    },
  });

  // browser.setWindowSize(411, 823);

  await browser.url(LOGIN_URL);

  // login
  const switchToPasswordBtn = await browser.$('.txt-cell.text-center a.s-txt-live')
  await switchToPasswordBtn.click()

  const phoneNumInput = await browser.$('input[placeholder="请输入手机号码"]')
  await phoneNumInput.setValue(phoneNumber)
  
  const passwordInput = await browser.$('input[placeholder="请输入登录密码"]')
  await passwordInput.setValue(password)

  const agreementCheckBox = await browser.$('.checkbox')
  await agreementCheckBox.click()

  const loginBtn = await browser.$('button.u-btn-primary')
  await loginBtn.click();

  // go to tomorrow's class list
  await browser.pause(1000)

  const toBookBtn = await browser.$('span=约')
  await toBookBtn.click();

  await browser.pause(1000)
  
  const tomorrow = await browser.$(function () {
    const today = document.querySelector(".date.z-active.z-today")
    return today.parentElement.nextElementSibling.firstElementChild
  })
  await tomorrow.click()

  await browser.pause(1000)

  const classListLoading = await browser.$('p=数据加载中...')
  await classListLoading.waitForDisplayed({ reverse: true, timeout: 5000, timeoutMsg: 'class list should finish loading in 5 sec' });

  // go to class page

  // wait till class is bookable 
  await browser.waitUntil(function() {
    const now = new Date().getTime()
    return now > TARGET.mili
    // return now > TODAY_MID_NIGHT_MILI + 3600 * 1000 * 11 + 1000 * 60 * 48  // for testing
  }, { timeout: 1000 * 60 * 10, timeoutMsg: 'Class should be able to book in 10 min', interval: 200 })
  
  // browser.$(function) seems can't access variables outside so need to use browser.execute
  await browser.execute((classTime) => {
    const xpath = `//span[contains(text(),'${classTime}')]`
    const timeSpan = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    timeSpan.parentElement.parentElement.click()
  }, TARGET.string)

  // book it
  const bookBtn = await browser.$('.bigSize.f-fr')
  await bookBtn.click()

  // actually book it
  // const confirmBtn = await browser.$(".btn.u-btn.u-btn-main")
  // await confirmBtn.click()
})();