
import { hashPassword, verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSession } from "next-auth/react";

async function handler(req, res) {
	if (req.method !== "PATCH") {
		res.status(405).json({ error: "Method Not Allowed" });
		return;
	}

	try {
		const session = await getSession({ req: req });
		console.log(session);

		if (!session) {
			res.status(401).json({ message: "Not Authenticated" , result:res });
			return;
		}

		const userEmail = session.user.email;
		const oldPassword = req.body.oldPassword;
		const newPassword = req.body.newPassword;

		const client = await connectToDatabase();
		const usersCollection = client.db().collection("users");
		const user = await usersCollection.findOne({ email: userEmail });

		if (!user) {
			res.status(404).json({ error: "User not found" });
			client.close();
			return;
		}

		const currentPassword = user.password;
		const passwordsAreEqual = await verifyPassword(
			oldPassword,
			currentPassword,
		);

		if (!passwordsAreEqual) {
			res.status(403).json({ error: "Invalid password" });
			client.close();
			return;
		}

		const hashedPassword = await hashPassword(newPassword);

		const result = await usersCollection.updateOne(
			{ email: userEmail },
			{ $set: { password: hashedPassword } },
		);

		client.close();
		res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export default handler;
