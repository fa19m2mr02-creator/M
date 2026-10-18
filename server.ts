import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Function declarations for Gemini tool calling
const addToCartDeclaration: FunctionDeclaration = {
  name: 'addToCart',
  description: 'Add a pizza, side, drink, or dessert from the menu to the customer shopping cart.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: {
        type: Type.STRING,
        description: 'The menu item ID (e.g. "pizza-diablo-pepperoni", "pizza-margherita-dop", "side-garlic-knots", "drink-san-pellegrino-lemon", "dessert-tiramisu", or item name)',
      },
      itemName: {
        type: Type.STRING,
        description: 'Human readable item name (e.g. "The Godfather Diablo", "Garlic Knots", "Tiramisu")',
      },
      size: {
        type: Type.STRING,
        description: 'Pizza size: "Small (10\\")", "Medium (12\\")", "Large (14\\")", or "Family XL (16\\")". Default is "Large (14\\")".',
      },
      crust: {
        type: Type.STRING,
        description: 'Pizza crust type: "Neapolitan Sourdough", "New York Thin & Crispy", "Hand-Tossed Classic", "Garlic Herb Stuffed Crust", or "Cauliflower Gluten-Free".',
      },
      extraToppings: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of extra toppings to add (e.g. ["pepperoni", "mushrooms", "hot_honey", "jalapenos"])',
      },
      quantity: {
        type: Type.INTEGER,
        description: 'Quantity to add. Default is 1.',
      },
      specialInstructions: {
        type: Type.STRING,
        description: 'Any special prep notes, e.g. "extra crispy crust", "sauce on the side", "cut into squares"',
      },
    },
    required: ['itemName'],
  },
};

const customizePizzaDeclaration: FunctionDeclaration = {
  name: 'customizePizza',
  description: 'Configure and visualize a custom craft woodfire pizza with chosen size, crust, sauce, cheese, and toppings.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      size: {
        type: Type.STRING,
        description: 'Pizza size: "Small (10\\")", "Medium (12\\")", "Large (14\\")", or "Family XL (16\\")"',
      },
      crust: {
        type: Type.STRING,
        description: 'Crust: "Neapolitan Sourdough", "New York Thin & Crispy", "Hand-Tossed Classic", "Garlic Herb Stuffed Crust", or "Cauliflower Gluten-Free"',
      },
      sauce: {
        type: Type.STRING,
        description: 'Sauce: "San Marzano Tomato", "Creamy Garlic Alfredo", "Spicy Arrabiata", "Sweet Smoky BBQ", or "Genovese Basil Pesto"',
      },
      cheese: {
        type: Type.STRING,
        description: 'Cheese: "Whole Milk Mozzarella", "Fior di Latte", "Four Cheese Blend", "Vegan Cashew Mozzarella", or "No Cheese (Marinara Style)"',
      },
      extraCheese: {
        type: Type.BOOLEAN,
        description: 'Whether to add double extra cheese.',
      },
      toppings: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of topping ids or names to add (e.g. ["pepperoni", "mushrooms", "fresh_basil", "hot_honey", "bbq_brisket", "bell_peppers", "kalamata_olives"])',
      },
      addDirectlyToCart: {
        type: Type.BOOLEAN,
        description: 'If true, automatically adds this custom pizza to the cart right away.',
      },
    },
    required: ['size', 'crust', 'toppings'],
  },
};

const applyPromoDeclaration: FunctionDeclaration = {
  name: 'applyPromoCode',
  description: 'Apply a promotional discount coupon code to the active cart.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      code: {
        type: Type.STRING,
        description: 'Coupon code, such as "PIZZA20" (20% off), "FIRSTBITE" ($5 off), "FREESHIP" (Free delivery), or "CHEESELOVER" (15% off).',
      },
    },
    required: ['code'],
  },
};

