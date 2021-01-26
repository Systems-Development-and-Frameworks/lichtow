import { LOGIN } from "../gql/login.gql";
import jwt_decode from "jwt-decode";

export const state = () => ({
    token: null,
    currentUser: null,
});

export const getters = {
    loggedIn(state) {
        return !!state.token && !!state.currentUser;
    },
};

export const mutations = {
    setToken(state, token) {
        state.token = token;
        if (token) {
            let { userId } = jwt_decode(token);
            state.currentUser = userId;
        } else {
            state.currentUser = null;
        }
    },
};

export const actions = {
    async login({ commit }, { email, password, apolloClient }) {
        const { data } = await apolloClient.mutate({ mutation: LOGIN, variables: { email, password } });
        await this.$apolloHelpers.onLogin(data.login);
        commit("setToken", data.login);
    },
    logout({ commit }) {
        this.$apolloHelpers.onLogout();
        commit("setToken", null);
    },
};
