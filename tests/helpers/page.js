const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build(){
        const browser = await puppeteer.launch({
            headless:true,          // false if you want chromium browser to pop up, else true specially when using CI or production
            args:['--no-sandbox']
        })
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage,{
            get: function(target,property){
                return target[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page){
        this.page=page;
    }

    async login(){
        const user = await userFactory();
        // console.log(user);
        const {session, sig } = sessionFactory(user);
        await this.page.setCookie({ name:'session', value:session });
        await this.page.setCookie({ name:'session.sig', value:sig });
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"');
    }

    async getContentsOf(selector){
        return this.page.$eval(selector,el => el.innerHTML);
    }
}

module.exports = CustomPage;