const trackOrderDeclaration: FunctionDeclaration = {
  name: 'trackOrder',
  description: 'Track the status and estimated delivery time of a pizza order by order ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.STRING,
        description: 'The order ID (e.g. "PZA-8492" or "current" to track active order)',
      },
    },
    required: ['orderId'],
  },
};

const openCheckoutDeclaration: FunctionDeclaration = {
  name: 'openCheckout',
  description: 'Open the checkout screen and initiate the order placement process for the customer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      deliveryAddress: {
        type: Type.STRING,
        description: 'Delivery street address if provided by customer',
      },
      customerName: {
        type: Type.STRING,
        description: 'Customer name if provided',
      },
    },
  },
};

const SYSTEM_INSTRUCTION = `You are "Nonna Gina", the passionate, hospitable, and master pizzaiolo AI concierge of Nonna's Woodfire Pizza.
Your mission is to make ordering pizza delightful, lightning-fast, and mouth-watering.
You speak with warmth, culinary passion, and friendly charm (with occasional Italian touches like "Mamma Mia!", "Buon appetito!", "Perfetto!").

Key capabilities:
1. When a user asks to order, add, get, or want any pizza, side, drink, or dessert, ALWAYS call the 'addToCart' tool.
2. When a user describes a custom pizza (e.g., "build me a sourdough pizza with pepperoni, mushrooms, and hot honey"), call 'customizePizza'.
3. When a user asks for deals, coupons, or mentions a promo code, inform them and call 'applyPromoCode'. Popular codes include:
   - PIZZA20 (20% off orders over $25)
   - FIRSTBITE ($5 off)
   - FREESHIP (Free delivery)
   - CHEESELOVER (15% off)
4. When a user asks for recommendations, suggest balanced meal combos based on their party size and budget:
   - For 1-2 people: 1 Specialty Large Pizza + Truffle Garlic Knots + 2 San Pellegrino sodas (~$30)
   - For 3-4 people: 2 Large Pizzas (e.g. Diablo Pepperoni & Margherita) + Wings + Drinks + Tiramisu (~$48)
   - For Dietary: Tuscan Garden Vegan (cashew mozzarella) or Gluten-Free Cauliflower crust with fresh veggies.
5. If the user asks where their pizza is, or asks to track, call 'trackOrder'.
6. If the user says they are ready to checkout or pay, call 'openCheckout'.
7. Keep responses lively, concise (2-4 sentences max), and confirm the action taken. Never give a dry robotic reply.`;

