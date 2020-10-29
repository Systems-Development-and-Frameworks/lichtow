import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('renders a message when the item list is empty', () => {
    const wrapper = shallowMount(App, {
      propsData: { items: [] }
    })
    expect(wrapper.find(".empty-list").isVisible()).toBe(true);
    expect(wrapper.find(".empty-list").text()).toBe("The list is empty :(");
  })
})
