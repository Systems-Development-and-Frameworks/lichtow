import { createLocalVue, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import LoginForm from "./LoginForm.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("LoginForm.vue", () => {
    let wrapper;
    let actions;
    let store;

    const createComponent = () => {
        store = new Vuex.Store({
            actions,
        });
        wrapper = shallowMount(LoginForm, {
            store,
            localVue,
        });
    };

    afterEach(() => {
        wrapper.destroy();
    });

    it("renders a Vue component", () => {
        createComponent();
        expect(wrapper.exists()).toBe(true);
    });

    it("renders an email input field", () => {
        createComponent();
        const emailInput = wrapper.find("input#email");
        expect(emailInput.exists()).toBe(true);
    });

    it("renders a password input field", () => {
        createComponent();
        const passwordInput = wrapper.find("input#password");
        expect(passwordInput.exists()).toBe(true);
    });

    it("renders a submit button", () => {
        createComponent();
        const submitBtn = wrapper.find("input#submit");
        expect(submitBtn.exists()).toBe(true);
    });

    describe("invalid credentials", () => {
        let login;
        beforeEach(() => {
            login = jest.fn().mockRejectedValue(new Error("test"));
            actions = {
                login,
            };
            createComponent();
        });

        describe("click submit button", () => {
            beforeEach(() => {
                const submitBtn = wrapper.find("input#submit");
                submitBtn.trigger("click");
            });
            it("calls login", () => {
                expect(login.mock.calls.length).toBe(1);
            });
            it("renders error message", () => {
                const invCredentialsMsg = wrapper.find("#invCredentialsMsg");
                expect(invCredentialsMsg.exists()).toBe(true);
                expect(invCredentialsMsg.text()).toContain("Falsche Email oder Passwort");
            });
        });
    });
});
