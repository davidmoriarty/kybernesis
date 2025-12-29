// packages/shared/src/crypto/password.ts
export async function hashPassword(password) {
    return await Bun.password.hash(password, {
        algorithm: "argon2id",
    });
}
export async function verifyPassword(password, hash) {
    return await Bun.password.verify(password, hash);
}
