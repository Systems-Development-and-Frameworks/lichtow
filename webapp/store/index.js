import login from "../gql/login.gql";

export const state = () => ({
    token: null,
    currentUser: null,
});

export const getters = {
    loggedIn(state) {
        return !!state.token;
    },
};

export const mutations = {
    setToken(state, token) {
        state.token = token;
        if (token) {
            //TODO: decode jwt to get user id
            state.currentUser = "USER";
        } else {
            state.currentUser = null;
        }
    },
};

export const actions = {
    async login({ commit }, { email, password, apolloClient }) {
        const { data } = await apolloClient.mutate({ mutation: login, variables: { email, password } });
        await this.$apolloHelpers.onLogin(data.login);
        commit("setToken", data.login);
    },
    logout({ commit }) {
        this.$apolloHelpers.onLogout();
        commit("setToken", null);
    },
};
