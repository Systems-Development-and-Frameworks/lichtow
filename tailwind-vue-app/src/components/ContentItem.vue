<template>
  <div class="flex items-center md:block">
    <img :src="img" class="h-24 mr-5 rounded-full md:h-32 md:mx-auto" />
    <div>
      <div class="my-2 text-2xl uppercase md:text-center">{{ title }}</div>
      <slot></slot>
      <button
        class="block px-2 py-1 my-4 text-white uppercase bg-black rounded text-s focus:outline-none"
      >
        More
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContentItem",
  props: ["title", "img"],
};
</script>