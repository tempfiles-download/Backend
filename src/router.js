import {Router} from 'itty-router'
import {upload} from "./upload";
import {download} from "./download";
import {remove} from "./remove";

const router = Router()

router.post("/", (request) => upload(request))
router.get("/:id/:password", (request) => download(request))
router.delete("/:id/:password", (request) => remove(request))

/* Default route */
router.all("*", () => new Response("File not found", {status: 404}))

addEventListener('fetch', event =>
    event.respondWith(router.handle(event.request))
)
