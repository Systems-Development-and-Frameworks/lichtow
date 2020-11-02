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
                        items: [{ id: 1, title: "VueJS", votes: 0 }],
                    };
                },
            });
            expect(wrapper.find(".empty-list-message").exists()).toBe(false);
        });
        it("sorts items in descending order by default", () => {
            let localThis = {
                items: [
                    { id: 1, title: "VueJS", votes: 1 },
                    { id: 2, title: "TDD", votes: 4 },
                    { id: 3, title: "React", votes: 0 },
                ],
                descending: true,
            };
            expect(NewsList.computed.orderedItems.call(localThis)).toEqual([
                { id: 2, title: "TDD", votes: 4 },
                { id: 1, title: "VueJS", votes: 1 },
                { id: 3, title: "React", votes: 0 },
            ]);
        });
        describe("Reverse order", () => {
            it("switches to descending order", () => {
                let localThis = {
                    items: [
                        { id: 1, title: "VueJS", votes: 1 },
                        { id: 2, title: "TDD", votes: 4 },
                        { id: 3, title: "React", votes: 0 },
                    ],
                    descending: false,
                };
                expect(NewsList.computed.orderedItems.call(localThis)).toEqual([
                    { id: 3, title: "React", votes: 0 },
                    { id: 1, title: "VueJS", votes: 1 },
                    { id: 2, title: "TDD", votes: 4 },
                ]);
            });
        });
    });
});
