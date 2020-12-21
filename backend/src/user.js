import bcrypt from "bcrypt";
import crypto from "crypto";

const saltRounds = 10;

export default class User {
    constructor(name, email, password) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.name = name;
        this.email = email;
        this.password = password;
    }
    static async build(name, email, password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return new User(name, email, hashedPassword);
    }
}
