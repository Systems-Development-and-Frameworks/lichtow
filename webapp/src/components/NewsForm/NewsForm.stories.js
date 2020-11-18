import NewsForm from "./NewsForm.vue";

export default {
    title: "NewsForm",
    component: NewsForm,
    argTypes: {
        createItem: { action: "createItem" }
    },
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { NewsForm },
    template: "<NewsForm @createItem='createItem' v-bind='$props' />",
});

export const TestForm = Template.bind({});