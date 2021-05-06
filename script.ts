require('dotenv').config()
const { remote } = require('webdriverio');

const [, , ...args] = process.argv;
const phoneNumber = args[0] || process.env.PHONE
const password = args[1] || process.env.PASSWORD

if (!phoneNumber || !password) {
  console.error('wrong args')
  process.exit()
}

const LOGIN_URL = 'https://cloud.qingchengfit.cn/mobile/users/access/?next_url=https%3A//yun.qingchengfit.cn/shop/48560/welcome#/login';
const COURSES_URL = 'https://yun.qingchengfit.cn/shop/48560/m/user/schedules/group/?auto=1';
const CLASS_630 = '18:30 - 20:00';
const CLASS_800 = '20:00 - 21:30';
const TODAY_MID_NIGHT = new Date().toLocaleDateString();
const TODAY_MID_NIGHT_MILI = new Date(TODAY_MID_NIGHT).getTime()
const PM_630 = 1000 * 60 * 60 * 18.5;
const PM_800 = 1000 * 60 * 60 * 20;
const CLASS_630_TIME = new Date(TODAY_MID_NIGHT_MILI + PM_630).getTime();
const CLASS_800_TIME = new Date(TODAY_MID_NIGHT_MILI + PM_800).getTime();

const targetTime = CLASS_630_TIME;

(async () => {
  const browser = await remote({
    capabilities: {
      browserName: 'chrome',
      // "goog:chromeOptions": {
      //   mobileEmulation: {'deviceName': 'iPhone 11'},
        // args: [ '--no-sandbox',
        //         '--disable-gpu',
        //         // '--start-fullscreen',
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
  // login ---------- end

  // go to class page
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

  const classDiv = await browser.$(function () {
    return document.querySelectorAll(".m-groupCard.f-linkLike")[2]
  })

  browser.waitUntil(function() {
    const now = new Date().getTime()
    return now > targetTime
  }, { timeout: 1000 * 60 * 10, timeoutMsg: 'Class should be able to book in 10 min', interval: 200 })

  await classDiv.click()
  // go to class page --------- end

  // book it
  const bookBtn = await browser.$('.bigSize.f-fr')
  await bookBtn.click()

  // const confirmBtn = await browser.$(".btn.u-btn.u-btn-main")
  // await confirmBtn.click()

  // book it ----------- end

})();
