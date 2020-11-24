import NewsList from "./components/NewsList/NewsList.vue";
import Vue from "vue";
import { createProvider } from "./vue-apollo";

new Vue({
    apolloProvider: createProvider(),
    render: (h) => h(NewsList),
}).$mount("#app");
