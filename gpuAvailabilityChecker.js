const axios = require("axios");
const cron = require("node-cron");

// Define the initial GPU cards and other necessary variables
const initialGpuCards = [
  {
    name: "5090",
    api_url:
      "https://api.store.nvidia.com/partner/v1/feinventory?skus=NVGFT590",
    api_url_us: "https://api.store.nvidia.com/partner/v1/feinventory?skus=",
    available: false,
    last_seen: null,
    product_url: null,
    locale: "to_be_set",
  },
  {
    name: "5080",
    api_url:
      "https://api.store.nvidia.com/partner/v1/feinventory?skus=NVGFT580",
    api_url_us: "https://api.store.nvidia.com/partner/v1/feinventory?skus=",
    available: false,
    last_seen: null,
    product_url: null,
    locale: "to_be_set",
  },
  {
    name: "5070T",
    api_url:
      "https://api.store.nvidia.com/partner/v1/feinventory?skus=NVGFT570T",
    api_url_us: "https://api.store.nvidia.com/partner/v1/feinventory?skus=",
    available: false,
    last_seen: null,
    product_url: null,
    locale: "to_be_set",
  },
  {
    name: "5070",
    api_url:
      "https://api.store.nvidia.com/partner/v1/feinventory?skus=NVGFT570",
    api_url_us: "https://api.store.nvidia.com/partner/v1/feinventory?skus=",
    available: false,
    last_seen: null,
    product_url: null,
    locale: "to_be_set",
  },
];

require('dotenv').config();
const selectedRegion = process.env.REGION;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const userid1 = process.env.USER_ID_1;
const userid2 = process.env.USER_ID_2;


// Function to fetch GPU availability
async function fetchGpuAvailability() {
  console.log("Fetching GPU availability...");
  
  try {
    const promises = initialGpuCards.map(async (card) => {
      const card_url = card.api_url;
      const completeUrl = `${card_url}&locale=${selectedRegion}`;
      
      try {
        // const response = await axios.get(completeUrl);
        const response = await axios.get(completeUrl, { timeout: 10 }); // 10 seconds timeout
        const isApiReachable =
        response.data.listMap &&
        Array.isArray(response.data.listMap) &&
        response.data.listMap.length > 0 &&
        "is_active" in (response.data.listMap[0] ?? {});
        
        const isActive = response.data.listMap.some(
          (item) => item.is_active === "true",
        );

        return {
          ...card,
          locale: selectedRegion,
          product_url: response.data.listMap[0]?.product_url ?? null,
          available: isActive,
          last_seen: isActive ? new Date().toISOString() : card.last_seen,
          api_reachable: isApiReachable,
        };
      } catch (error) {
        return {
          ...card,
          locale: selectedRegion,
          api_reachable: false,
        };
      }
    });

    const updatedCards = await Promise.all(promises);
    console.log(updatedCards);

    if (updatedCards[0]?.available === true) {
      // Send a discord message through a webhook
      await axios.post(webhookUrl, {
        content:
          `5090 FE RESTOCK [HERE](https://marketplace.nvidia.com/fr-fr/consumer/graphics-cards/nvidia-geforce-rtx-5090/) <@${userid1}> <@${userid2}>`,
      });
      await axios.post(webhookUrl, {
        content:
          "https://cdn.discordapp.com/emojis/747367976164130818.webp?size=96&animated=true",
      });
    }

    if (updatedCards[1]?.available === true) {
      // Send a discord message through a webhook
      await axios.post(webhookUrl, {
        content:
          `5080 FE RESTOCK [HERE](https://marketplace.nvidia.com/fr-fr/consumer/graphics-cards/nvidia-geforce-rtx-5080/) <@${userid1}> <@${userid2}>`,
      });
      await axios.post(webhookUrl, {
        content:
          "https://cdn.discordapp.com/emojis/747367976164130818.webp?size=96&animated=true",
      });
    }
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

// Schedule the task to run every minute
// fetchGpuAvailability()
cron.schedule("*/31 * * * * *", fetchGpuAvailability);
console.log("GPU availability checker is running...");
