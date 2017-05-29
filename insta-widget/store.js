import fetchJsonp from 'fetch-jsonp'

console.log(fetchJsonp)

const imgCache = {}

export function getImages(accessToken) {
    const myInit = { 
        method: 'GET',
        mode: 'no-cors',
        dataType: 'jsonp'
    };
    
    return fetchJsonp(`https://api.instagram.com/v1/users/self/media/recent/?access_token=${accessToken}`, myInit)
    .then(result => result.json())
}

export function toThumbnails (dataItem) {
    const image = dataItem.images.standard_resolution
    return {
        url: image.url,
        active: false,
        height: image.height
    }
}

export function switchImage () {
    
}