// API endpoint for AI Agent Chat
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], cart = [], activeOrder = null } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    // Fallback rule-based parsing if no API key or in case Gemini call fails
    const runSmartFallback = (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      const actions: any[] = [];
      let reply = '';

      if (lower.includes('track') || lower.includes('where is my') || lower.includes('status')) {
        actions.push({
          type: 'TRACK_ORDER',
          payload: { orderId: activeOrder ? activeOrder.orderId : 'current' },
          displayText: 'Tracking active order',
        });
        reply = activeOrder 
          ? `Mamma Mia! Your order #${activeOrder.orderId} is currently ${activeOrder.status.replace('_', ' ')}! Our driver is speeding over.`
          : `Let me check! You don't have an active order right now, but our 800° woodfire oven is roaring and ready for you!`;
      } else if (lower.includes('checkout') || lower.includes('pay') || lower.includes('place order')) {
        actions.push({
          type: 'OPEN_CHECKOUT',
          displayText: 'Proceeding to checkout',
        });
        reply = `Perfetto! Opening your checkout so we can get your piping hot woodfire pies to your doorstep!`;
      } else if (lower.includes('pizza20') || lower.includes('coupon') || lower.includes('promo') || lower.includes('discount') || lower.includes('deal')) {
        actions.push({
          type: 'APPLY_PROMO',
          payload: { code: 'PIZZA20' },
          displayText: 'Applied 20% OFF coupon PIZZA20',
        });
        reply = `Bellissimo! I applied promo code PIZZA20 for 20% off your entire order!`;
      } else if (lower.includes('diablo') || lower.includes('pepperoni')) {
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'pizza-diablo-pepperoni',
            itemName: 'The Godfather Diablo & Hot Honey',
            size: 'Large (14")',
            crust: 'Neapolitan Sourdough',
            quantity: 1,
          },
          displayText: 'Added Godfather Diablo Pizza',
        });
        reply = `Eccellente! Added a Large Godfather Diablo & Hot Honey Pizza with crispy cupped pepperoni and spicy hot honey!`;
      } else if (lower.includes('margherita')) {
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'pizza-margherita-dop',
            itemName: 'Nonna\'s Margherita Vera D.O.P.',
            size: 'Large (14")',
            crust: 'Neapolitan Sourdough',
            quantity: 1,
          },
          displayText: 'Added Margherita Vera D.O.P.',
        });
        reply = `Classico! Added our signature Margherita Vera D.O.P. with San Marzano tomatoes, Fior di Latte, and sweet garden basil!`;
      } else if (lower.includes('mushroom') || lower.includes('truffle')) {
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'pizza-tartufo-mushroom',
            itemName: 'Tartufo Wild Forest Mushroom',
            size: 'Large (14")',
            crust: 'Neapolitan Sourdough',
            quantity: 1,
          },
          displayText: 'Added Tartufo Wild Mushroom Pizza',
        });
        reply = `Molto delizioso! Added our Tartufo Wild Forest Mushroom with roasted cremini, fontina, and white truffle oil!`;
      } else if (lower.includes('knot') || lower.includes('garlic knot')) {
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'side-garlic-knots',
            itemName: 'Truffle & Herb Garlic Knots (6 pcs)',
            quantity: 1,
          },
          displayText: 'Added Truffle Garlic Knots',
        });
        reply = `Oh yes! Added 6 warm Truffle & Herb Garlic Knots tossed in garlic confit butter with marinara!`;
      } else if (lower.includes('wing')) {
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'side-calabrian-wings',
            itemName: 'Woodfire Roasted Calabrian Wings (8 pcs)',
            quantity: 1,
          },
          displayText: 'Added Woodfire Calabrian Wings',
        });
        reply = `Added 8 jumbo Woodfire Roasted Calabrian Wings glazed in spicy honey rosemary!`;
      } else if (lower.includes('tiramisu')) {
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'dessert-tiramisu',
            itemName: 'Nonna\'s Espresso Tiramisu Classico',
            quantity: 1,
          },
          displayText: 'Added Espresso Tiramisu',
        });
        reply = `Dolce perfection! Added Nonna's authentic Espresso Tiramisu layered with rich mascarpone and Valrhona cocoa!`;
      } else if (lower.includes('build') || lower.includes('custom') || lower.includes('create')) {
        actions.push({
          type: 'CUSTOMIZE_PIZZA',
          payload: {
            size: 'Large (14")',
            crust: 'Neapolitan Sourdough',
            sauce: 'San Marzano Tomato',
            cheese: 'Whole Milk Mozzarella',
            toppings: ['pepperoni', 'mushrooms', 'fresh_basil'],
          },
          displayText: 'Opening Pizza Customizer Studio',
        });
        reply = `Let's make some woodfire magic! I opened the Pizza Studio with fresh dough, San Marzano sauce, and gourmet toppings for you!`;
      } else if (lower.includes('vegan') || lower.includes('gluten')) {
        reply = `We take care of everyone! We offer our Tuscan Garden Vegan pizza with cashew mozzarella, and our crisp Cauliflower Gluten-Free crust for any pie. Would you like me to add one?`;
      } else if (lower.includes('recommend') || lower.includes('feed') || lower.includes('combo') || lower.includes('family')) {
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'pizza-diablo-pepperoni',
            itemName: 'The Godfather Diablo & Hot Honey',
            size: 'Large (14")',
            quantity: 1,
          },
        });
        actions.push({
          type: 'ADD_TO_CART',
          payload: {
            itemId: 'side-garlic-knots',
            itemName: 'Truffle & Herb Garlic Knots (6 pcs)',
            quantity: 1,
          },
        });
        actions.push({
          type: 'APPLY_PROMO',
          payload: { code: 'PIZZA20' },
        });
        reply = `For an unbeatable feast, I recommend our Best-Seller Combo: The Godfather Diablo Pizza, hot Truffle Garlic Knots, plus 20% OFF with code PIZZA20! I've loaded them into your cart!`;
      } else {
        reply = `Ciao bella! I am Nonna Gina! Tell me what you're craving—crispy pepperoni, creamy truffle mushrooms, custom woodfire pies, or a sweet tiramisu, and I'll whip it right up!`;
      }

      return { text: reply, actions };
    };

    // If no Gemini API key configured, use intelligent rule engine immediately
    if (!ai) {
      const fallbackResult = runSmartFallback(message);
      return res.json(fallbackResult);
    }

    try {
      // Build context including current cart and order info
      const cartSummary = cart.length > 0 
        ? cart.map((i: any) => `${i.quantity}x ${i.menuItem?.name || i.size || 'Pizza'} ($${(i.itemPrice * i.quantity).toFixed(2)})`).join(', ')
        : 'Empty cart';

      const promptWithContext = `Customer message: "${message}"
Current Cart: [${cartSummary}]
Active Order: ${activeOrder ? `Order #${activeOrder.orderId} (Status: ${activeOrder.status})` : 'None'}

Please respond helpfully and call any relevant tools (like addToCart, customizePizza, applyPromoCode, trackOrder, openCheckout).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptWithContext,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{
            functionDeclarations: [
              addToCartDeclaration,
              customizePizzaDeclaration,
              applyPromoDeclaration,
              trackOrderDeclaration,
              openCheckoutDeclaration,
            ],
          }],
        },
      });

      const actions: any[] = [];
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'addToCart') {
            actions.push({
              type: 'ADD_TO_CART',
              payload: call.args,
              displayText: `Added ${(call.args as any)?.itemName || 'Item'} to cart`,
            });
          } else if (call.name === 'customizePizza') {
            actions.push({
              type: 'CUSTOMIZE_PIZZA',
              payload: call.args,
              displayText: 'Customized Pizza in Studio',
            });
          } else if (call.name === 'applyPromoCode') {
            actions.push({
              type: 'APPLY_PROMO',
              payload: call.args,
              displayText: `Applied Promo Code ${(call.args as any)?.code}`,
            });
          } else if (call.name === 'trackOrder') {
            actions.push({
              type: 'TRACK_ORDER',
              payload: call.args,
              displayText: `Tracking Order ${(call.args as any)?.orderId || ''}`,
            });
          } else if (call.name === 'openCheckout') {
            actions.push({
              type: 'OPEN_CHECKOUT',
              payload: call.args,
              displayText: 'Opened Checkout',
            });
          }
        }
      }

      let responseText = response.text || '';
      if (!responseText && actions.length > 0) {
        responseText = `Perfetto! I've updated your order! Buon appetito!`;
      }

      // If Gemini returned an answer without tools but user clearly wanted to add an item or promo, merge fallback actions
      if (actions.length === 0) {
        const fallbackCheck = runSmartFallback(message);
        if (fallbackCheck.actions.length > 0) {
          actions.push(...fallbackCheck.actions);
        }
      }

      return res.json({
        text: responseText,
        actions,
      });
    } catch (geminiError: any) {
      console.warn('Gemini API call failed, falling back to smart local parser:', geminiError?.message || geminiError);
      const fallbackResult = runSmartFallback(message);
      return res.json(fallbackResult);
    }
  } catch (err: any) {
    console.error('Agent chat endpoint error:', err);
    res.status(500).json({ error: 'Internal server error', details: err?.message });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Mount Vite or static server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`> Nonna's Woodfire Pizza Server running on port ${PORT}`);
  });
}

startServer();
