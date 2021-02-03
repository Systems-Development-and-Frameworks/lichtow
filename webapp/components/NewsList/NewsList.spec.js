import { createLocalVue, mount } from "@vue/test-utils";
import VueApollo from "vue-apollo";
import Vuex from "vuex";
import { createMockClient } from "mock-apollo-client";
import NewsList from "./NewsList.vue";
import NewsItem from "../NewsItem/NewsItem.vue";
import { GET_POSTS } from "../../gql/queries.gql";

const postListMock = {
    data: {
        posts: [
            {
                id: "1",
                title: "Vue",
                votes: 4,
                author: {
                    id: "1",
                    __typename: "User",
                },
                __typename: "Post",
            },
            {
                id: "2",
                title: "React",
                votes: 0,
                author: {
                    id: "2",
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
                    id: "3",
                },
                __typename: "Post",
            },
        ],
    },
};

const localVue = createLocalVue();
localVue.use(VueApollo);
localVue.use(Vuex);

describe("NewsList.vue", () => {
    let wrapper;
    let mockClient;
    let apolloProvider;
    let requestHandlers;
    let store = new Vuex.Store({
        getters: {
            loggedIn: () => false,
        },
        mutations: {
            setToken() {},
        },
    });

    const createComponent = (handlers) => {
        mockClient = createMockClient({
            resolvers: {},
        });
        requestHandlers = {
            allPostsQueryHandler: jest.fn().mockResolvedValue({ ...postListMock }),
            ...handlers,
        };
        mockClient.setRequestHandler(GET_POSTS, requestHandlers.allPostsQueryHandler);
        apolloProvider = new VueApollo({ defaultClient: mockClient });
        const getToken = jest.fn();
        wrapper = mount(NewsList, {
            store,
            localVue,
            apolloProvider,
            mocks: {
                $apolloHelpers: {
                    getToken,
                },
            },
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
        expect(wrapper.vm.$apollo.queries.items).toBeTruthy();
    });

    describe("empty", () => {
        it("renders a message when the item list is empty", async () => {
            createComponent({
                allPostsQueryHandler: jest.fn().mockResolvedValue({ data: { posts: [] } }),
            });
            await localVue.nextTick();

            expect(wrapper.find("#emptyListMessage").text()).toBe("The list is empty :(");
        });
    });
    describe("not empty", () => {
        beforeEach(async () => {
            createComponent();
            await localVue.nextTick();
        });
        it("does not render empty list message when item list is filled", () => {
            expect(wrapper.find("#emptyListMessage").exists()).toBe(false);
        });
        it("renders items in descending order by default", () => {
            let newsItems = wrapper.findAllComponents(NewsItem);
            expect(newsItems.wrappers.map((i) => i.props("item").title)).toEqual(["Vue", "TDD", "React"]);
        });
        describe("Reverse order", () => {
            describe("click 'Reverse Order'", () => {
                it("renders items in ascending order", async () => {
                    let reverseOrderButton = wrapper.find("#reverseOrder");
                    await reverseOrderButton.trigger("click");
                    let newsItems = wrapper.findAllComponents(NewsItem);
                    expect(newsItems.wrappers.map((i) => i.props("item").title)).toEqual(["React", "TDD", "Vue"]);
                });
            });
        });
    });
});
