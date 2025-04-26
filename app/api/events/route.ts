import { ExtractSymbolFromText } from "@/utils/ai";
import { cast } from "@/utils/cast";
import { coinIt } from "@/utils/coin";

export async function POST (req: Request) {

    const immediateResponse = new Response("OK", { status: 200 });
    (async () => {
    const body = await req.json();
    console.log(body);
    const creatorAddress = body.data.author.verified_addresses.primary.eth_address
    const description = body.data.text || ""
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
    }

    try{

        if(imageEmbed?.url) {
            let symbol;
    
            if (description && description.length){
                symbol = await ExtractSymbolFromText(description)
                console.log(symbol, "symbol")
            }
            else if (!description || !description.length){
                const text = "Create a Coin  Related to plants, Flora."
                symbol = await ExtractSymbolFromText(text)
                console.log(symbol, "symbol")
            }
        
            if(!symbol){
                return;
            }
            const metadata = {
                name: symbol,
                description: description,
                symbol: symbol,
                image: imageEmbed.url, // Assuming uri is the image URL,
                properties: {
                    "category": "social"
                }
            }
            
    
             const coinUrl = await coinIt(metadata,creatorAddress )
    
             const castResponse = await cast({ coinPage: coinUrl, parentId: body?.data?.hash });
            console.log(castResponse, "cast Response")
        }
    
        // return new Response("OK");
    }
    catch(error) {
        console.log(error, "error")
        return new Response(JSON.stringify({ error: error || "An error occurred" }))
    }
})();

return immediateResponse;
}