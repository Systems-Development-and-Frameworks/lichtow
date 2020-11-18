import { shallowMount, mount } from "@vue/test-utils";
import NewsList from "./NewsList.vue";
import NewsItem from "../NewsItem/NewsItem.vue";

const testItems = [
    { id: 1, title: "VueJS", votes: 1 },
    { id: 2, title: "TDD", votes: 4 },
    { id: 3, title: "React", votes: 0 },
];
const descendingTestItems = [
    { id: 2, title: "TDD", votes: 4 },
    { id: 1, title: "VueJS", votes: 1 },
    { id: 3, title: "React", votes: 0 },
];
const ascendingTestItems = [
    { id: 3, title: "React", votes: 0 },
    { id: 1, title: "VueJS", votes: 1 },
    { id: 2, title: "TDD", votes: 4 },
];

describe("NewsList.vue", () => {
    describe("empty", () => {
        it("renders a message when the item list is empty", () => {
            const wrapper = shallowMount(NewsList, {
                propsData: {
                    initialItems: [],
                },
            });
            expect(wrapper.find("#emptyListMessage").text()).toBe("The list is empty :(");
        });
    });
    describe("not empty", () => {
        let wrapper;
        beforeEach(() => {
            wrapper = mount(NewsList, {
                propsData: {
                    initialItems: testItems,
                },
            });
        });
        it("does not render empty list message when item list is filled", () => {
            expect(wrapper.find("#emptyListMessage").exists()).toBe(false);
        });
        it("orderedItems sorts items in descending order by default", () => {
            let localThis = {
                items: testItems,
                descending: true,
            };
            expect(NewsList.computed.orderedItems.call(localThis)).toEqual(descendingTestItems);
        });
        it("renders items in descending order by default", () => {
            let newsItems = wrapper.findAllComponents(NewsItem);
            expect(newsItems.wrappers.map((i) => i.props("item").title)).toEqual(
                descendingTestItems.map((i) => i.title)
            );
        });
        describe("Reverse order", () => {
            it("orderedItems sorts items in ascending order", () => {
                let localThis = {
                    items: testItems,
                    descending: false,
                };
                expect(NewsList.computed.orderedItems.call(localThis)).toEqual(ascendingTestItems);
            });
            describe("click 'Reverse Order'", () => {
                it("renders items in ascending order", async () => {
                    let reverseOrderButton = wrapper.find("#reverseOrder");
                    await reverseOrderButton.trigger("click");
                    let newsItems = wrapper.findAllComponents(NewsItem);
                    expect(newsItems.wrappers.map((i) => i.props("item").title)).toEqual(
                        ascendingTestItems.map((i) => i.title)
                    );
                });
            });
        });
    });
});
