// 'use strict'

/* Deploy a JSON API
Create a new Workers project using Wrangler. This project will respond to two kinds of requests, one to generate a JSON API (defined below), and second, to serve an HTML page (see "Set up an HTML page")

To begin, you should define an array of links. The links should be a JavaScript array, with a number of link objects, each with a name and URL string. See the below example for one of these link objects:

{ "name": "Link Name", "url": "https://linkurl" }
You should define at least three link objects inside of your array.

Once you've defined this array, set up a request handler to respond to the path /links, and return the array itself as the root of your JSON response.

In addition, you should ensure that the API response has the correct Content-Type header to indicate to clients that it is a JSON response.

You should be able to test that this works as expect by running wrangler dev to access your Workers application locally. Visit localhost:8000/links to confirm that your application returns the link array as a JSON response. */

const Router = require('./router')

const sampleText = `Hello worker! You should get this response for all URL endpoints EXCEPT for LINKS. You hit: `

const linkArray = [
    { name: 'A sample URL', url: 'https://asampleurl.com' },
    { name: 'Another sample URL', url: 'https://anothersampleurl.com' },
    { name: 'A final sample URL', url: 'https://afinalsampleurl.com' },
]

const host = `https://static-links-page.signalnerve.workers.dev`

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

function handler(request) {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify({ some: 'json' })
    return new Response(body, init)
}

function linkHandler(request) {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify(linkArray)
    return new Response(body, init)
}

async function handleRequest(request) {
    // need to hit localhost:8000/links - hitting 8787 right now. How do I change that?
    const router = new Router()
    // Replace with the appropriate paths and handlers
    // router.get('.*/bar', () => new Response('responding for /bar route'))
    router.get('.*/links', request => linkHandler(request))
    // router.get('.*/foo', request => handler(request))
    // router.post('.*/foo.*', request => handler(request))
    // router.get('/demos/router/foo', request => fetch(request)) // return the response from the origin

    // router.get('.*/*', () => new Response(sampleText + request.url)) // return a default message for the root route (and hopefully all other routes)

    router.get(
        '.*/*',
        () =>
            new Response(
                fetch('https://static-links-page.signalnerve.workers.dev')
            )
    )

    const res = await router.route(request)
    console.log('RESPONSE???', res) // coming back with a Promise
    return res
}

// fetch('https://static-links-page.signalnerve.workers.dev')

/* With your API deployed, you can flesh out the rest of your application. If the path requested is not /links, your application should render a static HTML page, by doing the following steps:

1. Retrieve a static HTML page
2. Get the links from your previously deployed JSON response
3. Use HTMLRewriter to add these links to the static HTML page
4. Return the transformed HTML page from the Worker */
