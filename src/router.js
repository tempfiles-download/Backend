import {Router} from 'itty-router'
import {upload} from "./upload";
import {download} from "./download";
import {remove} from "./remove";

const router = Router()

router.post("/", (request) => upload(request))
router.get("/:id/:password", (request) => download(request))
router.delete("/:id/:password", (request) => remove(request))

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
  event.respondWith(router.handle(event.request, event.env))
)
