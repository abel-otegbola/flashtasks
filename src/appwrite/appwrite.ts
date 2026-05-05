import { Account, Client, Databases, TablesDB, Functions, Teams } from "appwrite";

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "");

export const account = new Account(client)
export const databases = new Databases(client)
export const tablesDB = new TablesDB(client);
export const functions = new Functions(client);
export const teams = new Teams(client);