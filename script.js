document.addEventListener('DOMContentLoaded', main);
window.addEventListener('DOMMouseScroll', slowScroll);
window.onmousewheel = slowScroll;

async function main() {
    const data = await getCollection();
    InfoCard.init(document.getElementById('container'));

    for (const info of data) {
        InfoCard.add(info);
    }
}

async function getCollection() {
    const res = await fetch('collections.json');
    const json = await res.json();
    return json.data;
}

/**
 * @param {number} github_id
 * @returns {{img: Image, link: String}}
 */
async function getGithubInfo(github_id) {
    const res = await fetch('https://api.github.com/user/' + github_id);
    const json = await res.json();

    const img = new Image();
    img.src = json.avatar_url || '';
    const link = json.html_url;

    return {img, link};
}


class InfoCard {
    static init(listElement) {
        InfoCard.container = listElement;
    }

    static add(info) {
        const infoCard = new InfoCard(info);
        container.append(infoCard.element);
    }

    constructor(info) {
        this.info = info;
        this.link = {};
        this.element = document.createElement('div');
        this.element.classList.add('info-card');
        this.loadAsyncData().then(()=>{
            this.updateElement();
        });
    }

    updateElement() {
        const name = `<div class='info-name'>${this.info.name}</div>`;
        const des = `<div class='info-des'>${this.info.des}</div>`
        const avatar = new Image();
        avatar.className = 'info-card-avatar';

        if (!!this.info.avatar) {
            avatar.src = this.info.avatar;
        } else if (!!this.info.fbid) {
            avatar.src = `https://graph.facebook.com/${this.info.fbid}/picture?width=320`;
        } else if (!!this.info.github) {
            avatar.src = this.github_avatar.src;
        }

        let linkString = '';
        if (this.info.spiderum) linkString += `<a target='_blank' class='info-link link-spiderum' href='${this.info.spiderum}'></a>`;
        if (this.info.fbid) linkString += `<a target='_blank' class='info-link link-facebook' href='https://facebook.com/${this.info.fbid}'></a>`;
        if (this.info.github) linkString += `<a target='_blank' class='info-link link-github' href='${this.link.github}'></a>`;
        if (this.info.blog) linkString += `<a target='_blank' class='info-link link-blog' href='${this.info.blog}'></a>`;

        this.element.innerHTML = '';
        this.element.append(avatar);
        this.element.innerHTML += `
        <div class='info-card-body'>
        ${name}${des}<div class='info-card-link'>${linkString}</div>
        </div>`;
    }

    async loadAsyncData() {
        if (this.info.github) {
            const info = await getGithubInfo(this.info.github);
            this.github_avatar = info.img;
            this.link.github = info.link;
        }
    }
}

function slowScroll(event) {
    if (event.preventDefault) event.preventDefault();
    else event.returnValue = false;

    let delta = 0;
    if (event.wheelDelta) delta = -event.wheelDelta / 120;
    else if (event.detail) delta = event.detail / 3;

    window.scrollBy({
        top: delta * 200,
        left: 0,
        behavior: 'smooth'
    });
}