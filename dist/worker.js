!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){const r=n(1),o=[{name:"A sample URL",url:"https://asampleurl.com"},{name:"Another sample URL",url:"https://anothersampleurl.com"},{name:"A final sample URL",url:"https://afinalsampleurl.com"}];class s{constructor(e){this.links=e}async element(e){console.log("Incoming Element: "+e.keys),console.log("THIS LINKS ????",this.links),this.links.forEach(t=>{e.append(`<a href='${t.url}'>${t.name}</a>`,{html:!0})})}}class a{async element(e){e.removeAttribute("style")}}class i{async element(e){e.setAttribute("src","coolprofileimage.jpg")}}class l{async element(e){e.setInnerContent("My USERNAME")}}addEventListener("fetch",e=>{e.respondWith(async function(e){const t=new r;t.get(".*/links",e=>function(e){const t=JSON.stringify(o);return new Response(t,{headers:{"content-type":"application/json"}})}()),t.get(".*/*",e=>async function(e){const t={headers:{"content-type":"text/html;charset=UTF-8"}},n=await fetch("https://static-links-page.signalnerve.workers.dev",t),r=await async function(e){const{headers:t}=e,n=t.get("content-type")||"";return n.includes("application/json")?JSON.stringify(await e.json()):(n.includes("application/text")||n.includes("text/html"),await e.text())}(n),c=new Response(r,t);return(new HTMLRewriter).on("#links",new s(o)).on("#profile",new a).on("#avatar",new i).on("#name",new l).transform(c)}());return await t.route(e)}(e.request))})},function(e,t){const n=e=>t=>t.method.toLowerCase()===e.toLowerCase(),r=n("connect"),o=n("delete"),s=n("get"),a=n("head"),i=n("options"),l=n("patch"),c=n("post"),u=n("put"),h=n("trace"),p=e=>t=>{const n=new URL(t.url).pathname;return(n.match(e)||[])[0]===n};e.exports=class{constructor(){this.routes=[]}handle(e,t){return this.routes.push({conditions:e,handler:t}),this}connect(e,t){return this.handle([r,p(e)],t)}delete(e,t){return this.handle([o,p(e)],t)}get(e,t){return this.handle([s,p(e)],t)}head(e,t){return this.handle([a,p(e)],t)}options(e,t){return this.handle([i,p(e)],t)}patch(e,t){return this.handle([l,p(e)],t)}post(e,t){return this.handle([c,p(e)],t)}put(e,t){return this.handle([u,p(e)],t)}trace(e,t){return this.handle([h,p(e)],t)}all(e){return this.handle([],e)}route(e){const t=this.resolve(e);return t?t.handler(e):new Response("resource not found",{status:404,statusText:"not found",headers:{"content-type":"text/plain"}})}resolve(e){return this.routes.find(t=>!(t.conditions&&(!Array.isArray(t)||t.conditions.length))||("function"==typeof t.conditions?t.conditions(e):t.conditions.every(t=>t(e))))}}}]);