'use strict'

/* You should be able to test that this works as expect by running wrangler dev to access your Workers application locally. Visit localhost:8000/links to confirm that your application returns the link array as a JSON response. */

const Router = require('./router')
const githubIcon = require('simple-icons/icons/github')
const linkedInIcon = require('simple-icons/icons/linkedin')
const cloudflareIcon = require('simple-icons/icons/cloudflare')

const linkArray = {
    links: [
        { name: 'HARDCODED', url: 'https://asampleurl.com' },
        { name: 'Another sample URL', url: 'https://anothersampleurl.com' },
        {
            name: 'Yet another sample URL',
            url: 'https://yetanothersampleurl.com',
        },
        { name: 'A final sample URL', url: 'https://afinalsampleurl.com' },
    ],
}

const host = `https://static-links-page.signalnerve.workers.dev`
const apiURL = `https://json-api.alex-whan.workers.dev`

class LinksTransformer {
    constructor(links) {
        this.links = links
    }
    // This will be called every time that HTMLRewriter detects an element that matches the selector you pass in to the HTMLRewriter - any time it finds one of those tags (i.e. element.tagName === 'meta'), it'll call that function, passing in the element as the function argument
    async element(element) {
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

    const response = await fetch(host, init)
    const preResults = await gatherResponse(response)
    // const results = await displayLinks(preResults)
    // console.log('RESULTSSSSSSS', results)
    const results = new Response(preResults, init) // uncomment this
    // const jsonLinks = await fetch(apiURL)
    // console.log('JSON LINKS>>', JSON.parse(jsonLinks))
    return (
        new HTMLRewriter()
            // .on('div#links', new LinksTransformer(linkArray.links))
            .on('div#profile', new ProfileTransformer())
            .on('img#avatar', new AvatarTransformer())
            .on('h1#name', new NameTransformer())
            .on('div#social', new SocialTransformer())
            .on('body', new BodyTransformer())
            .on('title', new TitleTransformer())
            .transform(results)
    )
}

// we do want to make sure the entire request/transform finishes - maybe a separate line? like: `await rewriter.transform(results).arrayBuffer()?

async function linksHandler(request) {
    const init = {
        headers: {
            'content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    }

    // console.log('WHAT IS MY EFFIN REQUEST HERE?', request)
    try {
        const apiResponse = await fetch(apiURL, init)
        console.log('API RESPONSE???', apiResponse)
        const results = await gatherResponse(apiResponse)
        console.log('WHAT ARE THE RESULTS>>', results)

        // const body = JSON.stringify(linkArray)
        return new Response(results, init)
    } catch (err) {
        console.log(err.toString())
    }
}

// add a try/catch block for development
async function handleRequest(request) {
    const router = new Router()
    router.get('.*/links', request => linksHandler(request))
    router.get('.*/*', request => pageHandler(request))

    const res = await router.route(request)
    return res
}

/* With your API deployed, you can flesh out the rest of your application. If the path requested is not /links, your application should render a static HTML page, by doing the following steps:

1. Retrieve a static HTML page
2. Get the links from your previously deployed JSON response
3. Use HTMLRewriter to add these links to the static HTML page
4. Return the transformed HTML page from the Worker */
