import { cast } from "../actions/cast";
import { coinIt } from "../actions/coin";
import { ExtractSymbolFromText } from "../actions/extractSymbol";

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

   

        if(imageEmbed?.url) {
            let symbol;

            try {
                console.log("Trying to extract symbol with description:", description);
        
                if (description){
                    symbol = await ExtractSymbolFromText(description);
                    console.log("Extracted symbol:", symbol);
                }
                else {
                    const text = "Generate a Coin Name Related to plants and Flora.";
                    console.log("No description found, using fallback text:", text);
                    symbol = await ExtractSymbolFromText(text);
                    console.log("Extracted fallback symbol:", symbol);
                }
            } catch(err) {
                console.error("Error during ExtractSymbolFromText:", err);
                return;
            }
        
            if(!symbol){
                console.log(" no symbol found")
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
            
    
            try {
                const coinUrl = await coinIt(metadata, creatorAddress);
                const castResponse = await cast({ coinPage: coinUrl, parentId: body?.data?.hash });
                console.log("Cast response:", castResponse);
            } catch (error) {
                console.error("Error during coinIt or cast:", error);
            }
        }
   
})();

return immediateResponse;
}