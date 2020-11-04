import NewsList from "./NewsList.vue";

export default {
    title: "NewsList",
    component: NewsList,
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { NewsList },
    template: "<NewsList v-bind=\"$props\" />",
});

export const List = Template.bind({});
