
export const cast = async ({ coinPage, parentId }: { coinPage: string, parentId?: string }) => {
    if (!coinPage) {
        console.error("Error: coinPage (URL to embed) is required.");
        return null;
    }

    const embeds = [{ url: coinPage }];

    const url = "https://api.neynar.com/v2/farcaster/cast";
    const body = {
        signer_uuid: process.env.WARPCAST_SIGNER_UUID,
        text: `here you go - `,
        embeds: embeds,
        parent: parentId,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: new Headers({
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": process.env.NEYNAR_API_KEY || "",
        }),
        body: JSON.stringify(body),
    });

    const jsonResponse = await response.json();
    return jsonResponse;
}