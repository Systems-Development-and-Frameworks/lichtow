import { createLocalVue, mount, shallowMount } from "@vue/test-utils";
import VueApollo from "vue-apollo";
import { createMockClient } from "mock-apollo-client";
import NewsList from "./NewsList.vue";
import NewsItem from "../NewsItem/NewsItem.vue";
import allPostsQuery from "../../graphql/Posts.gql";

const postListMock = {
    data: {
        posts: [
            {
                id: "1",
                title: "Vue",
                votes: 4,
                author: {
                    name: "Paula",
                    __typename: "User",
                },
                __typename: "Post",
            },
            {
                id: "2",
                title: "React",
                votes: 0,
                author: {
                    name: "Jonas",
                    __typename: "User",
                },
                __typename: "Post",
            },
            {
                id: "3",
                title: "TDD",
                votes: 2,
                author: {
                    __typename: "User",
                    name: "Paula",
                },
                __typename: "Post",
            },
        ],
    },
};

const localVue = createLocalVue();
localVue.use(VueApollo);

describe("NewsList.vue", () => {
    let wrapper;
    let mockClient;
    let apolloProvider;
    let requestHandlers;

    const createComponent = (handlers) => {
        mockClient = createMockClient({
            resolvers: {},
        });
        requestHandlers = {
            allPostsQueryHandler: jest.fn().mockResolvedValue({ ...postListMock }),
            ...handlers,
        };
        mockClient.setRequestHandler(allPostsQuery, requestHandlers.allPostsQueryHandler);
        apolloProvider = new VueApollo({ defaultClient: mockClient });
        wrapper = mount(NewsList, {
            localVue,
            apolloProvider,
        });
    };

    afterEach(() => {
        wrapper.destroy();
        mockClient = null;
        apolloProvider = null;
    });

    it("renders a Vue component", () => {
        createComponent();
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.vm.$apollo.queries.posts).toBeTruthy();
    });

    it("renders a loading block when query is in progress", () => {
        createComponent();

        expect(wrapper.find(".test-loading").exists()).toBe(true);
    });

    describe("empty", () => {
        it("renders a message when the item list is empty", async () => {
            createComponent({
                allPostsQueryHandler: jest.fn().mockResolvedValue({ data: { posts: [] } }),
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#emptyListMessage").text()).toBe("The list is empty :(");
        });
    });
    describe("not empty", () => {
        beforeEach(async () => {
            createComponent();
            await wrapper.vm.$nextTick();
        });
        it("does not render empty list message when item list is filled", () => {
            expect(wrapper.find("#emptyListMessage").exists()).toBe(false);
        });
        it("renders posts in descending order by default", () => {
            let newsItems = wrapper.findAllComponents(NewsItem);
            expect(newsItems.wrappers.map((i) => i.props("post").title)).toEqual(["Vue", "TDD", "React"]);
        });
        describe("Reverse order", () => {
            describe("click 'Reverse Order'", () => {
                it("renders items in ascending order", async () => {
                    let reverseOrderButton = wrapper.find("#reverseOrder");
                    await reverseOrderButton.trigger("click");
                    let newsItems = wrapper.findAllComponents(NewsItem);
                    expect(newsItems.wrappers.map((i) => i.props("post").title)).toEqual(["React", "TDD", "Vue"]);
                });
            });
        });
    });
});
