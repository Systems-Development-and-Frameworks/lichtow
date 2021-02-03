import { createLocalVue, shallowMount, RouterLinkStub } from "@vue/test-utils";
import Vuex from "vuex";
import NavBar from "./NavBar.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("NavBar.vue", () => {
    let wrapper;
    let actions;
    let getters;
    let store;

    const createComponent = () => {
        store = new Vuex.Store({
            actions,
            getters,
        });
        wrapper = shallowMount(NavBar, {
            store,
            localVue,
            stubs: {
                NuxtLink: RouterLinkStub,
            },
        });
    };
    beforeEach(() => {
        getters = {
            loggedIn: () => false,
        };
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it("renders a Vue component", () => {
        createComponent();
        expect(wrapper.exists()).toBe(true);
    });

    describe("not logged in", () => {
        beforeEach(() => createComponent());

        it("shows login link", () => {
            const loginLink = wrapper.findComponent(RouterLinkStub);
            expect(loginLink.exists()).toBe(true);
        });
        it("links to /login page", () => {
            const loginLink = wrapper.findComponent(RouterLinkStub);
            expect(loginLink.props().to).toBe("/login");
        });
        it("does not show logout button", () => {
            const logoutBtn = wrapper.find("#logoutBtn");
            expect(logoutBtn.exists()).toBe(false);
        });
    });

    describe("logged in", () => {
        let logout = jest.fn();

        beforeEach(() => {
            getters = {
                loggedIn: () => true,
            };
            actions = {
                logout,
            };
            createComponent();
        });

        it("shows logout button", () => {
            const logoutBtn = wrapper.find("#logoutBtn");
            expect(logoutBtn.exists()).toBe(true);
        });
        it("calls logout when logout button is clicked", () => {
            const logoutBtn = wrapper.find("#logoutBtn");
            logoutBtn.trigger("click");
            expect(logout.mock.calls.length).toBe(1);
        });
        it("does not show login link", () => {
            const loginLink = wrapper.findComponent(RouterLinkStub);
            expect(loginLink.exists()).toBe(false);
        });
    });
});
