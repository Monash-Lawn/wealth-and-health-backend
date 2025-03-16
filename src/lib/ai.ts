import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai"
import { getCategories } from "./category.ts";
import dotenv from "dotenv"
dotenv.config()

const Categories = getCategories();

const estimateSchema: Schema = {
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            category: {
                type: SchemaType.INTEGER,
                description: "ID of the category",
                nullable: false,
            },
            amount: {
                type: SchemaType.NUMBER,
                description: "Amount estimated to be spent on the category in given timeframe",
                nullable: false,
            },
        },
        required: ["category", "amount"],
    },
};

const analyticsSchema: Schema = {
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            category: {
                type: SchemaType.INTEGER,
                description: "ID of the category",
                nullable: false,
            },
            tag: {
                type: SchemaType.INTEGER,
                description: "Overspending/Underspending/normal tag based on user's spending and analytics. For overspending: 1, for underspending: -1, for normal: 0",
                nullable: false,
            },
            difference: {
                type: SchemaType.NUMBER,
                description: "Percent value of overspending/underspending (between 0 and 100)",
                nullable: false,
            }
        }
    }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const getModel = (schema: Schema) => {
    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
}


export const estimateSpending = async (spendings: any[]) => {
    const result = await getModel(estimateSchema).generateContent(
        `Estimate the user's monthly spending based on the following spending data: ${JSON.stringify(spendings, null, 2)}`,
    );

    const text = result.response.text();

    return JSON.parse(text);
}


export const formatEstimate = (estimates: any[]) => {
    let text = 'Estimated spending: \n';
    estimates.forEach(est => {
        text += `${Categories.find(cat => cat.id === est.category)!.name || "Unknown"}: ${est.amount}\n`;
    });
    return text;
}


export const getAnalyticsAdvice = async (spendings: any[], analytics: any[]) => {
    const result = await getModel(analyticsSchema).generateContent(
        `Tag the overspending/underspending/normal categories based on the following spending data of the user: ${JSON.stringify(spendings, null, 2)} and general analytics per category and location which tells you the average transaction value of each category in respective location: ${JSON.stringify(analytics, null, 2)}`,
    );

    const text = result.response.text();

    return JSON.parse(text);
}


export const formatAnalyticsAdvice = (analytics: any[]) => {
    const getTrend = (tag: number, percent: number) => {
        switch (tag) {
            case 1:
                return "Overspending by " + percent + "%";
            case -1:
                return "Underspending by " + percent + "%";
            default:
                return "Normal spending";
        }
    };

    let text = 'Based on your spending and analytics, your category wise spending trends are: \n';
    analytics.forEach(data => {
        text += `${Categories.find(cat => cat.id === data.category)!.name || "Unknown"}: ${getTrend(data.tag, data.difference)}\n`;
    });

    return text;
}