import {decryptData} from "./encryption";
import {decode} from "base64-arraybuffer";

export async function download({params}) {
    try {
        const {id, password} = params;
        const data = await R2.get(id)

        if (data === null) {
            const e = new Error('File not found')
            e.code = 404
            throw e
        }
        const encryptedData = await data.text()
        const decryptedData = await decryptData(encryptedData, password)
        const file = JSON.parse(decryptedData)
        return new Response(decode(file.data), {
            headers: {
                'Content-Description': 'File Transfer',
                'content-type': `${file.type}`,
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
