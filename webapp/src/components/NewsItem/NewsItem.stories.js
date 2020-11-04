import NewsItem from "./NewsItem.vue";

export default {
    title: "NewsItem",
    component: NewsItem,
    argTypes: {
        item: { title: "text",
                id: "integer",
            votes: "integer" },
    },
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { NewsItem },
    template: '<NewsItem v-bind="$props" />',
});

export const TestItem = Template.bind({});
TestItem.args = {
    item: {title: "Test", id: 1, votes: 2},
};
