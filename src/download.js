import {decode} from "base64-arraybuffer";
import {decryptData} from "./encryption";

export function download({params}) {
    return handleRequest(params)
}

async function handleRequest(params) {
    try {
        const {id, password} = params;
        const data = await R2.get(id)

        if (data === null) {
            const e = new Error('File not found')
            e.code = 404
            throw e
        }

        const decryptedData = await decryptData(await data.text(), password)
        let file = JSON.parse(atob(decryptedData))
        return new Response(decode(file.data), {
            headers: {
                'Content-Description': 'File Transfer',
                'content-type': `${file.type}; charset=utf-8`,
                'Content-Disposition': `inline; filename="${file.name}"`,
                'Content-Length': `${file.size}`,
                'etag': `${data.httpEtag}`
            },
        })
    } catch (e) {
        return new Response(JSON.stringify({error: e.message}), {
            status: e.status,
            headers: {'content-type': 'application/json'}
        })
    }
}