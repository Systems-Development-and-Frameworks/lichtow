const { UserInputError } = require("apollo-server");

const resolvers = {
    Query: {
        users: (parent, args, context) => context.dataSources.db.allUsers(),
        posts: (parent, args, context) => context.dataSources.db.allPosts(),
    },
    Mutation: {
        write: async (parent, args, context) => {
            const newPost = {
                title: args.post.title,
                authorName: args.post.author.name,
            };
            const author = await context.dataSources.db.getUser(newPost.authorName);
            if (!author) {
                throw new UserInputError("Invalid user", { invalidArgs: newPost.authorName });
            }
            return await context.dataSources.db.createPost(newPost);
        },
        delete: async (parent, args, context) => {
            const id = args.id;
            const post = await context.dataSources.db.getPost(id);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: id });
            }
            return await context.dataSources.db.deletePost(id);
        },
        upvote: async (parent, args, context) => {
            const name = args.voter.name;
            const id = args.id;
            const upvoter = await context.dataSources.db.getUser(name);
            if (!upvoter) {
                throw new UserInputError("Invalid user", { invalidArgs: name });
            }
            const post = await context.dataSources.db.getPost(id);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: id });
            }
            return await context.dataSources.db.upvotePost(id, name);
        },
        downvote: async (parent, args, context) => {
            const name = args.voter.name;
            const id = args.id;
            const downvoter = await context.dataSources.db.getUser(name);
            if (!downvoter) {
                throw new UserInputError("Invalid user", { invalidArgs: name });
            }
            const post = await context.dataSources.db.getPost(id);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: id });
            }
            return await context.dataSources.db.downvotePost(id, name);
        },
    },
    Post: {
        author: async (obj, args, context) => {
            return await context.dataSources.db.getUser(obj.authorName);
        },
        votes: async (obj, args, context) => {
            let values = Array.from(obj.voters.values());
            let votes = values.reduce((sum, number) => sum + number, 0);
            return votes;
        },
    },
    User: {
        posts: async (obj, args, context) => {
            const allPosts = await context.dataSources.db.allPosts();
            return allPosts.filter((post) => post.authorName === obj.name);
        },
    },
};

export default resolvers;
