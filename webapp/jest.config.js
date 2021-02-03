module.exports = {
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^~/(.*)$": "<rootDir>/$1",
        "^vue$": "vue/dist/vue.common.js",
    },
    moduleFileExtensions: ["js", "vue", "json"],
    testMatch: ["**/components/**/*.spec.[jt]s?(x)"],
    transform: {
        "^.+\\.js$": "babel-jest",
        ".*\\.(vue)$": "vue-jest",
        "\\.(gql|graphql)$": "jest-transform-graphql",
    },
};
