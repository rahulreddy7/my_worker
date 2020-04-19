addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

//HTMLRewriter is used to replace content in the selected variant 
const htmlRewriter = new HTMLRewriter()
  .on('title', { element: e => e.setInnerContent("my-worker") })
  .on('h1#title', { element: e => e.setInnerContent("Thanks for all your efforts and support for students in need") })
  .on('p#description', { element: e => e.setInnerContent("The website is deployed to workers.dev") })
  .on('a#url', { element: e => e.setInnerContent('Link to my Github') })
  .on('a#url', { element: e => e.setAttribute('href', 'https://github.com/rahulreddy7') });

const url = 'https://cfw-takehome.developers.workers.dev/api/variants';

//Get cookie by name
function getCookie(request, name) {
  //return null if no cookies match the requested name
  let out = null;
  let cookies = request.headers.get('Cookie');

  //search for cookies in the page
  if (cookies) {
    cookies.split(";").forEach((cookie) => {
      //Split each cookie into an array of its name and content
      let cookieSplit = cookie.split("=");

      //If name matches, set out to cookie content
      if (cookieSplit[0].trim() == name) {
        out = cookieSplit[1];
      }
    })
  }
  return out;
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  //Get the value for the "index" cookie
  const cookie = getCookie(request, "index");

  //Fetch array of variants from given url and transform to JSON
  const apiResponse = await fetch(url)
    .then(response => response.json())
    .catch(err => console.log(err));

  //Set index to cookie if the cookie is valid, otherwise to random integer either 0 or 1
  let index = (cookie == 0 || cookie == 1) ? cookie : Math.floor(Math.random() * 2);

  //fetch one of two variants from the array of variant urls found earlier
  let res = await fetch(apiResponse.variants[index])
    .catch(err => console.log(err));

  //apply HTMLRewriter to variant response and create a new response based on it
  out = new Response(htmlRewriter.transform(res).body);
  //set cookie "index" to the index value so each user sees same variant every time
  out.headers.set('Set-Cookie', "index=" + index);

  return out;
}
