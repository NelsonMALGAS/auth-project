import { MongoClient } from "mongodb";

export async function connectToDatabase() {
	const client = await MongoClient.connect(
		"mongodb+srv://auth:P1zJr814a66TEcZd@cluster0.c1yxuy6.mongodb.net/auth-data?retryWrites=true&w=majority",
	);

	return client;
}
