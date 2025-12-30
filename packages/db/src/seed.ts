// packages/db/src/seed.ts
import { hashPassword } from "@shared/crypto/password";
import { eq } from "drizzle-orm";
import { db, users } from "./index";

async function seed() {
	// insert only if user doesn't exist
	const existing = db
		.select()
		.from(users)
		.where(eq(users.email, "admin@example.com"))
		.get();

	if (!existing) {
		const passwordHash = await hashPassword("password123");

		db.insert(users)
			.values({
				email: "admin@example.com",
				passwordHash,
			})
			.run();
	} else {
		console.log("Admin user already exists, skipping seed");
	}

	const allUsers = db.select().from(users).all();
	console.log(allUsers);
}

seed();
