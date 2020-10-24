'use strict'

/* You should be able to test that this works as expect by running wrangler dev to access your Workers application locally. Visit localhost:8000/links to confirm that your application returns the link array as a JSON response. */

const Router = require('./router')
const githubIcon = require('simple-icons/icons/github')
const linkedInIcon = require('simple-icons/icons/linkedin')
const cloudflareIcon = require('simple-icons/icons/cloudflare')

// const linkArray = [
//     { name: 'A sample URL', url: 'https://asampleurl.com' },
//     { name: 'Another sample URL', url: 'https://anothersampleurl.com' },
//     { name: 'Yet another sample URL', url: 'https://yetanothersampleurl.com' },
//     { name: 'A final sample URL', url: 'https://afinalsampleurl.com' },
// ]

const host = `https://static-links-page.signalnerve.workers.dev`
const apiURL = `https://json-api.alex-whan.workers.dev`

// There are two handler types that can be used with HTMLRewriter: element handlers and document handlers

// new HTMLRewriter()
//     .on('*', new ElementHandler())
//     .onDocument(new DocumentHandler())

// element.tagName (useful one)

class LinksTransformer {
    constructor(links) {
        this.links = links
    }
    // This will be called every time that HTMLRewriter detects an element that matches the selector you pass in to the HTMLRewriter - any time it finds one of those tags (i.e. element.tagName === 'meta'), it'll call that function, passing in the element as the function argument
    async element(element) {
        console.log('WHAT IS THIS LINKS??', this.links)
        this.links.forEach(link => {
            // maybe try for/in or for/of? - think for/of
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

// const titleHandler = {
//     element: element => {
//         element.setInnerContent('Alexander Whan')
//     },
// }

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

// async function displayLinks(response, links) {
//     const rewriter = new HTMLRewriter().on(
//         '#links',
//         new LinksTransformer(linkArray)
//     )
//     const returnRewriter = await rewriter.transform(response)
//     return returnRewriter
// }

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

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

// probably should make separate classes/handlers for each element change
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
    console.log('IS THIS A PARSED THING?', links.links)

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

// we do want to make sure the entire request/transform finishes - maybe a separate line? like: `await rewriter.transform(results).arrayBuffer()?

async function linksHandler(request) {
    const init = {
        headers: { 'content-type': 'application/json;charset=UTF-8' },
    }
    const apiResponse = await fetch(apiURL, init)
    const results = await gatherResponse(apiResponse)
    // console.log('WHAT ARE THE RESULTS>>', results)
    return new Response(results, init)
}

// add a try/catch block for development
async function handleRequest(request) {
    const router = new Router()
    router.get('.*/links', request => linksHandler(request))
    router.get('.*/*', request => pageHandler(request))

    const res = await router.route(request)
    return res
}

// fetch('https://static-links-page.signalnerve.workers.dev')

/* With your API deployed, you can flesh out the rest of your application. If the path requested is not /links, your application should render a static HTML page, by doing the following steps:

1. Retrieve a static HTML page
2. Get the links from your previously deployed JSON response
3. Use HTMLRewriter to add these links to the static HTML page
4. Return the transformed HTML page from the Worker */
