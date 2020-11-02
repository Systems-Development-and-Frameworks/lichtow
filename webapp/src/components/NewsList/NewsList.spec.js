import { shallowMount } from "@vue/test-utils";
import NewsList from "./NewsList.vue";

describe("NewsList.vue", () => {
    describe("empty", () => {
        it("renders a message when the item list is empty", () => {
            const wrapper = shallowMount(NewsList, {
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
            const wrapper = shallowMount(NewsList, {
                data() {
                    return {
                        items: [[{ id: 1, title: "VueJS", votes: 0 }]],
                    };
                },
            });
            expect(wrapper.find(".empty-list-message").exists()).toBe(false);
        });
        describe("click 'Reverse order'", () => {
            it("toggles between ascending and descending order", () => {
                const wrapper = shallowMount(NewsList, {
                    data() {
                        return {
                            items: [
                                [
                                    { id: 1, title: "VueJS", votes: 1 },
                                    { id: 2, title: "TDD", votes: 2 },
                                    { id: 3, title: "React", votes: 0 },
                                ],
                            ],
                        };
                    },
                });
                window.setTimeout(() => {
                    expect(wrapper.vm.orderedItems).toEqual([
                        { id: 3, title: "React", votes: 0 },
                        { id: 1, title: "VueJS", votes: 1 },
                        { id: 2, title: "TDD", votes: 2 },
                    ]);
                }, 10);
            });
        });
    });
});
