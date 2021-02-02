<template>
  <div class="p-5 bg-indigo-500 md:px-20 md:py-5">
    <nav class="flex text-white md:justify-between">
      <div class="flex flex-row justify-between w-full">
        <a href="#">Logo</a>
        <button class="md:hidden focus:outline-none" @click="toggleMenu">
          Menu
        </button>
      </div>
      <ul ref="mobileMenu" class="hidden md:flex md:flex-row">
        <li class="pr-5"><a>Start</a></li>
        <li class="pr-5"><a>Service</a></li>
        <li class="pr-5"><a>About</a></li>
        <li class="pr-5"><a>Contact</a></li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "Header",
  methods: {
    toggleMenu() {
      //TODO: toggle mobile menu
    },
  },
};
</script>
<style>
</style>