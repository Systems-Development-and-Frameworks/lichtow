import crypto from "crypto";

export default class Post {
    constructor(title) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.title = title;
    }
}
