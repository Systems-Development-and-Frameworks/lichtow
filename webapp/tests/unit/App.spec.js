import { shallowMount } from "@vue/test-utils";
import App from "@/App.vue";

describe("App.vue", () => {
    describe("empty", () => {
        it("renders a message when the item list is empty", () => {
            const wrapper = shallowMount(App, {
                data() {
                    return {
                        items: [],
                    };
                },
            });
            expect(wrapper.find(".empty-list-message").text()).toBe("The list is empty :(");
        });
    });
    describe("not empty", () => {
        it("does not render empty list message when item list is filled", () => {
            const wrapper = shallowMount(App, {
                data() {
                    return {
                        items: [[{ id: 1, title: "VueJS", votes: 0 }]],
                    };
                },
            });
            expect(wrapper.find(".empty-list-message").exists()).toBe(false);
        });
    });
});
