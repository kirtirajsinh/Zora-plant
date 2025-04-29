import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { ExtractSymbolFromText } from "../actions/extractSymbol"
import { coinIt } from "../actions/coin"
import { cast } from "@/utils/cast"


// 👇 Verify that this messages comes from QStash
export const POST = verifySignatureAppRouter(async (req: Request) => {
  const data = await req.json()
  const description = data.body.data.text || ""
  const creatorAddress = data.body.data.author.verified_addresses.primary.eth_address
  console.log(data, "body from process Coining")
  let imageEmbed =  data.imageUrl;
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
      return new Response("Error extracting symbol", { status: 500 });
  }

  if(!symbol){
      console.log(" no symbol found")
      throw new Error("No Symbol Found")
  }
  const metadata = {
      name: symbol,
      description: description,
      symbol: symbol,
      image: imageEmbed, // Assuming uri is the image URL,
      properties: {
          "category": "social"
      }
  }
  

  try {
      const coinUrl = await coinIt(metadata, creatorAddress);
      const castResponse = await cast({ coinPage: coinUrl, parentId: data?.body?.data?.hash });
      console.log("Cast response:", castResponse);
  } catch (error) {
      console.error("Error during coinIt or cast:", error);
  }

  // Image processing logic, i.e. using sharp

  return new Response(`A coin has been Coined`)
})
