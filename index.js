'use strict'

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

const Router = require('./router')
const githubIcon = require('simple-icons/icons/github')
const linkedInIcon = require('simple-icons/icons/linkedin')
const cloudflareIcon = require('simple-icons/icons/cloudflare')

const host = `https://static-links-page.signalnerve.workers.dev`
const apiURL = `https://new-json-api.whana.workers.dev/`

// Transformers for incoming static HTML elements
class LinksTransformer {
    constructor(links) {
        this.links = links
    }
    async element(element) {
        this.links.forEach(link => {
            element.append(`<a href='${link.url}'>${link.name}</a>`, {
                html: true,
            })
        })
    }
}

class TitleTransformer {
    async element(element) {
        element.setInnerContent('Alexander Whan')
    }
}

class ProfileTransformer {
    async element(element) {
        element.removeAttribute('style')
    }
}

class SocialTransformer {
    async element(element) {
        element.removeAttribute('style')
        element.append(`<a href='someurl.com'>${githubIcon.svg}</a>`, {
            html: true,
        })
        element.append(`<a href='someurl.com'>${linkedInIcon.svg}</a>`, {
            html: true,
        })
        element.append(`<a href='someurl.com'>${cloudflareIcon.svg}</a>`, {
            html: true,
        })
    }
}

class AvatarTransformer {
    async element(element) {
        element.setAttribute(
            'src',
            'https://images.unsplash.com/photo-1537815749002-de6a533c64db?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=845&q=80'
        )
    }
}

class NameTransformer {
    async element(element) {
        element.setInnerContent('alex-whan')
    }
}

class BodyTransformer {
    async element(element) {
        element.setAttribute('class', 'bg-indigo-800')
    }
}

// Gathers Response object from API
async function gatherResponse(response) {
    const { headers } = response
    const contentType = headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        return JSON.stringify(await response.json())
    } else if (contentType.includes('application/text')) {
        return await response.text()
    } else if (contentType.includes('text/html')) {
        return await response.text()
    } else {
        return await response.text()
    }
}

// Handles all endpoints excluding /links
async function pageHandler(request) {
    const init = {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
    }

    // Fetches static HTML page
    const response = await fetch(host, init)
    const preResults = await gatherResponse(response)
    const results = new Response(preResults, init)

    // Fetches links from JSON API
    const apiResponse = await linksHandler()
    const jsonArray = await gatherResponse(apiResponse)
    const links = JSON.parse(jsonArray)

    return new HTMLRewriter()
        .on('div#links', new LinksTransformer(links.links))
        .on('div#profile', new ProfileTransformer())
        .on('img#avatar', new AvatarTransformer())
        .on('h1#name', new NameTransformer())
        .on('div#social', new SocialTransformer())
        .on('body', new BodyTransformer())
        .on('title', new TitleTransformer())
        .transform(results)
}

// Handles /links endpoint
async function linksHandler(request) {
    const init = {
        headers: {
            'content-type': 'application/json',
        },
    }
    const apiResponse = await fetch(apiURL, init)
    const results = await gatherResponse(apiResponse)
    return new Response(results, init)
}

// Handles endpoints
async function handleRequest(request) {
    const router = new Router()
    router.get('.*/links', request => linksHandler(request))
    router.get('.*/*', request => pageHandler(request))

    const res = await router.route(request)
    return res
}
