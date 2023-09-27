import { hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

async function handler(req, res) {
	const data = req.body;

	const { email, password } = data;

	if (req.method !== "POST") {
		return;
	}

	if (
		!email ||
		!email.includes("@") ||
		!password ||
		password.trim().length < 7
	) {
		res.status(422).json({
			message: "Invalid input - password should also be atleast 7 characters",
		});
		return;
	}

	const client = await connectToDatabase();

	const db = client.db();

	const existingUser = await db.collection("users").findOne({email: email});

    if(existingUser){
      res.status(422).json({message : "Email already exits"})
      client.close()
        return
    }

	const hashedPassword = await hashPassword(password);

	const result = await db.collection("users").insertOne({
		email: email,
		password: hashedPassword,
	});

	res.status(201).json({ message: "Created user" });
}

export default handler;
