// packages/db/src/seed.ts
import { eq } from "drizzle-orm";
import { db, users } from "./index";

function seed() {
	// insert only if user doesn't exist
	const existing = db
		.select()
		.from(users)
		.where(eq(users.email, "admin@example.com"))
		.get();

	if (!existing) {
		db.insert(users).values({
			email: "admin@example.com",
			passwordHash: "dev-only-hash",
		});
	}

	const allUsers = db.select().from(users).all();
	console.log(allUsers);
}

seed();
