export function remove(request) {
    return handleRequest(request);
}

async function handleRequest(request) {
    const {params} = request;
    const {id, password} = params;

    const {metadata} = await KV_DATA.getWithMetadata(id);
    if (metadata !== null) {
        if ('del_password' in metadata) {
            if (metadata.del_password === password) {
                await KV_DATA.delete(id);
                return new Response('File removed');
            }
        } else {
            return new Response('No deletion password set for that file', {status: 400})
        }
    }
    return new Response('Wrong ID or Deletion Password', {status: 404})
}