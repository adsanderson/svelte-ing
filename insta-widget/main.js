import { getImages, toThumbnails } from './store'
import Hw from './components/Hw.html'

export default function start(config) {
    const c = config || {}
    const accessToken = c.ACCESS_TOKEN || ''
    const wait = c.wait || 1000
    return Promise.resolve()
    .then(() => getImages(accessToken))
    .then(r => r.data.map(toThumbnails))
    .then(preload)
    .then(t => switchImage(t, 1, wait))
    .catch(err => {
        console.error(err)
        app.set({name: 'error'})
    })
}

const app = new Hw({
    target: document.querySelector('#instaRoll'),
    data: {
        imgSrc: '',
        images: [],
        currentImage: ''
    }
});

function preload (images) {
    setImage(images.slice(0, 2), 0)
    return images
}

function switchImage (images, count, wait) {
    setTimeout(() => {
        setImage(images, count)
        switchImage(images, (count + 1) % 20, wait)
    }, wait)
}

function setImage (images, count) {
    images[count].active = true
    app.set({
        images: images
    })
    images[count].active = false
}