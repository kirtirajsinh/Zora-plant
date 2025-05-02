import { Client } from "@upstash/qstash";


const client = new Client({ token: process.env.QSTASH_TOKEN! })

export async function POST (req: Request) {
    const body = await req.json();
    console.log(body);
    // console.log(body.data.author.verified_addresses.primary.eth_address, "embed");
    let imageEmbed;
    console.log(body.data.embeds, "embeds")
    // Check if there are any embeds
    if (body.data?.embeds && body.data.embeds.length > 0) {
        // Find the first embed that has an image URL and content_type starts with 'image'
        imageEmbed = body.data.embeds.find((embed: { url?: string; metadata?: { content_type?: string } }) => 
            embed.url && embed.metadata?.content_type?.startsWith('image')
        );
        if (imageEmbed) {
            console.log('Image URL:', imageEmbed.url);
        }
        if (!imageEmbed) {
            const pendingEmbed = body.data.embeds.find((embed: { url?: string; metadata?: { _status?: string } }) => 
                embed.url && 
                embed.metadata?._status === 'PENDING'
            );

            if (pendingEmbed) {
                console.log('Found pending embed, fetching metadata...');
                const options = {
                    method: 'GET',
                    headers: {
                        'x-api-key': process.env.NEYNAR_API_KEY || ''
                    }
                };

                try {
                    const response = await fetch(
                        `https://api.neynar.com/v2/farcaster/cast/embed/crawl?url=${encodeURIComponent(pendingEmbed.url)}`,
                        options
                    );
                    const data = await response.json();
                    
                    // If the fetched metadata confirms it's an image, use this embed
                    if (data.metadata?.content_type?.startsWith('image')) {
                        imageEmbed = {
                            url: pendingEmbed.url,
                            metadata: data.metadata
                        };
                    }
                } catch (error) {
                    console.error('Error fetching metadata:', error);
                }
            }
        }
    }
        if(imageEmbed?.url) {

            if(!process.env.PUBLIC_URL){
                return new Response("NO Public URL Found",{status:500})
            }

            const result = await client.publishJSON({
                url: process.env.PUBLIC_URL,
                body: { body:body, imageUrl: imageEmbed?.url },
              })

              console.log("returning ASAP.")

             
              return new Response(JSON.stringify({
                  message: "Image queued for Coining!",
                  qstashMessageId: result.messageId,
      
                }))
        }

        return new Response(JSON.stringify("NO Image to Coin"))
}