import {decode} from "base64-arraybuffer";
import {getDecryptedKV} from "encrypt-workers-kv";

export function download(request) {
    return handleRequest()
}

async function handleRequest(request) {
    try {
        const { params } = request;
        const id = params.id;
        const password = params.password;
        let decryptedData = await getDecryptedKV(KV_DATA, id, password)
        let strDecryptedData = new TextDecoder().decode(decode(new TextDecoder().decode(decryptedData)));
        let file = JSON.parse(strDecryptedData)
        return new Response(decode(file.data), {
            headers: {
                'Content-Description': 'File Transfer',
                'content-type': `${file.type}; charset=utf-8`,
                'Content-Disposition': `inline; filename="${file.name}"`,
                'Content-Length': `${file.size}`,
            },
        })
    } catch (e) {
        return new Response(e.message, {status: e.status})
    }
}