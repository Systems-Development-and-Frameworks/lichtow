import NewsItem from "./NewsItem.vue";

export default {
    title: "NewsItem",
    component: NewsItem,
    argTypes: {
        item: {
            title: "text",
            id: "integer",
            votes: "integer"
        },
        removeItem: { action: "removeItem" },
        updateItem: { action: "updateItem" }
    },
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { NewsItem },
    template: "<NewsItem @removeItem=\"removeItem(item)\" @updateItem=\"updateItem(item)\" v-bind=\"$props\" />",
});

export const TestItem = Template.bind({});
TestItem.args = {
    item: { title: "Test", id: 1, votes: 2 },
};
