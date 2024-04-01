import {Router} from 'itty-router'
import {upload} from "./upload";
import {download} from "./download";
import {remove} from "./remove";

const router = Router()

router.post("/", async (request) => await upload(request))
router.get("/:id/:password", (request) => download(request))
router.delete("/:id/:password", (request) => remove(request))

router.options("/D*", () => new Response(null, {status: 204, headers: {
    'Access-Control-Allow-Methods': 'GET,DELETE,OPTIONS',
    'Access-Control-Allow-Origin': '*',
  }}))
/* Error handling */
router.all('/D*/', () => new Response(JSON.stringify({error: 'No password received'}), {
  status: 400,
  headers: {'content-type': 'application/json'}
}))
router.all("*", () => new Response(JSON.stringify({error: "Unexpected method or path not found."}), {
  status: 400,
  headers: {'content-type': 'application/json'}
}))

addEventListener('fetch', event =>
  event.respondWith(router.handle(event.request))
)
